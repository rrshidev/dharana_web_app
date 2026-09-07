"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  AdminUserActivity,
  AdminUserDetail,
} from "@/lib/api/admin";
import { ChartCard } from "@/components/charts/chart-card";
import { AreaTrendChart } from "@/components/charts/area-trend-chart";
import { PeriodSelector } from "@/components/charts/period-selector";
import { CHART } from "@/components/charts/colors";

interface UserDetailLabels {
  banned: string;
  deleted: string;
  premium: string;
  free: string;
  ban: string;
  unban: string;
  delete: string;
  restore: string;
  givePremium: string;
  removePremium: string;
  giving: string;
  infoTitle: string;
  email: string;
  telegram: string;
  createdAt: string;
  lastPractice: string;
  streakCurrent: string;
  streakLongest: string;
  subscription: string;
  subType: string;
  subEnd: string;
  totalMinutes: string;
  daysUnit: string;
  activityTitle: string;
  sessionsTitle: string;
  sessionsEmpty: string;
  messageTitle: string;
  messagePlaceholder: string;
  channelTg: string;
  channelApp: string;
  channelBoth: string;
  send: string;
  sending: string;
  actionFailed: string;
  messageFailed: string;
  minutesUnit: string;
}

function fmtDate(iso: string | null | undefined, locale: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function UserDetailPanel({
  locale,
  days,
  user,
  subscription,
  recentSessions,
  activity,
  labels,
}: {
  locale: string;
  days: number;
  user: AdminUserDetail["user"];
  subscription: AdminUserDetail["subscription"];
  recentSessions: AdminUserDetail["recent_sessions"];
  activity: AdminUserActivity | null;
  labels: UserDetailLabels;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [channel, setChannel] = useState("both");
  const [premiumDays, setPremiumDays] = useState("30");

  async function runAction(kind: string, url: string, body: unknown) {
    if (busy) return;
    setBusy(kind);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "fail");
      router.refresh();
    } catch {
      alert(labels.actionFailed);
    } finally {
      setBusy(null);
    }
  }

  const name = user.name || user.email || (user.username ? `@${user.username}` : "#" + user.id);
  const isPremium = subscription.is_premium;
  const flagCls = (on: boolean, tone: string) =>
    on ? tone : "border border-night-line text-muted";

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-night-line bg-night/60 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold">{name}</h1>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${flagCls(isPremium, "bg-sage/15 text-sage")}`}>
                {isPremium ? labels.premium : labels.free}
              </span>
              {user.is_banned && (
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${flagCls(true, "bg-[#e85d5d]/15 text-[#e85d5d]")}`}>
                  {labels.banned}
                </span>
              )}
              {user.is_deleted && (
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${flagCls(true, "bg-[#e85d5d]/15 text-[#e85d5d]")}`}>
                  {labels.deleted}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted">
              {[user.email, user.telegram_id ? `${labels.telegram}: ${user.telegram_id}` : null]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div>
              <p className="text-xl font-semibold">{Math.round(user.total_practice_minutes)}</p>
              <p className="text-[11px] text-muted">{labels.totalMinutes}</p>
            </div>
            <div>
              <p className="text-xl font-semibold">{user.total_practice_days}</p>
              <p className="text-[11px] text-muted">{labels.daysUnit}</p>
            </div>
            <div>
              <p className="text-xl font-semibold">{user.current_streak}</p>
              <p className="text-[11px] text-muted">{labels.streakCurrent}</p>
            </div>
            <div>
              <p className="text-xl font-semibold">{user.longest_streak}</p>
              <p className="text-[11px] text-muted">{labels.streakLongest}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <ActionBtn
            busy={busy === "ban"}
            tone={user.is_banned ? "neutral" : "danger"}
            onClick={() =>
              runAction("ban", `/api/admin/users/${user.id}/ban`, { banned: !user.is_banned })
            }
          >
            {user.is_banned ? labels.unban : labels.ban}
          </ActionBtn>
          <ActionBtn
            busy={busy === "del"}
            tone={user.is_deleted ? "neutral" : "danger"}
            onClick={() =>
              runAction("del", `/api/admin/users/${user.id}/delete`, { deleted: !user.is_deleted })
            }
          >
            {user.is_deleted ? labels.restore : labels.delete}
          </ActionBtn>
          <div className="flex items-center gap-1.5">
            <ActionBtn
              busy={busy === "prem"}
              tone="sage"
              onClick={() =>
                runAction("prem", `/api/admin/users/${user.id}/premium`, {
                  is_premium: !isPremium,
                  days: Number(premiumDays) || 30,
                })
              }
            >
              {isPremium ? labels.removePremium : labels.givePremium}
            </ActionBtn>
            <input
              type="number"
              min={1}
              max={365}
              value={premiumDays}
              onChange={(e) => setPremiumDays(e.target.value)}
              className="w-16 rounded-lg border border-night-line bg-night/60 px-2 py-1.5 text-center text-xs outline-none focus:border-accent/60"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ChartCard title={labels.infoTitle}>
          <dl className="space-y-2 text-sm">
            <Row k={labels.email} v={user.email ?? "—"} />
            <Row k={labels.telegram} v={user.telegram_id ? String(user.telegram_id) : "—"} />
            <Row k={labels.createdAt} v={fmtDate(user.created_at, locale)} />
            <Row k={labels.lastPractice} v={fmtDate(user.last_practice_at, locale)} />
          </dl>
        </ChartCard>

        <ChartCard title={labels.subscription}>
          <dl className="space-y-2 text-sm">
            <Row
              k={labels.subType}
              v={subscription.subscription_type ?? (isPremium ? labels.premium : labels.free)}
            />
            <Row
              k={labels.subEnd}
              v={subscription.subscription_end ? fmtDate(subscription.subscription_end, locale) : "—"}
            />
          </dl>
        </ChartCard>
      </div>

      <ChartCard title={labels.activityTitle}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-xs text-muted">
            {labels.totalMinutes} · {days} {labels.daysUnit}
          </p>
          <PeriodSelector
            days={days}
            chips={[7, 30, 90].map((v) => ({
              value: v,
              label: `${v}`,
            }))}
          />
        </div>
        <AreaTrendChart
          data={(activity?.days ?? []).map((label, i) => ({
            label,
            value: activity?.minutes?.[i] ?? 0,
          }))}
          color={CHART.accent}
          height={160}
          metric={labels.minutesUnit}
        />
      </ChartCard>

      <ChartCard title={labels.messageTitle}>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {[
              { v: "tg", l: labels.channelTg },
              { v: "app", l: labels.channelApp },
              { v: "both", l: labels.channelBoth },
            ].map((c) => (
              <button
                key={c.v}
                type="button"
                onClick={() => setChannel(c.v)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  channel === c.v
                    ? "bg-accent text-night"
                    : "border border-night-line text-muted hover:text-ink"
                }`}
              >
                {c.l}
              </button>
            ))}
          </div>
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder={labels.messagePlaceholder}
            rows={3}
            className="w-full rounded-xl border border-night-line bg-night/60 px-3 py-2 text-sm outline-none placeholder:text-muted/60 focus:border-accent/60"
          />
          <div className="flex justify-end">
            <ActionBtn
              busy={busy === "msg"}
              disabled={!msg.trim()}
              tone="neutral"
              onClick={async () => {
                setBusy("msg");
                try {
                  const res = await fetch(`/api/admin/users/${user.id}/message`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ channel: channel === "tg" ? "telegram" : channel, message: msg }),
                  });
                  if (!res.ok) throw new Error("fail");
                  setMsg("");
                  router.refresh();
                } catch {
                  alert(labels.messageFailed);
                } finally {
                  setBusy(null);
                }
              }}
            >
              {labels.send}
            </ActionBtn>
          </div>
        </div>
      </ChartCard>

      <ChartCard title={labels.sessionsTitle}>
        {recentSessions.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">{labels.sessionsEmpty}</p>
        ) : (
          <ul className="divide-y divide-night-line">
            {recentSessions.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-x-2 py-2.5 text-sm">
                <span className="font-medium">{s.asanas_practiced.join(", ") || "—"}</span>
                <span className="text-muted">
                  · {Math.round(s.total_duration_seconds / 60)} {labels.minutesUnit}
                </span>
                <span className="ml-auto text-xs text-muted">
                  {fmtDate(s.completed_at ?? s.started_at, locale)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </ChartCard>
    </div>
  );
}

function ActionBtn({
  children,
  busy,
  disabled,
  onClick,
  tone,
}: {
  children: React.ReactNode;
  busy?: boolean;
  disabled?: boolean;
  onClick: () => void;
  tone: "neutral" | "danger" | "sage";
}) {
  const cls =
    tone === "danger"
      ? "bg-[#e85d5d]/15 text-[#e85d5d] hover:bg-[#e85d5d]/25"
      : tone === "sage"
        ? "bg-sage/15 text-sage hover:bg-sage/25"
        : "border border-night-line text-muted hover:text-ink";
  return (
    <button
      type="button"
      disabled={busy || disabled}
      onClick={onClick}
      className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${cls}`}
    >
      {busy ? "…" : children}
    </button>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted">{k}</dt>
      <dd className="text-right font-medium">{v}</dd>
    </div>
  );
}