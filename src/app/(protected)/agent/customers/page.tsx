import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

type Role = "agent" | "customer";

type ProfileRow = { role: Role };

type AccountsJoinRow = {
  customer_user_id: string | null;
  profiles: { full_name: string | null; phone: string | null } | null;
};

type CustomerListItem = {
  id: string;
  name: string;
  phone: string | null;
};

export default async function AgentCustomersPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<ProfileRow>();
  if (profile?.role !== "agent") redirect("/home");

  // Distinct customers for this agent via accounts
  const { data: rows, error } = await supabase
    .from("accounts")
    .select(
      "customer_user_id, profiles:profiles!accounts_customer_user_id_fkey(full_name, phone)"
    )
    .eq("agent_user_id", user.id)
    .not("customer_user_id", "is", null)
    .returns<AccountsJoinRow[]>();

  if (error) return <main className="p-6">Error: {error.message}</main>;

  const map = new Map<string, CustomerListItem>();
  for (const r of rows ?? []) {
    if (!r.customer_user_id) continue;
    const id = r.customer_user_id;
    const name = r.profiles?.full_name ?? "Customer";
    const phone = r.profiles?.phone ?? null;
    if (!map.has(id)) map.set(id, { id, name, phone });
  }
  const customers = Array.from(map.values());

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Your Customers</h1>
        <Link href="/agent" className="btn btn-sm">
          Back to Agent Overview
        </Link>
      </div>

      <ul className="space-y-2">
        {customers.map((c) => (
          <li
            key={c.id}
            className="border rounded-lg p-4 flex items-center justify-between"
          >
            <div>
              <div className="font-medium">{c.name}</div>
              {c.phone && <div className="text-xs opacity-70">{c.phone}</div>}
            </div>
            <Link
              href={`/agent/customers/${c.id}`}
              className="btn btn-sm btn-outline"
            >
              View
            </Link>
          </li>
        ))}
        {customers.length === 0 && (
          <p className="opacity-60 text-sm">No customers yet.</p>
        )}
      </ul>
    </main>
  );
}
