import { Document, Packer, Paragraph } from "docx";
import { SCHRIJFWIJZER_REGELS } from "../../src/data/schrijfwijzerRegels.js";
import { TONE_OF_VOICE } from "../../src/data/toneOfVoice.js";

// Herschrijft een document op basis van de schrijfwijzer regels en de
// antwoorden uit de vragenstap, en levert het resultaat als Word bestand.
// Verwacht een POST met JSON body: { tekst, antwoorden }
// Geeft terug: { herschrevenTekst, bestandBase64, bestandsNaam } of { fout }

function bouwSysteemPrompt(antwoorden) {
  const regelsTekst = SCHRIJFWIJZER_REGELS.map((r) => `- ${r.titel}: ${r.regel}`).join("\n");

  const context = [];
  if (antwoorden?.typeMiddel) context.push(`Type middel: ${antwoorden.typeMiddel}`);
  if (antwoorden?.doelgroep) context.push(`Doelgroep: ${antwoorden.doelgroep}`);
  if (antwoorden?.academieOfDienst) context.push(`Academie of dienst: ${antwoorden.academieOfDienst}`);
  if (antwoorden?.submerk && antwoorden.submerk !== "Nee") context.push(`Submerk: ${antwoorden.submerk}`);
  if (antwoorden?.opleidingNaam) context.push(`Opleidingsnaam gebruik: ${antwoorden.opleidingNaam}`);
  if (antwoorden?.herschrijfNiveau) context.push(`Gewenst niveau van ingrijpen: ${antwoorden.herschrijfNiveau}`);

  const gebruikToneOfVoice = antwoorden?.toneOfVoice === "The originals tone of voice";

  let toneTekst = "";
  if (gebruikToneOfVoice) {
    toneTekst = `

Pas daarnaast de the originals tone of voice toe:
Schrijfprincipes: ${TONE_OF_VOICE.schrijfprincipes.join(" ")}
Toonprincipes: ${TONE_OF_VOICE.toonPrincipes.join(" ")}
De pay-off is: ${TONE_OF_VOICE.payoff}.`;
  }

  return `Je past de schrijfwijzer van NHL Stenden Hogeschool toe op een aangeleverd document. Dit zijn de schrijfregels waar je je aan houdt:

${regelsTekst}

Context over dit specifieke document:
${context.join("\n") || "Geen aanvullende context meegegeven."}
${toneTekst}

Herschrijf het aangeleverde document volledig volgens deze regels. Geef uitsluitend de herschreven tekst terug, zonder inleiding, zonder uitleg, zonder aanhalingstekens eromheen, en zonder markdown opmaak zoals sterretjes. Behoud de opbouw en alinea indeling van het origineel zoveel mogelijk.`;
}

function bouwDocxBuffer(tekst) {
  const alineas = tekst.split("\n").map(
    (regel) =>
      new Paragraph({
        text: regel,
      })
  );

  const doc = new Document({
    sections: [{ children: alineas }],
  });

  return Packer.toBuffer(doc);
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ fout: "Alleen POST is toegestaan." }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        fout: "Er is geen ANTHROPIC_API_KEY ingesteld. Zet deze in de Netlify omgevingsvariabelen.",
      }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ fout: "Ongeldige aanvraag." }) };
  }

  const { tekst, antwoorden } = payload;
  if (!tekst) {
    return { statusCode: 400, body: JSON.stringify({ fout: "Er is geen documenttekst meegestuurd." }) };
  }

  try {
    const systeemPrompt = bouwSysteemPrompt(antwoorden || {});

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 8192,
        system: systeemPrompt,
        messages: [{ role: "user", content: tekst }],
      }),
    });

    if (!response.ok) {
      const foutTekst = await response.text();
      return {
        statusCode: 502,
        body: JSON.stringify({ fout: "De AI dienst gaf een fout terug.", details: foutTekst }),
      };
    }

    const data = await response.json();
    const herschrevenTekst = data.content?.find((blok) => blok.type === "text")?.text?.trim();

    if (!herschrevenTekst) {
      return {
        statusCode: 502,
        body: JSON.stringify({ fout: "De AI gaf geen bruikbare tekst terug." }),
      };
    }

    const docxBuffer = await bouwDocxBuffer(herschrevenTekst);
    const bestandBase64 = docxBuffer.toString("base64");

    return {
      statusCode: 200,
      body: JSON.stringify({
        herschrevenTekst,
        bestandBase64,
        bestandsNaam: "schrijfwijzer-resultaat.docx",
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ fout: "Er ging iets mis bij het herschrijven van het document.", details: String(err) }),
    };
  }
}
