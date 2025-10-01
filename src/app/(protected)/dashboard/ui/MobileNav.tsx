// src/app/(protected)/ui/MobileNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { JSX } from "react";

type Item = {
  href: string;
  label: string;
  icon: (active: boolean) => JSX.Element;
};

function IconHome(active: boolean) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      className={active ? "opacity-100" : "opacity-60"}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 10.5V21h14v-10.5" />
    </svg>
  );
}
function IconList(active: boolean) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      className={active ? "opacity-100" : "opacity-60"}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <circle cx="3" cy="6" r="1.5" />
      <circle cx="3" cy="12" r="1.5" />
      <circle cx="3" cy="18" r="1.5" />
    </svg>
  );
}
function IconDoc(active: boolean) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      className={active ? "opacity-100" : "opacity-60"}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}
function IconUser(active: boolean) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      className={active ? "opacity-100" : "opacity-60"}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21a8 8 0 1 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default function MobileNav() {
  const pathname = usePathname();

  const items: Item[] = [
    { href: "/dashboard", label: "Dashboard", icon: IconHome },
    { href: "/transactions", label: "Transactions", icon: IconList },
    { href: "/statements", label: "Statements", icon: IconDoc },
    { href: "/profile", label: "Profile", icon: IconUser },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-base-100/95 backdrop-blur supports-[backdrop-filter]:bg-base-100/70">
      <ul className="flex items-stretch justify-around h-14">
        {items.map((it) => {
          const active =
            pathname === it.href ||
            (it.href !== "/dashboard" && pathname?.startsWith(it.href));
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
                className={`h-full w-full flex flex-col items-center justify-center gap-0.5 text-xs ${
                  active ? "text-primary" : "text-base-content"
                }`}
              >
                {it.icon(active)}
                <span className="text-[10px]">{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
