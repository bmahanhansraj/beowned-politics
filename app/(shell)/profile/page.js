import Link from "next/link";
import { getSessionFromCookies } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import SignOutButton from "@/components/SignOutButton";

export default async function ProfilePage() {
  const session = await getSessionFromCookies();
  const user = await getUserById(session.sub);
  const initial = (user.displayName || "?").charAt(0).toUpperCase();

  return (
    <div className="screen">
      <div className="profile-head">
        <div className="avatar">{initial}</div>
        <h1 className="profile-name">{user.displayName}</h1>
        <div className="profile-tag">
          Member since{" "}
          {new Date(user.createdAt).toLocaleDateString(undefined, {
            month: "short",
            year: "numeric",
          })}
        </div>
        <div className="impact-badge">✊ Impact Score · {user.impactScore}</div>
      </div>

      <div style={{ marginTop: 14 }}>
        <Link href="/reports" className="menu-row" style={{ display: "flex" }}>
          <div className="t">My Reports</div>
          <div className="arrow">›</div>
        </Link>
        <div className="menu-row">
          <div className="t">Volunteer Hours · {user.volunteerHours}h</div>
          <div className="arrow">›</div>
        </div>
        <div className="menu-row">
          <div className="t">Badges &amp; Rewards</div>
          <div className="arrow">›</div>
        </div>
        <div className="menu-row">
          <div className="t">Language · English</div>
          <div className="arrow">›</div>
        </div>
        <div className="menu-row">
          <div className="t">Privacy &amp; Anonymity</div>
          <div className="arrow">›</div>
        </div>
        {(user.role === "staff" || user.role === "admin") && (
          <Link href="/admin" className="menu-row" style={{ display: "flex" }}>
            <div className="t">Staff Dashboard</div>
            <div className="arrow">›</div>
          </Link>
        )}
        <SignOutButton />
      </div>
    </div>
  );
}
