"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminPayment } from "@/lib/api/admin";

interface PaymentsLabels {
  empty: string;
  error: string;
  amount: string;
  days: string;
  user: string;
  receipt: string;
  confirm: string;
  reject: string;
  statusPending: string;
  statusConfirmed: string;
  statusRejected: string;
  actionFailed: string;
}

export function PaymentsPanel({
  locale,
  payments,
  error,
  receiptUrl,
  labels,
}: {
  locale: string;
  payments: AdminPayment[];
  error: boolean;
  receiptUrl: (url: string | null | undefined) => string | null;
  labels: PaymentsLabels;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<number | null>(null);

  async function review(id: number, status: "confirmed" | "rejected") {
    if (busy) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/payments/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, premium_days: 30 }),
      });
      if (!res.ok) throw new Error("fail");
      router.refresh();
    } catch {
      alert(labels.actionFailed);
    } finally {
      setBusy(null);
    }
  }

  const statusText = (s: string) =>
    s === "confirmed"
      ? labels.statusConfirmed
      : s === "rejected"
        ? labels.statusRejected
        : labels.statusPending;

  if (error) {
    return (
      <p className="rounded-2xl border border-night-line p-8 text-center text-sm text-muted">
        {labels.error}
      </p>
    );
  }

  if (payments.length === 0) {
    return (
      <p className="rounded-2xl border border-night-line p-8 text-center text-sm text-muted">
        {labels.empty}
      </p>
    );
  }

  const fmtDate = (iso: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  return (
    <ul className="divide-y divide-night-line rounded-2xl border border-night-line bg-night/40">
      {payments.map((p) => {
        const isPending = p.status === "pending";
        return (
          <li key={p.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="font-medium">
                {p.user_name || (p.user_id ? "#" + p.user_id : p.telegram_id ? `tg:${p.telegram_id}` : "—")}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                {statusText(p.status)} · {fmtDate(p.created_at)}
              </p>
            </div>

            <div className="shrink-0 text-right text-sm">
              <p className="font-semibold">
                {Number(p.amount ?? 0).toLocaleString("ru-RU")} ₽
              </p>
              <p className="text-xs text-muted">
                {labels.days.replace("%days%", String(p.premium_days ?? 30))}
              </p>
            </div>

            {p.receipt_url && (
              <a
                href={receiptUrl(p.receipt_url) ?? "#"}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-night-line px-3 py-1.5 text-xs font-semibold text-muted hover:text-ink"
              >
                {labels.receipt}
              </a>
            )}

            {isPending && (
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  disabled={busy === p.id}
                  onClick={() => review(p.id, "confirmed")}
                  className="rounded-lg bg-sage/15 px-3.5 py-1.5 text-xs font-semibold text-sage transition-colors hover:bg-sage/25 disabled:opacity-50"
                >
                  {labels.confirm}
                </button>
                <button
                  type="button"
                  disabled={busy === p.id}
                  onClick={() => review(p.id, "rejected")}
                  className="rounded-lg bg-[#e85d5d]/15 px-3.5 py-1.5 text-xs font-semibold text-[#e85d5d] transition-colors hover:bg-[#e85d5d]/25 disabled:opacity-50"
                >
                  {labels.reject}
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}