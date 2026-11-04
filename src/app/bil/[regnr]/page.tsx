import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircleQuestion, ScanSearch } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getServicePriceRanges, listServices } from "@/features/comparison/server/queries";
import { ModelGuide } from "@/features/vehicle-lookup/components/model-guide";
import { VehicleSummary } from "@/features/vehicle-lookup/components/vehicle-summary";
import { getOrFetchVehicle } from "@/features/vehicle-lookup/server/queries";
import { findCarModelGuide, servicesNotApplicable } from "@/lib/car-models";
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

  const [services, ranges] = await Promise.all([listServices(), getServicePriceRanges()]);
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
          <ScanSearch aria-hidden /> Granska en offert
        </Link>
      </div>

      {guide && <ModelGuide guide={guide} />}

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">Jämför priser för din bil</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {relevant.map((s) => {
            const range = ranges.get(s.slug);
            return (
              <Link
                key={s.slug}
                href={`/jamfor?tjanst=${s.slug}&${qs}`}
                className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 shadow-xs hover:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <span className="font-medium">{s.titleSv}</span>
                {range && <span className="text-sm font-semibold text-primary">från {formatSek(range.minSek)}</span>}
              </Link>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">Priser inkl. moms för en genomsnittlig bil. Stora eller premiumbilar kan kosta mer i material.</p>
      </section>
    </div>
  );
}
