import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function ensureProfile() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return;

  const role = (user.user_metadata?.role === "agent") ? "agent" : "customer";
  const full_name = String(user.user_metadata?.full_name ?? "");

  await supabase.from("profiles").insert({
    id: user.id, role, full_name
  });
}
