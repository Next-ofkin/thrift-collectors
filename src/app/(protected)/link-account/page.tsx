import { linkAccount } from "./actions";

export default function LinkAccountPage({
  searchParams,
}: { searchParams?: { error?: string } }) {
  const error = searchParams?.error;

  return (
    <main className="min-h-screen grid place-items-center p-8">
      <form
        action={linkAccount}
        className="w-full max-w-sm border rounded-xl p-6 space-y-4"
      >
        <h1 className="text-xl font-bold">Link your account</h1>

        {error && <div className="alert alert-error text-sm">{error}</div>}

        <label className="form-control">
          <span className="label-text">6-digit code from your agent</span>
          <input
            name="code"
            placeholder="123456"
            inputMode="numeric"
            maxLength={6}
            className="input input-bordered w-full"
            required
          />
        </label>

        <button className="btn btn-primary w-full">Link</button>
      </form>
    </main>
  );
}
