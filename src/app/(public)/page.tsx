// src/app/(public)/page.tsx
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  // If already logged in, skip the landing page
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/home");

  // Otherwise, show a simple CTA
  return (
    <main className="min-h-screen grid place-items-center p-8">
      <div className="max-w-xl text-center space-y-6">
        <h1 className="text-3xl font-bold">Thrift Collector</h1>
        <p className="opacity-80">
          Digitize your Ajo/Esusu savings. Agents manage customer accounts and record deposits.
          Customers link accounts and track balances—securely.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/signup" className="btn btn-primary">Get Started</Link>
          <Link href="/login" className="btn">Sign in</Link>
        </div>
      </div>
    </main>
  );
}
