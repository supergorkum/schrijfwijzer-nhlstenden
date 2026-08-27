import { VRAGEN } from "../../src/data/vragen.js";

// Bepaalt met de Anthropic API welke vragen uit de kandidaat vragenset
// relevant zijn voor het aangeleverde document, en waarom.
// Verwacht een POST met JSON body: { tekst }
// Geeft terug: { relevanteVragen: [id, ...], beoordelingen: [{id, relevant, reden}, ...] } of { fout }

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ fout: "Alleen POST is toegestaan." }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("bepaal-vragen: ANTHROPIC_API_KEY ontbreekt in de omgeving.");
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

Lees het aangeleverde document en beoordeel voor elk van deze vragen, dus voor alle vragen uit de lijst hierboven, of die relevant is om te stellen. Een vraag is niet relevant als het antwoord al duidelijk uit de tekst blijkt, of als de vraag niet van toepassing is op dit type document. Geef bij elke vraag een korte reden, in maximaal één zin, waarom je 'm wel of niet relevant vindt.

Antwoord uitsluitend met geldige JSON in dit formaat, zonder verdere uitleg, met exact één regel per vraag uit de lijst:
{"beoordelingen": [{"id": "typeMiddel", "relevant": true, "reden": "korte reden hier"}, {"id": "doelgroep", "relevant": false, "reden": "korte reden hier"}]}`;

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
        max_tokens: 1200,
        thinking: { type: "disabled" },
        system: systeemPrompt,
        messages: [{ role: "user", content: stukTekst }],
      }),
    });

    if (!response.ok) {
      const foutTekst = await response.text();
      console.error(`bepaal-vragen: Anthropic API gaf status ${response.status} terug: ${foutTekst}`);
      return {
        statusCode: 502,
        body: JSON.stringify({ fout: "De AI dienst gaf een fout terug.", details: foutTekst, status: response.status }),
      };
    }

    const data = await response.json();
    const tekstAntwoord = data.content?.find((blok) => blok.type === "text")?.text ?? "";

    let beoordelingen;
    try {
      const schoongemaakt = tekstAntwoord.replace(/```json|```/g, "").trim();
      const geparsed = JSON.parse(schoongemaakt);
      beoordelingen = geparsed.beoordelingen;
    } catch {
      beoordelingen = null;
    }

    if (!Array.isArray(beoordelingen) || beoordelingen.length === 0) {
      beoordelingen = VRAGEN.map((v) => ({
        id: v.id,
        relevant: true,
        reden: "Kon de afweging niet bepalen, deze vraag wordt daarom voor de zekerheid getoond.",
      }));
    }

    const relevanteVragen = beoordelingen.filter((b) => b.relevant).map((b) => b.id);

    return {
      statusCode: 200,
      body: JSON.stringify({ relevanteVragen, beoordelingen }),
    };
  } catch (err) {
    console.error("bepaal-vragen: onverwachte fout", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ fout: "Er ging iets mis bij het bepalen van de vragen.", details: String(err) }),
    };
  }
}
