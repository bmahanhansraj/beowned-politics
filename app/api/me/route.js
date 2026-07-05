import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { getUserById, reportStats } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSessionFromCookies();
    if (!session) return NextResponse.json({ user: null });

    const user = await getUserById(session.sub);
    if (!user) return NextResponse.json({ user: null });

    const stats = await reportStats(user.id);
    return NextResponse.json({ user, stats });
  } catch (err) {
    console.error("me failed:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
