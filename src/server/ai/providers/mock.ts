import type { AIService, MechanicAnswer } from "../types";

/**
 * Offline provider: deterministic keyword answers. Default in dev and the only
 * provider used in tests (AI_PROVIDER=mock). No network calls.
 */

type Rule = { match: RegExp; answer: Omit<MechanicAnswer, "followUpQuestionsSv"> & { followUpQuestionsSv?: string[] } };

const RULES: readonly Rule[] = [
  {
    match: /broms|gnissl|tjut/i,
    answer: {
      answerSv:
        "Gnissel eller skrapljud vid inbromsning kan bero på slitna bromsbelägg, rost på skivorna eller en kärvande bromsok. Om pedalen känns mjuk eller bilen drar åt sidan: kör inte, kontakta en verkstad. Annars – låt en verkstad mäta belägg och skivor innan du godkänner byte av allt.",
      urgency: "HOG",
      suggestedServiceSlug: "bromsar-fram",
      followUpQuestionsSv: ["Hörs ljudet bara när du bromsar?", "Känns bromspedalen annorlunda än vanligt?"],
    },
  },
  {
    match: /motorlampa|check engine|gul lampa|felkod/i,
    answer: {
      answerSv:
        "En gul motorlampa betyder att bilens dator har sparat en felkod. Det kan vara allt från en lös tanklock till en givare. Om lampan lyser fast och bilen går som vanligt kan du oftast köra till en verkstad för felsökning. Blinkar lampan eller går motorn ojämnt: kör så lite som möjligt.",
      urgency: "MEDEL",
      suggestedServiceSlug: "felsokning",
    },
  },
  {
    match: /startar inte|batteri|död|klickar/i,
    answer: {
      answerSv:
        "Om bilen bara klickar eller är helt död är 12-voltsbatteriet den vanligaste orsaken, särskilt när det är kallt. Prova starthjälp. Startar bilen då men problemet kommer tillbaka kan batteriet vara slut eller laddningen inte fungera – låt en verkstad mäta batteri och generator.",
      urgency: "MEDEL",
      suggestedServiceSlug: "batteribyte",
    },
  },
  {
    match: /däck|vinterdäck|sommardäck|dubb|hjulskifte|mönsterdjup/i,
    answer: {
      answerSv:
        "Vinterdäck krävs 1 december–31 mars när det är vinterväglag. Dubbdäck får användas 1 oktober–15 april (längre om väglaget kräver det). Minsta mönsterdjup på vinterdäck är 3 mm, men 5 mm eller mer ger mycket bättre grepp.",
      urgency: "LAG",
      suggestedServiceSlug: "hjulskifte",
    },
  },
  {
    match: /service|olja|oljebyte|serviceintervall/i,
    answer: {
      answerSv:
        "Följ serviceintervallet i serviceboken eller bilens serviceindikator – oftast en gång per år. Du behöver inte gå till märkesverkstad för att behålla nybilsgarantin, så länge servicen görs enligt tillverkarens schema med likvärdiga delar. Spara kvittona.",
      urgency: "LAG",
      suggestedServiceSlug: "bas-service",
    },
  },
  {
    match: /besiktning/i,
    answer: {
      answerSv:
        "Du kan besikta bilen hos valfritt besiktningsföretag. Kolla sista datum för besiktning – kör du efter det kan bilen få körförbud. En snabb koll av lampor, torkarblad, däck och bromsar innan besiktningen minskar risken för ombesiktning.",
      urgency: "LAG",
      suggestedServiceSlug: null,
    },
  },
];

const FALLBACK: MechanicAnswer = {
  answerSv:
    "Det är svårt att säga utan att någon tittar på bilen. Beskriv gärna när problemet uppstår (kall/varm motor, vid fart, vid inbromsning) och om någon varningslampa lyser. Vid osäkerhet: boka en felsökning hos en Godkänd Bilverkstad.",
  urgency: "MEDEL",
  suggestedServiceSlug: "felsokning",
  followUpQuestionsSv: ["När började problemet?", "Lyser någon lampa på instrumentpanelen?"],
};

export function createMockAIService(): AIService {
  return {
    provider: "mock",
    model: "mock",
    async askMechanic({ question, services }) {
      const rule = RULES.find((r) => r.match.test(question));
      const answer: MechanicAnswer = rule ? { followUpQuestionsSv: [], ...rule.answer } : FALLBACK;
      const known = services.some((s) => s.slug === answer.suggestedServiceSlug);
      return { ...answer, suggestedServiceSlug: known ? answer.suggestedServiceSlug : null };
    },
    async explainQuote(input) {
      const lines = input.findingsSv.length
        ? input.findingsSv
        : ["Offerten ligger i linje med vad verkstäder i Stockholm brukar ta för jobbet."];
      return {
        adviceSv: lines.join(" "),
        verdict: null,
        questionsToAskSv: [
          "Kan ni specificera vilka delar som ingår och vad de kostar styck?",
          "Vilka av punkterna måste göras nu och vilka kan vänta?",
        ],
      };
    },
  };
}
