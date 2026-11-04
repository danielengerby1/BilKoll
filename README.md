# BilKoll

**Vet vad det bör kosta – innan du lämnar in bilen.**

BilKoll är "Skyscanner för bilverkstäder" plus en AI-mekaniker i fickan, för bilägare i Stockholms län:

- **Hitta verkstad** – riktiga verkstäder (Mekonomen, MECA, Autoexperten, Speedy, Bosch Car Service, OKQ8, fristående och märkesverkstäder som Bilia, Din Bil och Tesla) med adress, telefon, webbplats och avstånd. För varje verkstad visar vi **BilKolls uppskattade pris** för jobbet, med arbets- och materialkostnad.
- **Jämför din offert** – be verkstaden om en offert och skriv in den. Du får direkt **Billigt / Bra värde / Dyrt** jämfört med vår uppskattning för just den typen av verkstad, plus en varning vid misstänkt merförsäljning.
- **Din bil** – slå upp regnr och få besiktningsdatum, vanligt slitage och tips för de vanligaste bilmodellerna, och uppskattningar anpassade efter bilen (premiumbilar räknas med dyrare delar).
- **Fråga AI-mekanikern** – vardagsfrågor på enkel svenska, med säkerhetsvarningar som alltid triggas för bromsar, styrning, röda lampor och bränslelukt.

## Hur uppskattningen räknas

```
pris = normaltid × timpris för verkstadstypen + vanlig materialkostnad × påslag
```

| Verkstadstyp | Timpris (inkl. moms) | Material |
|---|---|---|
| Märkesverkstad | 1 800–2 200 kr | ×1,10–1,35 |
| Kedjeverkstad | 1 400–1 850 kr | ×0,95–1,15 |
| Fristående | 1 200–1 700 kr | ×0,85–1,10 |

Premiumbilar: material ×1,3 och tid ×1,1. Antagandena finns i `src/lib/domain.ts` (`TIER_ESTIMATE`) och bör kalibreras mot riktiga offerter – varje jämförd offert sparas med verkstad och jobb i `QuoteAudit`.

> Verkstadsuppgifter är hämtade från offentliga källor (länk finns på varje verkstadssida). Priserna är uppskattningar, inte verkstädernas egna priser. Fordonsuppslag använder en mock-adapter.

## Kom igång

Kräver Node 20+.

```bash
cp .env.example .env
npm install
npm run db:push     # eller: npx prisma migrate deploy
npm run db:seed
npm run dev         # http://localhost:3000
```

Testa med regnr `ABC 123` (Volvo XC60), `GHJ 78A` (Tesla Model Y) eller `KLM 901` (Toyota RAV4).

### Riktig AI

```
AI_PROVIDER="anthropic"
ANTHROPIC_API_KEY="sk-ant-..."
AI_MODEL="claude-sonnet-5-5"
```

Utan nyckel används `mock`-providern (offline, deterministisk).

## Kvalitet

```bash
npm run check   # typecheck + lint + tester
npm run build
```

## Arkitektur

Se [CLAUDE.md](./CLAUDE.md) för stack, mappstruktur, domänregler och AI-regler.

## Nästa steg

- Verifiera Godkänd Bilverkstad- och MRF-status mot de officiella registren
- Geokoda adresser (avstånd är nu ungefärliga, per postnummerområde)
- Kalibrera uppskattningarna mot inskickade offerter per verkstad och jobb
- Låt verkstäder ansluta sig och publicera egna fasta priser och bokning
- Fordonsdata via Biluppgifter/Transportstyrelsen (`VehicleDataProvider`)
- Fler verkstäder och modell-specifik normaltid
