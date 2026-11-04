import Link from "next/link";
import { HelpCircle, Search, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatSek } from "@/lib/money";
import type { AuditResponse } from "../server/actions";
import { RangeMeter } from "./range-meter";
import { VerdictBadge } from "./verdict-badge";

function diffText(pct: number): string {
  if (pct === 0) return "samma som vårt typiska pris";
  return `${Math.abs(pct)} % ${pct > 0 ? "över" : "under"} vårt typiska pris`;
}

export function AuditResult({ result, serviceSlug }: { result: AuditResponse; serviceSlug: string }) {
  const { estimate } = result;
  return (
    <Card aria-live="polite">
      <CardHeader className="gap-3">
        <p className="text-sm text-muted-foreground">
          {result.serviceTitleSv}
          {result.workshopName ? ` hos ${result.workshopName}` : ""} – jämfört med {result.comparedWithSv}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <VerdictBadge verdict={result.verdict} />
          <p className="text-sm">
            <strong className="tabular-nums">{formatSek(result.quotedTotalSek)}</strong> är {diffText(result.diffFromTypicalPct)}
          </p>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5">
        <RangeMeter
          lowSek={estimate.lowSek}
          typicalSek={estimate.typicalSek}
          highSek={estimate.highSek}
          quotedSek={result.quotedTotalSek}
        />

        {result.suspectedUpsell && (
          <Alert variant="warning">
            <ShieldAlert aria-hidden />
            <AlertTitle>Möjlig merförsäljning</AlertTitle>
            <AlertDescription>Offerten verkar innehålla mer än jobbet du frågade efter. Fråga vad som verkligen behövs.</AlertDescription>
          </Alert>
        )}

        <p className="leading-relaxed">{result.adviceSv}</p>

        {result.findings.length > 0 && (
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {result.findings.map((f) => (
              <li key={f.code}>{f.textSv}</li>
            ))}
          </ul>
        )}

        <dl className="grid gap-x-6 gap-y-1 rounded-lg bg-muted p-4 text-sm sm:grid-cols-2">
          <dt className="text-muted-foreground">Uppskattad arbetskostnad</dt>
          <dd className="tabular-nums sm:text-right">
            {formatSek(estimate.laborSek.low)}–{formatSek(estimate.laborSek.high)} (ca {estimate.hours.toLocaleString("sv-SE")} h)
          </dd>
          <dt className="text-muted-foreground">Uppskattad materialkostnad</dt>
          <dd className="tabular-nums sm:text-right">
            {estimate.partsSek.high === 0 ? "–" : `${formatSek(estimate.partsSek.low)}–${formatSek(estimate.partsSek.high)}`}
          </dd>
          {result.effectiveHourlyRateSek !== null && (
            <>
              <dt className="text-muted-foreground">Timpris i din offert</dt>
              <dd className="tabular-nums sm:text-right">{formatSek(result.effectiveHourlyRateSek)}/h</dd>
            </>
          )}
          <p className="text-xs text-muted-foreground sm:col-span-2">Alla belopp inkl. moms. Uppskattningen gäller en genomsnittlig bil.</p>
        </dl>

        {result.questionsToAskSv.length > 0 && (
          <section className="rounded-lg border p-4">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <HelpCircle aria-hidden className="size-4 text-primary" /> Fråga verkstaden
            </h4>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {result.questionsToAskSv.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </section>
        )}

        {result.verdict === "DYRT" && (
          <Link href={`/jamfor?tjanst=${serviceSlug}&sortera=LAGST_PRIS`} className={buttonVariants({ size: "lg" })}>
            <Search aria-hidden /> Hitta verkstäder med lägre uppskattat pris
          </Link>
        )}
        <p className="text-xs text-muted-foreground">
          Vägledning, inte en garanti. Granskning {result.id.slice(-6)} ·{" "}
          {result.aiModel === "deterministic" ? "regelbaserad" : `förklarad av ${result.aiModel}`}
        </p>
      </CardContent>
    </Card>
  );
}
