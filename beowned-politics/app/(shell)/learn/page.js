import Link from "next/link";
import { RIGHTS_TOPICS } from "@/lib/content";

export default function LearnPage() {
  return (
    <div className="screen">
      <div className="screen-head">
        <h1 className="screen-title">Know Your Rights</h1>
        <div className="screen-sub">Plain-language guides. No legal jargon.</div>
      </div>
      <div className="pad" style={{ paddingTop: 16, paddingLeft: 0, paddingRight: 0 }}>
        {RIGHTS_TOPICS.map((topic, i) => (
          <Link href={`/learn/${topic.slug}`} key={topic.slug} className="learn-card" style={{ display: "flex" }}>
            <div className="n">{String(i + 1).padStart(2, "0")}</div>
            <div>
              <div className="t">{topic.title}</div>
              <div className="d">{topic.summary}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
