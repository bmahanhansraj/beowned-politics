import { NextResponse } from "next/server";
import { getSessionFromCookies, isSameOriginRequest } from "@/lib/auth";
import {
  createReport,
  listReportsForUser,
  listAllReports,
  redactForStaff,
} from "@/lib/db";
import { checkRateLimit } from "@/lib/rateLimit";

export async function GET(request) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope");

  if (scope === "all") {
    if (session.role !== "staff" && session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
    const reports = (await listAllReports()).map(redactForStaff);
    return NextResponse.json({ reports });
  }

  const reports = await listReportsForUser(session.sub);
  return NextResponse.json({ reports });
}

export async function POST(request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const rl = checkRateLimit(`create-report:${session.sub}`, {
    limit: 20,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many reports filed recently. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const { category, description, photoDataUrl, lat, lng, anonymous } = body;

  if (!category || typeof category !== "string") {
    return NextResponse.json(
      { error: "A category is required." },
      { status: 400 }
    );
  }

  // guard: keep uploaded photo payloads reasonable for the demo file store
  if (photoDataUrl) {
    if (typeof photoDataUrl !== "string" || !photoDataUrl.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "Photo must be a valid image." },
        { status: 400 }
      );
    }
    if (photoDataUrl.length > 3_000_000) {
      return NextResponse.json(
        { error: "Photo is too large. Try a smaller image." },
        { status: 413 }
      );
    }
  }

  const report = await createReport({
    userId: session.sub,
    category,
    description: typeof description === "string" ? description.slice(0, 2000) : "",
    photoDataUrl,
    lat: typeof lat === "number" ? lat : undefined,
    lng: typeof lng === "number" ? lng : undefined,
    anonymous: !!anonymous,
  });

  return NextResponse.json({ report }, { status: 201 });
}
