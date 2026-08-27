// PATCH_02_KENNISBANK
// Kandidaat vragenset voor de vragenflow, maximaal tien vragen.
// relevantWanneer is een korte beschrijving, de daadwerkelijke selectie
// van welke vragen getoond worden gebeurt later door de AI stap op basis
// van de inhoud van het aangeleverde document.

export const VRAGEN = [
  {
    id: "typeMiddel",
    vraag: "Voor welk type middel is dit document bedoeld?",
    opties: [
      "Brochure of drukwerk",
      "Website",
      "Social media",
      "Interne communicatie",
      "Presentatie",
      "Overig",
    ],
    regelsGekoppeld: ["cijfersEnGetallen", "opsommingen"],
  },
  {
    id: "doelgroep",
    vraag: "Is dit document bedoeld voor interne of externe, corporate communicatie?",
    opties: ["Intern", "Extern of corporate"],
    regelsGekoppeld: ["academienamen", "submerken"],
  },
  {
    id: "academieOfDienst",
    vraag: "Gaat dit document over een specifieke academie of dienst? Zo ja, welke?",
    opties: null,
    regelsGekoppeld: ["academienamen"],
  },
  {
    id: "submerk",
    vraag:
      "Gaat dit document over een submerk, Thorbecke Academie, Maritiem Instituut Willem Barentsz of Hotel Management School?",
    opties: ["Nee", "Thorbecke Academie", "Maritiem Instituut Willem Barentsz", "Hotel Management School"],
    regelsGekoppeld: ["submerken"],
  },
  {
    id: "opleidingNaam",
    vraag:
      "Wordt een opleiding genoemd? Gebruik je de commerciële naam, of gaat het om instructies binnen Studielink waar de CROHO naam nodig is?",
    opties: ["Commerciële naam", "CROHO naam voor Studielink", "Niet van toepassing"],
    regelsGekoppeld: ["opleidingsnamen"],
  },
  {
    id: "toneOfVoice",
    vraag:
      "Is dit wervingscommunicatie waar de tone of voice en het concept the originals op toegepast moet worden, of een neutrale, zakelijke tekst?",
    opties: ["The originals tone of voice", "Neutraal, zakelijk"],
    regelsGekoppeld: ["originalsSchrijfwijze"],
  },
  {
    id: "herschrijfNiveau",
    vraag:
      "Mag alleen op schrijfregels gecorrigeerd worden, of ook actief herschreven worden richting de gekozen tone of voice?",
    opties: ["Alleen schrijfregels corrigeren", "Ook actief herschrijven"],
    regelsGekoppeld: [],
  },
];
