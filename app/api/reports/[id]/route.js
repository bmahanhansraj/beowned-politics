import { NextResponse } from "next/server";
import { getSessionFromCookies, isSameOriginRequest } from "@/lib/auth";
import { getReport, updateReportStatus, redactForStaff } from "@/lib/db";

const VALID_STATUSES = ["pending", "in_review", "resolved"];

export async function GET(request, { params }) {
  try {
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

    const payload = isOwner ? report : redactForStaff(report);
    return NextResponse.json({ report: payload });
  } catch (err) {
    console.error("get report failed:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
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
  } catch (err) {
    console.error("update report failed:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
