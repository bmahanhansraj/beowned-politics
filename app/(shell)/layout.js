import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";

export default async function ShellLayout({ children }) {
  const session = await getSessionFromCookies();
  if (!session) redirect("/login");

  return (
    <>
      <TopBar />
      <div className="screens" style={{ flex: 1, position: "relative", display: "flex", overflow: "hidden" }}>
        {children}
      </div>
      <BottomNav />
    </>
  );
}
