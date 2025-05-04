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

Ensure the response contains only the JSON object inside the code fences, with no additional text or comments. If no conversation is provided or the conversation is too short to analyze, return an empty JSON object:
\`\`\`json
{}
\`\`\`

Conversation:
{{conversation}}
`),
]);

// Validate if human messages contain substantive feedback
const isSubstantiveFeedback = (messages: HumanMessage[]): boolean => {
  const feedbackKeywords = [
    "situation",
    "behavior",
    "impact",
    "plan",
    "suggest",
    "action",
    "improve",
    "strategy",
    "feedback",
    "deadline",
    "priority",
    "workload",
  ];
  return messages.some((msg) => {
    const content = typeof msg.content === "string" ? msg.content.toLowerCase() : "";
    const wordCount = content.split(/\s+/).length;
    const hasKeywords = feedbackKeywords.some((keyword) => content.includes(keyword));
    return wordCount > 10 || (wordCount > 5 && hasKeywords);
  });
};

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

    console.log("Fetched conversation:", conversation);

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
      console.log("Existing conversation messages:", conversation.messages);
      messages = conversation.messages.map((msg: { role: string; content: string }) => {
        if (msg.role === "system") return new SystemMessage(msg.content);
        if (msg.role === "human") return new HumanMessage(msg.content);
        if (msg.role === "ai") return new AIMessage(msg.content);
        throw new Error(`Invalid message role: ${msg.role}`);
      });
    }

    if (typeof input === "string" && input.toLowerCase().includes("end conversation")) {
      console.log("Ending conversation, generating feedback");
      console.log("Messages before feedback:", messages);
      const conversationText = messages
        .filter((msg) => !(msg instanceof SystemMessage))
        .map((msg) => `${msg._getType()}: ${msg.content}`)
        .join("\n");
      console.log("Conversation text:", conversationText);

      const nonSystemMessages = messages.filter((msg) => !(msg instanceof SystemMessage));
      const humanMessages = nonSystemMessages.filter((msg) => msg instanceof HumanMessage) as HumanMessage[];
      console.log("Non-system messages:", nonSystemMessages.length, "Human messages:", humanMessages.length);

      if (humanMessages.length === 0) {
        console.log("No human messages found, returning default feedback");
        const defaultFeedback = {
          feedback: {
            sbi_usage: {
              score: 0,
              description: `No mentor feedback provided to evaluate SBI usage. Please respond to ${employeeName}'s concerns before ending the conversation.`,
            },
            action_plan: {
              score: 0,
              description: "No action plan provided due to lack of mentor feedback.",
            },
            balance: {
              score: 0,
              description: "No mentor feedback given to assess balance of praise and constructive feedback.",
            },
            overall: [
              `To receive feedback, provide at least one response to ${employeeName}'s concerns using the SBI model (Situation, Behavior, Impact).`,
            ],
          },
        };
        console.log("Returning default feedback:", defaultFeedback);
        return NextResponse.json(defaultFeedback);
      }

      if (!isSubstantiveFeedback(humanMessages)) {
        console.log("Human messages lack substantive feedback, returning default feedback");
        const defaultFeedback = {
          feedback: {
            sbi_usage: {
              score: 0,
              description: `Your responses were too brief or off-topic to evaluate SBI usage. Please provide specific feedback addressing ${employeeName}'s concerns, using the SBI model (Situation, Behavior, Impact).`,
            },
            action_plan: {
              score: 0,
              description: `No actionable steps were provided. Suggest specific strategies to help ${employeeName} improve.`,
            },
            balance: {
              score: 0,
              description: "No praise or constructive feedback was given to assess balance. Include both in your responses.",
            },
            overall: [
              `To receive a full evaluation, provide detailed feedback to ${employeeName} using the SBI model, include an action plan, and balance praise with constructive feedback. For example, describe a specific situation, the behavior observed, and its impact.`,
            ],
          },
        };
        console.log("Returning default feedback:", defaultFeedback);
        return NextResponse.json(defaultFeedback);
      }

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

      if (Object.keys(feedbackJson).length === 0 || !feedbackJson.sbi_usage?.description) {
        console.log("Model returned empty or incomplete feedback, returning default feedback");
        const defaultFeedback = {
          feedback: {
            sbi_usage: {
              score: 0,
              description: `Your responses did not provide enough detail to evaluate SBI usage. Please use the SBI model by describing a specific situation, the behavior observed, and its impact.`,
            },
            action_plan: {
              score: 0,
              description: `No actionable steps were provided. Include specific strategies to help ${employeeName} address their concerns.`,
            },
            balance: {
              score: 0,
              description: "No praise or constructive feedback was given to assess balance. Ensure your responses include both.",
            },
            overall: [
              `To receive a full evaluation, provide detailed feedback to ${employeeName} using the SBI model, suggest an action plan, and balance praise with constructive feedback.`,
            ],
          },
        };
        console.log("Returning default feedback:", defaultFeedback);
        return NextResponse.json(defaultFeedback);
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
      console.log("New human message:", input);
      console.log("AI response:", result);
    } else if (!conversation) {
      result = messages[messages.length - 1].content as string;
    } else {
      return NextResponse.json({ response: "" });
    }

    // Refetch conversation to prevent overwrites
    console.log("Refetching conversation before update for sessionId:", sessionId);
    const { data: latestConversation, error: refetchError } = await supabase
      .from("conversations")
      .select("*")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (refetchError) {
      console.error("Error refetching conversation:", refetchError);
      throw new Error(`Failed to refetch conversation: ${refetchError.message}`);
    }

    let latestMessages = messages;
    if (latestConversation) {
      console.log("Latest conversation messages:", latestConversation.messages);
      latestMessages = latestConversation.messages.map((msg: { role: string; content: string }) => {
        if (msg.role === "system") return new SystemMessage(msg.content);
        if (msg.role === "human") return new HumanMessage(msg.content);
        if (msg.role === "ai") return new AIMessage(msg.content);
        throw new Error(`Invalid message role: ${msg.role}`);
      });
      if (typeof input === "string" && input.trim()) {
        latestMessages.push(new HumanMessage(input));
        latestMessages.push(new AIMessage(result));
      }
    }

    const updatedMessages = latestMessages.map((msg) => ({
      role: msg._getType(),
      content: msg.content,
    }));

    const maxMessages = 10;
    const trimmedMessages =
      updatedMessages.length > maxMessages
        ? [updatedMessages[0], ...updatedMessages.slice(-maxMessages + 1)]
        : updatedMessages;

    console.log("Messages to save:", trimmedMessages);

    let conversationId = conversation?.id || latestConversation?.id;
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
      console.log("New conversation created with ID:", conversationId);
    } else {
      console.log("Updating existing conversation:", conversationId);
      const { data, error: updateError } = await supabase
        .from("conversations")
        .update({ messages: trimmedMessages })
        .eq("id", conversationId)
        .select();

      if (updateError) {
        console.error("Supabase update error:", {
          message: updateError.message,
          code: updateError.code,
          details: updateError.details,
          hint: updateError.hint,
        });
        throw new Error(`Failed to update existing conversation: ${updateError.message}`);
      }
      console.log("Conversation updated:", data);
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