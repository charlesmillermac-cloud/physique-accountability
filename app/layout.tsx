import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    default: "Physique Accountability",
    template: "%s | Physique Accountability",
  },
  description:
    "AI-driven physique coaching accountability infrastructure for check-ins, compliance, reminders, and structured weekly summaries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("min-h-screen bg-background font-sans text-foreground antialiased")}>
        {children}
      </body>
    </html>
  );
}
