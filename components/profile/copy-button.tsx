"use client";

import { useCallback, useState } from "react";

export interface CopyButtonLabels {
  copyHint: string;
  copied: string;
}

export function CopyButton({
  value,
  labels,
}: {
  value: string;
  labels: CopyButtonLabels;
}) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  }, [value]);

  return (
    <button
      type="button"
      onClick={() => {
        void copy();
      }}
      title={labels.copyHint}
      className="group flex items-center justify-between gap-3 rounded-xl border border-night-line bg-night-soft/40 p-3.5 transition-colors hover:border-accent/50"
    >
      <span className="font-mono text-base tracking-wider">{value}</span>
      <span
        className={`shrink-0 text-xs font-medium transition-colors ${
          copied ? "text-sage" : "text-muted group-hover:text-ink"
        }`}
      >
        {copied ? labels.copied : labels.copyHint}
      </span>
    </button>
  );
}