import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
const client = new OpenAI();

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { body } = await request.json();
    const user = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!body) {
      return NextResponse.json(
        { error: `Missing body with prompt` },
        { status: 400 }
      );
    }

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: `${body}`,
    });

    return NextResponse.json(response.output_text, { status: 200 });
  } catch (error) {
    console.error("Error with prompt:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
