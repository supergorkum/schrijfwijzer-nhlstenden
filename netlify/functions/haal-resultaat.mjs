import { haalTakenStoreOp } from "./blobs-store.mjs";

// Snelle functie om te pollen of een achtergrondtaak al klaar is.
// Verwacht een POST met JSON body: { jobId }
// Geeft terug: { status: "bezig" } of het opgeslagen resultaat.

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ fout: "Alleen POST is toegestaan." }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ fout: "Ongeldige aanvraag." }) };
  }

  const { jobId } = payload;
  if (!jobId) {
    return { statusCode: 400, body: JSON.stringify({ fout: "Er is geen jobId meegestuurd." }) };
  }

  try {
    const store = haalTakenStoreOp();
    const resultaat = await store.get(jobId, { type: "json" });

    if (!resultaat) {
      return { statusCode: 200, body: JSON.stringify({ status: "bezig" }) };
    }

    return { statusCode: 200, body: JSON.stringify(resultaat) };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ fout: "Kon de opslag niet bereiken.", details: String(err) }),
    };
  }
}
