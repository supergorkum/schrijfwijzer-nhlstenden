import mammoth from "mammoth";
import pdfParse from "pdf-parse";

// Haalt platte tekst uit een aangeleverd bestand.
// Verwacht een POST met JSON body: { bestandsNaam, mimeType, base64Data }
// Geeft terug: { tekst } of { fout } bij een probleem.

function bepaalType(bestandsNaam, mimeType) {
  const naam = (bestandsNaam || "").toLowerCase();
  if (mimeType?.includes("wordprocessingml") || naam.endsWith(".docx")) return "docx";
  if (mimeType?.includes("pdf") || naam.endsWith(".pdf")) return "pdf";
  if (mimeType?.includes("text/plain") || naam.endsWith(".txt")) return "txt";
  return "onbekend";
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ fout: "Alleen POST is toegestaan." }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ fout: "Ongeldige aanvraag, geen geldige JSON ontvangen." }) };
  }

  const { bestandsNaam, mimeType, base64Data } = payload;

  if (!base64Data) {
    return { statusCode: 400, body: JSON.stringify({ fout: "Er is geen bestand meegestuurd." }) };
  }

  const type = bepaalType(bestandsNaam, mimeType);
  const buffer = Buffer.from(base64Data, "base64");

  try {
    let tekst = "";

    if (type === "docx") {
      const resultaat = await mammoth.extractRawText({ buffer });
      tekst = resultaat.value;
    } else if (type === "pdf") {
      const resultaat = await pdfParse(buffer);
      tekst = resultaat.text;
    } else if (type === "txt") {
      tekst = buffer.toString("utf8");
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({
          fout: "Bestandstype wordt niet ondersteund. Lever een Word, PDF of tekst bestand aan.",
        }),
      };
    }

    tekst = tekst.trim();

    if (!tekst) {
      return {
        statusCode: 422,
        body: JSON.stringify({
          fout: "Er kon geen tekst uit dit bestand gehaald worden. Mogelijk is het een gescande PDF zonder tekstlaag.",
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ tekst }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ fout: "Er ging iets mis bij het lezen van het bestand.", details: String(err) }),
    };
  }
}
