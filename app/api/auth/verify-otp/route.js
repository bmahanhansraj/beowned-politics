import { NextResponse } from "next/server";
import { verifyOtp, findOrCreateUser } from "@/lib/db";
import { signSession, setSessionCookie, isSameOriginRequest } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const { identifier: rawIdentifier, code } = await request.json();
  const identifier = (rawIdentifier || "").trim().toLowerCase();

  if (!identifier || !code) {
    return NextResponse.json(
      { error: "Missing identifier or code." },
      { status: 400 }
    );
  }

  // Limit guesses per identifier so a 6-digit code can't be brute-forced
  // within its validity window.
  const rl = checkRateLimit(`otp-verify:${identifier}`, {
    limit: 8,
    windowMs: 15 * 60 * 1000,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please request a new code." },
      { status: 429 }
    );
  }

  const ok = await verifyOtp(identifier, String(code).trim());
  if (!ok) {
    return NextResponse.json(
      { error: "That code is invalid or expired." },
      { status: 401 }
    );
  }

  const user = await findOrCreateUser(identifier);
  const token = signSession(user);
  await setSessionCookie(token);

  return NextResponse.json({ ok: true, user });
}
