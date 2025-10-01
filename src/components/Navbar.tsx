import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logout } from "@/app/(public)/login/actions";

export default async function Navbar() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Public navbar (logged out)
  if (!user) {
    return (
      <nav className="w-full border-b">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold">Thrift Collector</Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn btn-sm">Login</Link>
            <Link href="/signup" className="btn btn-sm btn-primary">Sign up</Link>
          </div>
        </div>
      </nav>
    );
  }

  // Logged-in: fetch role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile?.role as "agent" | "customer" | undefined) ?? "customer";

  return (
    <nav className="w-full border-b">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/home" className="font-semibold">Thrift Collector</Link>

        <div className="flex items-center gap-2">
          {role === "agent" ? (
            <Link href="/agent" className="btn btn-sm">Agent</Link>
          ) : (
            <>
              <Link href="/dashboard" className="btn btn-sm">Dashboard</Link>
              <Link href="/link-account" className="btn btn-sm btn-outline">Link account</Link>
            </>
          )}

          <span className="badge">{role}</span>

          <form action={logout}>
            <button className="btn btn-sm" type="submit">Sign out</button>
          </form>
        </div>
      </div>
    </nav>
  );
}
