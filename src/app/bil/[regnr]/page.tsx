import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircleQuestion, ScanSearch } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getServiceEstimates, listServices } from "@/features/comparison/server/queries";
import { ModelGuide } from "@/features/vehicle-lookup/components/model-guide";
import { VehicleSummary } from "@/features/vehicle-lookup/components/vehicle-summary";
import { getOrFetchVehicle } from "@/features/vehicle-lookup/server/queries";
import { findCarModelGuide, priceClassFor, servicesNotApplicable } from "@/lib/car-models";
import { FuelType } from "@/lib/domain";
import { formatSek } from "@/lib/money";
import { formatRegnr } from "@/lib/regnr";

export const dynamic = "force-dynamic";

type Params = Promise<{ regnr: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { regnr } = await params;
  return { title: formatRegnr(decodeURIComponent(regnr)) };
}

export default async function VehiclePage({ params }: { params: Params }) {
  const { regnr } = await params;
  const vehicle = await getOrFetchVehicle(decodeURIComponent(regnr));
  if (!vehicle) notFound();

  const priceClass = priceClassFor(vehicle.make, vehicle.model);
  const [services, estimates] = await Promise.all([listServices(), getServiceEstimates(priceClass)]);
  const guide = findCarModelGuide(vehicle.make, vehicle.model);
  const fuel = FuelType.safeParse(vehicle.fuelType);
  const hidden = fuel.success ? servicesNotApplicable(fuel.data) : [];
  const relevant = services.filter((s) => !hidden.includes(s.slug));
  const qs = `regnr=${vehicle.regnr}`;

  return (
    <div className="grid gap-6">
      <VehicleSummary vehicle={vehicle} />

      <div className="flex flex-wrap gap-2">
        <Link href={`/fraga?${qs}`} className={buttonVariants({ variant: "outline" })}>
          <MessageCircleQuestion aria-hidden /> Fråga om din bil
        </Link>
        <Link href={`/granska?${qs}`} className={buttonVariants({ variant: "outline" })}>
          <ScanSearch aria-hidden /> Jämför en offert
        </Link>
      </div>

      {guide && <ModelGuide guide={guide} />}

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">Vad bör det kosta för din bil?</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {relevant.map((s) => {
            const e = estimates.get(s.slug);
            return (
              <Link
                key={s.slug}
                href={`/jamfor?tjanst=${s.slug}&${qs}`}
                className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 shadow-xs hover:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <span className="font-medium">{s.titleSv}</span>
                {e && <span className="text-sm font-semibold text-primary">ca {formatSek(e.typicalSek)}</span>}
              </Link>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">{`BilKolls uppskattning inkl. moms${priceClass === "PREMIUM" ? ", räknat som premiumbil (dyrare delar)" : ""}. Klicka för att se verkstäder och jämföra din offert.`}</p>
      </section>
    </div>
  );
}
