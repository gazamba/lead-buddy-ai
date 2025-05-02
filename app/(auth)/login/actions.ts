"use server";

import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  return error;
}

export async function signup(formData: FormData) {

  const supabase = await createClient();
  
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        firstName,
        lastName: formData.get("lastName") as string,
        avatar_initial: firstName[0],
      },
    },
  });

  return error;
}

export async function signOut() {

  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  
  return error;
}
