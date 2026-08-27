import { VRAGEN } from "../../src/data/vragen.js";

// Bepaalt met de Anthropic API welke vragen uit de kandidaat vragenset
// relevant zijn voor het aangeleverde document.
// Verwacht een POST met JSON body: { tekst }
// Geeft terug: { relevanteVragen: [id, id, ...] } of { fout }

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

  const { tekst } = payload;
  if (!tekst) {
    return { statusCode: 400, body: JSON.stringify({ fout: "Er is geen documenttekst meegestuurd." }) };
  }

  const vragenOverzicht = VRAGEN.map((v) => `${v.id}: ${v.vraag}`).join("\n");
  const stukTekst = tekst.slice(0, 6000);

  const systeemPrompt = `Je helpt bepalen welke vragen relevant zijn voordat een document wordt aangepast aan de schrijfwijzer van NHL Stenden Hogeschool. Hier is de kandidaat vragenlijst, met per vraag een korte identificatie:

${vragenOverzicht}

Lees het aangeleverde document en bepaal welke van deze vragen daadwerkelijk relevant zijn om te stellen. Sla een vraag over als het antwoord al duidelijk uit de tekst blijkt, of als de vraag niet van toepassing is op dit type document. Antwoord uitsluitend met geldige JSON in dit formaat, zonder verdere uitleg: {"relevanteVragen": ["id1", "id2"]}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 500,
        system: systeemPrompt,
        messages: [{ role: "user", content: stukTekst }],
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
    const tekstAntwoord = data.content?.find((blok) => blok.type === "text")?.text ?? "";

    let relevanteVragen;
    try {
      const schoongemaakt = tekstAntwoord.replace(/```json|```/g, "").trim();
      const geparsed = JSON.parse(schoongemaakt);
      relevanteVragen = geparsed.relevanteVragen;
    } catch {
      relevanteVragen = VRAGEN.map((v) => v.id);
    }

    if (!Array.isArray(relevanteVragen) || relevanteVragen.length === 0) {
      relevanteVragen = VRAGEN.map((v) => v.id);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ relevanteVragen }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ fout: "Er ging iets mis bij het bepalen van de vragen.", details: String(err) }),
    };
  }
}
