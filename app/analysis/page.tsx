"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";
import { useSupabaseAuth } from "@/lib/supabase-provider";
import type { Task, QuadrantId } from "@/components/dashboard/TaskTypes";

type Metrics = {
  byQuadrant: Record<QuadrantId, number>;
  dueToday: number;
  reviewSoon: number;
  completed7d: number;
  attentionCue: QuadrantId;
};

const accent: Record<QuadrantId, string> = {
  do_now: "#FF6B6B",
  schedule: "#5BC0BE",
  delegate: "#F2C94C",
  eliminate: "#6C7A89"
};

function toISODateLocal(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseYMD(ymd: string) {
  const [y, m, d] = ymd.split("-").map((x) => Number(x));
  return new Date(y, m - 1, d);
}

export default function AnalysisPage() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      const supabase = getSupabaseClient();
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      setTasks((data ?? []) as Task[]);
    };

    void fetchTasks();
  }, [user]);

  const metrics: Metrics | null = useMemo(() => {
    if (!tasks) return null;

    const byQuadrant: Record<QuadrantId, number> = {
      do_now: 0,
      schedule: 0,
      delegate: 0,
      eliminate: 0
    };

    for (const t of tasks) {
      byQuadrant[t.quadrant] += 1;
    }

    const today = toISODateLocal(new Date());
    const now = new Date();
    const soon = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const dueToday = tasks.filter(
      (t) => !t.completed && t.due_date && t.due_date === today
    ).length;

    const reviewSoon = tasks.filter((t) => {
      if (t.completed) return false;
      if (!t.review_at) return false;
      const d = new Date(t.review_at);
      if (Number.isNaN(d.getTime())) return false;
      return d >= now && d <= soon;
    }).length;

    const completed7d = tasks.filter((t) => {
      if (!t.completed || !t.completed_at) return false;
      const d = new Date(t.completed_at);
      if (Number.isNaN(d.getTime())) return false;
      const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return d >= cutoff;
    }).length;

    const sorted = (Object.keys(byQuadrant) as QuadrantId[]).sort(
      (a, b) => byQuadrant[b] - byQuadrant[a]
    );
    const attentionCue = sorted[0] ?? "do_now";

    return { byQuadrant, dueToday, reviewSoon, completed7d, attentionCue };
  }, [tasks]);

  if (authLoading || !user) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-navy-900 via-[#0b1227] to-[#050814] px-4 py-6">
        <div className="mx-auto max-w-4xl text-sm text-text-secondary">Loading your insights…</div>
      </main>
    );
  }

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.email ||
    "You";

  const cue: QuadrantId = metrics?.attentionCue ?? "do_now";

  return (
    <main className="min-h-screen bg-gradient-to-b from-navy-900 via-[#0b1227] to-[#050814] px-4 py-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div
                className="h-7 w-7 rounded-lg shadow-soft"
                style={{
                  background: `linear-gradient(135deg, ${accent[cue]} 0%, #5BC0BE 100%)`
                }}
              />
              <span className="text-xs font-semibold tracking-[0.25em] text-text-secondary">
                EM TO DO
              </span>
            </div>
            <h1 className="mt-4 text-xl font-semibold">A small analysis</h1>
            <p className="mt-1 text-xs text-text-secondary">
              A calm look at your work, so you can choose your next attention on purpose.
            </p>
            <p className="mt-2 text-[11px] text-text-secondary">
              Signed in as{" "}
              <span className="text-text-primary/90">{displayName}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-full border border-[#2c3656] px-4 py-2 text-xs text-text-secondary transition hover:border-quadrant-schedule hover:text-text-primary"
            >
              Back to Matrix
            </Link>
            <div className="rounded-full border border-[#2c3656] bg-navy-900/30 px-4 py-2 text-xs text-text-secondary">
              Analysis
            </div>
          </div>
        </div>

        {!metrics ? (
          <div className="text-sm text-text-secondary">Calculating…</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <Tile
              title="Quadrant balance"
              subtitle="Where your attention is currently gathering."
            >
              <div className="mt-3 space-y-2">
                {(
                  [
                    ["do_now", "DO NOW"],
                    ["schedule", "SCHEDULE"],
                    ["delegate", "DELEGATE"],
                    ["eliminate", "ELIMINATE"]
                  ] as [QuadrantId, string][]
                ).map(([id, label]) => {
                  const value = metrics.byQuadrant[id];
                  const total = tasks.length || 1;
                  const pct = Math.round((value / total) * 100);
                  return (
                    <div key={id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: accent[id] }}
                        />
                        <span className="text-xs text-text-secondary">{label}</span>
                      </div>
                      <div className="text-xs text-text-primary/90">
                        {value} <span className="text-text-secondary/70">({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Tile>

            <Tile
              title="Today’s pressure"
              subtitle="Urgency that is asking for movement."
            >
              <div className="mt-3 space-y-2 text-sm">
                <MetricRow label="Due today" value={metrics.dueToday} />
                <MetricRow label="Review soon (48h)" value={metrics.reviewSoon} />
              </div>
              <p className="mt-3 text-xs text-text-secondary">
                If you only do one thing: consider{" "}
                <span className="font-semibold text-text-primary">
                  {attentionLabel(metrics.attentionCue)}
                </span>
                .
              </p>
            </Tile>

            <Tile
              title="Reflection momentum"
              subtitle="Evidence that completion is happening."
            >
              <div className="mt-3 flex items-baseline justify-between gap-4">
                <div>
                  <div className="text-3xl font-semibold text-text-primary">
                    {metrics.completed7d}
                  </div>
                  <div className="text-xs text-text-secondary">completed in the last 7 days</div>
                </div>
                <div className="w-28">
                  <div className="flex h-2 items-center gap-1">
                    {Array.from({ length: 10 }).map((_, i) => {
                      const filled = metrics.completed7d / 10 > i;
                      return (
                        <div
                          // eslint-disable-next-line react/no-array-index-key
                          key={i}
                          className="h-2 w-full rounded-full"
                          style={{
                            backgroundColor: filled ? "#253155" : "#142043",
                            opacity: filled ? 1 : 0.6
                          }}
                        />
                      );
                    })}
                  </div>
                  <p className="mt-2 text-[11px] text-text-secondary/80">
                    Not a score. Just a signal.
                  </p>
                </div>
              </div>
            </Tile>

            <Tile
              title="A tiny suggestion"
              subtitle="Nothing to optimize. Just a gentle cue."
            >
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                {gentleCue(metrics.attentionCue)}
              </p>
            </Tile>
          </div>
        )}
      </div>
    </main>
  );
}

function attentionLabel(id: QuadrantId) {
  if (id === "do_now") return "DO NOW";
  if (id === "schedule") return "SCHEDULE";
  if (id === "delegate") return "DELEGATE";
  return "ELIMINATE";
}

function gentleCue(id: QuadrantId) {
  if (id === "do_now")
    return "Your matrix has momentum in DO NOW. Choose the one task that would make the next hour feel lighter.";
  if (id === "schedule")
    return "SCHEDULE is carrying your long-term work. Protect one meaningful block—small consistency counts here.";
  if (id === "delegate")
    return "DELEGATE is waiting. If you can hand it off, your attention can return to what only you can do.";
  return "ELIMINATE is a permission slip. Consider removing or postponing the smallest low-value task.";
}

function Tile({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#222b46] bg-[#10172f]/70 p-5 shadow-soft">
      <header>
        <div className="text-xs font-semibold tracking-[0.22em] text-text-secondary">{title}</div>
        <div className="mt-1 text-xs text-text-secondary/90">{subtitle}</div>
      </header>
      {children}
    </section>
  );
}

function MetricRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#1c2641] bg-[#0c1226] px-3 py-2">
      <span className="text-xs text-text-secondary">{label}</span>
      <span className="text-xs font-semibold text-text-primary">{value}</span>
    </div>
  );
}

