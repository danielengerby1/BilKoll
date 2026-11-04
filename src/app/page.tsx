import Link from "next/link";
import { MessageCircleQuestion, ScanSearch, Scale } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchForm } from "@/features/comparison/components/search-form";
import { getServiceEstimates, listServices } from "@/features/comparison/server/queries";
import { RegnrForm } from "@/features/vehicle-lookup/components/regnr-form.client";
import { formatSek } from "@/lib/money";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    href: "/jamfor",
    icon: Scale,
    title: "Hitta verkstäder",
    text: "Riktiga verkstäder nära dig med vår uppskattning av vad jobbet bör kosta hos var och en.",
  },
  {
    href: "/granska",
    icon: ScanSearch,
    title: "Jämför din offert",
    text: "Fått ett pris? Vi säger om det är billigt, bra värde eller dyrt – och flaggar merförsäljning.",
  },
  {
    href: "/fraga",
    icon: MessageCircleQuestion,
    title: "Fråga AI-mekanikern",
    text: "Konstiga ljud, varningslampor eller däckregler – få ett rakt svar på svenska.",
  },
] as const;

export default async function HomePage() {
  const [services, estimates] = await Promise.all([listServices(), getServiceEstimates()]);

  return (
    <div className="grid gap-12">
      <section className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center">
        <div className="grid gap-4">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Rätt pris på verkstaden. <span className="text-primary">Varje gång.</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            BilKoll visar vad jobbet bör kosta hos verkstäder i Stockholms län. Be om en offert, jämför med vårt pris och se
            direkt om det är billigt, bra värde eller dyrt.
          </p>
          <RegnrForm />
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="mb-4 font-semibold">Hitta bästa verkstaden</h2>
          <SearchForm services={services} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {FEATURES.map(({ href, icon: Icon, title, text }) => (
          <Link key={href} href={href} className="group rounded-xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <CardHeader>
                <Icon aria-hidden className="mb-2 size-8 text-primary" />
                <CardTitle>{title}</CardTitle>
                <CardDescription>{text}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </section>

      <section className="grid gap-4">
        <div className="grid gap-1">
          <h2 className="text-2xl font-semibold">Vanliga jobb – vad bör det kosta?</h2>
          <p className="text-sm text-muted-foreground">BilKolls standardpris i Stockholm för en genomsnittlig bil.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
            const e = estimates.get(s.slug);
            return (
              <Link
                key={s.slug}
                href={`/jamfor?tjanst=${s.slug}`}
                className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 shadow-xs hover:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <span className="font-medium">{s.titleSv}</span>
                {e && (
                  <span className="text-right text-sm">
                    <span className="block font-semibold text-primary">ca {formatSek(e.typicalSek)}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatSek(e.lowSek)}–{formatSek(e.highSek)} inkl. moms
                    </span>
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
