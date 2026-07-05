import Link from "next/link";
import { getSessionFromCookies } from "@/lib/auth";
import { listReportsForUser, reportStats } from "@/lib/db";

const CATEGORY_ICON = {
  Infrastructure: "🕳️",
  Environment: "🌫️",
  Traffic: "🚦",
  Health: "🧪",
  Corruption: "✊",
  "Crime Tip": "🛡️",
};

const STATUS_LABEL = {
  pending: "Pending",
  in_review: "In Review",
  resolved: "Resolved",
};

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default async function MyReportsPage() {
  const session = await getSessionFromCookies();
  const [reports, stats] = await Promise.all([
    listReportsForUser(session.sub),
    reportStats(session.sub),
  ]);

  return (
    <div className="screen">
      <div className="screen-head">
        <h1 className="screen-title">My Reports</h1>
        <div className="screen-sub">
          {stats.filed} filed · {stats.resolved} resolved · {stats.inReview} in review
        </div>
      </div>
      <div className="pad" style={{ paddingTop: 16 }}>
        {reports.length === 0 ? (
          <div className="empty-state">
            <div className="display">Nothing filed yet</div>
            <div>
              <Link href="/report" style={{ color: "var(--yellow)" }}>
                Report your first issue
              </Link>{" "}
              to start tracking it here.
            </div>
          </div>
        ) : (
          reports.map((r) => (
            <Link href={`/reports/${r.id}`} key={r.id} className="issue-card" style={{ display: "flex" }}>
              <div className="issue-cat">{CATEGORY_ICON[r.category] || "📍"}</div>
              <div className="issue-body">
                <div className="issue-title">
                  {r.id} · {r.category}
                  {r.anonymous ? " · Anonymous" : ""}
                </div>
                <div className="issue-meta">
                  {timeAgo(r.createdAt)} · {r.department}
                </div>
              </div>
              <div className={"pill " + r.status}>{STATUS_LABEL[r.status]}</div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
