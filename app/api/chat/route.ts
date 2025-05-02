import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

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

// Feedback prompt for analyzing the conversation
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
    // Validate inputs
    if (!sessionId || typeof sessionId !== "string") {
      console.error("Validation error: Invalid session ID", { sessionId });
      return NextResponse.json(
        { error: "Invalid session ID" },
        { status: 400 }
      );
    }
    if (!employeeName || typeof employeeName !== "string" || !context || typeof context !== "string") {
      console.error("Validation error: Missing employeeName or context", { employeeName, context });
      return NextResponse.json(
        { error: "Employee name and context are required" },
        { status: 400 }
      );
    }

    // Fetch or initialize conversation history from Supabase
    let { data: conversation, error } = await supabase
      .from("conversations")
      .select("messages, employee_name, context")
      .eq("session_id", sessionId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Supabase fetch error:", error);
      throw new Error(`Failed to fetch conversation: ${error.message}`);
    }

    // If no conversation exists, create a new one
    if (!conversation) {
      if (input) {
        console.warn("Attempted to send message to non-existent conversation", { sessionId, input });
        return NextResponse.json(
          { error: "Conversation not found. Please start a new conversation." },
          { status: 404 }
        );
      }

      const systemPrompt = getSystemPrompt(employeeName, context);
      const initialMessages = [
        { role: "system", content: systemPrompt },
        { role: "assistant", content: `Hello, I'm ${employeeName}. I'm here for our meeting. What did you want to discuss?` },
      ];
      const { error: insertError, data: insertData } = await supabase
        .from("conversations")
        .insert({
          session_id: sessionId,
          employee_name: employeeName,
          context,
          messages: initialMessages,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        throw new Error(`Failed to create conversation: ${insertError.message}`);
      }

      console.log("New conversation created", { sessionId, employeeName, insertData });
      return NextResponse.json({ response: initialMessages[1].content });
    }

    // Validate input for existing conversations
    if (!input || typeof input !== "string") {
      console.error("Validation error: Invalid input", { input });
      return NextResponse.json(
        { error: "Input is required for ongoing conversations" },
        { status: 400 }
      );
    }

    // Initialize the model
    const model = new ChatOpenAI({
      model: "gpt-4.1",
      temperature: 0.2,
    });

    // Convert stored messages to LangChain message objects
    const messages = conversation.messages.map((msg: { role: string; content: string }) => {
      if (msg.role === "system") return new SystemMessage(msg.content);
      if (msg.role === "user") return new HumanMessage(msg.content);
      if (msg.role === "assistant") return new AIMessage(msg.content);
      throw new Error(`Invalid message role: ${msg.role}`);
    });

    // Check if the user wants to end the conversation
    if (input.toLowerCase().includes("end conversation")) {
      const conversationText = conversation.messages
        .filter((msg: { role: string }) => msg.role !== "system")
        .map((msg: { role: string; content: string }) => `${msg.role}: ${msg.content}`)
        .join("\n");

      const feedbackChain = FEEDBACK_PROMPT.pipe(model).pipe(new StringOutputParser());
      const feedbackResult = await feedbackChain.invoke({ conversation: conversationText });

      let feedbackJson;
      try {
        feedbackJson = JSON.parse(feedbackResult);
      } catch (parseError) {
        console.error("Failed to parse feedback JSON:", parseError);
        throw new Error("Invalid feedback format from model");
      }

      await supabase.from("conversations").delete().eq("session_id", sessionId);
      console.log("Conversation ended and deleted", { sessionId });

      return NextResponse.json({ feedback: feedbackJson });
    }

    // Add the new user message
    messages.push(new HumanMessage(input));

    // Create a prompt with the full conversation history
    const prompt = ChatPromptTemplate.fromMessages(messages);

    // Set up the chain: prompt -> model -> parser
    const parser = new StringOutputParser();
    const chain = prompt.pipe(model).pipe(parser);

    // Invoke the chain
    let result;
    try {
      result = await chain.invoke({});
    } catch (modelError) {
      console.error("Model invocation error:", modelError);
      return NextResponse.json(
        { error: "Failed to generate response from model" },
        { status: 500 }
      );
    }

    // Update the conversation history in Supabase
    const updatedMessages = [
      ...conversation.messages,
      { role: "user", content: input },
      { role: "assistant", content: result },
    ];

    // Trim history to avoid token limits
    const maxMessages = 10;
    const trimmedMessages =
      updatedMessages.length > maxMessages
        ? [updatedMessages[0], ...updatedMessages.slice(-maxMessages + 1)]
        : updatedMessages;

    const { error: updateError, data: updateData } = await supabase
      .from("conversations")
      .update({ messages: trimmedMessages })
      .eq("session_id", sessionId)
      .select()
      .single();

    if (updateError) {
      console.error("Supabase update error:", updateError);
      throw new Error(`Failed to update conversation: ${updateError.message}`);
    }

    console.log("Conversation updated", { sessionId, newMessage: result, updateData });
    return NextResponse.json({ response: result });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: `Unable to process request: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}