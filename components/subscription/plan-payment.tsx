"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/settings";
import { ReceiptUploader, type ReceiptUploaderLabels } from "@/components/profile/receipt-uploader";

export interface PlanOption {
  id: string;
  label: string;
  amount: string;
}

export function PlanPayment({
  locale,
  contact,
  plans,
  labels,
}: {
  locale: Locale;
  contact: string;
  plans: PlanOption[];
  labels: ReceiptUploaderLabels;
}) {
  const [selected, setSelected] = useState(0);
  const plan = plans[selected] ?? plans[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {plans.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelected(i)}
            aria-pressed={selected === i}
            className={`flex items-center justify-between rounded-2xl border px-5 py-3.5 text-left text-sm transition-colors ${
              selected === i
                ? "border-accent bg-accent/10 text-ink"
                : "border-night-line bg-night/40 text-muted hover:border-accent/50 hover:text-ink"
            }`}
          >
            <span className="font-medium">{p.label}</span>
            <span aria-hidden="true">{selected === i ? "◉" : "○"}</span>
          </button>
        ))}
      </div>

      <ReceiptUploader
        locale={locale}
        method={plan.label}
        amount={plan.amount}
        contact={contact}
        labels={labels}
      />
    </div>
  );
}