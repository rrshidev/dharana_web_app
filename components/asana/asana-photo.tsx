export function AsanaPhoto({ src, alt }: { src: string | null; alt: string }) {
  if (!src) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-night-line bg-night text-4xl text-muted/40">
        🧘
      </div>
    );
  }

  return (
    <div className="flex h-[min(70vh,620px)] items-center justify-center overflow-hidden rounded-2xl border border-night-line bg-night">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="max-h-full max-w-full object-contain" />
    </div>
  );
}