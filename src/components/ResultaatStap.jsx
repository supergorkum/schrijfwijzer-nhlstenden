import { useEffect, useState } from "react";

function downloadBase64AlsBestand(base64, bestandsNaam) {
  const bytes = atob(base64);
  const buffer = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) buffer[i] = bytes.charCodeAt(i);

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = bestandsNaam;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ResultaatStap({ document: brondocument, antwoorden, onOpnieuw }) {
  const [laden, setLaden] = useState(true);
  const [foutmelding, setFoutmelding] = useState(null);
  const [resultaat, setResultaat] = useState(null);

  useEffect(() => {
    let actief = true;

    async function herschrijf() {
      setLaden(true);
      setFoutmelding(null);

      try {
        const response = await fetch("/.netlify/functions/herschrijf-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tekst: brondocument?.tekst ?? "",
            antwoorden: antwoorden ?? {},
          }),
        });

        const data = await response.json();
        if (!actief) return;

        if (!response.ok) {
          setFoutmelding(data.fout || "Er ging iets mis bij het herschrijven van het document.");
        } else {
          setResultaat(data);
        }
      } catch (err) {
        if (!actief) return;
        setFoutmelding("Kon geen verbinding maken om het document te herschrijven.");
      } finally {
        if (actief) setLaden(false);
      }
    }

    herschrijf();

    return () => {
      actief = false;
    };
  }, [brondocument, antwoorden]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Stap 3. Resultaat</h2>

      {laden && <p className="text-gray-500">Bezig met het herschrijven van het document.</p>}

      {foutmelding && (
        <p className="text-sm text-nhlrood bg-red-50 border border-red-200 rounded p-3">
          {foutmelding}
        </p>
      )}

      {resultaat && (
        <div className="space-y-4">
          <button
            className="px-4 py-2 rounded bg-nhlteal text-white"
            onClick={() => downloadBase64AlsBestand(resultaat.bestandBase64, resultaat.bestandsNaam)}
          >
            Download als Word bestand
          </button>

          <div className="border border-gray-200 rounded p-4 bg-gray-50 text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
            {resultaat.herschrevenTekst}
          </div>
        </div>
      )}

      <button
        className="px-4 py-2 rounded border border-gray-300"
        onClick={onOpnieuw}
      >
        Nieuw document
      </button>
    </div>
  );
}
