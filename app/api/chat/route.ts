import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Feedback } from "@/lib/types";

const getSystemPrompt = (employeeName: string, context: string) => `
You are ${employeeName}, an employee in a one-on-one meeting with your mentor. Respond realistically based on this context: ${context}

Your role is to:
1. Start the conversation by briefly acknowledging the meeting and sharing a relevant challenge or question
2. Acknowledge feedback professionally, addressing the issues raised
3. Share relevant challenges without being defensive
4. Engage with the mentor's suggestions and collaborate on an action plan
5. Maintain a supportive, professional tone

If the user says "End conversation" or similar, simply acknowledge the end of the conversation and thank them for their time.

IMPORTANT: As the employee, you should:
- Be open to receiving feedback
- Ask for specific examples when receiving feedback
- Show willingness to improve
- Discuss concrete action plans
- Balance acknowledging strengths with areas for improvement
`;

const FEEDBACK_PROMPT = ChatPromptTemplate.fromMessages([
  new SystemMessage(`
You are a feedback analyzer. Your task is to analyze the following conversation and provide structured feedback.

IMPORTANT: You must analyze the actual content of the conversation, not just check for keywords. Look for:
1. Specific examples of feedback given
2. Concrete suggestions for improvement
3. Balance between positive and constructive feedback
4. Clear action items or next steps

Analyze the conversation based on:
1. Use of the SBI model (Situation, Behavior, Impact)
2. Inclusion of an action plan
3. Balance of praise and constructive feedback

Return your analysis as a JSON object in this exact format:
{
  "sbi_usage": {
    "score": <number between 0 and 100>,
    "description": "<Detailed description of SBI usage, including specific examples from the conversation>"
  },
  "action_plan": {
    "score": <number between 0 and 100>,
    "description": "<Detailed description of action plan, including specific steps mentioned>"
  },
  "balance": {
    "score": <number between 0 and 100>,
    "description": "<Detailed description of feedback balance, including examples of both praise and constructive feedback>"
  },
  "overall": "<Overall assessment with specific examples from the conversation>"
}

Guidelines for scoring:
- SBI Usage (0-100):
  * 0-30: No clear SBI elements or very vague feedback
  * 31-60: Some SBI elements present but incomplete or unclear
  * 61-80: Most SBI elements present and clear, with specific examples
  * 81-100: All SBI elements present, well-structured, with clear examples and impact

- Action Plan (0-100):
  * 0-30: No clear action plan or very vague suggestions
  * 31-60: Some suggestions but not specific or measurable
  * 61-80: Clear steps with some detail and timeline
  * 81-100: Specific, measurable, actionable steps with clear follow-up and timeline

- Balance (0-100):
  * 0-30: No balance between praise and criticism
  * 31-60: Some balance but could be improved
  * 61-80: Good balance with specific examples of both
  * 81-100: Excellent balance with clear examples of strengths and areas for improvement

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

    console.log("Processing request with sessionId:", sessionId, "input:", input);

    const model = new ChatOpenAI({
      model: "gpt-4.1",
      temperature: 0.2,
    });

    let messages: Array<SystemMessage | HumanMessage | AIMessage> = [];
    let conversationId: string | null = null;

    // Fetch conversation
    const { data: conversation, error: fetchError } = await supabase
      .from("conversations")
      .select("*")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching conversation:", fetchError);
      return NextResponse.json(
        { error: `Failed to fetch conversation: ${fetchError.message}` },
        { status: 500 }
      );
    }

    console.log("Fetched conversation:", conversation);

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
      console.log("Existing conversation messages:", conversation.messages);
      messages = conversation.messages.map((msg: { role: string; content: string }) => {
        if (msg.role === "system") return new SystemMessage(msg.content);
        if (msg.role === "human") return new HumanMessage(msg.content);
        if (msg.role === "ai") return new AIMessage(msg.content);
        throw new Error(`Invalid message role: ${msg.role}`);
      });
      conversationId = conversation.id;
    }

    if (typeof input === "string" && input.toLowerCase().includes("end conversation")) {
      console.log("Ending conversation, generating feedback");
      console.log("Messages before feedback:", messages);
      const conversationText = messages
        .filter((msg) => !(msg instanceof SystemMessage))
        .map((msg) => `${msg._getType()}: ${msg.content}`)
        .join("\n");
      console.log("Conversation text:", conversationText);

      const feedbackChain = FEEDBACK_PROMPT.pipe(model).pipe(new StringOutputParser());
      const feedbackResult = await feedbackChain.invoke({ conversation: conversationText });
      console.log("Raw feedback result:", feedbackResult);

      let feedbackJson: any;
      try {
        // Try to parse the feedback result directly as JSON
        feedbackJson = JSON.parse(feedbackResult);
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

      // Store feedback in conversation
      if (conversationId) {
        console.log("Storing feedback in conversation");
        await supabase
          .from("conversations")
          .update({ feedback: transformedFeedback })
          .eq("id", conversationId);
      }

      return NextResponse.json({ feedback: transformedFeedback });
    }

    // Regular chat response handling
    let result = "";
    if (typeof input === "string" && input.trim()) {
      messages.push(new HumanMessage(input));
      const prompt = ChatPromptTemplate.fromMessages(messages);
      const parser = new StringOutputParser();
      const chain = prompt.pipe(model).pipe(parser);
      result = await chain.invoke({});
      console.log("New human message:", input);
      console.log("AI response:", result);
      messages.push(new AIMessage(result));
    } else if (!conversation) {
      result = messages[messages.length - 1].content as string;
    } else {
      return NextResponse.json({ response: "" });
    }

    const updatedMessages = messages.map((msg) => ({
      role: msg._getType(),
      content: msg.content,
    }));

    const maxMessages = 10;
    const trimmedMessages =
      updatedMessages.length > maxMessages
        ? [updatedMessages[0], ...updatedMessages.slice(-maxMessages + 1)]
        : updatedMessages;

    console.log("Messages to save:", trimmedMessages);

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
        return NextResponse.json(
          { error: `Failed to create new conversation: ${insertError.message}` },
          { status: 500 }
        );
      }
      if (!newConversation) {
        console.error("No conversation returned from insert");
        return NextResponse.json(
          { error: "Failed to create new conversation: No data returned" },
          { status: 500 }
        );
      }

      conversationId = newConversation.id;
      console.log("New conversation created with ID:", conversationId);
    } else {
      console.log("Upserting conversation:", conversationId);
      const { data, error: upsertError } = await supabase
        .from("conversations")
        .upsert({
          id: conversationId,
          session_id: sessionId,
          user_id: userId,
          scenario_id: scenarioId,
          messages: trimmedMessages,
          employee_name: employeeName,
          context: context,
        })
        .select();

      if (upsertError) {
        console.error("Supabase upsert error:", {
          message: upsertError.message,
          code: upsertError.code,
          details: upsertError.details,
          hint: upsertError.hint,
        });
        return NextResponse.json(
          { error: `Failed to upsert conversation: ${upsertError.message}` },
          { status: 500 }
        );
      }
      console.log("Conversation upserted successfully:", data);
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