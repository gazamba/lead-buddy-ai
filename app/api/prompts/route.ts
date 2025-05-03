import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt: input } = await req.json();
    const model = new ChatOpenAI({
      model: "gpt-4.1",
      temperature: 0.4
    });

    const messages = [
      new SystemMessage("You are an expert leadership coach"),
      new HumanMessage(input),
    ];
    console.log(messages)
    const result = await model.invoke(messages);

    return NextResponse.json(result.content);
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to connect to OpenAI services" },
      { status: 500 }
    );
  }
}
