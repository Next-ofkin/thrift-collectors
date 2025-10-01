import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Read-only in Server Components (no cookie writes) */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll().map((c) => ({ name: c.name, value: c.value }));
      },
      // No writes from RSC
      setAll() {
        /* no-op */
      },
    },
  });
}

/** Read/write inside Server Actions (login/logout/signup) */
export async function createSupabaseActionClient() {
  const cookieStore = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll().map((c) => ({ name: c.name, value: c.value }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set({ name, value, ...(options as CookieOptions) });
        });
      },
    },
  });
}
