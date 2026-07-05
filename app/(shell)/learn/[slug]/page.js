import Link from "next/link";
import { notFound } from "next/navigation";
import { getRightsTopic } from "@/lib/content";

export default async function RightsTopicPage({ params }) {
  const { slug } = await params;
  const topic = getRightsTopic(slug);
  if (!topic) notFound();

  return (
    <div className="screen">
      <div className="back-row">
        <Link href="/learn" className="back-btn" aria-label="Back to Learn">
          ‹
        </Link>
        <h1 className="screen-title" style={{ fontSize: 17 }}>
          {topic.title}
        </h1>
      </div>
      <div className="pad" style={{ paddingTop: 16 }}>
        <div style={{ fontSize: 13, color: "var(--dim)", lineHeight: 1.7 }}>{topic.body}</div>
      </div>
    </div>
  );
}
