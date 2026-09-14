import { Document, Packer, Paragraph } from "docx";
import { haalTakenStoreOp } from "./blobs-store.mjs";
import { SCHRIJFWIJZER_REGELS } from "../../src/data/schrijfwijzerRegels.js";
import { TONE_OF_VOICE } from "../../src/data/toneOfVoice.js";
import { EXTERNE_COMMUNICATIE } from "../../src/data/externeCommunicatie.js";

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
  const isExtern = antwoorden?.doelgroep === "Extern of corporate";

  let toneTekst = "";
  if (gebruikToneOfVoice) {
    toneTekst = `

Pas daarnaast de the originals tone of voice toe:
Schrijfprincipes: ${TONE_OF_VOICE.schrijfprincipes.join(" ")}
Toonprincipes: ${TONE_OF_VOICE.toonPrincipes.join(" ")}
De pay-off is: ${TONE_OF_VOICE.payoff}.`;
  }

  let externTekst = "";
  if (isExtern) {
    externTekst = `

Dit document is bedoeld voor extern of corporate gebruik. Belangrijk: schrijf vanuit het perspectief van de externe lezer, dus de student, bezoeker of partner die het voor het eerst leest, niet vanuit NHL Stenden zelf, en niet in de vorm van een interne mededeling die uitlegt wat iets betekent voor studenten of medewerkers. Vermijd zinnen die de lezer aanspreken als was hij intern personeel of ingeschreven student, tenzij dat daadwerkelijk de doelgroep is.

Volg deze opbouw:
${EXTERNE_COMMUNICATIE.opbouw}

Neem inhoudelijk mee waar relevant:
${EXTERNE_COMMUNICATIE.inhoudsstappen.map((s) => `- ${s}`).join("\n")}

Vuistregels:
${EXTERNE_COMMUNICATIE.vuistregels.map((s) => `- ${s}`).join("\n")}

Toets aan het einde: ${EXTERNE_COMMUNICATIE.toets}`;
  }

  return `Je past de schrijfwijzer van NHL Stenden Hogeschool toe op een aangeleverd document. Dit zijn de schrijfregels waar je je aan houdt:

${regelsTekst}

Context over dit specifieke document:
${context.join("\n") || "Geen aanvullende context meegegeven."}
${toneTekst}
${externTekst}

Herschrijf het aangeleverde document volledig volgens deze regels. Geef uitsluitend de herschreven tekst terug, zonder inleiding, zonder uitleg, zonder aanhalingstekens eromheen, en zonder markdown opmaak zoals sterretjes. Behoud de opbouw en alinea indeling van het origineel zoveel mogelijk, tenzij de opbouw voor extern gerichte communicatie hierboven iets anders vraagt.`;
}

function bouwDocxBuffer(tekst) {
  const alineas = tekst.split("\n").map((regel) => new Paragraph({ text: regel }));
  const doc = new Document({ sections: [{ children: alineas }] });
  return Packer.toBuffer(doc);
}

export async function handler(event) {
  const store = haalTakenStoreOp();

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400 };
  }

  const { jobId, tekst, antwoorden } = payload;
  if (!jobId || !tekst) {
    return { statusCode: 400 };
  }

  try {
    await store.setJSON(jobId, { status: "bezig" });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("herschrijf-document-background: ANTHROPIC_API_KEY ontbreekt in de omgeving.");
      await store.setJSON(jobId, {
        status: "fout",
        fout: "Er is geen ANTHROPIC_API_KEY ingesteld. Zet deze in de Netlify omgevingsvariabelen.",
      });
      return { statusCode: 200 };
    }

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
        max_tokens: 16000,
        thinking: { type: "disabled" },
        system: systeemPrompt,
        messages: [{ role: "user", content: tekst }],
      }),
    });

    if (!response.ok) {
      const foutTekst = await response.text();
      console.error(`herschrijf-document-background: Anthropic API gaf status ${response.status} terug: ${foutTekst}`);
      await store.setJSON(jobId, {
        status: "fout",
        fout: "De AI dienst gaf een fout terug.",
        details: foutTekst,
        httpStatus: response.status,
      });
      return { statusCode: 200 };
    }

    const data = await response.json();
    const herschrevenTekst = data.content?.find((blok) => blok.type === "text")?.text?.trim();

    if (!herschrevenTekst) {
      console.error("herschrijf-document-background: geen tekst in Anthropic response", JSON.stringify(data));
      await store.setJSON(jobId, { status: "fout", fout: "De AI gaf geen bruikbare tekst terug." });
      return { statusCode: 200 };
    }

    const docxBuffer = await bouwDocxBuffer(herschrevenTekst);
    const bestandBase64 = docxBuffer.toString("base64");

    await store.setJSON(jobId, {
      status: "klaar",
      herschrevenTekst,
      bestandBase64,
      bestandsNaam: "schrijfwijzer-resultaat.docx",
    });

    return { statusCode: 200 };
  } catch (err) {
    console.error("herschrijf-document-background: onverwachte fout", err);
    await store.setJSON(jobId, { status: "fout", fout: "Er ging iets mis bij het herschrijven.", details: String(err) });
    return { statusCode: 200 };
  }
}
