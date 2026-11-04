import { VALUE_WEIGHTS, OUTLIER_FACTOR } from "../ranking";

const pct = (n: number) => `${Math.round(n * 100)} %`;

export function ValueExplainer() {
  return (
    <details className="rounded-xl border bg-card p-5 text-sm shadow-sm">
      <summary className="cursor-pointer font-semibold">Så räknar vi fram ”Bäst värde”</summary>
      <div className="mt-3 grid gap-2 text-muted-foreground">
        <p>Vi tar inte betalt av verkstäderna för placering. Värdepoängen (0–100) är en öppen formel:</p>
        <ul className="list-disc pl-5">
          <li>Pris: {pct(VALUE_WEIGHTS.price)} – billigast får full poäng.</li>
          <li>Omdömen: {pct(VALUE_WEIGHTS.rating)} – få omdömen vägs mot ett genomsnitt så att ett enda 5-betyg inte avgör.</li>
          <li>Avstånd: {pct(VALUE_WEIGHTS.distance)} – inom 30 km från ditt postnummer.</li>
          <li>Trygghet: {pct(VALUE_WEIGHTS.trust)} – Godkänd Bilverkstad, MRF och auktorisation för ditt märke.</li>
          <li>Tillgänglighet: {pct(VALUE_WEIGHTS.availability)} – hur snart du kan få tid.</li>
        </ul>
        <p>Priser mer än {Math.round((OUTLIER_FACTOR - 1) * 100)} % över medianen markeras som klart dyrare.</p>
      </div>
    </details>
  );
}
