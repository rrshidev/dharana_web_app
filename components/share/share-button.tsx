"use client";

import { useCallback, useState } from "react";
import { ShareIcon } from "@/components/icons";
import { Toast } from "@/components/ui/toast";

export interface ShareData {
  title: string;
  text: string;
  url: string;
}

export interface ShareLabels {
  share: string;
  copied: string;
}

/**
 * Share button. Uses the native Web Share API when available and falls back
 * to copying the URL to the clipboard (with a short "copied" state).
 */
export function ShareButton({
  data,
  labels,
  size = "sm",
}: {
  data: ShareData;
  labels: ShareLabels;
  size?: "sm" | "lg";
}) {
  const [copied, setCopied] = useState(false);

  const share = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch (err) {
        // пользователь отменил системную шторку — никакой обратной связи
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(data.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard может быть недоступен без secure-контекста — молча гасим
    }
  }, [data]);

  const pad = size === "lg" ? "h-11 w-11" : "h-9 w-9";
  const icon = size === "lg" ? "h-5 w-5" : "h-4 w-4";

  return (
    <>
      <button
        type="button"
        onClick={share}
        aria-label={copied ? labels.copied : labels.share}
        title={copied ? labels.copied : labels.share}
        className={`flex ${pad} shrink-0 items-center justify-center rounded-full bg-night/70 text-ink/70 backdrop-blur transition-all duration-200 hover:text-ink`}
      >
        <ShareIcon className={`${icon} ${copied ? "text-accent" : ""}`} />
      </button>
      {copied && <Toast>{labels.copied}</Toast>}
    </>
  );
}