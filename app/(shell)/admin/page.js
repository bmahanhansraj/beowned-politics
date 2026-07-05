import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import AdminDashboard from "@/components/AdminDashboard";

export default async function AdminPage() {
  const session = await getSessionFromCookies();
  if (session.role !== "staff" && session.role !== "admin") {
    redirect("/home");
  }
  return <AdminDashboard />;
}
