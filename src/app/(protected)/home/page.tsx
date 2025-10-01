import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function HomeRouter() {
  const supabase = await createSupabaseServerClient();

  // 1) Require login
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2) Try to read profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  let role = (profile?.role as "agent" | "customer" | undefined) ?? undefined;

  // 3) If missing, create from user metadata
  if (!role) {
    const metaRole =
      user.user_metadata?.role === "agent" ? "agent" : "customer";
    const full_name =
      (user.user_metadata?.full_name as string | undefined) ?? null;

    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      role: metaRole,
      full_name,
    });

    if (insertError && insertError.code !== "23505") {
      console.error("Failed to insert profile:", insertError.message);
      // optional: redirect("/login?error=profile-setup");
    }

    role = metaRole;
  }

  // 4) Route by role
  if (role === "agent") redirect("/agent");
  redirect("/dashboard"); // default: customer
}
