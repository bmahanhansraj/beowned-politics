"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button className="menu-row" onClick={signOut} disabled={busy}>
      <div className="t">{busy ? "Signing out…" : "Sign Out"}</div>
      <div className="arrow">›</div>
    </button>
  );
}
