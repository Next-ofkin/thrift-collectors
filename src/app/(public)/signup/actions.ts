"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Simple guard: anything not "agent" becomes "customer"
function normalizeRole(r: string) {
  return r === "agent" ? "agent" : "customer";
}

export async function signupWithEmail(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const full_name = String(formData.get("full_name") ?? "").trim();
  const role = normalizeRole(String(formData.get("role") ?? "customer"));

  if (!email || !password || !full_name) {
    redirect(`/signup?error=${encodeURIComponent("All fields are required")}`);
  }

  const supabase = await createSupabaseServerClient();

  // Create the auth user and stash role/full_name in user_metadata
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role, full_name },
      // Optional: set this if you want email links to come back to your app
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/home`,
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  // If your project requires email confirmation, there won't be a session yet
  if (!data.session || !data.user) {
    redirect(`/login?msg=${encodeURIComponent("Account created. Check your email to confirm.")}`);
  }

  // If auto-confirm is enabled, create the profile row now (RLS allows id = auth.uid())
  const user = data.user;
  const { error: profileErr } = await supabase.from("profiles").insert({
    id: user.id,
    role,
    full_name,
  });

  // Ignore duplicate races; otherwise, surface the error
  if (profileErr && profileErr.code !== "23505") {
    redirect(`/signup?error=${encodeURIComponent(profileErr.message)}`);
  }

  redirect("/home");
}
