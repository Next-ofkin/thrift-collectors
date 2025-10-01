"use server";

import { redirect } from "next/navigation";
import { createSupabaseActionClient } from "@/lib/supabase/server";

export async function loginWithEmailPassword(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/home");

  const supabase = await createSupabaseActionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`);
  }

  redirect(next || "/home");
}

export async function logout(): Promise<void> {
  const supabase = await createSupabaseActionClient();
  await supabase.auth.signOut();
  redirect("/login");
}
