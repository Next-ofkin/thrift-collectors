import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DepositForm from "../../ui/DepositForm";

type Role = "agent" | "customer";
type TxStatus = "pending" | "completed" | "failed";
type TxType = "deposit" | "withdrawal" | "loan" | "interest";

type ProfileRow = { role: Role };
type CustomerProfile = { full_name: string | null; phone: string | null };

type AccountRow = {
  id: string;
  display_name: string;
  current_balance: number;
  status: string | null;
  linking_status: string | null;
};

type TxRow = {
  id: string;
  account_id: string;
  type: TxType;
  amount: number;
  status: TxStatus;
  description: string | null;
  reference_code: string;
  created_at: string;
};

function statusBadgeClass(status?: string) {
  switch ((status ?? "").toLowerCase()) {
    case "pending":
      return "badge badge-warning";
    case "completed":
      return "badge badge-success";
    case "failed":
      return "badge badge-error";
    default:
      return "badge";
  }
}

export default async function AgentCustomerDetail({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;

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

  // Customer profile (safe columns)
  const { data: customer } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", customerId)
    .maybeSingle<CustomerProfile>();

  // Accounts for this customer under this agent
  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, display_name, current_balance, status, linking_status")
    .eq("agent_user_id", user.id)
    .eq("customer_user_id", customerId)
    .order("created_at", { ascending: false })
    .returns<AccountRow[]>();

  // Recent transactions across those accounts
  const accountIds = (accounts ?? []).map((a) => a.id);
  let txns: TxRow[] = [];
  if (accountIds.length) {
    const { data } = await supabase
      .from("transactions")
      .select(
        "id, account_id, type, amount, status, description, reference_code, created_at"
      )
      .in("account_id", accountIds)
      .order("created_at", { ascending: false })
      .limit(50)
      .returns<TxRow[]>();
    txns = data ?? [];
  }

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            {customer?.full_name ?? "Customer"}
          </h1>
          {customer?.phone && (
            <div className="text-sm opacity-70">{customer.phone}</div>
          )}
        </div>
        <a href="/agent/customers" className="btn btn-sm">
          Back
        </a>
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold">Accounts</h2>
        <ul className="grid md:grid-cols-2 gap-3">
          {(accounts ?? []).map((a) => (
            <li key={a.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">{a.display_name}</div>
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    ₦{Number(a.current_balance).toLocaleString()}
                  </div>
                  <div className="text-xs opacity-70">
                    {a.status} · {a.linking_status}
                  </div>
                </div>
              </div>
              {/* Quick deposit on this account */}
              <DepositForm accountId={a.id} />
            </li>
          ))}
          {(accounts ?? []).length === 0 && (
            <p className="opacity-60 text-sm">No accounts for this customer.</p>
          )}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Recent Transactions</h2>
        <ul className="space-y-2">
          {txns.map((t) => (
            <li key={t.id} className="border rounded-md p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium capitalize">{t.type}</div>
                <div>₦{Number(t.amount).toLocaleString()}</div>
              </div>
              <div className="flex items-center justify-between text-xs opacity-80 mt-1">
                <span>{new Date(t.created_at).toLocaleString()}</span>
                <span className={statusBadgeClass(t.status)}>{t.status}</span>
              </div>
              {t.description && (
                <div className="text-sm mt-1">{t.description}</div>
              )}
              <div className="text-[11px] opacity-60 mt-1">
                Ref: {t.reference_code}
              </div>
            </li>
          ))}
          {txns.length === 0 && (
            <p className="opacity-60 text-sm">No recent transactions.</p>
          )}
        </ul>
      </section>
    </main>
  );
}
