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

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_POGINGEN = 100; // ongeveer 5 minuten

export default function ResultaatStap({ document: brondocument, antwoorden, onOpnieuw }) {
  const [laden, setLaden] = useState(true);
  const [foutmelding, setFoutmelding] = useState(null);
  const [foutDetails, setFoutDetails] = useState(null);
  const [resultaat, setResultaat] = useState(null);

  useEffect(() => {
    let actief = true;
    let pogingen = 0;

    async function pollResultaat(jobId) {
      while (actief && pogingen < MAX_POLL_POGINGEN) {
        pogingen += 1;
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        if (!actief) return;

        try {
          const response = await fetch("/.netlify/functions/haal-resultaat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jobId }),
          });
          const data = await response.json();

          if (!actief) return;

          if (data.status === "klaar") {
            setResultaat(data);
            setLaden(false);
            return;
          }

          if (data.status === "fout") {
            setFoutmelding(data.fout || "Er ging iets mis bij het herschrijven van het document.");
            setFoutDetails(data.details || null);
            setLaden(false);
            return;
          }
        } catch {
          // een gemiste polling poging is geen ramp, gewoon opnieuw proberen
        }
      }

      if (actief && pogingen >= MAX_POLL_POGINGEN) {
        setFoutmelding("Het duurt langer dan verwacht. Probeer het later nog eens.");
        setLaden(false);
      }
    }

    async function start() {
      setLaden(true);
      setFoutmelding(null);
      setFoutDetails(null);

      const jobId =
        window.crypto?.randomUUID?.() ?? `taak-${Date.now()}-${Math.random().toString(16).slice(2)}`;

      try {
        await fetch("/.netlify/functions/herschrijf-document-background", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobId,
            tekst: brondocument?.tekst ?? "",
            antwoorden: antwoorden ?? {},
          }),
        });
      } catch {
        if (!actief) return;
        setFoutmelding("Kon de herschrijftaak niet starten. Probeer het opnieuw.");
        setLaden(false);
        return;
      }

      if (!actief) return;
      pollResultaat(jobId);
    }

    start();

    return () => {
      actief = false;
    };
  }, [brondocument, antwoorden]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Stap 3. Resultaat</h2>

      {laden && (
        <div className="space-y-2">
          <p className="text-gray-500">Bezig met het herschrijven van het document.</p>
          <p className="text-sm text-gray-400">
            Dit kan bij langere documenten een paar minuten duren, even geduld.
          </p>
        </div>
      )}

      {foutmelding && (
        <div className="text-sm text-nhlrood bg-red-50 border border-red-200 rounded p-3 space-y-2">
          <p>{foutmelding}</p>
          {foutDetails && (
            <pre className="text-xs whitespace-pre-wrap text-red-800 bg-red-100 rounded p-2 overflow-x-auto">
              {foutDetails}
            </pre>
          )}
        </div>
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

      {!laden && (
        <button
          className="px-4 py-2 rounded border border-gray-300"
          onClick={onOpnieuw}
        >
          Nieuw document
        </button>
      )}
    </div>
  );
}
