import type { FuelType } from "./domain";

/**
 * Plain-language guide for the most common cars on Swedish roads.
 * Deliberately general and conservative: we point people to the service book
 * rather than invent model-specific intervals.
 */
export type CarModelGuide = {
  slug: string;
  make: string;
  model: string;
  fuelTypes: readonly FuelType[];
  /** Typical build years we have data for. */
  years: { from: number; to: number };
  segment: string;
  serviceIntervalSv: string;
  commonWearSv: readonly string[];
  tipsSv: readonly string[];
};

const EV_WEAR = [
  "Bromsskivor som rostar eftersom elbilen bromsar mest med motorn",
  "Däck slits snabbare på grund av vikt och vridmoment",
  "12-voltsbatteriet kan ta slut även om drivbatteriet är fullt",
] as const;

const PHEV_WEAR = [
  "Bromsskivor som rostar när bilen mest körs på el",
  "Motorolja som åldras även om bensinmotorn sällan går",
  "12-voltsbatteriet",
] as const;

export const CAR_MODEL_GUIDES: readonly CarModelGuide[] = [
  {
    slug: "volvo-xc60",
    make: "Volvo",
    model: "XC60",
    fuelTypes: ["DIESEL", "BENSIN", "LADDHYBRID"],
    years: { from: 2017, to: 2025 },
    segment: "Mellanstor SUV",
    serviceIntervalSv: "Vanligen en gång per år eller enligt serviceindikatorn. Kontrollera serviceboken.",
    commonWearSv: ["Bromsbelägg och skivor (tung bil)", ...PHEV_WEAR.slice(0, 1), "AdBlue-system på diesel"],
    tipsSv: [
      "Laddhybrider: kör på bensin ibland så att motor och bromsar hålls i form.",
      "Garantin kräver inte märkesverkstad – service enligt Volvos schema räcker, spara kvittona.",
    ],
  },
  {
    slug: "volvo-v60",
    make: "Volvo",
    model: "V60",
    fuelTypes: ["DIESEL", "BENSIN", "LADDHYBRID"],
    years: { from: 2018, to: 2025 },
    segment: "Mellanklass kombi",
    serviceIntervalSv: "Vanligen en gång per år eller enligt serviceindikatorn. Kontrollera serviceboken.",
    commonWearSv: ["Bromsbelägg och skivor", "Torkarblad och kupéfilter", "AdBlue-system på diesel"],
    tipsSv: ["Jämför priset för bas-service – skillnaden mellan verkstäder är ofta flera tusen kronor."],
  },
  {
    slug: "volvo-xc40",
    make: "Volvo",
    model: "XC40",
    fuelTypes: ["BENSIN", "LADDHYBRID", "EL"],
    years: { from: 2018, to: 2025 },
    segment: "Kompakt SUV",
    serviceIntervalSv: "Vanligen en gång per år. Elversionen har färre servicepunkter.",
    commonWearSv: ["Bromsar (särskilt på el- och laddhybrid)", "Däck", "12-voltsbatteriet"],
    tipsSv: ["Elversionen behöver inget oljebyte – tacka nej om någon föreslår det."],
  },
  {
    slug: "volvo-xc90",
    make: "Volvo",
    model: "XC90",
    fuelTypes: ["DIESEL", "BENSIN", "LADDHYBRID"],
    years: { from: 2015, to: 2025 },
    segment: "Stor SUV",
    serviceIntervalSv: "Vanligen en gång per år eller enligt serviceindikatorn.",
    commonWearSv: ["Bromsar (tung bil)", "Luftfjädring på bilar som har det", "AdBlue-system på diesel"],
    tipsSv: ["Stora hjul och tung bil gör däck och bromsar dyrare – jämför materialkostnaden noga."],
  },
  {
    slug: "volvo-v90",
    make: "Volvo",
    model: "V90",
    fuelTypes: ["DIESEL", "BENSIN", "LADDHYBRID"],
    years: { from: 2016, to: 2025 },
    segment: "Stor kombi",
    serviceIntervalSv: "Vanligen en gång per år eller enligt serviceindikatorn.",
    commonWearSv: ["Bromsar", "AdBlue-system på diesel", "Partikelfilter vid mycket kortkörning (diesel)"],
    tipsSv: ["Dieselbilar som mest körs korta sträckor mår bra av en längre landsvägstur ibland."],
  },
  {
    slug: "vw-golf",
    make: "Volkswagen",
    model: "Golf",
    fuelTypes: ["BENSIN", "DIESEL", "LADDHYBRID"],
    years: { from: 2013, to: 2025 },
    segment: "Kompaktbil",
    serviceIntervalSv: "Fast eller flexibelt intervall beroende på inställning – serviceindikatorn visar.",
    commonWearSv: ["Bromsbelägg och skivor", "Batteri på bilar med start/stopp", "Kopplingar på manuella bilar"],
    tipsSv: ["DSG-växellådor har eget oljebytesintervall – kolla serviceboken innan du godkänner det."],
  },
  {
    slug: "vw-passat",
    make: "Volkswagen",
    model: "Passat",
    fuelTypes: ["DIESEL", "BENSIN", "LADDHYBRID"],
    years: { from: 2014, to: 2025 },
    segment: "Mellanklass",
    serviceIntervalSv: "Fast eller flexibelt intervall – serviceindikatorn visar.",
    commonWearSv: ["Bromsar", "Partikelfilter vid kortkörning (diesel)", "AdBlue-system"],
    tipsSv: ["Kamremsbyte (bensin/diesel med rem) är dyrt – jämför alltid flera verkstäder."],
  },
  {
    slug: "vw-id4",
    make: "Volkswagen",
    model: "ID.4",
    fuelTypes: ["EL"],
    years: { from: 2021, to: 2025 },
    segment: "Elbil, SUV",
    serviceIntervalSv: "Elbil – färre servicepunkter. Följ serviceindikatorn och kontrollera bromsvätskan.",
    commonWearSv: [...EV_WEAR],
    tipsSv: ["Ingen motorolja – ett \"oljebyte\" på en elbil är alltid fel."],
  },
  {
    slug: "tesla-model-y",
    make: "Tesla",
    model: "Model Y",
    fuelTypes: ["EL"],
    years: { from: 2021, to: 2025 },
    segment: "Elbil, SUV",
    serviceIntervalSv: "Inget fast serviceintervall. Tesla rekommenderar kontroller av t.ex. bromsvätska och kupéfilter.",
    commonWearSv: [...EV_WEAR],
    tipsSv: ["Många fristående verkstäder kan byta däck, bromsar och filter på Tesla."],
  },
  {
    slug: "tesla-model-3",
    make: "Tesla",
    model: "Model 3",
    fuelTypes: ["EL"],
    years: { from: 2019, to: 2025 },
    segment: "Elbil, sedan",
    serviceIntervalSv: "Inget fast serviceintervall. Följ Teslas rekommenderade kontroller.",
    commonWearSv: [...EV_WEAR],
    tipsSv: ["Ingen motorolja – ett \"oljebyte\" på en elbil är alltid fel."],
  },
  {
    slug: "toyota-rav4",
    make: "Toyota",
    model: "RAV4",
    fuelTypes: ["HYBRID", "LADDHYBRID"],
    years: { from: 2019, to: 2025 },
    segment: "Mellanstor SUV",
    serviceIntervalSv: "Vanligen en gång per år. Toyotas förlängda batterigaranti kan kräva årlig hybridkontroll.",
    commonWearSv: ["12-voltsbatteriet", "Bromsar rostar vid lite inbromsning", "Torkarblad och filter"],
    tipsSv: ["Hybriderna sliter lite på bromsar – byten ska sällan behövas ofta. Fråga varför om de föreslås."],
  },
  {
    slug: "toyota-corolla",
    make: "Toyota",
    model: "Corolla",
    fuelTypes: ["HYBRID", "BENSIN"],
    years: { from: 2019, to: 2025 },
    segment: "Kompaktbil",
    serviceIntervalSv: "Vanligen en gång per år.",
    commonWearSv: ["12-voltsbatteriet", "Däck", "Torkarblad och kupéfilter"],
    tipsSv: ["En billig och tålig bil att serva – en bas-service över ca 4 000 kr bör ifrågasättas."],
  },
  {
    slug: "kia-niro",
    make: "Kia",
    model: "Niro",
    fuelTypes: ["HYBRID", "LADDHYBRID", "EL"],
    years: { from: 2017, to: 2025 },
    segment: "Kompakt crossover",
    serviceIntervalSv: "Vanligen en gång per år. Kias långa garanti förutsätter service enligt schema.",
    commonWearSv: ["12-voltsbatteriet", "Bromsar på el- och laddhybrid", "Däck"],
    tipsSv: ["Garantin gäller även om fristående verkstad servar enligt Kias schema med rätt delar."],
  },
  {
    slug: "skoda-octavia",
    make: "Skoda",
    model: "Octavia",
    fuelTypes: ["BENSIN", "DIESEL", "GAS", "LADDHYBRID"],
    years: { from: 2013, to: 2025 },
    segment: "Kompakt kombi",
    serviceIntervalSv: "Fast eller flexibelt intervall – serviceindikatorn visar.",
    commonWearSv: ["Bromsar", "Partikelfilter vid kortkörning (diesel)", "Kopplingar på manuella bilar"],
    tipsSv: ["Samma teknik som VW Golf – delar och arbete ska kosta ungefär lika mycket."],
  },
  {
    slug: "audi-a4",
    make: "Audi",
    model: "A4",
    fuelTypes: ["BENSIN", "DIESEL"],
    years: { from: 2015, to: 2025 },
    segment: "Mellanklass premium",
    serviceIntervalSv: "Fast eller flexibelt intervall – serviceindikatorn visar.",
    commonWearSv: ["Bromsar", "Oljeförbrukning på vissa äldre bensinmotorer", "Partikelfilter (diesel)"],
    tipsSv: ["Märkesverkstad är ofta dyrast – en Godkänd Bilverkstad klarar vanlig service."],
  },
  {
    slug: "bmw-3",
    make: "BMW",
    model: "3-serie",
    fuelTypes: ["BENSIN", "DIESEL", "LADDHYBRID"],
    years: { from: 2015, to: 2025 },
    segment: "Mellanklass premium",
    serviceIntervalSv: "Behovsstyrd service – bilen visar vad som behövs i instrumentet.",
    commonWearSv: ["Bromsar (har slitagevarnare)", "Läckage från ventilkåpa på äldre motorer", "Batteri"],
    tipsSv: ["Nytt batteri behöver ofta registreras i bilen – kontrollera att det ingår i priset."],
  },
  {
    slug: "polestar-2",
    make: "Polestar",
    model: "2",
    fuelTypes: ["EL"],
    years: { from: 2020, to: 2025 },
    segment: "Elbil, sedan",
    serviceIntervalSv: "Elbil med glesa servicebesök – följ serviceindikatorn.",
    commonWearSv: [...EV_WEAR],
    tipsSv: ["Service görs ofta av Volvo-verkstäder. Jämför ändå priset för däck och bromsar."],
  },
];

export function findCarModelGuide(make: string, model: string): CarModelGuide | undefined {
  const m = make.toLowerCase();
  const mo = model.toLowerCase();
  return CAR_MODEL_GUIDES.find(
    (g) => (g.make.toLowerCase() === m || (m === "vw" && g.make === "Volkswagen")) && g.model.toLowerCase() === mo,
  );
}

/** Service slugs that make no sense for a fuel type (e.g. oil change on an EV). */
export function servicesNotApplicable(fuelType: FuelType): readonly string[] {
  return fuelType === "EL" ? ["oljebyte", "kamremsbyte"] : [];
}
