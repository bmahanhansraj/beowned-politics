"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function TopBar() {
  const router = useRouter();
  return (
    <div className="topbar">
      <div className="brandmark">
        <Image src="/logo-square.webp" alt="logo" width={22} height={22} />
        <div className="word">
          BeOwned <b>Politics</b>
        </div>
      </div>
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
  );
}
