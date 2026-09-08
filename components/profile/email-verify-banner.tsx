"use client";

import { useState } from "react";
import { MailIcon } from "@/components/icons";

const DISMISS_KEY = "dharana:emailVerifyDismissed";

interface EmailVerifyBannerLabels {
  title: string;
  hint: string;
  resend: string;
  sent: string;
  failed: string;
  frequency: string;
  dismiss: string;
}

export function EmailVerifyBanner({ labels }: { labels: EmailVerifyBannerLabels }) {
  const [dismissed, setDismissed] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [message, setMessage] = useState("");

  if (dismissed) return null;

  async function resend() {
    setState("sending");
    setMessage("");
    try {
      const res = await fetch("/api/profile/verify-email/send", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.status === 429) {
        setState("failed");
        setMessage(labels.frequency);
        return;
      }
      if (!res.ok) {
        setState("failed");
        setMessage(labels.failed);
        return;
      }
      setState("sent");
      setMessage(labels.sent);
    } catch {
      setState("failed");
      setMessage(labels.failed);
    }
  }

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // игнорируем: localStorage может быть недоступен (приватный режим)
    }
    setDismissed(true);
  }

  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/5 p-4"
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
        <MailIcon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{labels.title}</p>
        <p className="mt-0.5 text-xs leading-5 text-muted">{labels.hint}</p>
        {message && <p className="mt-2 text-xs font-medium text-sage">{message}</p>}
        <button
          type="button"
          onClick={resend}
          disabled={state === "sending" || state === "sent"}
          className="mt-3 inline-flex h-9 items-center justify-center rounded-full bg-night-soft border border-night-line px-4 text-xs font-semibold text-ink transition-colors hover:border-sage/40 disabled:opacity-60"
        >
          {state === "sending" ? "…" : state === "sent" ? labels.sent : labels.resend}
        </button>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label={labels.dismiss}
        className="shrink-0 text-muted/50 transition-colors hover:text-muted"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
          <path d="m6 6 12 12" />
          <path d="M18 6 6 18" />
        </svg>
      </button>
    </div>
  );
}