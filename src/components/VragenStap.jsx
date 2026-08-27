import { useEffect, useState } from "react";
import { VRAGEN } from "../data/vragen.js";

export default function VragenStap({ document, onVolgende, onTerug }) {
  const [laden, setLaden] = useState(true);
  const [foutmelding, setFoutmelding] = useState(null);
  const [teTonenVragen, setTeTonenVragen] = useState([]);
  const [antwoorden, setAntwoorden] = useState({});
  const [andersActief, setAndersActief] = useState({});
  const [beoordelingen, setBeoordelingen] = useState([]);
  const [afwegingZichtbaar, setAfwegingZichtbaar] = useState(false);

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
          setBeoordelingen([]);
        } else {
          const ids = data.relevanteVragen ?? [];
          const gefilterd = VRAGEN.filter((v) => ids.includes(v.id));
          setTeTonenVragen(gefilterd.length > 0 ? gefilterd : VRAGEN);
          setBeoordelingen(data.beoordelingen ?? []);
        }

        // Alleen hier, na een echt afgeronde aanroep, mag laden op false.
        // Een afgebroken, dubbele aanroep in ontwikkelmodus stopt hierboven
        // al bij de AbortError hieronder, en laat laden dus terecht op true
        // staan tot de echte aanroep is afgerond.
        setLaden(false);
      } catch (err) {
        if (err.name === "AbortError") return;
        setFoutmelding("Kon geen verbinding maken om de vragen te bepalen. Alle vragen worden getoond.");
        setTeTonenVragen(VRAGEN);
        setBeoordelingen([]);
        setLaden(false);
      }
    }

    bepaalVragen();

    return () => {
      controller.abort();
    };
  }, [document]);

  function kiesOptie(vraag, optie) {
    if (vraag.laatVrijeInvoerToe && optie === vraag.laatVrijeInvoerToe) {
      setAndersActief((huidig) => ({ ...huidig, [vraag.id]: true }));
      setAntwoorden((huidig) => ({ ...huidig, [vraag.id]: "" }));
      return;
    }
    setAndersActief((huidig) => ({ ...huidig, [vraag.id]: false }));
    setAntwoorden((huidig) => ({ ...huidig, [vraag.id]: optie }));
  }

  function typVrijeInvoer(id, waarde) {
    setAntwoorden((huidig) => ({ ...huidig, [id]: waarde }));
  }

  function beantwoordVrijeVraag(id, waarde) {
    setAntwoorden((huidig) => ({ ...huidig, [id]: waarde }));
  }

  if (laden) {
    return <p className="text-gray-500">Bezig met het bepalen van de relevante vragen.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <h2 className="text-lg font-bold text-nhlblauw">Een paar vragen</h2>

        {beoordelingen.length > 0 && (
          <button
            type="button"
            onClick={() => setAfwegingZichtbaar((huidig) => !huidig)}
            className="text-base font-bold px-5 py-2.5 rounded-full bg-nhlteal text-white shadow-sm hover:bg-nhlteal/90 transition-colors"
          >
            {afwegingZichtbaar ? "Verberg afwegingen" : "Toon afwegingen"}
          </button>
        )}
      </div>

      {afwegingZichtbaar && beoordelingen.length > 0 && (
        <div className="space-y-2">
          {beoordelingen.map((b) => {
            const vraagDefinitie = VRAGEN.find((v) => v.id === b.id);
            return (
              <div
                key={b.id}
                className={`text-sm rounded-lg p-3 border ${
                  b.relevant
                    ? "bg-teal-50 border-teal-100 text-teal-900"
                    : "bg-gray-50 border-gray-100 text-gray-600"
                }`}
              >
                <p className="font-medium">
                  {b.relevant ? "Gesteld: " : "Overgeslagen: "}
                  {vraagDefinitie?.vraag ?? b.id}
                </p>
                <p className="mt-0.5">{b.reden}</p>
              </div>
            );
          })}
        </div>
      )}

      {foutmelding && (
        <p className="text-sm text-nhlrood bg-red-50 border border-red-200 rounded-lg p-3">
          {foutmelding}
        </p>
      )}

      {teTonenVragen.length === 0 && (
        <p className="text-gray-600">
          Er zijn geen aanvullende vragen nodig voor dit document.
        </p>
      )}

      {teTonenVragen.map((v) => {
        const isAndersActief = Boolean(andersActief[v.id]);

        return (
          <div key={v.id} className="space-y-2">
            <p className="font-semibold text-gray-700">{v.vraag}</p>

            {v.opties ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {v.opties.map((optie) => {
                    const actief = isAndersActief
                      ? optie === v.laatVrijeInvoerToe
                      : antwoorden[v.id] === optie;
                    return (
                      <button
                        key={optie}
                        type="button"
                        onClick={() => kiesOptie(v, optie)}
                        className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                          actief
                            ? "bg-nhlblauw text-white border-nhlblauw"
                            : "border-gray-300 text-gray-600 hover:border-nhlblauw hover:text-nhlblauw"
                        }`}
                      >
                        {optie}
                      </button>
                    );
                  })}
                </div>

                {isAndersActief && (
                  <input
                    type="text"
                    autoFocus
                    value={antwoorden[v.id] ?? ""}
                    onChange={(e) => typVrijeInvoer(v.id, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nhlteal focus:border-transparent"
                    placeholder="Vul hier de naam van de dienst in"
                  />
                )}
              </div>
            ) : (
              <input
                type="text"
                value={antwoorden[v.id] ?? ""}
                onChange={(e) => beantwoordVrijeVraag(v.id, e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nhlteal focus:border-transparent"
                placeholder="Vul hier je antwoord in"
              />
            )}
          </div>
        );
      })}

      <div className="flex gap-3 pt-2">
        <button
          className="px-5 py-2 rounded-full border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50"
          onClick={onTerug}
        >
          Terug
        </button>
        <button
          className="px-5 py-2 rounded-full bg-nhlblauw text-white text-sm font-semibold hover:bg-nhlblauw/90"
          onClick={() => onVolgende(antwoorden)}
        >
          Verder
        </button>
      </div>
    </div>
  );
}
