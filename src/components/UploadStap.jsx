import { useState } from "react";

const MAX_BESTANDSGROOTTE_BYTES = 4 * 1024 * 1024; // 4 MB

function leesAlsBase64(bestand) {
  return new Promise((resolve, reject) => {
    const lezer = new FileReader();
    lezer.onload = () => {
      const resultaat = lezer.result;
      const komma = resultaat.indexOf(",");
      resolve(resultaat.slice(komma + 1));
    };
    lezer.onerror = () => reject(lezer.error);
    lezer.readAsDataURL(bestand);
  });
}

function formatGrootte(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadStap({ onVolgende }) {
  const [bezig, setBezig] = useState(false);
  const [foutmelding, setFoutmelding] = useState(null);

  async function verwerkBestand(bestand) {
    if (!bestand) return;
    setFoutmelding(null);

    if (bestand.size > MAX_BESTANDSGROOTTE_BYTES) {
      setFoutmelding(
        `Dit bestand is ${formatGrootte(bestand.size)}, dat is groter dan de limiet van ${formatGrootte(
          MAX_BESTANDSGROOTTE_BYTES
        )}. Verwijder grote afbeeldingen uit het document, of lever een kleinere versie aan.`
      );
      return;
    }

    setBezig(true);

    try {
      const base64Data = await leesAlsBase64(bestand);

      const response = await fetch("/.netlify/functions/extract-tekst", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bestandsNaam: bestand.name,
          mimeType: bestand.type,
          base64Data,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFoutmelding(data.fout || "Er ging iets mis bij het verwerken van het bestand.");
        setBezig(false);
        return;
      }

      onVolgende({
        bestandsNaam: bestand.name,
        mimeType: bestand.type,
        tekst: data.tekst,
      });
    } catch (err) {
      setFoutmelding(
        "Er ging iets mis bij het versturen van het bestand. Is het bestand erg groot? Probeer een kleinere versie."
      );
      setBezig(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Stap 1. Document aanleveren</h2>
      <p className="text-gray-600">
        Lever een Word bestand, een PDF of platte tekst aan, tot maximaal {formatGrootte(MAX_BESTANDSGROOTTE_BYTES)}.
        De tekst wordt automatisch uit het bestand gehaald.
      </p>

      <input
        type="file"
        accept=".docx,.pdf,.txt"
        disabled={bezig}
        className="block w-full text-sm border border-gray-300 rounded p-2 disabled:opacity-50"
        onChange={(e) => verwerkBestand(e.target.files?.[0] ?? null)}
      />

      {bezig && <p className="text-sm text-gray-500">Bezig met het lezen van het document.</p>}

      {foutmelding && (
        <p className="text-sm text-nhlrood bg-red-50 border border-red-200 rounded p-3">
          {foutmelding}
        </p>
      )}
    </div>
  );
}
