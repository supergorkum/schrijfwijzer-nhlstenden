import { useState } from "react";
import UploadStap from "./components/UploadStap.jsx";
import VragenStap from "./components/VragenStap.jsx";
import ResultaatStap from "./components/ResultaatStap.jsx";
import { VERSIE } from "./data/versie.js";

export default function App() {
  const [stap, setStap] = useState("upload");
  const [document, setDocument] = useState(null);
  const [antwoorden, setAntwoorden] = useState(null);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="bg-nhlblauw text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Schrijfwijzer NHL Stenden</h1>
        <span className="text-xs opacity-70">v{VERSIE}</span>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
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
      </main>
    </div>
  );
}
