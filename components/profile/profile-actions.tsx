"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/settings";
import { EditIcon, ChevronRightIcon, LogoutIcon } from "@/components/icons";
import {
  EditProfileModal,
  type EditProfileLabels,
} from "@/components/profile/edit-profile-modal";

export interface ProfileActionsLabels {
  edit: string;
  logout: string;
  editProfile: EditProfileLabels;
}

export function ProfileActions({
  locale,
  labels,
  initialName,
  initialUsername,
  initialBio,
}: {
  locale: Locale;
  labels: ProfileActionsLabels;
  initialName: string;
  initialUsername: string;
  initialBio: string;
}) {
  const [editing, setEditing] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.assign(`/${locale}`);
    }
  };

  return (
    <div className="divide-y divide-night-line overflow-hidden rounded-2xl border border-night-line bg-night/60">
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-night-soft/60"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
          <EditIcon className="h-5 w-5" />
        </span>
        <span className="flex-1 text-sm font-medium">{labels.edit}</span>
        <ChevronRightIcon className="h-4 w-4 text-muted/60" />
      </button>

      <button
        type="button"
        onClick={() => {
          void handleLogout();
        }}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-night-soft/60"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
          <LogoutIcon className="h-5 w-5" />
        </span>
        <span className="flex-1 text-sm font-medium text-red-400">{labels.logout}</span>
      </button>

      <EditProfileModal
        labels={labels.editProfile}
        initialName={initialName}
        initialUsername={initialUsername}
        initialBio={initialBio}
        open={editing}
        onClose={() => setEditing(false)}
      />
    </div>
  );
}