import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import Image from "next/image";

export default async function SplashPage() {
  const session = await getSessionFromCookies();
  if (session) redirect("/home");

  return (
    <div className="splash">
      <Image
        src="/logo-square.webp"
        alt="NOT.A logo"
        width={300}
        height={300}
        priority
      />
      <h1 className="splash-sub">
        BeOwned <span className="y">Politics</span>
      </h1>
      <div className="splash-tag">Own your society. Shape your nation.</div>
      <a href="/login" className="enter-btn" style={{ display: "inline-block", textAlign: "center" }}>
        Enter the App
      </a>
      <div className="splash-tag" style={{ letterSpacing: "1px" }}>
        Not Left · Not Right · Not Sold
      </div>
    </div>
  );
}
