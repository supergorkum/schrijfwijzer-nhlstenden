// DE CONTROLE VOOR ELKE PUBLICATIE (1 november 2026, naar Sepupu).
//
// Sinds de Schrijfwijzer in Claude Code wordt onderhouden, gaat een wijziging
// niet meer via een patchscript, maar rechtstreeks in de bestanden. Een push
// naar GitHub publiceert de site. Dit script is daarom de poort ervoor: het
// draait vanzelf bij elke git push (scripts/git-hooks/pre-push) en is met de
// hand te draaien met npm run controle.
//
// Wat het nakijkt, in deze volgorde:
// 1. VERSIE in versie.js is de nieuwste changelog-entry (de laatste in de
//    lijst, die loopt oplopend), hoger dan de entry ervoor, met een datum en
//    een beschrijving; de onderhoudsregel staat in App.jsx;
// 2. bij een push: raakt de push src/, netlify/, public/ of index.html, dan
//    horen versie.js en changelog.js mee te veranderen;
// 3. de bouwmap buiten Google Drive wordt bijgewerkt (scripts/bouwmap.mjs);
// 4. node --check op elk bestand in netlify/functions;
// 5. vite build slaagt.
//
// Wat het NIET kan: eslint draaien (de Schrijfwijzer heeft geen eslint), en
// de functies echt aanroepen (die praten met Anthropic en Netlify Blobs).
//
// Valt een stap om, dan gaat de push niet door. Netlify bouwt daarna zelf nog
// een keer; mislukt dat, dan blijft de vorige versie gewoon live.

import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { REPO, BOUW, synchroniseer, afhankelijkheden } from "./bouwmap.mjs";

const PUSH = process.argv.includes("--push");
const SNEL = process.argv.includes("--snel");
const fouten = [];
const meld = (t) => console.log("  " + t);

function vergelijk(a, b) {
  const pa = String(a).split(".").map(Number);
  const pb = String(b).split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d;
  }
  return 0;
}

async function inhoud() {
  console.log("1. Versie, changelog en onderhoudsregel");
  const t = "?t=" + Date.now();
  const ver = await import(pathToFileURL(path.join(REPO, "src/data/versie.js")).href + t);
  const cl = await import(pathToFileURL(path.join(REPO, "src/data/changelog.js")).href + t);
  const lijst = cl.CHANGELOG || [];
  const nieuwste = lijst[lijst.length - 1];
  const vorige = lijst[lijst.length - 2];
  if (!nieuwste) return fouten.push("changelog.js heeft geen entries");
  if (ver.VERSIE !== nieuwste.versie) fouten.push("versie.js zegt " + ver.VERSIE + ", de nieuwste changelog-entry (onderaan) " + nieuwste.versie);
  if (vorige && vergelijk(nieuwste.versie, vorige.versie) <= 0) fouten.push("de nieuwste changelog-entry " + nieuwste.versie + " is niet hoger dan de vorige " + vorige.versie);
  if (!nieuwste.datum) fouten.push("de nieuwste changelog-entry heeft geen datum");
  if (!String(nieuwste.beschrijving || "").trim()) fouten.push("de nieuwste changelog-entry heeft geen beschrijving");
  const regel = await import(pathToFileURL(path.join(REPO, "src/data/onderhoudsregel.js")).href + t);
  if (!/Claude Code/.test(regel.ONDERHOUDSREGEL || "")) fouten.push("src/data/onderhoudsregel.js mist de onderhoudsregel");
  const app = fs.readFileSync(path.join(REPO, "src/App.jsx"), "utf8");
  if (!app.includes("ONDERHOUDSREGEL")) fouten.push("App.jsx toont de onderhoudsregel niet meer");
  meld("live na publicatie: " + ver.VERSIE + " (" + nieuwste.datum + ")");
}

function pushInhoud() {
  console.log("2. Wat deze push meeneemt");
  let basis;
  try {
    basis = execFileSync("git", ["rev-parse", "--verify", "-q", "origin/main"], { cwd: REPO }).toString().trim();
  } catch {
    meld("origin/main onbekend, stap overgeslagen");
    return;
  }
  const namen = execFileSync("git", ["diff", "--name-only", basis + "..HEAD"], { cwd: REPO }).toString().split("\n").filter(Boolean);
  if (!namen.length) return meld("niets nieuws ten opzichte van origin/main");
  meld(namen.length + " bestand(en) gewijzigd");
  const zichtbaar = namen.filter((n) => n.startsWith("src/") || n.startsWith("netlify/") || n.startsWith("public/") || n === "index.html");
  if (zichtbaar.length && !namen.includes("src/data/versie.js")) {
    fouten.push("deze push wijzigt de site (" + zichtbaar.slice(0, 3).join(", ") + (zichtbaar.length > 3 ? ", ..." : "") + ") maar versie.js niet. Geef de wijziging een versie en een changelog-entry.");
  }
  if (zichtbaar.length && !namen.includes("src/data/changelog.js")) {
    fouten.push("deze push wijzigt de site maar changelog.js niet.");
  }
}

function functies() {
  console.log("4. node --check op de functies");
  const map = path.join(REPO, "netlify/functions");
  const bestanden = fs.readdirSync(map).filter((n) => /\.m?js$/.test(n));
  for (const n of bestanden) {
    const r = spawnSync(process.execPath, ["--check", path.join(map, n)]);
    if (r.status !== 0) fouten.push("netlify/functions/" + n + " is geen geldig JavaScript:\n      " + r.stderr.toString().trim().split("\n").slice(0, 5).join("\n      "));
  }
  meld(bestanden.length + " bestanden nagekeken");
}

function bouw() {
  console.log("5. vite build");
  const r = spawnSync(process.execPath, ["node_modules/vite/bin/vite.js", "build", "--logLevel", "error"], { cwd: BOUW, maxBuffer: 256 * 1024 * 1024 });
  if (r.status !== 0) {
    const uit = (r.stdout.toString() + r.stderr.toString()).trim().split("\n").slice(-15).join("\n      ");
    fouten.push("vite build is mislukt:\n      " + uit);
  } else meld("gelukt");
}

console.log("Controle Schrijfwijzer" + (PUSH ? " (voor de push)" : ""));
try {
  await inhoud();
  if (PUSH) pushInhoud();
  if (!SNEL) {
    console.log("3. Bouwmap bijwerken");
    synchroniseer();
    afhankelijkheden();
    functies();
    bouw();
  }
} catch (e) {
  fouten.push(e.schrijfwijzer ? e.message : "onverwachte fout: " + (e.stack || e.message || e));
}

if (fouten.length) {
  console.log("");
  console.log("NIET IN ORDE:");
  for (const f of fouten) console.log("  - " + f);
  if (PUSH) console.log("\nDe push is tegengehouden. Er is niets gepubliceerd.");
  process.exit(1);
}
console.log("\nAlles in orde." + (PUSH ? " De push gaat door; Netlify publiceert zodra de bouw daar klaar is." : ""));
