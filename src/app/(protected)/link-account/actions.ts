"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function linkAccount(formData: FormData): Promise<void> {
  const raw = String(formData.get("code") ?? "").trim();
  const code = raw.replace(/\D/g, ""); // keep digits only

  if (code.length !== 6) {
    redirect("/link-account?error=Enter a valid 6-digit code");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("link_account_by_code", { p_code: code });

  if (error) redirect(`/link-account?error=${encodeURIComponent(error.message)}`);
  if (!data) redirect(`/link-account?error=${encodeURIComponent("Unable to link account")}`);

  redirect(`/dashboard/account/${data}`);
}
