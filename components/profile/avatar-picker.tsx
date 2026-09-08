"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserAvatar } from "@/lib/api/user";

export interface AvatarLabels {
  title: string;
  uploadBtn: string;
  uploading: string;
  setOk: string;
  error: string;
  limit: string;
}

export function ProfileAvatar({
  avatarUrl,
  name,
  initials,
  avatars,
  labels,
}: {
  avatarUrl: string | null;
  name: string;
  initials: string;
  avatars: UserAvatar[];
  labels: AvatarLabels;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/profile/avatars/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error === "avatar_limit" ? labels.limit : labels.error);
      } else {
        router.refresh();
      }
    } catch {
      setError(labels.error);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (avatarId: number) => {
    setError(null);
    try {
      const res = await fetch(`/api/profile/avatars/${avatarId}`, { method: "DELETE" });
      if (!res.ok) setError(labels.error);
      else router.refresh();
    } catch {
      setError(labels.error);
    }
  };

  return (
    <>
      <div className="relative">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={labels.title}
            className="h-24 w-24 rounded-full object-cover ring-2 ring-white/10"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-accent/70 to-accent/40 text-4xl font-bold text-night">
            {initials}
          </div>
        )}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={labels.title}
          className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-night shadow-md transition-opacity hover:opacity-90"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d="M12 15.2a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4z" />
            <path d="M9 2L7.17 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2h-3.17L15 2H9zm3 15a5 5 0 110-10 5 5 0 010 10z" />
          </svg>
        </button>
        {avatars.length > 1 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-night border border-night-line text-[10px] font-semibold text-muted">
            {avatars.length}
          </span>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl border border-night-line bg-[#1a1b2e] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold">{labels.title}</h3>
              <button
                type="button"
                onClick={() => { setOpen(false); setError(null); }}
                className="rounded-lg px-2 py-1 text-muted hover:text-ink"
                aria-label={labels.title}
              >
                ✕
              </button>
            </div>

            {avatars.length > 0 && (
              <ul className="mb-4 flex gap-3 overflow-x-auto pb-1">
                {avatars.map((a) => (
                  <li key={a.id} className="relative shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.url}
                      alt={labels.title}
                      className={`h-[72px] w-[72px] rounded-xl object-cover ${
                        a.is_primary ? "ring-2 ring-accent" : "ring-1 ring-night-line"
                      }`}
                    />
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => remove(a.id)}
                      aria-label={labels.title}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#e85d5d] text-white disabled:opacity-50"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
                e.currentTarget.value = "";
              }}
            />

            <button
              type="button"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-night-line bg-transparent px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-white/[0.03]"
            >
              {busy ? "…" : labels.uploadBtn}
            </button>

            {error && (
              <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}