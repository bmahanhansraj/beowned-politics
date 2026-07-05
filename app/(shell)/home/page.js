import Link from "next/link";
import { getSessionFromCookies } from "@/lib/auth";
import { getUserById, reportStats, listAllReports } from "@/lib/db";

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

export default async function HomePage() {
  const session = await getSessionFromCookies();
  const user = await getUserById(session.sub);
  const stats = await reportStats(session.sub);
  const allReports = await listAllReports();
  const feed = allReports.slice(0, 5);

  return (
    <div className="screen">
      <div className="hero-card stamp-frame">
        <span className="tick-tl" />
        <span className="tick-br" />
        <div className="hero-eyebrow">Impact Score · {user.impactScore}</div>
        <h1 className="hero-title">
          Your city.
          <br />
          Your report.
          <br />
          Your call.
        </h1>
        <div className="hero-desc">
          {stats.filed === 0
            ? "File your first report to start building your impact score."
            : `${stats.resolved} of your ${stats.filed} report${stats.filed === 1 ? "" : "s"} resolved so far.`}
        </div>
        <div className="stat-row">
          <div className="stat">
            <div className="n">{String(stats.filed).padStart(2, "0")}</div>
            <div className="l">Filed</div>
          </div>
          <div className="stat">
            <div className="n">{String(stats.resolved).padStart(2, "0")}</div>
            <div className="l">Resolved</div>
          </div>
          <div className="stat">
            <div className="n">{user.volunteerHours}h</div>
            <div className="l">Volunteered</div>
          </div>
        </div>
      </div>

      <Link href="/report" className="cta-report">
        <div>
          <div className="t">Report an Issue</div>
          <div className="s">Photo · GPS · under 60 seconds</div>
        </div>
        <div className="arrow">›</div>
      </Link>

      <h2 className="section-label">
        <span className="bar" /> Community Reports
      </h2>
      <div className="pad" style={{ paddingTop: 0 }}>
        {feed.length === 0 ? (
          <div className="empty-state">
            <div className="display">No reports yet</div>
            <div>Be the first to flag something in your area.</div>
          </div>
        ) : (
          feed.map((r) => (
            <Link href={`/reports/${r.id}`} key={r.id} className="issue-card" style={{ display: "flex" }}>
              <div className="issue-cat">{CATEGORY_ICON[r.category] || "📍"}</div>
              <div className="issue-body">
                <div className="issue-title">
                  {r.category} — {r.department}
                </div>
                <div className="issue-meta">{timeAgo(r.createdAt)}</div>
              </div>
              <div className={"pill " + r.status}>{STATUS_LABEL[r.status]}</div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
