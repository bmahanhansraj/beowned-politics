"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState("identify"); // identify | verify
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function requestOtp(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setDevCode(data.devCode || null);
      setStep("verify");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      router.push("/home");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="splash">
      <Image src="/logo-square.webp" alt="NOT.A logo" width={220} height={220} priority />

      {step === "identify" ? (
        <form onSubmit={requestOtp} style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center", width: "100%" }}>
          <h1 className="splash-sub">Sign In / Sign Up</h1>
          <label htmlFor="identifier" className="splash-tag" style={{ display: "block" }}>
            New or returning — enter your email or phone to continue.
            We'll text/email you a code, and create your account
            automatically the first time.
          </label>
          <input
            id="identifier"
            className="login-input"
            type="text"
            placeholder="you@example.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="email"
            required
          />
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          <button className="enter-btn" disabled={busy} type="submit">
            {busy ? "Sending…" : "Send Code"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center", width: "100%" }}>
          <h1 className="splash-sub">Enter Code</h1>
          <div className="splash-tag">We sent a 6-digit code to {identifier}</div>
          {devCode && (
            <div className="dev-otp-hint" role="status">
              Your code is <strong>{devCode}</strong>
              <br />
              (shown here because email/SMS delivery isn't set up yet —
              anyone who can reach this screen can see it. Wire up a real
              provider before inviting the public.)
            </div>
          )}
          <label htmlFor="otp-code" className="splash-tag" style={{ display: "block" }}>
            6-digit code
          </label>
          <input
            id="otp-code"
            className="otp-input"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="••••••"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          <button className="enter-btn" disabled={busy} type="submit">
            {busy ? "Verifying…" : "Verify & Continue"}
          </button>
          <button
            type="button"
            className="done-btn"
            onClick={() => {
              setStep("identify");
              setCode("");
              setError("");
            }}
          >
            Use a different email
          </button>
        </form>
      )}
    </div>
  );
}
