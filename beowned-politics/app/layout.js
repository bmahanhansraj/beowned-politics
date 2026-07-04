import "./globals.css";

export const metadata = {
  title: "BeOwned Politics",
  description: "Own your society. Shape your nation.",
  icons: { icon: "/logo-square.webp" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app-root">
          <div className="device">
            <div className="grain" />
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
