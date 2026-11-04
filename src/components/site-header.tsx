import Link from "next/link";
import { CircleCheckBig } from "lucide-react";

const NAV = [
  { href: "/jamfor", label: "Hitta verkstad" },
  { href: "/granska", label: "Jämför offert" },
  { href: "/fraga", label: "Fråga mekanikern" },
] as const;

export function SiteHeader() {
  return (
    <header className="border-b bg-card/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <CircleCheckBig aria-hidden className="size-6 text-primary" />
          <span>
            Bil<span className="text-primary">Koll</span>
          </span>
        </Link>
        <nav aria-label="Huvudmeny" className="flex flex-wrap gap-1 text-sm">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-md px-3 py-1.5 font-medium text-muted-foreground hover:bg-secondary hover:text-secondary-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
