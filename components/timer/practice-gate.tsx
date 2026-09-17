"use client";

import { useEffect } from "react";
import Link from "next/link";
import { SparkleIcon } from "@/components/icons";
import { reachGoal } from "@/lib/analytics/metrica";

export interface PracticeGateLabels {
  title: string;
  text: string;
  primary: string;
  primaryHref: string;
  secondary: string;
  secondaryHref: string;
  later?: string;
}

/**
 * Conversion modal for the guest timer funnel:
 * - "conversion" — shown after the first completed practice (create account).
 * - "second" gate — mandatory sign-in before starting practice #2.
 * Rendered as a full-screen overlay over the timer UI.
 */
export function PracticeGate({
  labels,
  onClose,
  goal,
}: {
  labels: PracticeGateLabels;
  onClose: () => void;
  goal?: string;
}) {
  useEffect(() => {
    if (goal) reachGoal(goal);
  }, [goal]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-night/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-night-line bg-night p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:text-ink"
        >
          ✕
        </button>
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
          <SparkleIcon className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-lg font-semibold tracking-tight">{labels.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{labels.text}</p>
        <Link
          href={labels.primaryHref}
          className="mt-6 block rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-night transition-opacity hover:opacity-90"
        >
          {labels.primary}
        </Link>
        <Link
          href={labels.secondaryHref}
          className="mt-3 block rounded-full border border-night-line px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-accent/50"
        >
          {labels.secondary}
        </Link>
        {labels.later && (
          <button
            type="button"
            onClick={onClose}
            className="mt-3 block w-full rounded-full px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:text-ink"
          >
            {labels.later}
          </button>
        )}
      </div>
    </div>
  );
}