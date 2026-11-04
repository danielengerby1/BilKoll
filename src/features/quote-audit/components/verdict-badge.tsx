import { AlertOctagon, BadgePercent, ThumbsUp } from "lucide-react";
import { AUDIT_VERDICT_LABEL_SV, type AuditVerdict } from "@/lib/domain";
import { cn } from "@/lib/utils";

const STYLE: Record<AuditVerdict, { icon: typeof ThumbsUp; className: string }> = {
  BILLIGT: { icon: BadgePercent, className: "bg-secondary text-secondary-foreground border-primary/30" },
  BRA_VARDE: { icon: ThumbsUp, className: "bg-success/10 text-success border-success/40" },
  DYRT: { icon: AlertOctagon, className: "bg-destructive/10 text-destructive border-destructive/40" },
};

/** Icon + text – colour is never the only signal. */
export function VerdictBadge({ verdict, size = "lg" }: { verdict: AuditVerdict; size?: "sm" | "lg" }) {
  const { icon: Icon, className } = STYLE[verdict];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border font-semibold",
        size === "lg" ? "px-4 py-2 text-lg" : "px-2 py-0.5 text-xs",
        className,
      )}
    >
      <Icon aria-hidden className={size === "lg" ? "size-6" : "size-3.5"} />
      {AUDIT_VERDICT_LABEL_SV[verdict]}
    </span>
  );
}
