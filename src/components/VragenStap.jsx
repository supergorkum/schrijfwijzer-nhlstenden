export default function VragenStap({ document, onVolgende, onTerug }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Stap 2. Vragen</h2>
      <p className="text-gray-600">
        Hier komen straks de dynamische vragen over academie, doelgroep,
        medium en tone of voice. Nu nog een placeholder.
      </p>
      <div className="flex gap-3">
        <button
          className="px-4 py-2 rounded border border-gray-300"
          onClick={onTerug}
        >
          Terug
        </button>
        <button
          className="px-4 py-2 rounded bg-nhlblauw text-white"
          onClick={() => onVolgende({})}
        >
          Verder
        </button>
      </div>
    </div>
  );
}
