import Link from "next/link";
import { getReport } from "@/lib/db";

export default async function ReportConfirmPage({ searchParams }) {
  const { id } = await searchParams;
  const report = id ? await getReport(id) : null;

  return (
    <div className="screen confirm-screen">
      <div className="stamp-box">
        <h1 className="stamp-ok">✓ Ticket Filed</h1>
        <div className="ticket-id">{report ? report.id : "#BOP-000000"}</div>
      </div>
      <div className="confirm-desc">
        {report
          ? `Routed to the ${report.department}. Check "My Reports" any time to see its status — we don't send push notifications yet.`
          : "Your report has been submitted."}
      </div>
      <Link href={report ? `/reports/${report.id}` : "/reports"} className="done-btn" style={{ display: "inline-block" }}>
        Track This Report
      </Link>
    </div>
  );
}
