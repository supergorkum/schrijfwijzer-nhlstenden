import { useState } from "react";
import UploadStap from "./components/UploadStap.jsx";
import VragenStap from "./components/VragenStap.jsx";
import ResultaatStap from "./components/ResultaatStap.jsx";
import PixelStrook from "./components/PixelStrook.jsx";
import { VERSIE } from "./data/versie.js";
import { CHANGELOG } from "./data/changelog.js";

const STAPPEN = [
  { key: "upload", label: "Document" },
  { key: "vragen", label: "Vragen" },
  { key: "resultaat", label: "Resultaat" },
];

export default function App() {
  const [stap, setStap] = useState("upload");
  const [document, setDocument] = useState(null);
  const [antwoorden, setAntwoorden] = useState(null);
  const [changelogZichtbaar, setChangelogZichtbaar] = useState(false);

  const huidigeIndex = STAPPEN.findIndex((s) => s.key === stap);
  const changelogAflopend = [...CHANGELOG].reverse();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-nhlblauw text-white">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/70 font-semibold">
              NHL Stenden Hogeschool
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight">Schrijfwijzer</h1>
          </div>
          <button
            type="button"
            onClick={() => setChangelogZichtbaar((huidig) => !huidig)}
            className="text-xs font-medium bg-white/10 hover:bg-white/20 rounded-full px-3 py-1 transition-colors"
          >
            v{VERSIE} · wat is nieuw?
          </button>
        </div>

        {changelogZichtbaar && (
          <div className="max-w-3xl mx-auto px-6 pb-6">
            <div className="bg-white/10 rounded-xl p-4 space-y-3 max-h-72 overflow-y-auto">
              {changelogAflopend.map((item) => (
                <div key={item.versie}>
                  <p className="text-sm font-semibold">
                    v{item.versie} <span className="font-normal text-white/60">— {item.datum}</span>
                  </p>
                  <p className="text-sm text-white/90">{item.beschrijving}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>
      <PixelStrook />

      <div className="max-w-3xl mx-auto px-6 pt-8">
        <ol className="flex items-center justify-between mb-8">
          {STAPPEN.map((s, i) => {
            const bereikt = i <= huidigeIndex;
            return (
              <li key={s.key} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      bereikt ? "bg-nhlblauw text-white" : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      bereikt ? "text-nhlblauw" : "text-gray-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STAPPEN.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 -mt-5 ${i < huidigeIndex ? "bg-nhlblauw" : "bg-gray-200"}`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <main className="max-w-3xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          {stap === "upload" && (
            <UploadStap
              onVolgende={(doc) => {
                setDocument(doc);
                setStap("vragen");
              }}
            />
          )}

          {stap === "vragen" && (
            <VragenStap
              document={document}
              onVolgende={(gegevenAntwoorden) => {
                setAntwoorden(gegevenAntwoorden);
                setStap("resultaat");
              }}
              onTerug={() => setStap("upload")}
            />
          )}

          {stap === "resultaat" && (
            <ResultaatStap
              document={document}
              antwoorden={antwoorden}
              onOpnieuw={() => {
                setDocument(null);
                setAntwoorden(null);
                setStap("upload");
              }}
            />
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Een hulpmiddel van NHL Stenden Hogeschool om documenten aan te passen aan de schrijfwijzer.
        </p>
      </main>

      <PixelStrook />
    </div>
  );
}
