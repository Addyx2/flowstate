import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flowstate",
  description: "AI-native social care platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#070708] text-[#e2e2e2] antialiased">{children}</body>
    </html>
  );
}
