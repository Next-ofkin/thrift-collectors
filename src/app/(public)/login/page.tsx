import { loginWithEmailPassword } from "./actions";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; msg?: string }>;
}) {
  const sp = await searchParams;
  const next = sp?.next ?? "/home";
  const error = sp?.error;
  const msg = sp?.msg;

  return (
    <main className="min-h-screen grid place-items-center p-8">
      <form action={loginWithEmailPassword} className="w-full max-w-sm space-y-4 border rounded-xl p-6">
        <input type="hidden" name="next" value={next} />
        <h1 className="text-xl font-bold">Sign in</h1>

        {msg && <div className="alert alert-info text-sm">{msg}</div>}
        {error && <div className="alert alert-error text-sm">{error}</div>}

        <label className="form-control">
          <span className="label-text">Email</span>
          <input className="input input-bordered w-full" type="email" name="email" required />
        </label>
        <label className="form-control">
          <span className="label-text">Password</span>
          <input className="input input-bordered w-full" type="password" name="password" required />
        </label>

        <button className="btn btn-primary w-full">Sign in</button>

        <p className="text-sm text-center">
          New here? <Link className="link" href="/signup">Create an account</Link>
        </p>
      </form>
    </main>
  );
}
