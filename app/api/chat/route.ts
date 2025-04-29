import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt: input } = await req.json();
    const model = new ChatOpenAI();

    const prompt = ChatPromptTemplate.fromMessages([
      new SystemMessage("You are an expert leadership coach"),
      new HumanMessage(input),
    ]);

    const parser = new StringOutputParser();
    const chain = prompt.pipe(model).pipe(parser);

    const result = await chain.invoke(input);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json("Failed to connect to chat", { status: 500 });
  }
}
