/**
 * Deterministic safety net. Runs before and independently of the AI so a
 * safety-critical symptom always gets a "stop driving" message.
 */

export type SafetyTopic = "BROMSAR" | "STYRNING" | "VARNINGSLAMPA" | "BRANSLE" | "ROK_BRAND" | "DACK";

const SAFETY_PATTERNS: Record<SafetyTopic, readonly RegExp[]> = {
  BROMSAR: [/broms\w*\s*(tjut|gnissl|skrap|mjuk|sjunk|dålig|inte|ej)/i, /bromspedal/i, /bromsvätskelampa/i, /bromsar(na)? (tar|fungerar) (inte|dåligt)/i, /bromsarna? (tar|tog) inte/i],
  STYRNING: [/styrning/i, /ratten (vibrerar|drar|skakar|är tung|kärvar)/i, /drar åt (höger|vänster|sidan)/i, /servostyrning/i],
  VARNINGSLAMPA: [/röd (lampa|varningslampa|symbol)/i, /oljelampa/i, /oljetryck/i, /temperaturlampa/i, /motortemp/i, /överhett/i, /kokar/i, /blinkande motorlampa/i, /motorlampan blinkar/i],
  BRANSLE: [/lukt\w* (av )?(bensin|diesel|bränsle)/i, /(bensin|bränsle|diesel)lukt/i, /läcker (bensin|diesel|bränsle)/i],
  ROK_BRAND: [/rök/i, /brandlukt/i, /brinner/i, /lukt\w* (av )?bränt/i, /bränd lukt/i],
  DACK: [/punktering/i, /bula på däck/i, /däcket (är )?(tomt|platt)/i],
};

export const SAFETY_MESSAGE_SV: Record<SafetyTopic, string> = {
  BROMSAR: "Bromsproblem är säkerhetskritiskt. Kör inte bilen – kontakta en verkstad eller bärgning.",
  STYRNING: "Problem med styrningen är säkerhetskritiskt. Kör inte vidare – kontakta en verkstad.",
  VARNINGSLAMPA: "En röd varningslampa eller överhettning betyder: stanna säkert så snart du kan och stäng av motorn. Kontakta en verkstad innan du kör vidare.",
  BRANSLE: "Lukt av bränsle kan betyda läckage och brandrisk. Kör inte bilen, rök inte i närheten och kontakta en verkstad.",
  ROK_BRAND: "Rök eller brandlukt: stanna säkert, stäng av motorn och lämna bilen. Ring 112 vid brand.",
  DACK: "Kör inte på ett skadat eller tomt däck. Byt till reservhjul eller ring vägassistans.",
};

export function detectSafetyTopics(text: string): SafetyTopic[] {
  return (Object.keys(SAFETY_PATTERNS) as SafetyTopic[]).filter((topic) =>
    SAFETY_PATTERNS[topic].some((re) => re.test(text)),
  );
}

export function safetyWarningsSv(text: string): string[] {
  return detectSafetyTopics(text).map((t) => SAFETY_MESSAGE_SV[t]);
}
