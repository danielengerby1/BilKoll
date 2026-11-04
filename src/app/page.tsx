import Link from "next/link";
import { MessageCircleQuestion, ScanSearch, Scale } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchForm } from "@/features/comparison/components/search-form";
import { getServicePriceRanges, listServices } from "@/features/comparison/server/queries";
import { RegnrForm } from "@/features/vehicle-lookup/components/regnr-form.client";
import { formatSek } from "@/lib/money";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    href: "/jamfor",
    icon: Scale,
    title: "Jämför verkstäder",
    text: "Se arbets- och materialkostnad sida vid sida och hitta bäst värde nära dig.",
  },
  {
    href: "/granska",
    icon: ScanSearch,
    title: "Granska din offert",
    text: "Vi jämför offerten mot normaltid och Stockholms marknadspriser och flaggar merförsäljning.",
  },
  {
    href: "/fraga",
    icon: MessageCircleQuestion,
    title: "Fråga AI-mekanikern",
    text: "Konstiga ljud, varningslampor eller däckregler – få ett rakt svar på svenska.",
  },
] as const;

export default async function HomePage() {
  const [services, ranges] = await Promise.all([listServices(), getServicePriceRanges()]);

  return (
    <div className="grid gap-12">
      <section className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center">
        <div className="grid gap-4">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Rätt pris på verkstaden. <span className="text-primary">Varje gång.</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            BilKoll jämför priser hos bilverkstäder i Stockholms län, granskar offerter och svarar på dina bilfrågor – så att
            du slipper betala för mycket eller köpa jobb du inte behöver.
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
        <h2 className="text-2xl font-semibold">Vanliga jobb – vad kostar det?</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
            const range = ranges.get(s.slug);
            return (
              <Link
                key={s.slug}
                href={`/jamfor?tjanst=${s.slug}`}
                className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 shadow-xs hover:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <span className="font-medium">{s.titleSv}</span>
                {range && (
                  <span className="text-right text-sm">
                    <span className="block font-semibold text-primary">från {formatSek(range.minSek)}</span>
                    <span className="text-xs text-muted-foreground">median {formatSek(range.medianSek)} inkl. moms</span>
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
