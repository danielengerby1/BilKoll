import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Info, MapPin, Phone, ScanSearch } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrustBadges } from "@/features/comparison/components/trust-badges";
import { getWorkshop, listServices } from "@/features/comparison/server/queries";
import { formatDateSv } from "@/lib/dates";
import { WORKSHOP_CHAIN_LABEL_SV, WORKSHOP_TIER_LABEL_SV, WorkshopChain, WorkshopTier } from "@/lib/domain";
import { estimatePrice } from "@/lib/estimate";
import { formatPostalCode } from "@/lib/geo";
import { formatSek } from "@/lib/money";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const w = await getWorkshop((await params).id);
  return { title: w?.name ?? "Verkstad" };
}

export default async function WorkshopPage({ params }: { params: Params }) {
  const [workshop, services] = await Promise.all([getWorkshop((await params).id), listServices()]);
  if (!workshop) notFound();
  const tier = WorkshopTier.catch("KEDJA").parse(workshop.tier);
  const chain = WorkshopChain.catch("INDEPENDENT").parse(workshop.chain);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="gap-2">
          <CardTitle className="text-2xl">{workshop.name}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {WORKSHOP_TIER_LABEL_SV[tier]}
            {chain !== "INDEPENDENT" && ` · ${WORKSHOP_CHAIN_LABEL_SV[chain]}`}
          </p>
          <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <span className="flex items-center gap-1">
              <MapPin aria-hidden className="size-4 text-muted-foreground" /> {workshop.address}, {formatPostalCode(workshop.postalCode)} {workshop.city}
            </span>
            {workshop.phone && (
              <a href={`tel:${workshop.phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-1 hover:underline">
                <Phone aria-hidden className="size-4 text-muted-foreground" /> {workshop.phone}
              </a>
            )}
            {workshop.website && (
              <a href={workshop.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                <ExternalLink aria-hidden className="size-4 text-muted-foreground" /> Webbplats
              </a>
            )}
          </p>
          <TrustBadges
            isGodkandBilverkstad={workshop.isGodkandBilverkstad}
            isMrf={workshop.isMrf}
            isAuthorized={workshop.isAuthorized}
            authorizedMakes={workshop.authorizedMakes}
          />
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Uppgifter hämtade från{" "}
            <a href={workshop.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
              offentlig källa
            </a>{" "}
            {formatDateSv(workshop.verifiedAt)}. Fel uppgift? Kontakta oss så rättar vi.
          </p>
        </CardContent>
      </Card>

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">Uppskattade priser hos {WORKSHOP_TIER_LABEL_SV[tier].toLowerCase()}</h2>
        <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
          BilKolls uppskattning för en genomsnittlig bil – inte verkstadens prislista. Be verkstaden om en offert och jämför.
        </p>
        <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
          <table className="w-full text-sm">
            <caption className="sr-only">Uppskattade priser inkl. moms</caption>
            <thead className="bg-muted text-left text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-2 font-medium">Tjänst</th>
                <th scope="col" className="px-4 py-2 text-right font-medium">Uppskattat spann</th>
                <th scope="col" className="px-4 py-2 text-right font-medium">Typiskt inkl. moms</th>
                <th scope="col" className="px-4 py-2"><span className="sr-only">Jämför offert</span></th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => {
                const e = estimatePrice(s, tier);
                return (
                  <tr key={s.id} className="border-t">
                    <th scope="row" className="px-4 py-2 text-left font-medium">
                      <Link href={`/jamfor?tjanst=${s.slug}`} className="hover:underline">{s.titleSv}</Link>
                    </th>
                    <td className="px-4 py-2 text-right tabular-nums">{formatSek(e.lowSek)}–{formatSek(e.highSek)}</td>
                    <td className="px-4 py-2 text-right font-semibold tabular-nums">ca {formatSek(e.typicalSek)}</td>
                    <td className="px-4 py-2 text-right">
                      <Link
                        href={`/granska?verkstad=${workshop.id}&tjanst=${s.slug}`}
                        className={buttonVariants({ size: "sm", variant: "secondary" })}
                      >
                        <ScanSearch aria-hidden /> Jämför offert
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
