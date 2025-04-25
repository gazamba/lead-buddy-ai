import { createClient } from "@/utils/supabase/client";
import type { Database } from "@/utils/supabase/database.types";

export type Scenario = Database["public"]["Tables"]["scenarios"]["Row"];
export type ScenarioInsert =
  Database["public"]["Tables"]["scenarios"]["Insert"];
export type ScenarioUpdate =
  Database["public"]["Tables"]["scenarios"]["Update"];

export async function getUserScenarios() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("scenarios")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching scenarios:", error);
    throw error;
  }

  return data;
}

export async function getScenarioById(id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("scenarios")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching scenario:", error);
    throw error;
  }

  return data;
}

export async function createScenario(scenario: ScenarioInsert) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("scenarios")
    .insert(scenario)
    .select()
    .single();

  if (error) {
    console.error("Error creating scenario:", error);
    throw error;
  }

  return data;
}

export async function updateScenario(id: string, updates: ScenarioUpdate) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("scenarios")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating scenario:", error);
    throw error;
  }

  return data;
}

export async function deleteScenario(id: string) {
  const supabase = createClient();

  const { error } = await supabase.from("scenarios").delete().eq("id", id);

  if (error) {
    console.error("Error deleting scenario:", error);
    throw error;
  }

  return true;
}
