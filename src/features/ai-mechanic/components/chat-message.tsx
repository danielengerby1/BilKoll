import Link from "next/link";
import { AlertTriangle, ArrowRight, Clock, OctagonAlert, ThumbsUp, Wrench } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { URGENCY_LABEL_SV, type Urgency } from "@/lib/domain";
import { cn } from "@/lib/utils";
import type { MechanicReply } from "../server/actions";

export type ChatEntry = { role: "user"; text: string } | { role: "assistant"; reply: MechanicReply };

const URGENCY_ICON: Record<Urgency, typeof Clock> = { LAG: ThumbsUp, MEDEL: Clock, HOG: OctagonAlert };

export function ChatMessage({ entry }: { entry: ChatEntry }) {
  if (entry.role === "user") {
    return (
      <p className="ml-auto max-w-[85%] rounded-xl rounded-br-sm bg-primary px-4 py-2 text-primary-foreground">{entry.text}</p>
    );
  }
  const { reply } = entry;
  const UrgencyIcon = URGENCY_ICON[reply.urgency];
  return (
    <div className="grid max-w-[95%] gap-3 rounded-xl rounded-bl-sm border bg-card p-4 shadow-sm">
      {reply.safetyWarningsSv.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle aria-hidden />
          <AlertTitle>Säkerhetsvarning</AlertTitle>
          <AlertDescription>
            {reply.safetyWarningsSv.map((w) => (
              <p key={w}>{w}</p>
            ))}
          </AlertDescription>
        </Alert>
      )}
      <p className="flex items-start gap-2">
        <Wrench aria-hidden className="mt-1 size-4 shrink-0 text-primary" />
        <span className="leading-relaxed">{reply.answerSv}</span>
      </p>
      <p className={cn("flex items-center gap-1.5 text-sm font-medium", reply.urgency === "HOG" ? "text-destructive" : "text-muted-foreground")}>
        <UrgencyIcon aria-hidden className="size-4" /> {URGENCY_LABEL_SV[reply.urgency]}
      </p>
      {reply.suggestedService && (
        <Link
          href={`/jamfor?tjanst=${reply.suggestedService.slug}`}
          className={cn(buttonVariants({ variant: "secondary" }), "justify-self-start")}
        >
          Jämför priser för {reply.suggestedService.titleSv.toLowerCase()} <ArrowRight aria-hidden />
        </Link>
      )}
      {reply.followUpQuestionsSv.length > 0 && (
        <div className="text-sm">
          <p className="font-medium">Berätta gärna mer:</p>
          <ul className="list-disc pl-5 text-muted-foreground">
            {reply.followUpQuestionsSv.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-xs text-muted-foreground">AI-svar – ingen diagnos. Låt en verkstad kontrollera bilen vid osäkerhet.</p>
    </div>
  );
}
