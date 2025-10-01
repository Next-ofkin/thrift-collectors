import "../globals.css";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Thrift Collector",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <nav className="w-full border-b">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/home" className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Thrift Collector"
                width={28}
                height={28}
              />
              <span className="font-semibold">Thrift Collector</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/login" className="btn btn-sm">
                Login
              </Link>
              <Link href="/signup" className="btn btn-sm btn-primary">
                Sign up
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
