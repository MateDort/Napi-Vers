import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vers App - Hungarian Poetry Daily",
  description: "Daily Hungarian poetry based on important events",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <body>{children}</body>
    </html>
  );
}

