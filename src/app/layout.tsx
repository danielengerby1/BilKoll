import type { Metadata } from "next";
import { DemoBanner } from "@/components/demo-banner";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "BilKoll – jämför verkstadspriser och bli inte lurad", template: "%s · BilKoll" },
  description:
    "Jämför priser hos bilverkstäder i Stockholm, granska din offert och få svar på bilfrågor av en AI-mekaniker.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className="min-h-dvh">
        <DemoBanner />
        <SiteHeader />
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="border-t py-6 text-center text-xs text-muted-foreground">
          BilKoll · Priser är uppskattningar inkl. moms · Råden är vägledning, ingen diagnos
        </footer>
      </body>
    </html>
  );
}
