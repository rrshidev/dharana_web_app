"use client";

import { useState } from "react";

export function AsanaPhoto({ src, alt }: { src: string | null; alt: string }) {
  const [ratio, setRatio] = useState<number | null>(null);

  if (!src) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center text-4xl text-muted/40">
        🧘
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-2xl border border-night-line bg-night"
      style={{ aspectRatio: ratio ? String(ratio) : "4 / 3" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-contain"
        onLoad={(event) => {
          const el = event.currentTarget;
          if (el.naturalWidth > 0 && el.naturalHeight > 0) {
            setRatio(el.naturalWidth / el.naturalHeight);
          }
        }}
      />
    </div>
  );
}