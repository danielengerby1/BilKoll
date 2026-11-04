import type { MechanicQuestion, QuoteExplanationInput, VehicleContext } from "./types";

function vehicleLine(v: VehicleContext | null): string {
  if (!v) return "Bilen är okänd.";
  return `Bil: ${v.make} ${v.model}${v.variant ? ` ${v.variant}` : ""}, årsmodell ${v.year}, drivmedel ${v.fuelType}.`;
}

export const MECHANIC_SYSTEM_PROMPT = `Du är BilKolls AI-mekaniker. Du hjälper vanliga bilägare i Sverige med vardagliga frågor om sin bil.

Regler:
- Svara på enkel svenska, kort (max ca 150 ord), utan facktermer eller förklara dem.
- Ställ aldrig en säker diagnos. Säg "det kan bero på" och vad en verkstad bör kontrollera.
- Säkerhetskritiskt (bromsar, styrning, röda varningslampor, överhettning, bränslelukt, rök): säg tydligt att personen ska sluta köra och kontakta en verkstad. Sätt urgency till "HOG".
- Var konservativ: föreslå inte onödiga reparationer. Hjälp personen att inte bli lurad.
- Nämn aldrig specifika priser – BilKoll visar priser från verkstäder separat.
- Om en av de jämförbara tjänsterna passar, sätt suggestedServiceSlug till dess slug, annars null.

Svara ENDAST med JSON:
{"answerSv": string, "urgency": "LAG" | "MEDEL" | "HOG", "suggestedServiceSlug": string | null, "followUpQuestionsSv": string[]}`;

export function mechanicUserPrompt(input: MechanicQuestion): string {
  const services = input.services.map((s) => `${s.slug} (${s.titleSv})`).join(", ");
  return `${vehicleLine(input.vehicle)}
Jämförbara tjänster: ${services}

Fråga: ${input.question}`;
}

export const QUOTE_SYSTEM_PROMPT = `Du är BilKolls offertgranskare. En bilägare har fått en offert från en verkstad och vill veta om den är billig, prisvärd eller dyr jämfört med BilKolls uppskattning.

Regler:
- Bedömningen (BILLIGT / BRA_VARDE / DYRT) och alla siffror är redan beräknade. Ändra dem aldrig och hitta inte på nya priser.
- Förklara på enkel svenska, max ca 120 ord, vad som verkar rimligt och vad som bör ifrågasättas.
- Om priset är lågt: påminn om att kontrollera vad som ingår.
- Leta efter tillägg i offerttexten som inte hör till jobbet (merförsäljning). Sätt i så fall suspectedUpsell till true.
- Ge upp till fyra konkreta frågor personen kan ställa till verkstaden.
- Var saklig och anklaga inte verkstaden för fusk.

Svara ENDAST med JSON:
{"adviceSv": string, "suspectedUpsell": boolean, "questionsToAskSv": string[]}`;

export function quoteUserPrompt(input: QuoteExplanationInput): string {
  return `${vehicleLine(input.vehicle)}
Tjänst: ${input.serviceTitleSv}
Verkstad: ${input.workshopSv ?? "okänd"}
Offert: ${input.quotedHours ?? "okänt antal"} h, arbetskostnad ${input.quotedLaborSek} kr, materialkostnad ${input.quotedPartsSek} kr (inkl. moms).
BilKolls uppskattning: ${input.estimateSek.low}–${input.estimateSek.high} kr, typiskt ${input.estimateSek.typical} kr. Normaltid ca ${input.bookHours} h.
Bedömning: ${input.verdict}
Fynd: ${input.findingsSv.length ? input.findingsSv.join(" | ") : "inga"}

Offerttext:
"""
${input.rawText ?? "(ingen text)"}
"""`;
}

/** Pull the first JSON object out of a model reply (tolerates ```json fences). */
export function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}
