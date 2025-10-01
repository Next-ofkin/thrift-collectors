import { signupWithEmail } from "./actions";
import Link from "next/link";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const error = sp?.error;

  return (
    <main className="min-h-screen grid place-items-center p-8">
      <form action={signupWithEmail} className="w-full max-w-sm space-y-4 border rounded-xl p-6">
        <h1 className="text-xl font-bold">Create account</h1>

        {error && <div className="alert alert-error text-sm">{error}</div>}

        <label className="form-control">
          <span className="label-text">Full name</span>
          <input className="input input-bordered w-full" name="full_name" required />
        </label>
        <label className="form-control">
          <span className="label-text">Email</span>
          <input className="input input-bordered w-full" type="email" name="email" required />
        </label>
        <label className="form-control">
          <span className="label-text">Password</span>
          <input className="input input-bordered w-full" type="password" name="password" required />
        </label>

        <label className="form-control">
          <span className="label-text">Choose your role</span>
          <select name="role" className="select select-bordered w-full" defaultValue="customer" required>
            <option value="customer">Customer</option>
            <option value="agent">Agent</option>
          </select>
        </label>

        <button className="btn btn-primary w-full">Create account</button>

        <p className="text-sm text-center">
          Already have an account? <Link className="link" href="/login">Sign in</Link>
        </p>
      </form>
    </main>
  );
}
