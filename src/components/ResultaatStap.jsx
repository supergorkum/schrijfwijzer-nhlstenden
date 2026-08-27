export default function ResultaatStap({ document, antwoorden, onOpnieuw }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Stap 3. Resultaat</h2>
      <p className="text-gray-600">
        Hier komt straks het aangepaste document, klaar om te downloaden.
        Nu nog een placeholder.
      </p>
      <button
        className="px-4 py-2 rounded border border-gray-300"
        onClick={onOpnieuw}
      >
        Nieuw document
      </button>
    </div>
  );
}
