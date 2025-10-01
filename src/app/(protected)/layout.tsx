// src/app/(protected)/layout.tsx
import "../globals.css";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logout } from "@/app/(public)/login/actions";
import Image from "next/image";

type Role = "agent" | "customer";
type ProfileRow = { role: Role; full_name: string | null };

export const metadata = {
  title: "Thrift Collector",
};

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: Role | null = null;
  let full_name: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .maybeSingle<ProfileRow>();

    role = (profile?.role as Role) ?? null;
    full_name = profile?.full_name ?? null;
  }

  // Helper: initials for avatar
  const initials =
    (full_name ?? "")
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <html lang="en" data-theme="light">
      <body className="min-h-screen bg-base-200/30">
        {/* Enhanced Responsive Navigation */}
        <nav className="w-full border-b bg-base-100 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            <div className="flex items-center justify-between h-16 lg:h-18">
              {/* Logo/Brand */}
              <Link 
                href="/home" 
                className="font-bold text-base sm:text-lg lg:text-xl flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary grid place-items-center flex-shrink-0">
                  <Image
                    src="/logo.svg"
                    alt="TC Logo"
                    width={24}
                    height={24}
                    className="w-5 h-5 sm:w-6 sm:h-6"
                  />
                </div>
                <span className="hidden sm:inline truncate">Thrift Collector</span>
              </Link>

              {user ? (
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {/* Navigation Links - Responsive */}
                  <div className="hidden md:flex items-center gap-2">
                    {role === "agent" ? (
                      <>
                        <Link href="/agent" className="btn btn-sm btn-primary">
                          Agent
                        </Link>
                        <Link href="/agent/customers" className="btn btn-sm btn-outline">
                          Customers
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link href="/dashboard" className="btn btn-sm btn-primary">
                          Dashboard
                        </Link>
                        <Link href="/link-account" className="btn btn-sm btn-outline">
                          Link account
                        </Link>
                      </>
                    )}
                  </div>

                  {/* Mobile Navigation Dropdown */}
                  <div className="dropdown dropdown-end md:hidden">
                    <label tabIndex={0} className="btn btn-sm btn-ghost btn-square">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </label>
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52 mt-3 border">
                      {role === "agent" ? (
                        <>
                          <li>
                            <Link href="/agent" className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                              Agent Dashboard
                            </Link>
                          </li>
                          <li>
                            <Link href="/agent/customers" className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                              </svg>
                              Customers
                            </Link>
                          </li>
                        </>
                      ) : (
                        <>
                          <li>
                            <Link href="/dashboard" className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                              </svg>
                              Dashboard
                            </Link>
                          </li>
                          <li>
                            <Link href="/link-account" className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                              </svg>
                              Link Account
                            </Link>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>

                  {/* User Info - Hidden on small screens */}
                  <div className="hidden lg:flex items-center gap-2 border-l pl-3">
                    <div className="avatar placeholder">
                      <div className="bg-neutral text-neutral-content rounded-full w-9 h-9">
                        <span className="text-xs font-medium">{initials}</span>
                      </div>
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-medium truncate max-w-[140px]">
                        {full_name ?? "User"}
                      </span>
                      {role && (
                        <span className="badge badge-ghost badge-xs">
                          {role}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Avatar Only - Shown on medium screens */}
                  <div className="lg:hidden avatar placeholder">
                    <div className="bg-neutral text-neutral-content rounded-full w-8 h-8">
                      <span className="text-xs font-medium">{initials}</span>
                    </div>
                  </div>

                  {/* Sign Out */}
                  <form action={logout}>
                    <button 
                      className="btn btn-sm btn-ghost hidden sm:flex" 
                      type="submit"
                      aria-label="Sign out"
                    >
                      Sign out
                    </button>
                    <button 
                      className="btn btn-sm btn-ghost btn-square sm:hidden" 
                      type="submit"
                      aria-label="Sign out"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex items-center gap-2 sm:gap-3">
                  <Link href="/login" className="btn btn-sm btn-ghost">
                    Login
                  </Link>
                  <Link href="/signup" className="btn btn-sm btn-primary">
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          {children}
        </main>
      </body>
    </html>
  );
}