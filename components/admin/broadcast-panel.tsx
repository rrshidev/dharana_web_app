"use client";

import { useState } from "react";

interface BroadcastLabels {
  audience: string;
  audienceFree: string;
  audiencePremium: string;
  channels: string;
  channelTelegram: string;
  channelApp: string;
  messagePlaceholder: string;
  send: string;
  sending: string;
  test: string;
  testing: string;
  sent: string;
  failed: string;
  messageRequired: string;
}

function ToggleChip({
  active,
  onToggle,
  children,
}: {
  active: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
        active
          ? "bg-accent text-night"
          : "border border-night-line text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function BroadcastPanel({ labels }: { labels: BroadcastLabels }) {
  const [message, setMessage] = useState("");
  const [aud, setAud] = useState({ free: true, premium: true });
  const [chans, setChans] = useState({ telegram: true, app: true });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"sent" | "failed" | null>(null);
  const [isTest, setIsTest] = useState(false);

  async function submit(test: boolean) {
    if (!message.trim()) {
      alert(labels.messageRequired);
      return;
    }
    setBusy(true);
    setIsTest(test);
    setStatus(null);
    try {
      const res = await fetch(test ? "/api/admin/broadcast/test" : "/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          audience: { free: aud.free, premium: aud.premium },
          channels: { telegram: chans.telegram, app: chans.app },
        }),
      });
      if (!res.ok) throw new Error("fail");
      setStatus("sent");
      if (!test) setMessage("");
    } catch {
      setStatus("failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-night-line bg-night/60 p-4">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={labels.messagePlaceholder}
        rows={4}
        className="w-full rounded-xl border border-night-line bg-night/40 px-3 py-2 text-sm outline-none placeholder:text-muted/60 focus:border-accent/60"
      />

      <div className="mt-4 space-y-3">
        <div>
          <p className="mb-1.5 text-xs font-semibold text-muted">{labels.audience}</p>
          <div className="flex flex-wrap gap-1.5">
            <ToggleChip
              active={aud.free}
              onToggle={() => setAud((s) => ({ ...s, free: !s.free }))}
            >
              {labels.audienceFree}
            </ToggleChip>
            <ToggleChip
              active={aud.premium}
              onToggle={() => setAud((s) => ({ ...s, premium: !s.premium }))}
            >
              {labels.audiencePremium}
            </ToggleChip>
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold text-muted">{labels.channels}</p>
          <div className="flex flex-wrap gap-1.5">
            <ToggleChip
              active={chans.telegram}
              onToggle={() => setChans((s) => ({ ...s, telegram: !s.telegram }))}
            >
              {labels.channelTelegram}
            </ToggleChip>
            <ToggleChip
              active={chans.app}
              onToggle={() => setChans((s) => ({ ...s, app: !s.app }))}
            >
              {labels.channelApp}
            </ToggleChip>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => submit(false)}
          className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-night disabled:opacity-50"
        >
          {busy && !isTest ? labels.sending : labels.send}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => submit(true)}
          className="rounded-xl border border-night-line px-4 py-2 text-sm font-semibold text-muted hover:text-ink disabled:opacity-50"
        >
          {busy && isTest ? labels.testing : labels.test}
        </button>
        {status === "sent" && (
          <span className="text-xs font-medium text-sage">{labels.sent}</span>
        )}
        {status === "failed" && (
          <span className="text-xs font-medium text-[#e85d5d]">{labels.failed}</span>
        )}
      </div>
    </div>
  );
}