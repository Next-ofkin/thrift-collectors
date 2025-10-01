import { createSupabaseServerClient } from "@/lib/supabase/server";
import CreateAccountForm from "./ui/CreateAccountForm";
import DepositForm from "./ui/DepositForm";
import { redirect } from "next/navigation";
import { approveWithdrawal, declineWithdrawal } from "./withdrawal-actions";

/** DB types (narrowed to what we select) */
type Role = "agent" | "customer";
type TxStatus = "pending" | "completed" | "failed";
type TxType = "deposit" | "withdrawal" | "loan" | "interest";

type ProfileRow = { role: Role };

type AccountRow = {
  id: string;
  display_name: string;
  account_code: string | null;
  linking_status: string | null;
  current_balance: number;
  status: string | null;
  agent_user_id?: string;
};

type PendingWithdrawalRow = {
  id: string;
  account_id: string;
  amount: number;
  description: string | null;
  reference_code: string;
  created_at: string;
  status: TxStatus;
  type: TxType;
  // Supabase can return the embedded relation as object OR array depending on join/cardinality.
  // We support both without using `any`.
  accounts?:
    | { display_name: string }
    | Array<{ display_name: string }>;
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

function accountNameOf(w: Pick<PendingWithdrawalRow, "accounts">): string {
  const acc = w.accounts;
  if (Array.isArray(acc)) return acc[0]?.display_name ?? "Account";
  if (acc && "display_name" in acc) return acc.display_name ?? "Account";
  return "Account";
}

export default async function AgentDashboard({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; msg?: string }>;
}) {
  const sp = (await searchParams) || {};
  const errorMsg = sp.error;
  const infoMsg = sp.msg;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Ensure only agents can access
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<ProfileRow>();
  if (profile?.role !== "agent") redirect("/home");

  // Agent's accounts
  const { data: accounts, error: accErr } = await supabase
    .from("accounts")
    .select(
      "id, display_name, account_code, linking_status, current_balance, status"
    )
    .eq("agent_user_id", user.id)
    .order("created_at", { ascending: false })
    .returns<AccountRow[]>();

  // Pending withdrawals across this agent's accounts
  const { data: pending } = await supabase
    .from("transactions")
    .select(
      `
      id,
      account_id,
      amount,
      description,
      reference_code,
      created_at,
      status,
      type,
      accounts!inner (
        display_name
      )
    `
    )
    .eq("type", "withdrawal")
    .eq("status", "pending")
    .eq("accounts.agent_user_id", user.id)
    .order("created_at", { ascending: false })
    .returns<PendingWithdrawalRow[]>();

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-8">
      {(infoMsg || errorMsg) && (
        <div className={`alert ${errorMsg ? "alert-error" : "alert-info"}`}>
          {errorMsg ?? infoMsg}
        </div>
      )}

      {/* Header with Customers link */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Agent Overview</h1>
        <a className="btn btn-sm btn-outline" href="/agent/customers">
          Customers
        </a>
      </div>

      {/* Create account */}
      <section className="border rounded-xl p-4">
        <h2 className="font-semibold mb-3">Create New Account</h2>
        <CreateAccountForm />
      </section>

      {/* Pending withdrawals */}
      <section className="space-y-3">
        <h2 className="font-semibold">Pending Withdrawals</h2>
        <ul className="space-y-2">
          {(pending ?? []).map((w) => (
            <li key={w.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{accountNameOf(w)}</div>
                  <div className="text-xs opacity-70">
                    Ref: {w.reference_code}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    ₦{Number(w.amount).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 justify-end text-xs opacity-80">
                    <span>{new Date(w.created_at).toLocaleString()}</span>
                    <span className={statusBadgeClass(w.status)}>
                      {w.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-sm mt-2">{w.description ?? ""}</div>
              <div className="flex gap-2 mt-3">
                <form action={approveWithdrawal}>
                  <input type="hidden" name="txn_id" value={w.id} />
                  <button className="btn btn-sm btn-primary">
                    Approve &amp; Pay
                  </button>
                </form>
                <form action={declineWithdrawal}>
                  <input type="hidden" name="txn_id" value={w.id} />
                  <button className="btn btn-sm">Decline</button>
                </form>
              </div>
            </li>
          ))}
          {(pending ?? []).length === 0 && (
            <p className="opacity-60 text-sm">No pending withdrawals.</p>
          )}
        </ul>
      </section>

      {/* Accounts grid */}
      <section className="space-y-3">
        <h2 className="font-semibold">Your Accounts</h2>
        {accErr && <div className="alert alert-error">{accErr.message}</div>}
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
              <div className="text-sm">
                Link code:{" "}
                <span className="font-mono">{a.account_code}</span>
              </div>
              <DepositForm accountId={a.id} />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
