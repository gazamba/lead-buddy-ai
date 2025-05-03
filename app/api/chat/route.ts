import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Feedback } from "@/lib/types";

// System prompt template
const getSystemPrompt = (employeeName: string, context: string) => `
You are ${employeeName}, an employee in a one-on-one meeting with your mentor. Respond realistically based on this context: ${context}
- Acknowledge feedback professionally, addressing the issues raised.
- Share relevant challenges (e.g., time management, workload, skills gaps) without being defensive.
- Engage with the mentor’s suggestions and collaborate on an action plan.
- Maintain a supportive, professional tone.

If the user says "End conversation" or similar, do not respond as ${employeeName}. Instead, analyze the conversation and provide feedback on the mentor's performance based on:
1. Use of the SBI model (Situation, Behavior, Impact).
2. Inclusion of an action plan.
3. Balance of praise and constructive feedback.
Return the feedback in this JSON format:
{
  "sbi_usage": "Description of how well the SBI model was used",
  "action_plan": "Description of the action plan's clarity and feasibility",
  "balance": "Description of how well praise and feedback were balanced",
  "overall": "Overall assessment and suggestions for improvement"
}
`;

const FEEDBACK_PROMPT = ChatPromptTemplate.fromMessages([
  new SystemMessage(`
Analyze the following conversation where a mentor provides feedback to an employee. Evaluate the mentor's performance based on:
1. Use of the SBI model (Situation, Behavior, Impact).
2. Inclusion of an action plan.
3. Balance of praise and constructive feedback.

Return the feedback in this JSON format:
{
  "sbi_usage": "Description of how well the SBI model was used",
  "action_plan": "Description of the action plan's clarity and feasibility",
  "balance": "Description of how well praise and feedback were balanced",
  "overall": "Overall assessment and suggestions for improvement"
}

Conversation:
{{conversation}}
`),
]);

export async function POST(req: NextRequest) {
  try {
    const { prompt: input, sessionId, employeeName, context } = await req.json();
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }

    if (!employeeName || typeof employeeName !== "string" || !context || typeof context !== "string") {
      return NextResponse.json({ error: "Employee name and context are required" }, { status: 400 });
    }

    const { data: conversation, error: fetchError } = await supabase
      .from("conversations")
      .select("*")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching conversation:", fetchError);
      throw new Error("Failed to fetch conversation");
    }

    const model = new ChatOpenAI({
      model: "gpt-4.1",
      temperature: 0.2,
    });

    let messages: Array<SystemMessage | HumanMessage | AIMessage> = [];

    if (!conversation) {
      const systemMessage = new SystemMessage(getSystemPrompt(employeeName, context));
      messages = [systemMessage];
    } else {
      messages = conversation.messages.map((msg: { role: string; content: string }) => {
        if (msg.role === "system") return new SystemMessage(msg.content);
        if (msg.role === "user") return new HumanMessage(msg.content);
        if (msg.role === "assistant") return new AIMessage(msg.content);
        throw new Error(`Invalid message role: ${msg.role}`);
      });
    }

    if (!input || typeof input !== "string") {
      return NextResponse.json({ error: "Input is required" }, { status: 400 });
    }

    if (input.toLowerCase().includes("end conversation")) {
      const conversationText = messages
        .filter((msg) => !(msg instanceof SystemMessage))
        .map((msg) => `${msg._getType()}: ${msg.content}`)
        .join("\n");

      const feedbackChain = FEEDBACK_PROMPT.pipe(model).pipe(new StringOutputParser());
      const feedbackResult = await feedbackChain.invoke({ conversation: conversationText });

      let feedbackJson: Feedback;
      try {
        feedbackJson = JSON.parse(feedbackResult);
      } catch (parseError) {
        console.error("Failed to parse feedback JSON:", parseError);
        throw new Error("Invalid feedback format from model");
      }

      await supabase.from("conversations").delete().eq("session_id", sessionId);
      return NextResponse.json({ feedback: feedbackJson });
    }

    messages.push(new HumanMessage(input));

    const prompt = ChatPromptTemplate.fromMessages(messages);
    const parser = new StringOutputParser();
    const chain = prompt.pipe(model).pipe(parser);

    const result = await chain.invoke({});

    const updatedMessages = [
      ...messages.map((msg) => ({
        role: msg._getType(),
        content: msg.content,
      })),
      { role: "assistant", content: result },
    ];

    const maxMessages = 10;
    const trimmedMessages =
      updatedMessages.length > maxMessages
        ? [updatedMessages[0], ...updatedMessages.slice(-maxMessages + 1)]
        : updatedMessages;

    let conversationId = conversation?.id;
    if (!conversationId) {
      const { data: newConversation, error: insertError } = await supabase
        .from("conversations")
        .insert({
          session_id: sessionId,
          user_id: userId,
          messages: trimmedMessages,
          created_at: new Date().toISOString(),
        })
        .select()
        .maybeSingle();

      if (insertError || !newConversation) {
        throw new Error("Failed to create new conversation");
      }

      conversationId = newConversation.id;
    } else {
      const { error: updateError } = await supabase
        .from("conversations")
        .update({ messages: trimmedMessages })
        .eq("id", conversationId);

      if (updateError) {
        throw new Error("Failed to update existing conversation");
      }
    }

    return NextResponse.json({ response: result });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: `Unable to process request: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
