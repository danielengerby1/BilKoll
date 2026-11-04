import type { Metadata } from "next";
import { listServices, listWorkshopsForSelect } from "@/features/comparison/server/queries";
import { QuoteForm } from "@/features/quote-audit/components/quote-form.client";
import { getOrFetchVehicle } from "@/features/vehicle-lookup/server/queries";
import { formatRegnr } from "@/lib/regnr";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Jämför din offert" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

export default async function AuditPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const regnr = one(sp.regnr);
  // Looking the car up caches it, so the audit can be linked to the vehicle.
  const [services, workshops, vehicle] = await Promise.all([
    listServices(),
    listWorkshopsForSelect(),
    regnr ? getOrFetchVehicle(regnr) : null,
  ]);
  const verkstad = one(sp.verkstad);
  const defaultWorkshopId = workshops.some((w) => w.id === verkstad) ? verkstad : undefined;

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Jämför din offert</h1>
        <p className="text-muted-foreground">
          Har du fått ett pris från verkstaden? Skriv in det så jämför vi med BilKolls uppskattning för just den typen av verkstad
          och säger om det är <strong className="text-foreground">billigt</strong>,{" "}
          <strong className="text-foreground">bra värde</strong> eller <strong className="text-foreground">dyrt</strong>. Vi
          varnar också om offerten ser ut att innehålla merförsäljning.
        </p>
      </div>
      <QuoteForm
        services={services.map((s) => ({ slug: s.slug, titleSv: s.titleSv }))}
        workshops={workshops}
        defaultRegnr={vehicle ? formatRegnr(vehicle.regnr) : regnr}
        defaultService={one(sp.tjanst)}
        defaultWorkshopId={defaultWorkshopId}
      />
    </div>
  );
}
