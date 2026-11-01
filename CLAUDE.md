# Werkafspraken Schrijfwijzer NHL Stenden

Dit bestand is het geheugen van dit project. Elke sessie die hier werkt leest dit
eerst. Wat hier staat geldt; staat het er niet, dan is het geen afspraak.

De Schrijfwijzer is een demo voor NHL Stenden Hogeschool. Een medewerker uploadt
een document (Word, PDF of platte tekst), beantwoordt een paar vragen over het
middel en de doelgroep, en krijgt de tekst terug herschreven volgens de
schrijfregels, de tone of voice ("The originals") en de huisstijl van NHL
Stenden, als Word-bestand. Gebruikers zijn medewerkers van academies en
diensten. De site is alleen in het Nederlands.

Tot 1 november 2026 werd de site onderhouden in een chatsessie, met
patchscripts. Sinds 1 november 2026 gebeurt dat in Claude Code. Wat er bij de
overstap speelde staat in `.overstap/OVERDRACHT-UIT-CHAT.md` (niet in git).

## Eerste handeling van elke sessie

1. `git pull`. De map staat in Google Drive en kan op een andere computer zijn
   bijgewerkt; git weet pas na een pull wat er op GitHub staat.
2. Versie lezen: `VERSIE` in `src/data/versie.js`.
3. `git log --oneline -3`: wat is de laatste commit.
4. `git status --short`: staan er wijzigingen die nog niet gecommit zijn? Staan
   er wijzigingen die je niet zelf hebt gemaakt, dan werkt er misschien iemand op
   een andere computer: eerst navragen, niets overschrijven.
5. `ls -l scripts/git-hooks/pre-push`: staat er een x bij? Google Drive
   bewaart het uitvoerbit niet altijd. Zonder dat bit slaat git de hook STIL
   over en gaat een push zonder controle de deur uit. `git status` toont het als
   een gewijzigd bestand zonder inhoudelijk verschil (old mode 100755, new mode
   100644). Herstel: `chmod +x scripts/git-hooks/*`. Kijk ook of
   `git config core.hooksPath` `scripts/git-hooks` zegt.

Pas daarna beginnen.

## Techniek

- React 18, Vite 5, Tailwind 3. Geen router: drie stappen in `src/App.jsx`
  (Document, Vragen, Resultaat) met de onderdelen in `src/components/`.
- Netlify Functions in `netlify/functions` (Node 24):
  - `extract-tekst`: haalt tekst uit .docx (mammoth), .pdf (pdf-parse) of .txt;
  - `bepaal-vragen`: laat Claude kiezen welke vragen voor dit document nodig
    zijn, met een zichtbare afweging;
  - `herschrijf-document-background`: Background Function (mag lang duren) die
    herschrijft en een .docx bouwt (pakket `docx`), en het resultaat in Netlify
    Blobs zet;
  - `haal-resultaat`: de browser vraagt hier herhaaldelijk naar het resultaat;
  - `blobs-store.mjs`: hulpbestand voor de Blobs-store `schrijfwijzer-taken`.
    Het staat zonder `_` vooraan in de functiemap en wordt daardoor ook als
    losse functie uitgerold. Onschuldig, wel slordig.
- De kennisbank staat in `src/data/`: `schrijfwijzerRegels.js`,
  `toneOfVoice.js`, `externeCommunicatie.js`, `academies.js`, `vragen.js`. De
  functies importeren die bestanden rechtstreeks uit `src/`. De bron-pdf's
  (schrijfwijzer, brandmanual, styleguide The originals) staan in `bronnen/`.
- AI: rechtstreeks `fetch` naar `api.anthropic.com/v1/messages`, model
  `claude-sonnet-5`, `thinking: disabled`, `max_tokens` 1200 voor de vragen en
  16000 voor het herschrijven. Geen SDK, geen Netlify AI Gateway (die gaf in
  patch 11 en 12 een "ongeldige key" en is bewust uitgezet).
- Bouwen: `npm run build` (vite build), publicatiemap `dist`.
- Netlify-site `schrijfwijzer-nhlstenden`, id
  `820bf11b-984e-4339-bf4f-350ffdc6eff7`, team-id `6a047d5b4965c04ab89fec76`.
  Blobs en functies in regio us-east-2.
- GitHub: `supergorkum/schrijfwijzer-nhlstenden`, productietak `main`. De repo is
  **openbaar**, bewust (zie Bekende eigenaardigheden).
- Live: https://schrijfwijzer-nhlstenden.netlify.app, afgeschermd met een
  sitewachtwoord van Netlify. Een kale `curl` geeft daarom 401; dat is geen
  storing.
- Netlify is aan GitHub gekoppeld: een push naar `main` wordt vanzelf gebouwd en
  staat binnen een minuut live (zo ging patch 20 op 14 september 2026, deploy
  `6aa7e4b7ec1baa0008d92864`, `manual_deploy: false`).

## Hoe een wijziging tot nu toe live ging

In de chat: per wijziging een patchscript met een genummerde patch (01 tot en
met 20). Het script zette een marker in de bestanden die het raakte
(`// PATCH_<NN>_<NAAM>`, bijvoorbeeld `PATCH_20_EXTERN_EN_CHANGELOG`), werkte
`versie.js` en `changelog.js` bij, en daarna volgden commit en push naar `main`
met een bericht als `Patch 20: externe communicatie en zichtbare changelog`.
Netlify bouwde de rest. De patchscripts zelf staan niet in de projectmap en niet
in git.

## Werken in Claude Code (sinds 1 november 2026)

Een push naar `main` publiceert de site. Mislukt de bouw op Netlify, dan blijft
de vorige versie staan.

Ingericht op 1 november 2026 (v0.21.0), naar het voorbeeld van Sepupu en de
Sandbox.

**Bouwen gebeurt buiten Google Drive.** In de projectmap staat geen
`node_modules` en dat blijft zo (afspraak van 28 oktober 2026, voor al Edgars
sites). Draai nooit `npm install` of `npm ci` in de projectmap zelf.

- `npm run bouwmap` (`scripts/bouwmap.mjs`) houdt
  `~/Developer/schrijfwijzer-nhlstenden-build` gelijk aan de projectmap: alles
  wat git kent of zou kennen, en `npm ci` zodra `package-lock.json` verandert.
  Een andere plek kan met `SCHRIJFWIJZER_BOUWMAP`. Het script weigert een map in
  Google Drive en een bestaande map die het niet zelf heeft gemaakt, en stopt
  bij een tekstbestand met alleen nullen. De bouwmap is wegwerp.
- Een nieuw pakket: `npm install` in de bouwmap, dan `package.json` en
  `package-lock.json` terugkopieren naar de projectmap.
- `npm run controle` (`scripts/controle.mjs`), na de eerste keer een paar
  seconden:
  1. `VERSIE` in `versie.js` is de nieuwste changelog-entry (de LAATSTE in de
     lijst), hoger dan de vorige, met datum en beschrijving; de onderhoudsregel
     staat in `src/data/onderhoudsregel.js` en wordt in `App.jsx` getoond;
  2. bij een push: raakt de push `src/`, `netlify/`, `public/` of
     `index.html`, dan moeten `versie.js` en `changelog.js` mee;
  3. bouwmap bijwerken; 4. `node --check` op alle bestanden in
     `netlify/functions`; 5. `vite build`.
  `--snel` slaat 3 tot en met 5 over. eslint is er niet; de Schrijfwijzer heeft
  het nooit gehad.
- `npm run lokaal` (`scripts/lokaal.mjs`): de proef op http://127.0.0.1:5177
  (5173 is van Sepupu en anderen, 5176 van de Sandbox), ook als preview in Code
  (`.claude/launch.json`, naam `schrijfwijzer-nhlstenden`). Wijzigingen in de
  projectmap lopen vanzelf mee. De Netlify Functions draaien in de proef niet en
  er is geen proxy (de live site staat achter een wachtwoord): goed voor
  uiterlijk en tekst, niet voor uploaden of herschrijven. `npx netlify dev`
  draait de functies wel, maar met de echte Anthropic-sleutel en de echte
  Blobs-opslag: niet doen zonder opzet.

**Elke push gaat eerst door de controle.** `scripts/git-hooks/pre-push` draait
`node scripts/controle.mjs --push`. Ingesteld met
`git config core.hooksPath scripts/git-hooks` (staat in `.git/config` en reist
via Drive mee). Valt de controle om, dan gaat de push niet door.
`git push --no-verify` alleen als Edgar daar zelf om vraagt. Werk aan tooling
zonder zichtbare wijziging (scripts, CLAUDE.md, .gitignore) krijgt geen
appversie; de hook laat dat toe.

**Een wijziging in Code** gaat zo:

1. Bestanden rechtstreeks aanpassen in de projectmap.
2. `VERSIE` in `src/data/versie.js` ophogen en ONDERAAN in `CHANGELOG` in
   `src/data/changelog.js` een entry toevoegen (`versie`, `datum`,
   `beschrijving`). De lijst loopt oplopend; de app toont hem omgekeerd. De
   changelog is zichtbaar voor gebruikers achter de versieknop in de kop, dus
   de beschrijving is leesbaar Nederlands. Datum in de vorm `2026-11-01`, zoals
   de rest van de lijst. Kleine stap: +0.1.0 (0.21.0 naar 0.22.0).
3. `npm run controle`, en bij iets zichtbaars de proef bekijken.
4. Commit met een bericht dat zegt wat de gebruiker merkt, met de versie
   erachter: `Onder het versienummer staat nu de onderhoudsregel (v0.21.0)`.
   Dan `git push origin main`. Pushen werkt vanuit Code: git gebruikt de
   aanmelding van `gh` (supergorkum) via de sleutelhanger.
5. De deploy nakijken en Edgar kort melden wat er live staat.

**De deploy nakijken.** `curl` op de live site geeft altijd 401, door het
sitewachtwoord; de inhoud is met curl niet te lezen. Via de Netlify-koppeling:
`netlify-project-services-reader` met `get-project` en het site-id geeft het id
van de huidige deploy; `netlify-deploy-services-reader` met `get-deploy` geeft
`state`, `commit_ref` en `published_at`. Is `state` `ready` en `commit_ref`
gelijk aan `git rev-parse HEAD`, dan staat de wijziging live. `deploy_source`
zegt `api`, ook bij een automatische bouw vanaf GitHub; dat klopt gewoon. De
inhoud zelf zien kan via `screenshot_url` in hetzelfde antwoord: een openbare
schermafbeelding van de eerste pagina, gemaakt door Netlify zelf (achter het
wachtwoord langs). Downloaden met curl, met `sips -s format png` omzetten en
bekijken. Vul het sitewachtwoord nooit zelf in.

**Geleerd bij de overstap (1 november 2026).**
- De overdracht is niet door de oude chat geschreven maar in Code samengesteld
  uit de repo, git en Netlify. Afspraken die alleen in die chat stonden, kunnen
  ontbreken.
- De push van v0.21.0 (`5db20a8`) werd vanzelf gebouwd en stond in ruim een
  halve minuut live (deploy `6ae7bc3589fa9d7202061afa`). De onderhoudsregel was
  te zien op de schermafbeelding van Netlify.
- De GitHub-repo is openbaar (`gh repo view` zegt PUBLIC). Edgar heeft op
  1 november 2026 besloten dat zo te laten.
- npm 11 meldt bij `npm ci` dat de installatiescripts van esbuild en fsevents
  niet zijn goedgekeurd. De bouw slaagt toch; geen actie nodig zolang dat zo
  blijft.
- `version` in package.json (0.7.0) is bewust niet aangepast; de appversie is
  `VERSIE`.
- `.env` met de sleutels is blijven staan waar hij stond (in `.gitignore`, nooit
  gecommit). Er is geen `.sleutels/`-map nodig gebleken; die staat wel in
  `.gitignore` voor later.

**Niet tegelijk op twee computers.** Git draait in een Google Drive-map. Werken
de MacBook en de HUB tegelijk in dezelfde map, dan kan Drive `.git` door elkaar
halen. Bij wisselen van computer eerst `git pull`. Lees een bestand dat leeg
lijkt terwijl het inhoud hoort te hebben nooit als leeg (Drive levert soms een
bestand met alleen nullen als het nog niet is binnengehaald), en schrijf er
niets overheen. Geeft `git commit` een fout over een ontbrekend object, kijk dan
in `../sepupu/CLAUDE.md` hoe dat daar op 1 november 2026 is opgelost.

## Bekende eigenaardigheden en open punten

Overgenomen uit de overdracht; wat hier staat geldt tot het is opgelost.

- **Repo openbaar, en dat blijft zo** (besluit van Edgar, 1 november 2026).
  Kennisbank, prompts en de pdf's in `bronnen/` zijn voor iedereen te lezen.
  Daarom: nooit een sleutel, wachtwoord of `.env` in een commit, en geen
  documenten van gebruikers in de repo.
- **Blobs worden niet opgeruimd.** Elke herschrijftaak, met de herschreven
  tekst, blijft in `schrijfwijzer-taken` staan.
- **`blobs-store.mjs`** staat zonder `_` in `netlify/functions` en wordt daardoor
  ook als losse functie uitgerold. Hernoemen naar `_blobs-store.mjs` en de twee
  imports aanpassen maakt het netjes.
- **Model `claude-sonnet-5`.** Werkte op 14 september 2026. Wisselen naar een
  nieuwer model alleen met meten: `bepaal-vragen` is een gewone functie met een
  tijdslimiet van ongeveer 26 seconden.
- **De changelog** heeft voor 0.1.0 tot en met 0.20.0 allemaal de datum
  2026-08-27, ook waar dat niet klopt (0.20.0 is van 14 september). Geschiedenis,
  blijft zo.
- **`deno.lock`** staat in git sinds patch 20, terwijl het project npm gebruikt.
  Onschuldig.
- **Kopieën elders op Drive** (`Codex - Charly/`, `Gemini Code/`) zijn niet
  bijgewerkt. Deze map is de werkmap.
- **Netlify AI Gateway** gaf in patch 11 en 12 een "ongeldige key". Wordt er ooit
  een AI-extensie aangezet in Netlify, kijk dan eerst hier.

## Sleutels en wachtwoorden

Alleen de plek, nooit de inhoud. Niet weergeven in een antwoord, verslag of
commit.

- `.env` in de projectmap (staat in `.gitignore`, is nooit gecommit):
  `ANTHROPIC_API_KEY`, `NETLIFY_SITE_ID`, `NETLIFY_AUTH_TOKEN`. Alleen voor
  lokaal werk. `.env.example` laat de namen zien.
- Dezelfde drie staan als omgevingsvariabelen in Netlify. `NETLIFY_AUTH_TOKEN`
  en `NETLIFY_SITE_ID` zijn nodig omdat de Blobs-store handmatig wordt
  geconfigureerd (patch 09); zonder die twee valt `blobs-store.mjs` terug op
  automatische herkenning.
- Sitewachtwoord: in Netlify onder de toegangsinstellingen van de site.
- Pushen naar GitHub werkt vanuit Code via `gh` (ingelogd als supergorkum), net
  als bij de andere sites.

## Vaste afspraken

- Antwoorden aan Edgar zijn in het Nederlands, ook bij technisch werk.
- Geen streepjes als stijlmiddel, ook niet in commentaar of changelog.
- De herschrijving volgt de bronnen in `bronnen/` via de kennisbank in
  `src/data/`. Wijkt de kennisbank af van de bron, dan gaat de bron voor en
  wordt de kennisbank bijgewerkt.
- Extern gerichte teksten (doelgroep "Extern of corporate") worden herschreven
  vanuit de externe lezer, met de opbouw uit `externeCommunicatie.js`; interne
  teksten niet. Dat is feedback van de opdrachtgever (patch 20).
- De tone of voice "The originals" wordt alleen toegepast als de gebruiker daar
  bij de vragen voor kiest.
- Het is een demo. Geen accounts. Uploads mogen hoogstens 4 MB zijn
  (`UploadStap.jsx`). Elke herschrijftaak blijft in de Blobs-store
  `schrijfwijzer-taken` staan; er is geen opruimen (zie de overdracht).
- Zegt Edgar "refresh", dan volgt een samenvatting van hoogstens drie zinnen,
  afgesloten met tijd, dag en datum.
