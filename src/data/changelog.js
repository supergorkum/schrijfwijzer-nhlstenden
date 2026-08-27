export const CHANGELOG = [
  {
    versie: "0.1.0",
    datum: "2026-08-27",
    beschrijving:
      "Eerste opzet van het project. Basisstructuur met upload, vragen en resultaat als lege stappen.",
  },
  {
    versie: "0.2.0",
    datum: "2026-08-27",
    beschrijving:
      "Kennisbank toegevoegd. Schrijfwijzer regels, academienamen, tone of voice en een kandidaat vragenset staan nu als structured data in het project. Brondocumenten gekopieerd naar de bronnen map.",
  },
  {
    versie: "0.3.0",
    datum: "2026-08-27",
    beschrijving:
      "Upload scherm werkt nu echt. Een Netlify Function haalt tekst uit Word, PDF en tekst bestanden, met foutafhandeling bij niet ondersteunde of onleesbare bestanden.",
  },
  {
    versie: "0.4.0",
    datum: "2026-08-27",
    beschrijving:
      "Vragenflow werkt nu echt. Een Netlify Function met de Anthropic API bepaalt welke vragen relevant zijn voor het document, en het formulier laat alleen die vragen zien.",
  },
  {
    versie: "0.5.0",
    datum: "2026-08-27",
    beschrijving:
      "AI herschrijving werkt nu echt. Het document wordt herschreven volgens de schrijfwijzer regels en, indien gekozen, de tone of voice van the originals, en is te downloaden als Word bestand.",
  },
];
