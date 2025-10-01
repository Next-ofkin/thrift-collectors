"use server";

import { createSupabaseActionClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function approveWithdrawal(formData: FormData): Promise<void> {
  const txn_id = String(formData.get("txn_id") ?? "");
  if (!txn_id) redirect("/agent?error=Missing transaction");

  const supabase = await createSupabaseActionClient();
  const { error } = await supabase.rpc("approve_withdrawal", { p_txn_id: txn_id });
  if (error) redirect(`/agent?error=${encodeURIComponent(error.message)}`);

  redirect(`/agent?msg=${encodeURIComponent("Withdrawal approved")}`);
}

export async function declineWithdrawal(formData: FormData): Promise<void> {
  const txn_id = String(formData.get("txn_id") ?? "");
  if (!txn_id) redirect("/agent?error=Missing transaction");

  const supabase = await createSupabaseActionClient();
  const { error } = await supabase.rpc("decline_withdrawal", { p_txn_id: txn_id });
  if (error) redirect(`/agent?error=${encodeURIComponent(error.message)}`);

  redirect(`/agent?msg=${encodeURIComponent("Withdrawal declined")}`);
}
