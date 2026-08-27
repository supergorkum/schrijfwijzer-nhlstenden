export default function UploadStap({ onVolgende }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Stap 1. Document aanleveren</h2>
      <p className="text-gray-600">
        Lever een Word bestand, een PDF of platte tekst aan. Deze stap is nog
        een lege schil, de daadwerkelijke verwerking volgt in een latere
        patch.
      </p>
      <input
        type="file"
        accept=".docx,.pdf,.txt"
        className="block w-full text-sm border border-gray-300 rounded p-2"
        onChange={(e) => {
          const bestand = e.target.files?.[0] ?? null;
          onVolgende(bestand);
        }}
      />
    </div>
  );
}
