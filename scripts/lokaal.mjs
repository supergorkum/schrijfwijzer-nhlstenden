// DE LOKALE PROEF (1 november 2026, naar Sepupu).
//
// Start de site op http://127.0.0.1:5177 vanuit de bouwmap buiten Google
// Drive, en houdt die bouwmap bij terwijl je in de projectmap werkt: elke
// opgeslagen wijziging staat binnen een seconde in de proef. Poort 5177, zodat
// hij naast de proeven van de andere sites kan draaien.
//
// LET OP: de Netlify Functions draaien in deze proef niet, en er is geen proxy
// naar de live site (die staat achter een sitewachtwoord). Uploaden, vragen
// bepalen en herschrijven geven hier dus een fout. De proef is voor uiterlijk
// en tekst. `npx netlify dev` zou de functies wel draaien, maar met de echte
// Anthropic-sleutel en de echte Blobs-opslag: niet doen zonder opzet.

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { REPO, BOUW, synchroniseer, afhankelijkheden } from "./bouwmap.mjs";

const POORT = process.env.PORT || "5177";

try {
  synchroniseer();
  afhankelijkheden();
} catch (e) {
  console.error("GESTOPT: " + e.message);
  process.exit(1);
}

const vite = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", POORT, "--strictPort"], {
  cwd: BOUW,
  stdio: "inherit",
});
vite.on("exit", (code) => process.exit(code ?? 0));

// Bijhouden. Een korte pauze vangt een reeks opslagacties in een keer op.
let klok = null;
const OVERSLAAN = /(^|\/)(\.git|node_modules|dist|\.netlify|\.sleutels|\.overstap)(\/|$)/;
try {
  fs.watch(REPO, { recursive: true }, (_soort, naam) => {
    if (naam && OVERSLAAN.test(String(naam).split(path.sep).join("/"))) return;
    clearTimeout(klok);
    klok = setTimeout(() => {
      try {
        const r = synchroniseer({ stil: true });
        if (r.gekopieerd || r.verwijderd) console.log("[schrijfwijzer] proef bijgewerkt: " + r.gekopieerd + " bestand(en)");
        if (afhankelijkheden()) console.log("[schrijfwijzer] afhankelijkheden opnieuw geinstalleerd; herstart de proef als iets niet laadt");
      } catch (e) {
        console.error("[schrijfwijzer] bijwerken mislukt: " + e.message);
      }
    }, 300);
  });
} catch (e) {
  console.error("[schrijfwijzer] meekijken met de projectmap lukt niet (" + e.message + "); draai na een wijziging npm run bouwmap.");
}

for (const sein of ["SIGINT", "SIGTERM"]) process.on(sein, () => vite.kill(sein));
