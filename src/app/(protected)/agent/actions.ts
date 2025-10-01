"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function genCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
}

function refCode(prefix = "DEP"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`.toUpperCase();
}

export async function createAccount(formData: FormData): Promise<{ error?: string; account_code?: string }> {
  const display_name = String(formData.get("display_name") ?? "").trim();
  if (!display_name) return { error: "Display name is required" };

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const code = genCode();

  const { error } = await supabase.from("accounts").insert({
    display_name,
    account_code: code,
    agent_user_id: user.id,
  });

  if (error) return { error: error.message };
  return { account_code: code };
}

export async function recordDeposit(formData: FormData): Promise<{ error?: string; reference_code?: string }> {
  const account_id = String(formData.get("account_id") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  const description = String(formData.get("description") ?? "");

  if (!account_id || !(amount > 0)) return { error: "Valid account and amount required" };

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const reference_code = refCode("DEP");

  // 1) ledger row
  const { error: tErr } = await supabase.from("transactions").insert({
    account_id,
    type: "deposit",
    amount,
    description,
    created_by: user.id,
    reference_code,
    status: "completed",
  });
  if (tErr) return { error: tErr.message };

  // 2) atomic balance increment
  const { error: aErr } = await supabase.rpc("increment_account_balance", {
    p_account_id: account_id,
    p_delta: amount,
  });
  if (aErr) return { error: aErr.message };

  return { reference_code };
}
