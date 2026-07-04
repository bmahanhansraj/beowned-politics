import { NextResponse } from "next/server";
import { clearSessionCookie, isSameOriginRequest } from "@/lib/auth";

export async function POST(request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
