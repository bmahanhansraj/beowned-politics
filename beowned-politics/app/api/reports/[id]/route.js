import { NextResponse } from "next/server";
import { getSessionFromCookies, isSameOriginRequest } from "@/lib/auth";
import { getReport, updateReportStatus, redactForStaff } from "@/lib/db";

const VALID_STATUSES = ["pending", "in_review", "resolved"];

export async function GET(request, { params }) {
  const { id } = await params;
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const report = await getReport(id);
  if (!report) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const isOwner = report.userId === session.sub;
  const isStaff = session.role === "staff" || session.role === "admin";
  if (!isOwner && !isStaff) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  // Staff/admin never receive the reporter's identity for an anonymous
  // report, even though they're allowed to see the report itself.
  const payload = isOwner ? report : redactForStaff(report);
  return NextResponse.json({ report: payload });
}

export async function PATCH(request, { params }) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const { id } = await params;
  const session = await getSessionFromCookies();
  if (!session || (session.role !== "staff" && session.role !== "admin")) {
    return NextResponse.json(
      { error: "Only department staff can update a ticket's status." },
      { status: 403 }
    );
  }

  const { status } = await request.json();
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const report = await updateReportStatus(id, status);
  if (!report) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({ report: redactForStaff(report) });
}
