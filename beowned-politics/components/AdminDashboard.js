"use client";

import { useEffect, useState } from "react";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "in_review", label: "In Review" },
  { key: "resolved", label: "Resolved" },
];

const STATUS_LABEL = {
  pending: "Pending",
  in_review: "In Review",
  resolved: "Resolved",
};

const CATEGORY_ICON = {
  Infrastructure: "🕳️",
  Environment: "🌫️",
  Traffic: "🚦",
  Health: "🧪",
  Corruption: "✊",
  "Crime Tip": "🛡️",
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

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/reports?scope=all");
    const data = await res.json();
    setReports(data.reports || []);
    setLoading(false);
  }

  async function updateStatus(id, status) {
    setUpdatingId(id);
    const res = await fetch(`/api/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const { report } = await res.json();
      setReports((prev) => prev.map((r) => (r.id === report.id ? report : r)));
    }
    setUpdatingId(null);
  }

  const visible =
    filter === "all" ? reports : reports.filter((r) => r.status === filter);

  return (
    <div className="screen">
      <div className="screen-head">
        <h1 className="screen-title">Staff Dashboard</h1>
        <div className="screen-sub">
          {reports.length} total reports across all departments
        </div>
      </div>

      <div className="admin-row" style={{ marginTop: 14 }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={"filter-chip" + (filter === f.key ? " active" : "")}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="pad" style={{ paddingTop: 6 }}>
        {loading ? (
          <div className="empty-state">Loading…</div>
        ) : visible.length === 0 ? (
          <div className="empty-state">
            <div className="display">Nothing here</div>
            <div>No reports match this filter.</div>
          </div>
        ) : (
          visible.map((r) => (
            <div className="issue-card" key={r.id}>
              <div className="issue-cat">{CATEGORY_ICON[r.category] || "📍"}</div>
              <div className="issue-body">
                <div className="issue-title">
                  {r.id} · {r.category}
                </div>
                <div className="issue-meta">
                  {r.department} · {timeAgo(r.createdAt)}
                  {r.anonymous ? " · Anonymous" : ""}
                </div>
                {r.description && (
                  <div className="issue-meta" style={{ marginTop: 4 }}>
                    “{r.description}”
                  </div>
                )}
                <select
                  className="status-select"
                  value={r.status}
                  disabled={updatingId === r.id}
                  onChange={(e) => updateStatus(r.id, e.target.value)}
                  style={{ marginTop: 8 }}
                >
                  <option value="pending">Pending</option>
                  <option value="in_review">In Review</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div className={"pill " + r.status}>{STATUS_LABEL[r.status]}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
