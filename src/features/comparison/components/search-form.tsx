import { Search } from "lucide-react";
import type { StandardService } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { SERVICE_CATEGORY_LABEL_SV, ServiceCategory } from "@/lib/domain";

type Props = {
  services: readonly StandardService[];
  defaults?: { tjanst?: string; postnr?: string; regnr?: string };
  compact?: boolean;
};

/** Plain GET form – works without JavaScript and gives shareable URLs. */
export function SearchForm({ services, defaults, compact }: Props) {
  const groups = ServiceCategory.options
    .map((cat) => ({ cat, items: services.filter((s) => s.category === cat) }))
    .filter((g) => g.items.length > 0);

  return (
    <form action="/jamfor" method="get" className={compact ? "grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end" : "grid gap-4"}>
      <div className="grid gap-1.5">
        <Label htmlFor="tjanst">Vad behöver bilen?</Label>
        <NativeSelect id="tjanst" name="tjanst" defaultValue={defaults?.tjanst ?? "bas-service"}>
          {groups.map((g) => (
            <optgroup key={g.cat} label={SERVICE_CATEGORY_LABEL_SV[g.cat]}>
              {g.items.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.titleSv}
                </option>
              ))}
            </optgroup>
          ))}
        </NativeSelect>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="postnr">Ditt postnummer</Label>
        <Input id="postnr" name="postnr" inputMode="numeric" placeholder="t.ex. 171 48" defaultValue={defaults?.postnr} maxLength={6} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="regnr">Regnr (valfritt)</Label>
        <Input id="regnr" name="regnr" placeholder="ABC 123" defaultValue={defaults?.regnr} maxLength={8} className="uppercase" />
      </div>
      <Button type="submit" size={compact ? "default" : "lg"}>
        <Search aria-hidden /> Visa verkstäder
      </Button>
    </form>
  );
}
