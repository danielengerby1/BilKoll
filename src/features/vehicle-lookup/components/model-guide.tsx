import { Lightbulb, Wrench } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CarModelGuide } from "@/lib/car-models";

export function ModelGuide({ guide }: { guide: CarModelGuide }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bra att veta om {guide.make} {guide.model}</CardTitle>
        <CardDescription>
          {guide.segment}. {guide.serviceIntervalSv}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-2">
        <section>
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Wrench aria-hidden className="size-4 text-primary" /> Vanligt slitage
          </h4>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {guide.commonWearSv.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </section>
        <section>
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Lightbulb aria-hidden className="size-4 text-accent-foreground" /> Tips
          </h4>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {guide.tipsSv.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
        <p className="text-xs text-muted-foreground sm:col-span-2">
          Allmänna råd – kontrollera alltid bilens servicebok.
        </p>
      </CardContent>
    </Card>
  );
}
