import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Feedback } from "@/lib/types";

const getSystemPrompt = (employeeName: string, context: string) => `
You are ${employeeName}, an employee in a one-on-one meeting with your mentor. Respond realistically based on this context: ${context}
- Start the conversation by briefly acknowledging the meeting and sharing a relevant challenge or question (e.g., time management, workload, skills gaps) to set the stage for feedback.
- Acknowledge feedback professionally, addressing the issues raised.
- Share relevant challenges without being defensive.
- Engage with the mentor’s suggestions and collaborate on an action plan.
- Maintain a supportive, professional tone.

If the user says "End conversation" or similar, do not respond as ${employeeName}. Instead, analyze the conversation and provide feedback on the mentor's performance based on:
1. Use of the SBI model (Situation, Behavior, Impact).
2. Inclusion of an action plan.
3. Balance of praise and constructive feedback.
Return the feedback in this JSON format:
{
  "sbi_usage": {"score": number, "description": "Description of SBI usage"},
  "action_plan": {"score": number, "description": "Description of action plan clarity"},
  "balance": {"score": number, "description": "Description of feedback balance"},
  "overall": "Overall assessment and suggestions"
}
`;

const FEEDBACK_PROMPT = ChatPromptTemplate.fromMessages([
  new SystemMessage(`
Analyze the following conversation where a mentor provides feedback to an employee. Evaluate the mentor's performance based on:
1. Use of the SBI model (Situation, Behavior, Impact).
2. Inclusion of an action plan.
3. Balance of praise and constructive feedback.

Return the feedback as a valid JSON object, wrapped in \`\`\`json\`\`\` code fences, in this exact format:
\`\`\`json
{
  "sbi_usage": {
    "score": <number between 0 and 100>,
    "description": "<Detailed description of how well the SBI model was used, specifying which components (Situation, Behavior, Impact) were included or missing, with examples from the conversation>"
  },
  "action_plan": {
    "score": <number between 0 and 100>,
    "description": "<Detailed description of the action plan's clarity and feasibility, noting specific steps provided or missing, with examples>"
  },
  "balance": {
    "score": <number between 0 and 100>,
    "description": "<Detailed description of how well praise and constructive feedback were balanced, with examples of praise or criticism>"
  },
  "overall": "<Concise summary of the mentor's performance, highlighting one key strength and one area for improvement>"
}
\`\`\`

Ensure the response contains only the JSON object inside the code fences, with no additional text or comments. If no conversation is provided, return an empty JSON object:
\`\`\`json
{}
\`\`\`

Conversation:
{{conversation}}
`),
]);

export async function POST(req: NextRequest) {
  try {
    const { prompt: input, sessionId, employeeName, context, scenarioId } = await req.json();
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

    console.log("Fetching conversation for sessionId:", sessionId);
    const { data: conversation, error: fetchError } = await supabase
      .from("conversations")
      .select("*")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching conversation:", fetchError);
      throw new Error(`Failed to fetch conversation: ${fetchError.message}`);
    }

    const model = new ChatOpenAI({
      model: "gpt-4.1",
      temperature: 0.2,
    });

    let messages: Array<SystemMessage | HumanMessage | AIMessage> = [];

    if (!conversation) {
      console.log("No existing conversation found, creating new one");
      const systemMessage = new SystemMessage(getSystemPrompt(employeeName, context));
      messages = [systemMessage];

      const initialPrompt = ChatPromptTemplate.fromMessages(messages);
      const parser = new StringOutputParser();
      const chain = initialPrompt.pipe(model).pipe(parser);
      const initialResult = await chain.invoke({});

      messages.push(new AIMessage(initialResult));
    } else {
      console.log("Existing conversation found:", conversation);
      messages = conversation.messages.map((msg: { role: string; content: string }) => {
        if (msg.role === "system") return new SystemMessage(msg.content);
        if (msg.role === "user") return new HumanMessage(msg.content);
        if (msg.role === "ai") return new AIMessage(msg.content);
        throw new Error(`Invalid message role: ${msg.role}`);
      });
    }

    if (typeof input === "string" && input.toLowerCase().includes("end conversation")) {
      console.log("Ending conversation, generating feedback");
      const conversationText = messages
        .filter((msg) => !(msg instanceof SystemMessage))
        .map((msg) => `${msg._getType()}: ${msg.content}`)
        .join("\n");

      const feedbackChain = FEEDBACK_PROMPT.pipe(model).pipe(new StringOutputParser());
      const feedbackResult = await feedbackChain.invoke({ conversation: conversationText });
      console.log("Raw feedback result:", feedbackResult);

      const jsonMatch = feedbackResult.match(/```json\n([\s\S]*?)\n```/);
      if (!jsonMatch || !jsonMatch[1]) {
        console.error("No valid JSON found in feedback result:", feedbackResult);
        throw new Error("Invalid feedback format: JSON not found");
      }

      let feedbackJson: any;
      try {
        feedbackJson = JSON.parse(jsonMatch[1]);
      } catch (parseError) {
        console.error("Failed to parse feedback JSON:", parseError);
        throw new Error(`Invalid feedback format: ${parseError}`);
      }

      const transformedFeedback: Feedback = {
        sbi_usage: {
          score: feedbackJson.sbi_usage?.score || 50,
          description: feedbackJson.sbi_usage?.description || "No SBI feedback provided.",
        },
        action_plan: {
          score: feedbackJson.action_plan?.score || 50,
          description: feedbackJson.action_plan?.description || "No action plan feedback provided.",
        },
        balance: {
          score: feedbackJson.balance?.score || 50,
          description: feedbackJson.balance?.description || "No balance feedback provided.",
        },
        overall: feedbackJson.overall ? feedbackJson.overall.split(". ").filter((s: string) => s.trim()) : [],
      };

      console.log("Transformed feedback:", transformedFeedback);

      console.log("Deleting conversation with sessionId:", sessionId);
      await supabase.from("conversations").delete().eq("session_id", sessionId);
      return NextResponse.json({ feedback: transformedFeedback });
    }

    let result = "";
    if (typeof input === "string" && input.trim()) {
      messages.push(new HumanMessage(input));
      const prompt = ChatPromptTemplate.fromMessages(messages);
      const parser = new StringOutputParser();
      const chain = prompt.pipe(model).pipe(parser);
      result = await chain.invoke({});
    } else if (!conversation) {
      result = messages[messages.length - 1].content as string;
    } else {
      return NextResponse.json({ response: "" });
    }

    const updatedMessages = conversation
      ? [
          ...messages.map((msg) => ({
            role: msg._getType(),
            content: msg.content,
          })),
          ...(typeof input === "string" && input.trim() ? [{ role: "ai", content: result }] : []),
        ]
      : messages.map((msg) => ({
          role: msg._getType(),
          content: msg.content,
        }));

    const maxMessages = 10;
    const trimmedMessages =
      updatedMessages.length > maxMessages
        ? [updatedMessages[0], ...updatedMessages.slice(-maxMessages + 1)]
        : updatedMessages;

    let conversationId = conversation?.id;
    if (!conversationId) {
      console.log("Inserting new conversation with messages:", trimmedMessages);
      const { data: newConversation, error: insertError } = await supabase
        .from("conversations")
        .insert({
          scenario_id: scenarioId,
          session_id: sessionId,
          user_id: userId,
          messages: trimmedMessages,
          employee_name: employeeName,
          context: context,
        })
        .select()
        .maybeSingle();

      if (insertError) {
        console.error("Supabase insert error:", {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint,
        });
        throw new Error(`Failed to create new conversation: ${insertError.message}`);
      }
      if (!newConversation) {
        console.error("No conversation returned from insert");
        throw new Error("Failed to create new conversation: No data returned");
      }

      conversationId = newConversation.id;
    } else {
      console.log("Updating existing conversation:", conversationId);
      const { error: updateError } = await supabase
        .from("conversations")
        .update({ messages: trimmedMessages })
        .eq("id", conversationId);

      if (updateError) {
        console.error("Supabase update error:", updateError);
        throw new Error(`Failed to update existing conversation: ${updateError.message}`);
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