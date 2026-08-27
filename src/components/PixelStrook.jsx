// Kleine decoratieve stroken blokjes, geïnspireerd op de vormentaal uit de
// brandmanual. Puur visueel, geen inhoud.

const KLEUREN = ["bg-nhlteal", "bg-nhlrood", "bg-nhloranje", "bg-nhlgroen", "bg-nhlroze"];

export default function PixelStrook({ className = "" }) {
  return (
    <div className={`flex h-2 w-full ${className}`} aria-hidden="true">
      {Array.from({ length: 24 }).map((_, i) => (
        <div key={i} className={`flex-1 ${KLEUREN[i % KLEUREN.length]}`} />
      ))}
    </div>
  );
}
