import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { getReport } from "@/lib/db";

const STATUS_LABEL = {
  pending: "Pending",
  in_review: "In Review",
  resolved: "Resolved",
};

function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function ReportDetailPage({ params }) {
  const { id } = await params;
  const session = await getSessionFromCookies();
  const report = await getReport(id);
  if (!report) notFound();

  const isOwner = report.userId === session.sub;
  const isStaff = session.role === "staff" || session.role === "admin";
  if (!isOwner && !isStaff) notFound();

  return (
    <div className="screen">
      <div className="back-row">
        <Link href="/reports" className="back-btn" aria-label="Back to my reports">
          ‹
        </Link>
        <h1 className="screen-title" style={{ fontSize: 17 }}>
          {report.id}
        </h1>
      </div>

      <div className="pad" style={{ paddingTop: 16 }}>
        {report.photoDataUrl && (
          <img
            src={report.photoDataUrl}
            alt=""
            style={{ width: "100%", border: "1px solid var(--line)", marginBottom: 14 }}
          />
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div className="display" style={{ fontSize: 15 }}>
            {report.category}
          </div>
          <div className={"pill " + report.status}>{STATUS_LABEL[report.status]}</div>
        </div>

        <div className="issue-meta" style={{ marginBottom: 4 }}>
          Routed to: <strong style={{ color: "var(--white)" }}>{report.department}</strong>
        </div>
        <div className="issue-meta" style={{ marginBottom: 14 }}>
          Filed {formatDate(report.createdAt)}
          {report.anonymous ? " · Submitted anonymously" : ""}
        </div>

        {report.description && (
          <>
            <div className="field-label" style={{ margin: "0 0 6px" }}>
              Description
            </div>
            <div style={{ fontSize: 13, color: "var(--dim)", lineHeight: 1.6, marginBottom: 16 }}>
              {report.description}
            </div>
          </>
        )}

        <h2 className="section-label" style={{ margin: "6px 0 10px" }}>
          <span className="bar" /> Status Timeline
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {report.statusHistory.map((h, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
              <div className="mono" style={{ fontSize: 10.5, color: "var(--yellow)", width: 90, flexShrink: 0 }}>
                {formatDate(h.at)}
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 700, textTransform: "uppercase" }}>
                {STATUS_LABEL[h.status]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
