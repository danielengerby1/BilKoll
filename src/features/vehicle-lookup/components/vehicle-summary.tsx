import { CalendarClock, Car, Fuel, Settings2 } from "lucide-react";
import type { Vehicle } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { daysUntil, formatDateSv } from "@/lib/dates";
import { FUEL_TYPE_LABEL_SV, FuelType, TRANSMISSION_LABEL_SV, Transmission } from "@/lib/domain";
import { formatRegnr } from "@/lib/regnr";

export function VehicleSummary({ vehicle }: { vehicle: Vehicle }) {
  const fuel = FuelType.safeParse(vehicle.fuelType);
  const gearbox = Transmission.safeParse(vehicle.transmission);
  const days = vehicle.nextInspection ? daysUntil(vehicle.nextInspection) : null;

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <p className="font-mono text-sm tracking-widest text-muted-foreground">{formatRegnr(vehicle.regnr)}</p>
          <CardTitle className="text-2xl">
            {vehicle.make} {vehicle.model}
          </CardTitle>
          {vehicle.variant && <p className="text-muted-foreground">{vehicle.variant}</p>}
        </div>
        <Car aria-hidden className="size-10 text-primary" />
      </CardHeader>
      <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
        <p className="flex items-center gap-2">
          <CalendarClock aria-hidden className="size-4 text-muted-foreground" /> Årsmodell {vehicle.year}
        </p>
        <p className="flex items-center gap-2">
          <Fuel aria-hidden className="size-4 text-muted-foreground" />
          {fuel.success ? FUEL_TYPE_LABEL_SV[fuel.data] : vehicle.fuelType}
        </p>
        {gearbox.success && (
          <p className="flex items-center gap-2">
            <Settings2 aria-hidden className="size-4 text-muted-foreground" /> {TRANSMISSION_LABEL_SV[gearbox.data]}
          </p>
        )}
        {vehicle.nextInspection && days !== null && (
          <div className="sm:col-span-3">
            <Badge variant={days <= 30 ? "accent" : "secondary"}>
              <CalendarClock aria-hidden />
              Besiktning senast {formatDateSv(vehicle.nextInspection)}
              {days >= 0 ? ` (om ${days} dagar)` : " – datumet har passerat!"}
            </Badge>
          </div>
        )}
        {vehicle.dataSource === "mock" && (
          <p className="text-xs text-muted-foreground sm:col-span-3">Fordonsdata är demodata tills en riktig fordonstjänst kopplas in.</p>
        )}
      </CardContent>
    </Card>
  );
}
