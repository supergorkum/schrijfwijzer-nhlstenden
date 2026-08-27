import { useEffect, useState } from "react";
import { VRAGEN } from "../data/vragen.js";

export default function VragenStap({ document, onVolgende, onTerug }) {
  const [laden, setLaden] = useState(true);
  const [foutmelding, setFoutmelding] = useState(null);
  const [teTonenVragen, setTeTonenVragen] = useState([]);
  const [antwoorden, setAntwoorden] = useState({});

  useEffect(() => {
    const controller = new AbortController();

    async function bepaalVragen() {
      setLaden(true);
      setFoutmelding(null);

      try {
        const response = await fetch("/.netlify/functions/bepaal-vragen", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tekst: document?.tekst ?? "" }),
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          setFoutmelding(data.fout || "Er ging iets mis bij het bepalen van de vragen.");
          setTeTonenVragen(VRAGEN);
        } else {
          const ids = data.relevanteVragen ?? [];
          const gefilterd = VRAGEN.filter((v) => ids.includes(v.id));
          setTeTonenVragen(gefilterd.length > 0 ? gefilterd : VRAGEN);
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        setFoutmelding("Kon geen verbinding maken om de vragen te bepalen. Alle vragen worden getoond.");
        setTeTonenVragen(VRAGEN);
      } finally {
        setLaden(false);
      }
    }

    bepaalVragen();

    return () => {
      controller.abort();
    };
  }, [document]);

  function beantwoord(id, waarde) {
    setAntwoorden((huidig) => ({ ...huidig, [id]: waarde }));
  }

  if (laden) {
    return <p className="text-gray-500">Bezig met het bepalen van de relevante vragen.</p>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Stap 2. Vragen</h2>

      {foutmelding && (
        <p className="text-sm text-nhlrood bg-red-50 border border-red-200 rounded p-3">
          {foutmelding}
        </p>
      )}

      {teTonenVragen.length === 0 && (
        <p className="text-gray-600">
          Er zijn geen aanvullende vragen nodig voor dit document.
        </p>
      )}

      {teTonenVragen.map((v) => (
        <div key={v.id} className="space-y-2">
          <p className="font-medium">{v.vraag}</p>

          {v.opties ? (
            <div className="flex flex-wrap gap-2">
              {v.opties.map((optie) => (
                <button
                  key={optie}
                  type="button"
                  onClick={() => beantwoord(v.id, optie)}
                  className={`px-3 py-1.5 rounded border text-sm ${
                    antwoorden[v.id] === optie
                      ? "bg-nhlblauw text-white border-nhlblauw"
                      : "border-gray-300 text-gray-700"
                  }`}
                >
                  {optie}
                </button>
              ))}
            </div>
          ) : (
            <input
              type="text"
              value={antwoorden[v.id] ?? ""}
              onChange={(e) => beantwoord(v.id, e.target.value)}
              className="w-full border border-gray-300 rounded p-2 text-sm"
              placeholder="Vul hier je antwoord in"
            />
          )}
        </div>
      ))}

      <div className="flex gap-3 pt-2">
        <button
          className="px-4 py-2 rounded border border-gray-300"
          onClick={onTerug}
        >
          Terug
        </button>
        <button
          className="px-4 py-2 rounded bg-nhlblauw text-white"
          onClick={() => onVolgende(antwoorden)}
        >
          Verder
        </button>
      </div>
    </div>
  );
}
