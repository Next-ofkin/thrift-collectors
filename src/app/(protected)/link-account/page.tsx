import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SearchParams = Promise<{ code?: string; error?: string }>;

export default async function LinkAccountPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const initialError = sp?.error;
  const initialCode = (sp?.code || "").trim();

  // If a code is present in the URL, try to link immediately (GET flow)
  if (initialCode && /^[0-9]{6}$/.test(initialCode)) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login?next=/link-account");

    // Validate the code
    const { data: account } = await supabase
      .from("accounts")
      .select("id, customer_user_id, linking_status")
      .eq("account_code", initialCode)
      .maybeSingle();

    if (!account) {
      return renderForm("Invalid code. Please check and try again.");
    }

    if (account.customer_user_id && account.customer_user_id !== user.id) {
      return renderForm("This account code has already been used by another customer.");
    }

    if (account.linking_status && account.linking_status !== "unlinked") {
      return renderForm("This account is not available for linking.");
    }

    // Link the account to the current user
    const { error: linkErr } = await supabase
      .from("accounts")
      .update({ customer_user_id: user.id, linking_status: "linked" })
      .eq("id", account.id);

    if (linkErr) {
      return renderForm("Could not link the account right now. Please try again.");
    }

    // Success → go to the account page
    redirect(`/dashboard/account/${account.id}`);
  }

  // No auto-code or failed attempt → show the form with any initial error
  return renderForm(initialError);

  function renderForm(err?: string) {
    return (
      <main className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-3 py-6 sm:px-4 sm:py-8">
        <div className="w-full max-w-2xl space-y-6 sm:space-y-8">
          <section className="text-center space-y-3 sm:space-y-4">
            <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-base-200 grid place-items-center">
              <span className="text-3xl sm:text-4xl">🔗</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">Link your account</h1>
            <p className="opacity-80 text-sm sm:text-base">
              Paste the 6-digit code from your agent to connect your savings.
            </p>
          </section>

          <section className="px-3 sm:px-0">
            <div className="card bg-base-100 border shadow-sm">
              <div className="card-body gap-4 sm:gap-5">
                {err && (
                  <div className="alert alert-error">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 7h2v5H9V7zm0 6h2v2H9v-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{err}</span>
                  </div>
                )}

                {/* GET form so customers can paste and link */}
                <form action="/link-account" method="GET" className="flex flex-col sm:flex-row gap-2">
                  <input
                    name="code"
                    placeholder="123456"
                    inputMode="numeric"
                    maxLength={6}
                    className="input input-bordered w-full text-center font-mono tracking-widest"
                    aria-label="6-digit code"
                    defaultValue={initialCode}
                  />
                  <button className="btn btn-primary w-full sm:w-auto">Connect</button>
                </form>

                <p className="text-xs sm:text-sm opacity-70">
                  Don&apos;t have a code?{" "}
                  <Link href="/home" className="link">
                    Contact your agent
                  </Link>
                  .
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }
}