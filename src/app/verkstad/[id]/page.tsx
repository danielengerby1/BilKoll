import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, MapPin, Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrustBadges } from "@/features/comparison/components/trust-badges";
import { getWorkshopWithPrices } from "@/features/comparison/server/queries";
import { formatSlotSv } from "@/lib/dates";
import { formatPostalCode } from "@/lib/geo";
import { formatSek } from "@/lib/money";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const w = await getWorkshopWithPrices((await params).id);
  return { title: w?.name ?? "Verkstad" };
}

export default async function WorkshopPage({ params }: { params: Params }) {
  const workshop = await getWorkshopWithPrices((await params).id);
  if (!workshop) notFound();

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="gap-2">
          <CardTitle className="text-2xl">{workshop.name}</CardTitle>
          <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin aria-hidden className="size-4" /> {workshop.address}, {formatPostalCode(workshop.postalCode)} {workshop.city}
            </span>
            <span className="flex items-center gap-1">
              <Star aria-hidden className="size-4 fill-warning text-warning" /> {workshop.rating.toLocaleString("sv-SE")} ({workshop.reviewCount} omdömen)
            </span>
            {workshop.nextAvailableAt && (
              <span className="flex items-center gap-1">
                <Clock aria-hidden className="size-4" /> Tidigast {formatSlotSv(workshop.nextAvailableAt)}
              </span>
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
          <p className="text-sm">Timpris: <strong>{formatSek(workshop.hourlyRateSek)}/h</strong> inkl. moms</p>
        </CardContent>
      </Card>

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">Prislista</h2>
        <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
          <table className="w-full text-sm">
            <caption className="sr-only">Priser inkl. moms</caption>
            <thead className="bg-muted text-left text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-2 font-medium">Tjänst</th>
                <th scope="col" className="px-4 py-2 text-right font-medium">Arbetskostnad</th>
                <th scope="col" className="px-4 py-2 text-right font-medium">Materialkostnad</th>
                <th scope="col" className="px-4 py-2 text-right font-medium">Totalt inkl. moms</th>
                <th scope="col" className="px-4 py-2"><span className="sr-only">Boka</span></th>
              </tr>
            </thead>
            <tbody>
              {workshop.prices.map((p) => (
                <tr key={p.id} className="border-t">
                  <th scope="row" className="px-4 py-2 text-left font-medium">
                    <Link href={`/jamfor?tjanst=${p.service.slug}`} className="hover:underline">{p.service.titleSv}</Link>
                  </th>
                  <td className="px-4 py-2 text-right tabular-nums">{formatSek(p.fixedPriceSek)}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{formatSek(p.partsPriceSek)}</td>
                  <td className="px-4 py-2 text-right font-semibold tabular-nums">{formatSek(p.fixedPriceSek + p.partsPriceSek)}</td>
                  <td className="px-4 py-2 text-right">
                    <Link href={`/boka/${workshop.id}/${p.service.slug}`} className={buttonVariants({ size: "sm", variant: "secondary" })}>
                      Boka
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
