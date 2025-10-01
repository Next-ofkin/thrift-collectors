// src/app/(protected)/dashboard/page.tsx
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import BalanceCard from "./ui/BalanceCard";
import { statusBadgeClass, typeColorClass } from "@/lib/ui";

type Role = "agent" | "customer";

type ProfileRow = {
  role: Role;
  full_name: string | null;
};

type AccountRow = {
  id: string;
  display_name: string;
  current_balance: number;
  status: string | null;
  linking_status: string | null;
  target_balance: number | null;
};

type TxRow = {
  id: string;
  account_id: string;
  type: string;
  amount: number;
  status: string;
  description: string | null;
  reference_code: string;
  created_at: string;
};

export default async function CustomerDashboard() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single<ProfileRow>();

  if (profile?.role === "agent") redirect("/home");

  const { data: accounts } = await supabase
    .from("accounts")
    .select(
      "id, display_name, current_balance, status, linking_status, target_balance"
    )
    .eq("customer_user_id", user.id)
    .order("created_at", { ascending: true })
    .returns<AccountRow[]>();

  const fullName = profile?.full_name ?? "Customer";
  const primary = (accounts ?? [])[0];

  // ——— No-linked state (fully responsive) ———
  if (!primary) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-3 py-6 sm:px-4 sm:py-8">
        <div className="w-full max-w-2xl space-y-6 sm:space-y-8 md:space-y-10">
          {/* Hero Section */}
          <section className="text-center space-y-3 sm:space-y-4">
            <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 grid place-items-center shadow-sm">
              <span className="text-3xl sm:text-4xl md:text-5xl">🔗</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent px-4">
                Connect Your Savings Account
              </h1>
              <p className="text-sm sm:text-base opacity-70 max-w-md mx-auto leading-relaxed px-4">
                Get started by linking your account using the 6-digit code from your agent
              </p>
            </div>
          </section>

          {/* Connection Card */}
          <section className="px-3 sm:px-0">
            <div className="card bg-base-100 border-2 border-base-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body gap-4 sm:gap-5 md:gap-6 p-4 sm:p-6 md:p-8">
                {/* Code Input Form */}
                <div className="form-control">
                  <label className="label pb-2">
                    <span className="label-text font-medium text-sm sm:text-base">Enter Code</span>
                    <span className="label-text-alt badge badge-sm badge-ghost text-[10px] sm:text-xs">6 digits</span>
                  </label>
                  <form
                    action="/link-account"
                    method="GET"
                    className="flex flex-col sm:flex-row gap-2 sm:gap-3"
                  >
                    <input
                      name="code"
                      placeholder="123456"
                      inputMode="numeric"
                      maxLength={6}
                      className="input input-bordered input-lg w-full text-center text-xl sm:text-2xl tracking-widest font-mono focus:input-primary transition-all"
                      aria-label="6-digit account code"
                    />
                    <button 
                      className="btn btn-primary btn-lg w-full sm:w-auto sm:min-w-[140px] gap-2 shadow-md hover:shadow-lg transition-all"
                      aria-label="Connect account"
                    >
                      <span>Connect</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </form>
                  <label className="label pt-2">
                    <span className="label-text-alt text-xs sm:text-sm opacity-70">
                      Don&apos;t have a code?{" "}
                      <Link href="/home" className="link link-primary font-medium">
                        Contact your agent
                      </Link>
                    </span>
                  </label>
                </div>

                <div className="divider my-0 sm:my-1 opacity-50"></div>

                {/* Help Section */}
                <details className="collapse collapse-arrow bg-base-200/50 rounded-xl border border-base-300">
                  <summary className="collapse-title text-sm sm:text-base font-medium min-h-[3rem] sm:min-h-[3.5rem]">
                    How does this work?
                  </summary>
                  <div className="collapse-content space-y-3 text-sm sm:text-base">
                    <div className="flex gap-3 items-start">
                      <span className="text-xl sm:text-2xl flex-shrink-0">1️⃣</span>
                      <p className="opacity-80">
                        Your agent will provide a unique <span className="font-mono font-bold bg-base-300 px-2 py-0.5 rounded text-xs sm:text-sm">6-digit code</span>
                      </p>
                    </div>
                    <div className="flex gap-3 items-start">
                      <span className="text-xl sm:text-2xl flex-shrink-0">2️⃣</span>
                      <p className="opacity-80">
                        Enter the code above and click Connect
                      </p>
                    </div>
                    <div className="flex gap-3 items-start">
                      <span className="text-xl sm:text-2xl flex-shrink-0">3️⃣</span>
                      <p className="opacity-80">
                        Your account will be linked instantly and you can start saving!
                      </p>
                    </div>
                    <div className="alert alert-info text-xs sm:text-sm mt-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-4 h-4 sm:w-5 sm:h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <span>Invalid or used codes will show an error message</span>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // ——— Linked state (fully responsive) ———
  const accountIds = (accounts ?? []).map((a) => a.id);
  let recent: TxRow[] = [];
  if (accountIds.length) {
    const { data } = await supabase
      .from("transactions")
      .select(
        "id, account_id, type, amount, status, description, reference_code, created_at"
      )
      .in("account_id", accountIds)
      .order("created_at", { ascending: false })
      .limit(5)
      .returns<TxRow[]>();
    recent = data ?? [];
  }

  // Basic total contributions (sum deposits + interest)
  let totalContrib = 0;
  if (accountIds.length) {
    const { data } = await supabase
      .from("transactions")
      .select("amount, type")
      .in("account_id", accountIds)
      .returns<{ amount: number; type: string }[]>();
    for (const t of data ?? []) {
      if (["deposit", "interest"].includes((t.type ?? "").toLowerCase())) {
        totalContrib += Number(t.amount || 0);
      }
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Enhanced Responsive Header */}
      <header className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 sm:gap-3 pb-2">
        <div className="min-w-0 space-y-1">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate">
            Welcome back, {fullName}! 👋
          </h1>
          <div className="flex items-center gap-2 text-xs sm:text-sm opacity-70">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="truncate font-medium">{primary.display_name}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-success gap-1 text-[10px] sm:text-xs py-2 sm:py-3 shadow-sm">
            <span className="w-1.5 h-1.5 bg-success-content rounded-full animate-pulse"></span>
            Active
          </span>
        </div>
      </header>

      {/* Balance Cards - Fully Responsive Grid */}
      <section className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2">
        <BalanceCard
          balance={primary.current_balance}
          goal={primary.target_balance}
          totalContrib={totalContrib}
        />

        {/* Loan Card - Responsive */}
        <div className="card bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10 border-2 border-orange-200 dark:border-orange-800 shadow-sm hover:shadow-md transition-all">
          <div className="card-body gap-2 sm:gap-3 md:gap-4 p-4 sm:p-5 md:p-6">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-orange-200 dark:bg-orange-800 grid place-items-center flex-shrink-0">
                <span className="text-lg sm:text-xl">💰</span>
              </div>
              <h3 className="card-title text-orange-700 dark:text-orange-300 text-base sm:text-lg md:text-xl">
                Loans
              </h3>
            </div>
            <p className="opacity-70 text-xs sm:text-sm md:text-base">
              No active loans at the moment.
            </p>
            <div className="alert alert-warning/50 text-[10px] sm:text-xs mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span>Loan features coming soon</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions - Fully Responsive */}
      <section className="card bg-base-100 border shadow-sm">
        <div className="card-body p-3 sm:p-4 md:p-5">
          <h3 className="font-semibold text-xs sm:text-sm md:text-base mb-2 opacity-70">Quick Actions</h3>
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
            <Link
              href={`/dashboard/account/${primary.id}`}
              className="btn btn-outline justify-start gap-2 h-auto py-2.5 sm:py-3 text-xs sm:text-sm hover:scale-[1.02] transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              <span>Transaction History</span>
            </Link>
            <Link 
              href={`/link-account`} 
              className="btn btn-ghost justify-start gap-2 h-auto py-2.5 sm:py-3 text-xs sm:text-sm hover:scale-[1.02] transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
              </svg>
              <span>Link Account</span>
            </Link>
            <Link 
              href={`/home`} 
              className="btn btn-ghost justify-start gap-2 h-auto py-2.5 sm:py-3 text-xs sm:text-sm hover:scale-[1.02] transition-transform xs:col-span-2 lg:col-span-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              <span>Contact Agent</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Transactions - Fully Responsive */}
      <section className="card bg-base-100 border shadow-sm">
        <div className="card-body p-3 sm:p-4 md:p-5">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="font-semibold text-sm sm:text-base md:text-lg">Recent Transactions</h3>
            <Link
              href={`/dashboard/account/${primary.id}`}
              className="link link-primary text-xs sm:text-sm font-medium"
            >
              View All
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-full bg-base-200 grid place-items-center">
                <span className="text-2xl sm:text-3xl opacity-50">📭</span>
              </div>
              <p className="text-sm sm:text-base opacity-70">No transactions yet</p>
              <p className="text-xs sm:text-sm opacity-50 mt-1">Your transaction history will appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-base-200/50 hover:bg-base-200 transition-colors"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${typeColorClass(tx.type)} grid place-items-center flex-shrink-0`}>
                      <span className="text-sm sm:text-base">
                        {tx.type === "deposit" ? "💵" : tx.type === "withdrawal" ? "💸" : "📈"}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-xs sm:text-sm truncate capitalize">
                        {tx.description || tx.type}
                      </p>
                      <p className="text-[10px] sm:text-xs opacity-60 truncate">
                        {new Date(tx.created_at).toLocaleDateString()} • {tx.reference_code}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className={`font-semibold text-xs sm:text-sm ${
                      tx.type === "withdrawal" ? "text-error" : "text-success"
                    }`}>
                      {tx.type === "withdrawal" ? "-" : "+"}₦{tx.amount.toLocaleString()}
                    </p>
                    <span className={`badge badge-xs ${statusBadgeClass(tx.status)} mt-0.5`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}