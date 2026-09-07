"use client";

import { useCallback, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/settings";
import { CameraIcon } from "@/components/icons";

export interface ReceiptUploaderLabels {
  payButton: string;
  uploading: string;
  payedToast: string;
  error: string;
}

export function ReceiptUploader({
  locale,
  method,
  amount,
  contact,
  labels,
}: {
  locale: Locale;
  method: string;
  amount: string;
  contact: string;
  labels: ReceiptUploaderLabels;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (file: File) => {
      setError(null);
      setMessage(null);
      setUploading(true);
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("payment_method", method);
        form.append("amount", amount);
        form.append("contact", contact);
        const res = await fetch("/api/payments/receipt", { method: "POST", body: form });
        if (res.status === 401) {
          window.location.assign(`/${locale}/login`);
          return;
        }
        if (!res.ok) setError(labels.error);
        else setMessage(labels.payedToast);
      } catch {
        setError(labels.error);
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [method, amount, contact, labels, locale],
  );

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void submit(file);
        }}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-night transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <CameraIcon className="h-4 w-4" />
        {uploading ? labels.uploading : labels.payButton}
      </button>
      {error && <p className="mt-3 text-center text-sm text-red-400">{error}</p>}
      {message && <p className="mt-3 text-center text-sm text-sage">{message}</p>}
    </div>
  );
}