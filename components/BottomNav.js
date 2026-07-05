"use client";

import { usePathname, useRouter } from "next/navigation";

const TABS = [
  {
    href: "/home",
    label: "Home",
    match: (p) => p === "/home",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M3 11l9-8 9 8" />
        <path d="M5 10v10h14V10" />
      </svg>
    ),
  },
  {
    href: "/report",
    label: "Report",
    match: (p) => p.startsWith("/report"),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
  {
    href: "/reports",
    label: "Reports",
    match: (p) => p.startsWith("/reports"),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M9 3h6l1 2h3v16H5V5h3z" />
        <path d="M9 11h6M9 15h6" />
      </svg>
    ),
  },
  {
    href: "/learn",
    label: "Learn",
    match: (p) => p.startsWith("/learn"),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M4 19V5a2 2 0 012-2h12v16H6a2 2 0 00-2 2z" />
        <path d="M8 7h8" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profile",
    match: (p) => p.startsWith("/profile"),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="navbar" aria-label="Primary">
      {TABS.map((tab) => (
        <button
          key={tab.href}
          className={"nav-item" + (tab.match(pathname) ? " active" : "")}
          onClick={() => router.push(tab.href)}
          aria-current={tab.match(pathname) ? "page" : undefined}
        >
          {tab.icon}
          <span className="lb">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
