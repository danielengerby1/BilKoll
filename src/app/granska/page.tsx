import type { Metadata } from "next";
import { listServices } from "@/features/comparison/server/queries";
import { QuoteForm } from "@/features/quote-audit/components/quote-form.client";
import { getOrFetchVehicle } from "@/features/vehicle-lookup/server/queries";
import { formatRegnr } from "@/lib/regnr";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Granska din offert" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AuditPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const regnr = typeof sp.regnr === "string" ? sp.regnr : undefined;
  const tjanst = typeof sp.tjanst === "string" ? sp.tjanst : undefined;
  // Looking the car up caches it, so the audit can be linked to the vehicle.
  const [services, vehicle] = await Promise.all([listServices(), regnr ? getOrFetchVehicle(regnr) : null]);

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Granska din offert</h1>
        <p className="text-muted-foreground">
          Fått ett pris från verkstaden? Vi jämför det med normaltiden för jobbet, timpriserna i Stockholm (1 200–2 200 kr/h
          inkl. moms) och vad andra verkstäder tar – och säger till om något ser ut som merförsäljning.
        </p>
      </div>
      <QuoteForm
        services={services.map((s) => ({ slug: s.slug, titleSv: s.titleSv }))}
        defaultRegnr={vehicle ? formatRegnr(vehicle.regnr) : regnr}
        defaultService={tjanst}
      />
    </div>
  );
}
