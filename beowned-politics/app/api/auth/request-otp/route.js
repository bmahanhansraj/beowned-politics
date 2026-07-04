import { NextResponse } from "next/server";
import { createOtp } from "@/lib/db";
import { isSameOriginRequest } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9()\-.\s]{7,15}$/;

// In production, wire this to a real email/SMS provider (see README).
// For local/dev use we return the code in the response so the UI can
// show it directly — nothing is actually sent anywhere.
export async function POST(request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const { identifier: rawIdentifier } = await request.json();
  const identifier = (rawIdentifier || "").trim().toLowerCase();

  if (!EMAIL_RE.test(identifier) && !PHONE_RE.test(identifier)) {
    return NextResponse.json(
      { error: "Enter a valid email address or phone number." },
      { status: 400 }
    );
  }

  // Rate limit by identifier (stop hammering one account) and by a coarse
  // IP bucket (stop one client spraying many identifiers). See
  // lib/rateLimit.js for the single-instance-only limitation.
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const byIdentifier = checkRateLimit(`otp-req:id:${identifier}`, {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  const byIp = checkRateLimit(`otp-req:ip:${ip}`, {
    limit: 20,
    windowMs: 15 * 60 * 1000,
  });
  if (!byIdentifier.allowed || !byIp.allowed) {
    return NextResponse.json(
      { error: "Too many code requests. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  const code = await createOtp(identifier);

  const isDev = process.env.NODE_ENV !== "production";
  return NextResponse.json({
    ok: true,
    devCode: isDev ? code : undefined,
  });
}
