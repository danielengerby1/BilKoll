import { TIER_ESTIMATE, WORKSHOP_TIER_LABEL_SV, WorkshopTier } from "@/lib/domain";
import { formatSek } from "@/lib/money";
import { VALUE_WEIGHTS } from "../ranking";

const pct = (n: number) => `${Math.round(n * 100)} %`;

export function ValueExplainer() {
  return (
    <details className="rounded-xl border bg-card p-5 text-sm shadow-sm">
      <summary className="cursor-pointer font-semibold">Så räknar vi fram priser och ”Bäst värde”</summary>
      <div className="mt-3 grid gap-3 text-muted-foreground">
        <p>
          Verkstäderna är riktiga, men priserna är <strong className="text-foreground">BilKolls uppskattningar</strong>. Vi räknar
          normaltiden för jobbet × ett timpris för verkstadstypen, plus vanlig materialkostnad. Premiumbilar räknas med dyrare delar
          och något längre tid.
        </p>
        <ul className="list-disc pl-5">
          {WorkshopTier.options.map((t) => (
            <li key={t}>
              {WORKSHOP_TIER_LABEL_SV[t]}: timpris ca {formatSek(TIER_ESTIMATE[t].rateSek.min)}–{formatSek(TIER_ESTIMATE[t].rateSek.max)} inkl. moms
            </li>
          ))}
        </ul>
        <p>
          Värdepoängen (0–100): uppskattat pris {pct(VALUE_WEIGHTS.price)}, avstånd {pct(VALUE_WEIGHTS.distance)}, trygghet{" "}
          {pct(VALUE_WEIGHTS.trust)} (auktoriserad för ditt märke eller verifierad branschmärkning). Ingen verkstad betalar för
          placering.
        </p>
        <p>
          När du fått en offert: jämför den med uppskattningen. <strong className="text-foreground">Under</strong> spannet = Billigt,{" "}
          <strong className="text-foreground">inom</strong> = Bra värde, <strong className="text-foreground">över</strong> = Dyrt.
        </p>
      </div>
    </details>
  );
}
