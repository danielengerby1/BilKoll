import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingForm } from "@/features/booking/components/booking-form.client";
import { getBookingContext } from "@/features/booking/server/queries";
import { TrustBadges } from "@/features/comparison/components/trust-badges";
import { formatSek } from "@/lib/money";
import { formatRegnr, isValidRegnr } from "@/lib/regnr";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Boka tid" };

type Params = Promise<{ workshopId: string; serviceSlug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function todayInStockholm(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm" }).format(new Date());
}

export default async function BookingPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { workshopId, serviceSlug } = await params;
  const sp = await searchParams;
  const ctx = await getBookingContext(workshopId, serviceSlug);
  if (!ctx) notFound();
  const regnr = typeof sp.regnr === "string" && isValidRegnr(sp.regnr) ? formatRegnr(sp.regnr) : undefined;

  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Boka {ctx.service.titleSv.toLowerCase()}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{ctx.workshop.name}</CardTitle>
          <CardDescription>
            {ctx.workshop.address}, {ctx.workshop.city}
          </CardDescription>
          <TrustBadges
            isGodkandBilverkstad={ctx.workshop.isGodkandBilverkstad}
            isMrf={ctx.workshop.isMrf}
            isAuthorized={ctx.workshop.isAuthorized}
            authorizedMakes={ctx.workshop.authorizedMakes}
          />
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-[1fr_auto] gap-y-1 text-sm">
            <dt className="text-muted-foreground">Arbetskostnad</dt>
            <dd className="text-right tabular-nums">{formatSek(ctx.fixedPriceSek)}</dd>
            <dt className="text-muted-foreground">Materialkostnad</dt>
            <dd className="text-right tabular-nums">{formatSek(ctx.partsPriceSek)}</dd>
            <dt className="border-t pt-1 font-semibold">Totalt inkl. moms</dt>
            <dd className="border-t pt-1 text-right text-lg font-bold tabular-nums">{formatSek(ctx.fixedPriceSek + ctx.partsPriceSek)}</dd>
          </dl>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <BookingForm workshopId={workshopId} serviceSlug={serviceSlug} defaultRegnr={regnr} minDate={todayInStockholm()} />
        </CardContent>
      </Card>
    </div>
  );
}
