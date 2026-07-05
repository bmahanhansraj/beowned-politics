"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const LINKS = [
  { href: "/home", label: "Home", match: (p) => p === "/home" },
  { href: "/report", label: "Report", match: (p) => p.startsWith("/report") },
  { href: "/reports", label: "My Reports", match: (p) => p.startsWith("/reports") },
  { href: "/learn", label: "Learn", match: (p) => p.startsWith("/learn") },
];

export default function TopBar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="topbar">
      <div className="brandmark">
        <Image src="/logo-square.webp" alt="logo" width={22} height={22} />
        <div className="word">
          BeOwned <b>Politics</b>
        </div>
      </div>

      <nav className="desktop-nav" aria-label="Primary">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={link.match(pathname) ? "active" : ""}
            aria-current={link.match(pathname) ? "page" : undefined}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="topbar-right">
        <button
          className="icon-btn"
          aria-label="Profile"
          onClick={() => router.push("/profile")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
