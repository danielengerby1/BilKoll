import Link from "next/link";
import { HelpCircle, Search } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatSek } from "@/lib/money";
import type { AuditResponse } from "../server/actions";
import { VerdictBadge } from "./verdict-badge";

export function AuditResult({ result, serviceSlug }: { result: AuditResponse; serviceSlug: string }) {
  return (
    <Card aria-live="polite">
      <CardHeader className="gap-3">
        <p className="text-sm text-muted-foreground">Bedömning av offert för {result.serviceTitleSv}</p>
        <VerdictBadge verdict={result.verdict} />
      </CardHeader>
      <CardContent className="grid gap-5">
        <dl className="grid gap-3 rounded-lg bg-muted p-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">Din offert</dt>
            <dd className="text-xl font-bold tabular-nums">{formatSek(result.quotedTotalSek)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Medianpris i Stockholm</dt>
            <dd className="text-xl font-bold tabular-nums">
              {result.benchmarkTotalSek !== null ? formatSek(result.benchmarkTotalSek) : "–"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Rimligt spann</dt>
            <dd className="text-xl font-bold tabular-nums">
              {result.fairRangeSek ? `${formatSek(result.fairRangeSek.low)}–${formatSek(result.fairRangeSek.high)}` : "–"}
            </dd>
          </div>
          {result.benchmarkHours !== null && (
            <p className="text-xs text-muted-foreground sm:col-span-3">
              Normaltid {result.benchmarkHours.toLocaleString("sv-SE")} h
              {result.effectiveHourlyRateSek !== null && ` · ditt timpris ${formatSek(result.effectiveHourlyRateSek)}/h`} · alla
              belopp inkl. moms
            </p>
          )}
        </dl>

        <p className="leading-relaxed">{result.adviceSv}</p>

        {result.findings.length > 0 && (
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {result.findings.map((f) => (
              <li key={f.code}>{f.textSv}</li>
            ))}
          </ul>
        )}

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

        {result.verdict !== "RIMLIGT" && (
          <Link href={`/jamfor?tjanst=${serviceSlug}`} className={buttonVariants({ size: "lg" })}>
            <Search aria-hidden /> Se billigare verkstäder för samma jobb
          </Link>
        )}
        <p className="text-xs text-muted-foreground">
          Vägledning, inte en garanti. Priset kan påverkas av bilmodell och delar. Granskning {result.id.slice(-6)} ·{" "}
          {result.aiModel === "deterministic" ? "regelbaserad" : `förklarad av ${result.aiModel}`}
        </p>
      </CardContent>
    </Card>
  );
}
