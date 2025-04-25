import { createClient } from "@/utils/supabase/client";
import type { Database } from "@/utils/supabase/database.types";

export type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
export type ConversationInsert =
  Database["public"]["Tables"]["conversations"]["Insert"];
export type ConversationUpdate =
  Database["public"]["Tables"]["conversations"]["Update"];

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface Feedback {
  clarity: number;
  empathy: number;
  effectiveness: number;
  strengths: string[];
  improvements: string[];
  summary: string;
}

export async function getUserConversations() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
      *,
      scenarios:scenario_id (title)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }

  return data;
}

export async function getConversationById(id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
      *,
      scenarios:scenario_id (*)
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching conversation:", error);
    throw error;
  }

  return data;
}

export async function saveConversation(conversation: ConversationInsert) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("conversations")
    .insert(conversation)
    .select()
    .single();

  if (error) {
    console.error("Error saving conversation:", error);
    throw error;
  }

  return data;
}

export async function updateConversation(
  id: string,
  updates: ConversationUpdate
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("conversations")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating conversation:", error);
    throw error;
  }

  return data;
}

export async function deleteConversation(id: string) {
  const supabase = createClient();

  const { error } = await supabase.from("conversations").delete().eq("id", id);

  if (error) {
    console.error("Error deleting conversation:", error);
    throw error;
  }

  return true;
}
