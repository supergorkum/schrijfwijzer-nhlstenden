// PATCH_02_KENNISBANK
// Samenvatting van de Schrijfwijzer NHL Stenden, versie 19 maart 2026.
// Elke regel heeft een id, zodat de vragenset en de AI prompt hiernaar
// kunnen verwijzen.

export const SCHRIJFWIJZER_REGELS = [
  {
    id: "schoolnaam",
    titel: "Schoolnaam",
    regel:
      "Bij de eerste vermelding voluit NHL Stenden Hogeschool schrijven, daarna NHL Stenden. Zonder lidwoord, dus niet de NHL Stenden. Hogeschool krijgt een hoofdletter als onderdeel van de merknaam, in ander gebruik een kleine letter.",
    contextAfhankelijk: false,
  },
  {
    id: "bachelorMasterAd",
    titel: "Bachelor, master en associate degree",
    regel:
      "Met hoofdletter in kopteksten. In lopende tekst met kleine letter, zonder streepje in bacheloropleiding, masteropleiding of masterstudent. Associate degree wordt in lopende tekst afgekort als Ad, bijvoorbeeld Ad opleiding of Ad student. Bij de CROHO naam de officiële afkorting B, M of Ad gebruiken.",
    contextAfhankelijk: false,
  },
  {
    id: "academienamen",
    titel: "Academienamen",
    regel:
      "Academie krijgt een hoofdletter als onderdeel van de volledige naam, een kleine letter als er los over de academie wordt gesproken. Richting aankomende studenten en in wervingsmateriaal communiceren we vanuit de opleiding, niet vanuit de academienaam. Bij externe of corporate communicatie voegen we bij de eerste vermelding van een academie of submerk toe: onderdeel van NHL Stenden Hogeschool.",
    contextAfhankelijk: true,
    vraagId: "academieOfDienst",
  },
  {
    id: "submerken",
    titel: "Submerken",
    regel:
      "NHL Stenden kent drie submerken: Thorbecke Academie, Maritiem Instituut Willem Barentsz en Hotel Management School. Bij externe of corporate communicatie bij de eerste vermelding toevoegen: onderdeel van NHL Stenden Hogeschool.",
    contextAfhankelijk: true,
    vraagId: "submerk",
  },
  {
    id: "minorsEnSpecialisaties",
    titel: "Minors en specialisaties",
    regel:
      "Bij volledige naam een hoofdletter, bijvoorbeeld Minor Winst en Weelde, zonder ampersand teken. In lopende tekst minor met kleine letter, meervoud is minors, niet minoren.",
    contextAfhankelijk: false,
  },
  {
    id: "vakken",
    titel: "Vakken",
    regel:
      "In lopende tekst met kleine letters, in kopteksten mogen hoofdletters ter benadrukking.",
    contextAfhankelijk: false,
  },
  {
    id: "opleidingsvarianten",
    titel: "Opleidingsvarianten",
    regel:
      "Voltijd, deeltijd en duaal met hoofdletter in kopteksten, in overige tekst met kleine letter: voltijdopleiding, deeltijdopleiding, duale opleiding.",
    contextAfhankelijk: false,
  },
  {
    id: "vooropleiding",
    titel: "Vooropleiding",
    regel:
      "havo, vwo en mbo met kleine letters, mbo niveau 4 met koppelteken, hbo diploma en mbo diploma met koppelteken, mvt mag als afkorting.",
    contextAfhankelijk: false,
  },
  {
    id: "onderwijsvormen",
    titel: "Onderwijsvormen",
    regel: "Design Based Education altijd met hoofdletters.",
    contextAfhankelijk: false,
  },
  {
    id: "voorlichtingenEnEvenementen",
    titel: "Voorlichtingen en evenementen",
    regel:
      "Namen van voorlichtingsmomenten en evenementen met hoofdletters, bijvoorbeeld Open Dag, Infoavond, Studieadviesgesprek, Beroepenspel.",
    contextAfhankelijk: false,
  },
  {
    id: "opleidingsnamen",
    titel: "Opleidingsnamen",
    regel:
      "De vastgestelde commerciële naam gebruiken zoals op de website en in brochures, met een hoofdletter aan het begin van elk woord, behalve woorden als en en of. Uitzondering, bij instructies voor het aanmeldproces in Studielink de CROHO naam gebruiken.",
    contextAfhankelijk: true,
    vraagId: "opleidingNaam",
  },
  {
    id: "cijfersEnGetallen",
    titel: "Cijfers en getallen",
    regel:
      "In lopende tekst getallen tot en met twintig voluit schrijven, bijvoorbeeld vier studenten. In tabellen, grafische weergave en opeenvolgende kopjes mag hiervan afgeweken worden. Bij korte opsommingen en de 21+ toets wel cijfers gebruiken. Geen cijfer bij eerstejaars of tweedejaars student.",
    contextAfhankelijk: true,
    vraagId: "typeMiddel",
  },
  {
    id: "bedragen",
    titel: "Bedragen",
    regel:
      "Spatie tussen het euroteken en het bedrag, bijvoorbeeld € 1,25. Hele euro bedragen zonder komma en streepje erachter, bijvoorbeeld € 2.060.",
    contextAfhankelijk: false,
  },
  {
    id: "afkortingen",
    titel: "Afkortingen",
    regel:
      "Veelgebruikte afkortingen zoals bijv. en o.a. waar mogelijk voluit schrijven. NHL Stenden Hogeschool alleen afkorten als NHL Stenden, geen andere afkortingen gebruiken.",
    contextAfhankelijk: false,
  },
  {
    id: "aanspreekvorm",
    titel: "Aanspreekvorm",
    regel: "Altijd tutoyeren, dus jij en je gebruiken, nooit u.",
    contextAfhankelijk: false,
  },
  {
    id: "telefoonnummers",
    titel: "Telefoonnummers",
    regel:
      "Nederland vast (058) 123 4567, Nederland mobiel 06 12 34 56 78, internationaal vast +31 58 123 4567, internationaal mobiel +31 6 12 34 56 78.",
    contextAfhankelijk: false,
  },
  {
    id: "tijdstippen",
    titel: "Tijdstippen",
    regel:
      "Met een punt geschreven en uur erachter, bijvoorbeeld 12.14 uur. Bij meerdere tijdstippen in een zin alleen uur achter het laatste tijdstip.",
    contextAfhankelijk: false,
  },
  {
    id: "titels",
    titel: "Titels",
    regel:
      "In lopende tekst kleine letter bij bc., ing., drs., mr., ir. en prof. Bij websitekopjes, visitekaartjes of aan het begin van een zin wel een hoofdletter.",
    contextAfhankelijk: false,
  },
  {
    id: "leestekens",
    titel: "Leestekens",
    regel:
      "Citaten in lopende tekst tussen dubbele aanhalingstekens. Een streamer krijgt geen punt aan het einde. Begint een zin met een citaat, dan vervalt de punt en volgt een komma. Bij een gedeeltelijk citaat begint dit met een kleine letter en valt de punt buiten de aanhalingstekens. Gedachten worden zonder aanhalingstekens weergegeven.",
    contextAfhankelijk: false,
  },
  {
    id: "urls",
    titel: "URL's",
    regel:
      "Zonder www. ervoor vermelden. In outdoor reclame zo min mogelijk verkorte URL's gebruiken.",
    contextAfhankelijk: false,
  },
  {
    id: "opsommingen",
    titel: "Opsommingen",
    regel:
      "Inleidende zin eindigt met een dubbele punt. Opsomming van hele zinnen, elk onderdeel begint met een hoofdletter en eindigt met een punt. Opsomming van losse woorden of zinsdelen, elk onderdeel begint met een kleine letter en eindigt met een puntkomma, het laatste onderdeel krijgt een punt. In brochures en drukwerk mag hiervan afgeweken worden als dit de presentatie ten goede komt.",
    contextAfhankelijk: true,
    vraagId: "typeMiddel",
  },
  {
    id: "originalsSchrijfwijze",
    titel: "The originals",
    regel:
      "Originals consequent als zelfstandig naamwoord met een kleine letter schrijven. Alleen the originals gebruiken, niet de originals en niet de originelen. Als bijvoeglijk naamwoord mag zowel original als originals, waarbij original's staat voor een oplossing van de originals, en original voor een originele oplossing. Wees zuinig, gebruik het woord maar één keer per boodschap.",
    contextAfhankelijk: true,
    vraagId: "toneOfVoice",
  },
];
