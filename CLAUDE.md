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
overstap speelde staat in `OVERDRACHT-UIT-CHAT.md`.

## Eerste handeling van elke sessie

1. `git pull`. De map staat in Google Drive en kan op een andere computer zijn
   bijgewerkt; git weet pas na een pull wat er op GitHub staat.
2. Versie lezen: `VERSIE` in `src/data/versie.js`.
3. `git log --oneline -3`: wat is de laatste commit.
4. `git status --short`: staan er wijzigingen die nog niet gecommit zijn? Staan
   er wijzigingen die je niet zelf hebt gemaakt, dan werkt er misschien iemand op
   een andere computer: eerst navragen, niets overschrijven.
5. Zodra er een `scripts/git-hooks/pre-push` is: `ls -l` daarop, staat er een x
   bij? Google Drive bewaart het uitvoerbit niet altijd en git slaat de hook dan
   STIL over. Herstel: `chmod +x scripts/git-hooks/*`. (Op 1 november 2026 is er
   nog geen hook.)

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
- GitHub: `supergorkum/schrijfwijzer-nhlstenden`, productietak `main`. Let op:
  Netlify meldt deze repo als **openbaar** (zie de overdracht).
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

**Bouwen gebeurt buiten Google Drive.** In de projectmap staat geen
`node_modules` en dat blijft zo (afspraak van 28 oktober 2026, voor al Edgars
sites). Draai nooit `npm install` of `npm ci` in de projectmap zelf. Bouw in een
kopie, naar het voorbeeld van de andere sites:
`~/Developer/schrijfwijzer-nhlstenden-build`. Er is op 1 november 2026 nog geen
`scripts/bouwmap.mjs`, `controle` of pre-push hook; die horen er bij de
inrichting in Code te komen, zoals bij de Sandbox (`../sandbox-nhlstenden`).

**Een wijziging in Code** gaat zo:

1. Bestanden rechtstreeks aanpassen in de projectmap.
2. `VERSIE` in `src/data/versie.js` ophogen en onderaan in `CHANGELOG` in
   `src/data/changelog.js` een entry toevoegen (`versie`, `datum`,
   `beschrijving`). De lijst loopt oplopend; de app toont hem omgekeerd. De
   changelog is zichtbaar voor gebruikers achter de versieknop in de kop, dus
   de beschrijving is leesbaar Nederlands.
3. Bouwen in de bouwmap (`vite build`) en bij iets zichtbaars de proef bekijken.
4. Commit en `git push origin main`.
5. De deploy nakijken (zie onder) en Edgar kort melden wat er live staat.

**De deploy nakijken.** Via de Netlify-koppeling:
`netlify-project-services-reader` met `get-project` en het site-id geeft het id
van de huidige deploy; `netlify-deploy-services-reader` met `get-deploy` geeft
`state`, `commit_ref` en `published_at`. Is `state` `ready` en `commit_ref`
gelijk aan `git rev-parse HEAD`, dan staat de wijziging live. `deploy_source`
zegt `api`, ook bij een automatische bouw vanaf GitHub; dat klopt gewoon. Vul
het sitewachtwoord nooit zelf in.

**Niet tegelijk op twee computers.** Git draait in een Google Drive-map. Werken
de MacBook en de HUB tegelijk in dezelfde map, dan kan Drive `.git` door elkaar
halen. Bij wisselen van computer eerst `git pull`. Lees een bestand dat leeg
lijkt terwijl het inhoud hoort te hebben nooit als leeg (Drive levert soms een
bestand met alleen nullen als het nog niet is binnengehaald), en schrijf er
niets overheen. Geeft `git commit` een fout over een ontbrekend object, kijk dan
in `../sepupu/CLAUDE.md` hoe dat daar op 1 november 2026 is opgelost.

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
