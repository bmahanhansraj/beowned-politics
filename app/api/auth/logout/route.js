import { NextResponse } from "next/server";
import { clearSessionCookie, isSameOriginRequest } from "@/lib/auth";

export async function POST(request) {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }
    await clearSessionCookie();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("logout failed:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
