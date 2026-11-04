# BilKoll

**Rätt pris på verkstaden. Varje gång.**

BilKoll är "Skyscanner för bilverkstäder" plus en AI-mekaniker i fickan, för bilägare i Stockholms län:

- **Jämför verkstäder** – arbetskostnad, materialkostnad, timpris, avstånd, omdömen och tidigaste tid för vanliga jobb. Highlights för *Bäst värde*, *Billigast*, *Tidigast* och *Närmast*, med en öppen formel för värdepoängen.
- **Din bil** – slå upp regnr och få besiktningsdatum, vanligt slitage och tips för de vanligaste bilmodellerna i Sverige, plus vilka jobb som inte behövs (t.ex. oljebyte på elbil).
- **Granska offert** – jämför en verkstadsoffert mot normaltid, Stockholms timpriser (1 200–2 200 kr/h inkl. moms) och marknadspriset. Flaggar merförsäljning. Siffrorna räknas av vår kod; AI:n förklarar bara.
- **Fråga AI-mekanikern** – vardagsfrågor om bilen på enkel svenska, med säkerhetsvarningar som alltid triggas för bromsar, styrning, röda lampor och bränslelukt.
- **Boka** – skicka en bokningsförfrågan med låst pris till verkstaden.

> Prototyp: verkstäder och priser är fiktiv demodata. Fordonsuppslag använder en mock-adapter.

## Kom igång

Kräver Node 20+.

```bash
cp .env.example .env
npm install
npm run db:push     # eller: npx prisma migrate deploy
npm run db:seed
npm run dev         # http://localhost:3000
```

Testa med regnr `ABC 123` (Volvo XC60), `GHJ 78A` (Tesla Model Y) eller `KLM 901` (Toyota RAV4). Alla giltiga regnr ger en demobil.

### Riktig AI

Sätt i `.env`:

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

- Riktiga prisflöden från verkstäder (API/inmatning) och verifierade omdömen
- Fordonsdata via Biluppgifter/Transportstyrelsen (`VehicleDataProvider`)
- Bokningsintegration med verkstadssystem och bekräftelse via e-post/SMS
- Bilmodell-specifika priser (material och normaltid per modell)
- Inloggning, "Mina bilar" och påminnelser om service och besiktning
- PostgreSQL/Supabase i produktion (byt `provider` i schemat och `DATABASE_URL`)
