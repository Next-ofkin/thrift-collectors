"use server";

import { createSupabaseActionClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function requestWithdrawal(formData: FormData): Promise<void> {
  const account_id = String(formData.get("account_id") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  const description = String(formData.get("description") ?? "");

  if (!account_id || !(amount > 0)) {
    redirect(
      `/dashboard/account/${account_id}?error=${encodeURIComponent(
        "Enter a valid amount"
      )}`
    );
  }

  const supabase = await createSupabaseActionClient();
  const { error } = await supabase.rpc("request_withdrawal", {
    p_account_id: account_id,
    p_amount: amount,
    p_description: description || null,
  });

  if (error) {
    redirect(
      `/dashboard/account/${account_id}?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  redirect(
    `/dashboard/account/${account_id}?msg=${encodeURIComponent(
      "Withdrawal requested"
    )}`
  );
}
