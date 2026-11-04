import type { Metadata } from "next";
import { MechanicChat } from "@/features/ai-mechanic/components/mechanic-chat.client";
import { getOrFetchVehicle } from "@/features/vehicle-lookup/server/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Fråga AI-mekanikern" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AskPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const regnr = typeof sp.regnr === "string" ? sp.regnr : null;
  const vehicle = regnr ? await getOrFetchVehicle(regnr) : null;

  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Fråga AI-mekanikern</h1>
        <p className="text-muted-foreground">
          Beskriv ljud, lampor eller annat konstigt – eller fråga om däck, service och besiktning. Du får ett rakt svar på
          svenska och tips om vad du behöver göra.
        </p>
      </div>
      <MechanicChat
        regnr={vehicle?.regnr ?? null}
        vehicleLabel={vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.year})` : null}
      />
    </div>
  );
}
