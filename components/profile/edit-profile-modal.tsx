"use client";

import { useCallback, useState } from "react";

export interface EditProfileLabels {
  editTitle: string;
  nameLabel: string;
  usernameLabel: string;
  bioLabel: string;
  save: string;
  saving: string;
  nameRequired: string;
  nameTooLong: string;
  updateFailed: string;
  cancel: string;
}

export function EditProfileModal({
  labels,
  initialName,
  initialUsername,
  initialBio,
  open,
  onClose,
}: {
  labels: EditProfileLabels;
  initialName: string;
  initialUsername: string;
  initialBio: string;
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [username, setUsername] = useState(initialUsername);
  const [bio, setBio] = useState(initialBio);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const save = useCallback(async () => {
    if (loading) return;
    setError(null);
    if (!name.trim()) return setError(labels.nameRequired);
    if (name.trim().length > 60) return setError(labels.nameTooLong);

    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), username: username.trim(), bio: bio.trim() }),
      });
      if (!res.ok) {
        setError(labels.updateFailed);
        setLoading(false);
        return;
      }
      window.location.reload();
    } catch {
      setError(labels.updateFailed);
      setLoading(false);
    }
  }, [loading, name, username, bio, labels]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={labels.editTitle}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl border border-night-line bg-night p-6 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">{labels.editTitle}</h2>

        <label className="mt-5 block">
          <span className="mb-1 block text-sm font-medium text-muted">{labels.nameLabel}</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-night-line bg-night-soft px-3 py-2 text-ink outline-none transition-colors focus:border-accent"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1 block text-sm font-medium text-muted">{labels.usernameLabel}</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border border-night-line bg-night-soft px-3 py-2 text-ink outline-none transition-colors focus:border-accent"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1 block text-sm font-medium text-muted">{labels.bioLabel}</span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-lg border border-night-line bg-night-soft px-3 py-2 text-ink outline-none transition-colors focus:border-accent"
          />
        </label>

        {error && (
          <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm text-muted transition-colors hover:text-ink"
          >
            {labels.cancel}
          </button>
          <button
            type="button"
            onClick={save}
            disabled={loading}
            className="rounded-full bg-accent px-6 py-2 text-sm font-semibold text-night transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? labels.saving : labels.save}
          </button>
        </div>
      </div>
    </div>
  );
}