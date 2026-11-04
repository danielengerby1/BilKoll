import { AlertOctagon, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { AUDIT_VERDICT_LABEL_SV, type AuditVerdict } from "@/lib/domain";
import { cn } from "@/lib/utils";

const STYLE: Record<AuditVerdict, { icon: typeof CheckCircle2; className: string }> = {
  RIMLIGT: { icon: CheckCircle2, className: "bg-success/10 text-success border-success/40" },
  NAGOT_HOGT: { icon: AlertTriangle, className: "bg-warning/15 text-accent-foreground border-warning/50" },
  FOR_HOGT: { icon: AlertOctagon, className: "bg-destructive/10 text-destructive border-destructive/40" },
  MISSTANKT_MERFORSALJNING: { icon: ShieldAlert, className: "bg-destructive/10 text-destructive border-destructive/40" },
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
