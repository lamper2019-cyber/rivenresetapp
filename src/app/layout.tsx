import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RIVEN Reset",
  description: "Your personalized metabolic reset plan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
