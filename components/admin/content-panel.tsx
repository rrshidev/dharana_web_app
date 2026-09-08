"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminAsana, AdminSequence } from "@/lib/api/admin";

interface ContentLabels {
  tabAsanas: string;
  tabSequences: string;
  search: string;
  empty: string;
  addAsana: string;
  asanaName: string;
  category: string;
  difficulty: string;
  effects: string;
  video: string;
  photo: string;
  upload: string;
  uploading: string;
  delete: string;
  cancel: string;
  save: string;
  saving: string;
  description: string;
  edit: string;
  addingSequence: string;
  addSequence: string;
  sequenceName: string;
  section: string;
  free: string;
  premium: string;
  confirmDelete: string;
  actionFailed: string;
  uploadFailed: string;
  fieldsRequired: string;
  openVideo: string;
  fromApp: string;
}

export function ContentPanel({
  asanas,
  sequences,
  categories,
  labels,
}: {
  asanas: AdminAsana[];
  sequences: AdminSequence[];
  categories: { id: string; name: string }[];
  labels: ContentLabels;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"asanas" | "sequences">("asanas");
  const [busy, setBusy] = useState<string | null>(null);
  const [q, setQ] = useState("");

  // Асаны
  const [showAddAsana, setShowAddAsana] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editDesc, setEditDesc] = useState<{ name: string; description: string } | null>(null);

  // Комплексы
  const [showAddSeq, setShowAddSeq] = useState(false);
  const [seqName, setSeqName] = useState("");
  const [seqSection, setSeqSection] = useState<"free" | "premium">("premium");
  const [seqFile, setSeqFile] = useState<File | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return asanas;
    return asanas.filter(
      (a) =>
        a.name.toLowerCase().includes(s) ||
        a.category_id.toLowerCase().includes(s) ||
        a.effects.some((e) => e.toLowerCase().includes(s)),
    );
  }, [asanas, q]);

  async function run(path: string, method: string, body: unknown): Promise<boolean> {
    try {
      const res = await fetch(path, {
        method,
        headers: body instanceof FormData ? {} : { "Content-Type": "application/json" },
        body: body instanceof FormData ? body : JSON.stringify(body),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        alert(data.error === "invalid_body" ? labels.fieldsRequired : labels.actionFailed);
        return false;
      }
      router.refresh();
      return true;
    } catch {
      alert(labels.actionFailed);
      return false;
    }
  }

  const uploadAsanaMedia = async (name: string, kind: "photo" | "video", file: File) => {
    if (!file) return;
    setBusy(`upload-${kind}-${name}`);
    const form = new FormData();
    form.append("file", file);
    const ok = await run(`/api/admin/asanas/${encodeURIComponent(name)}/${kind}`, "POST", form);
    if (!ok) alert(labels.uploadFailed);
    setBusy(null);
  };

  const uploadSequence = async () => {
    if (!seqName.trim() || !seqFile) {
      alert(labels.fieldsRequired);
      return;
    }
    setBusy("upload-seq");
    const form = new FormData();
    form.append("file", seqFile);
    form.append("name", seqName.trim());
    form.append("section", seqSection);
    const ok = await run("/api/admin/sequences/video", "POST", form);
    if (ok) {
      setSeqName("");
      setSeqFile(null);
      setShowAddSeq(false);
    }
    setBusy(null);
  };

  const addAsana = async () => {
    if (!newName.trim() || !newCategory.trim()) {
      alert(labels.fieldsRequired);
      return;
    }
    setBusy("add-asana");
    const ok = await run("/api/admin/asanas", "POST", {
      name: newName.trim(),
      category_id: newCategory.trim(),
      description: newDescription.trim() || "—",
    });
    if (ok) {
      setNewName("");
      setNewCategory("");
      setNewDescription("");
      setShowAddAsana(false);
    }
    setBusy(null);
  };

  const saveDesc = async () => {
    if (!editDesc) return;
    setBusy("edit-desc");
    const ok = await run(`/api/admin/asanas/${encodeURIComponent(editDesc.name)}/info`, "PUT", {
      description: editDesc.description.trim() || "—",
    });
    if (ok) setEditDesc(null);
    setBusy(null);
  };

  const tabBtnCls = (active: boolean) =>
    `rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
      active ? "bg-accent text-night" : "border border-night-line text-muted hover:text-ink"
    }`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1.5">
          <button type="button" className={tabBtnCls(tab === "asanas")} onClick={() => setTab("asanas")}>
            {labels.tabAsanas}
          </button>
          <button
            type="button"
            className={tabBtnCls(tab === "sequences")}
            onClick={() => setTab("sequences")}
          >
            {labels.tabSequences}
          </button>
        </div>
        <button
          type="button"
          onClick={() => (tab === "asanas" ? setShowAddAsana(true) : setShowAddSeq(true))}
          className="rounded-xl bg-accent px-3.5 py-2 text-sm font-semibold text-night"
        >
          {tab === "asanas" ? labels.addAsana : labels.addSequence}
        </button>
      </div>

      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={labels.search}
        className="w-full max-w-sm rounded-xl border border-night-line bg-night/60 px-4 py-2 text-sm outline-none placeholder:text-muted/60 focus:border-accent/60"
      />

      {tab === "asanas" ? (
        asanas.length === 0 ? (
          <p className="rounded-2xl border border-night-line p-8 text-center text-sm text-muted">
            {labels.empty}
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {filtered.map((a) => (
              <li
                key={a.name}
                className="flex gap-3 rounded-2xl border border-night-line bg-night/40 p-3"
              >
                {a.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.image_url}
                    alt={a.name}
                    className="h-16 w-16 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white/5 text-lg font-bold text-muted">
                    {a.name[0]?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="font-medium">{a.name}</p>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-muted">
                      {categories.find((c) => c.id === a.category_id)?.name ?? a.category_id}
                    </span>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-muted">
                      {labels.difficulty}: {a.difficulty}
                    </span>
                    {a.has_video && (
                      <span className="rounded-full bg-sage/15 px-2 py-0.5 text-[10px] font-semibold text-sage">
                        {labels.video}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-muted">
                    {a.effects.join(", ") || "—"}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <LabeledUpload
                      label={labels.photo}
                      busy={busy === `upload-photo-${a.name}`}
                      disabled={busy !== null}
                      onFile={(f) => uploadAsanaMedia(a.name, "photo", f)}
                    />
                    <LabeledUpload
                      label={labels.video}
                      busy={busy === `upload-video-${a.name}`}
                      disabled={busy !== null}
                      onFile={(f) => uploadAsanaMedia(a.name, "video", f)}
                    />
                    <button
                      type="button"
                      disabled={busy !== null}
                      onClick={() =>
                        setEditDesc({ name: a.name, description: a.effects.join(", ") })
                      }
                      className="rounded-lg border border-night-line px-2.5 py-1 text-xs font-semibold text-muted hover:text-ink disabled:opacity-50"
                    >
                      {labels.edit}
                    </button>
                    <button
                      type="button"
                      disabled={busy !== null}
                      onClick={async () => {
                        if (!confirm(labels.confirmDelete.replace("%name%", a.name))) return;
                        setBusy(`del-asana-${a.name}`);
                        await run(`/api/admin/asanas/${encodeURIComponent(a.name)}`, "DELETE", null);
                        setBusy(null);
                      }}
                      className="rounded-lg bg-[#e85d5d]/15 px-2.5 py-1 text-xs font-semibold text-[#e85d5d] hover:bg-[#e85d5d]/25 disabled:opacity-50"
                    >
                      {labels.delete}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : sequences.length === 0 ? (
        <p className="rounded-2xl border border-night-line p-8 text-center text-sm text-muted">
          {labels.empty}
        </p>
      ) : (
        <ul className="divide-y divide-night-line rounded-2xl border border-night-line bg-night/40">
          {sequences.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-muted">
                  {s.is_premium ? labels.premium : labels.free} · {labels.fromApp}
                </p>
              </div>
              <a
                href={s.video_url || "#"}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-night-line px-3 py-1.5 text-xs font-semibold text-muted hover:text-ink"
              >
                {labels.openVideo}
              </a>
              <button
                type="button"
                disabled={busy !== null}
                onClick={async () => {
                  if (!confirm(labels.confirmDelete.replace("%name%", s.name))) return;
                  setBusy(`del-seq-${s.id}`);
                  await run(`/api/admin/sequences/${s.id}`, "DELETE", null);
                  setBusy(null);
                }}
                className="rounded-lg bg-[#e85d5d]/15 px-3 py-1.5 text-xs font-semibold text-[#e85d5d] hover:bg-[#e85d5d]/25 disabled:opacity-50"
              >
                {labels.delete}
              </button>
            </li>
          ))}
        </ul>
      )}

      {showAddAsana && (
        <Modal title={labels.addAsana} onClose={() => setShowAddAsana(false)}>
          <div className="space-y-3">
            <Field label={labels.asanaName}>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded-xl border border-night-line bg-night/60 px-3 py-2 text-sm outline-none placeholder:text-muted/60 focus:border-accent/60"
              />
            </Field>
            <Field label={labels.category}>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full rounded-xl border border-night-line bg-night/60 px-3 py-2 text-sm outline-none placeholder:text-muted/60 focus:border-accent/60"
              >
                <option value="">—</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={labels.description}>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-night-line bg-night/60 px-3 py-2 text-sm outline-none placeholder:text-muted/60 focus:border-accent/60"
              />
            </Field>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddAsana(false)}
                className="rounded-xl border border-night-line px-4 py-2 text-sm font-semibold text-muted hover:text-ink"
              >
                {labels.cancel}
              </button>
              <button
                type="button"
                disabled={busy === "add-asana"}
                onClick={addAsana}
                className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-night disabled:opacity-50"
              >
                {busy === "add-asana" ? labels.saving : labels.save}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {editDesc && (
        <Modal title={editDesc.name} onClose={() => setEditDesc(null)}>
          <div className="space-y-3">
            <Field label={labels.description}>
              <textarea
                value={editDesc.description}
                onChange={(e) => setEditDesc({ ...editDesc, description: e.target.value })}
                rows={4}
                className="w-full rounded-xl border border-night-line bg-night/60 px-3 py-2 text-sm outline-none placeholder:text-muted/60 focus:border-accent/60"
              />
            </Field>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditDesc(null)}
                className="rounded-xl border border-night-line px-4 py-2 text-sm font-semibold text-muted hover:text-ink"
              >
                {labels.cancel}
              </button>
              <button
                type="button"
                disabled={busy === "edit-desc"}
                onClick={saveDesc}
                className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-night disabled:opacity-50"
              >
                {busy === "edit-desc" ? labels.saving : labels.save}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showAddSeq && (
        <Modal title={labels.addSequence} onClose={() => setShowAddSeq(false)}>
          <div className="space-y-3">
            <Field label={labels.sequenceName}>
              <input
                value={seqName}
                onChange={(e) => setSeqName(e.target.value)}
                className="w-full rounded-xl border border-night-line bg-night/60 px-3 py-2 text-sm outline-none placeholder:text-muted/60 focus:border-accent/60"
              />
            </Field>
            <Field label={labels.section}>
              <select
                value={seqSection}
                onChange={(e) => setSeqSection(e.target.value as "free" | "premium")}
                className="w-full rounded-xl border border-night-line bg-night/60 px-3 py-2 text-sm outline-none placeholder:text-muted/60 focus:border-accent/60"
              >
                <option value="premium">{labels.premium}</option>
                <option value="free">{labels.free}</option>
              </select>
            </Field>
            <Field label={labels.video}>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setSeqFile(e.target.files?.[0] ?? null)}
                className="text-sm"
              />
            </Field>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddSeq(false)}
                className="rounded-xl border border-night-line px-4 py-2 text-sm font-semibold text-muted hover:text-ink"
              >
                {labels.cancel}
              </button>
              <button
                type="button"
                disabled={busy === "upload-seq"}
                onClick={uploadSequence}
                className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-night disabled:opacity-50"
              >
                {busy === "upload-seq" ? labels.uploading : labels.upload}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-night-line bg-[#1a1b2e] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-muted hover:text-ink"
            aria-label={title}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-muted">{label}</span>
      {children}
    </label>
  );
}

function LabeledUpload({
  label,
  busy,
  disabled,
  onFile,
}: {
  label: string;
  busy: boolean;
  disabled: boolean;
  onFile: (file: File) => void;
}) {
  return (
    <label
      className={`cursor-pointer rounded-lg border border-night-line px-2.5 py-1 text-xs font-semibold text-muted transition-colors hover:text-ink ${
        disabled && !busy ? "opacity-50" : ""
      }`}
    >
      {busy ? "…" : label}
      <input
        type="file"
        accept={label.toLowerCase().includes("video") ? "video/*" : "image/*"}
        className="hidden"
        disabled={disabled || busy}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.currentTarget.value = "";
        }}
      />
    </label>
  );
}