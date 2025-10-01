import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { requestWithdrawal } from "./actions";

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

export default async function AccountPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string; msg?: string }>;
}) {
  const { id } = await params;
  const sp = (await searchParams) || {};
  const error = sp.error;
  const msg = sp.msg;

  const supabase = await createSupabaseServerClient();

  const { data: account } = await supabase
    .from("accounts")
    .select("id, display_name, current_balance")
    .eq("id", id)
    .single();

  if (!account) return notFound();

  const { data: txns, error: txErr } = await supabase
    .from("transactions")
    .select(
      "id, type, amount, description, status, reference_code, created_at"
    )
    .eq("account_id", account.id)
    .order("created_at", { ascending: false });

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{account.display_name}</h1>
        <div className="text-lg">
          Balance: ₦{Number(account.current_balance).toLocaleString()}
        </div>
      </header>

      {msg && <div className="alert alert-info">{msg}</div>}
      {(error || txErr) && (
        <div className="alert alert-error">{error ?? txErr?.message}</div>
      )}

      {/* Request Withdrawal (customer) */}
      <section className="border rounded-lg p-4 space-y-3">
        <h2 className="font-medium">Request Withdrawal</h2>
        <form action={requestWithdrawal} className="flex gap-2 items-center">
          <input type="hidden" name="account_id" value={account.id} />
          <input
            className="input input-bordered w-40"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="Amount"
            required
          />
          <input
            className="input input-bordered flex-1"
            name="description"
            placeholder="Note (optional)"
          />
          <button className="btn btn-outline">Request</button>
        </form>
        <p className="text-xs opacity-70">
          You can’t request more than your available balance.
        </p>
      </section>

      {/* Transactions */}
      <section className="space-y-2">
        <h2 className="font-medium">Transactions</h2>
        <ul className="space-y-2">
          {(txns ?? []).map((t) => (
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
          {(txns ?? []).length === 0 && (
            <p className="opacity-60 text-sm">No transactions yet.</p>
          )}
        </ul>
      </section>
    </main>
  );
}
