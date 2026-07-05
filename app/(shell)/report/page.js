import Link from "next/link";

const CATEGORIES = [
  { key: "Infrastructure", icon: "🕳️", anon: false },
  { key: "Environment", icon: "🌫️", anon: false },
  { key: "Traffic", icon: "🚦", anon: false },
  { key: "Health", icon: "🧪", anon: false },
  { key: "Corruption", icon: "✊", anon: true },
  { key: "Crime Tip", icon: "🛡️", anon: true },
];

export default function ReportCategoryPage() {
  return (
    <div className="screen">
      <div className="screen-head">
        <h1 className="screen-title">What's the issue?</h1>
        <div className="screen-sub">
          Pick a category — we'll route it to the right department.
        </div>
      </div>
      <div className="cat-grid">
        {CATEGORIES.map((c) => (
          <Link
            key={c.key}
            href={`/report/new?category=${encodeURIComponent(c.key)}`}
            className={"cat-tile" + (c.anon ? " anon" : "")}
          >
            <div className="ic">{c.icon}</div>
            <div className="lb">{c.key}</div>
          </Link>
        ))}
      </div>
      <div className="below" style={{ marginBottom: 100 }}>
        In an emergency, contact local emergency services directly. This app
        forwards reports — it does not replace an emergency response.
      </div>
    </div>
  );
}
