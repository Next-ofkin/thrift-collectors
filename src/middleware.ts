import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Public routes that don't require auth:
const PUBLIC_PATHS = new Set<string>([
  "/", "/login", "/signup", "/favicon.ico", "/logo.svg",
]);

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  // allow Next static assets
  if (pathname.startsWith("/_next/")) return true;
  if (pathname.startsWith("/images/")) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Prepare a response we can modify (set cookies) in middleware.
  const res = NextResponse.next();

  // Supabase SSR client that can READ and WRITE cookies in middleware
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return req.cookies.getAll().map((c) => ({ name: c.name, value: c.value }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          res.cookies.set({
            name,
            value,
            ...(options as CookieOptions),
          });
        });
      },
    },
  });

  // Ask Supabase if there’s a logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublic = isPublicPath(pathname);

  // If not logged in and tries to access protected route → send to /login?next=...
  if (!user && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    // Preserve intended destination
    url.search = `?next=${encodeURIComponent(pathname + (search || ""))}`;
    return NextResponse.redirect(url);
  }

  // If logged in and tries to visit public auth pages → send to /home
  if (user && (pathname === "/login" || pathname === "/signup" || pathname === "/")) {
    const url = req.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  // Otherwise continue
  return res;
}

export const config = {
  // Match everything under app/ (default), but skip static files we already handle in code
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)).*)",
  ],
};
