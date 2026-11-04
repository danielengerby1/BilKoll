import { BadgeCheck, ShieldCheck, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Props = {
  isGodkandBilverkstad: boolean;
  isMrf: boolean;
  isAuthorized: boolean;
  authorizedMakes?: string | null;
};

/** Only shows a badge when the DB flag is true. Never inferred. */
export function TrustBadges({ isGodkandBilverkstad, isMrf, isAuthorized, authorizedMakes }: Props) {
  if (!isGodkandBilverkstad && !isMrf && !isAuthorized) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {isGodkandBilverkstad && (
        <Badge variant="secondary">
          <ShieldCheck aria-hidden /> Godkänd Bilverkstad
        </Badge>
      )}
      {isMrf && (
        <Badge variant="secondary">
          <BadgeCheck aria-hidden /> MRF-ansluten
        </Badge>
      )}
      {isAuthorized && (
        <Badge variant="accent">
          <Award aria-hidden /> Auktoriserad{authorizedMakes ? ` ${authorizedMakes.replace(/,/g, ", ")}` : ""}
        </Badge>
      )}
    </div>
  );
}
