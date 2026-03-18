import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-navy-900 via-navy-900 to-[#050814] text-text-primary">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-quadrant-doNow to-quadrant-schedule shadow-soft" />
            <span className="text-sm font-semibold tracking-[0.2em] text-text-secondary">
              EM TO DO
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/login"
              className="rounded-full border border-[#2c3656] px-4 py-1.5 text-text-secondary transition hover:border-quadrant-schedule hover:text-text-primary"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-quadrant-schedule px-4 py-1.5 font-medium text-navy-900 shadow-soft transition hover:brightness-110"
            >
              Get started
            </Link>
          </div>
        </header>

        <section className="mt-20 grid gap-16 md:grid-cols-[1.3fr_1fr] md:items-center">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-quadrant-schedule">
              EISENHOWER MATRIX TO DO
            </p>
            <h1 className="text-balance text-4xl font-semibold leading-tight md:text-5xl">
              Focus on what{" "}
              <span className="bg-gradient-to-r from-quadrant-schedule to-quadrant-doNow bg-clip-text text-transparent">
                truly matters.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-text-secondary md:text-base">
              EM To Do is a calm task manager built around the Eisenhower Matrix. It helps
              you pause, reflect, and choose the work that genuinely deserves your
              attention instead of reacting to whatever feels urgent.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="rounded-full bg-quadrant-doNow px-6 py-2.5 text-sm font-medium text-navy-900 shadow-soft transition hover:brightness-110"
              >
                Get started
              </Link>
              <Link
                href="/login"
                className="text-sm text-text-secondary underline-offset-4 hover:text-text-primary hover:underline"
              >
                Already using EM To Do?
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-[#222b46] bg-gradient-to-b from-[#11182f] to-[#0b132b] p-5 shadow-soft">
            <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-text-secondary">
              <span>Eisenhower Matrix</span>
              <span>Psychology of prioritization</span>
            </div>
            <div className="grid gap-3 rounded-xl bg-navy-900/40 p-3 ring-1 ring-[#222b46]">
              <div className="grid grid-cols-2 gap-3">
                <QuadrantPreview
                  title="Do Now"
                  description="Urgent & important."
                  color="border-quadrant-doNow"
                />
                <QuadrantPreview
                  title="Schedule"
                  description="Important, not urgent."
                  color="border-quadrant-schedule"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <QuadrantPreview
                  title="Delegate"
                  description="Urgent, less important."
                  color="border-quadrant-delegate"
                />
                <QuadrantPreview
                  title="Eliminate"
                  description="Low value, low impact."
                  color="border-quadrant-eliminate"
                />
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-text-secondary">
              Most to-do apps help you collect tasks. EM To Do helps you decide which
              tasks deserve your time, using urgency and importance as gentle prompts for
              reflection.
            </p>
          </div>
        </section>

        <section className="mt-16 grid gap-10 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4 text-sm text-text-secondary">
            <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-quadrant-schedule">
              The concept
            </h2>
            <p>
              Real productivity is not about doing more tasks. It is about doing the right
              tasks — the ones that move your life and work in a meaningful direction.
            </p>
            <p>
              EM To Do creates a quiet space where you can see your work laid out in four
              simple decisions: do now, schedule, delegate, eliminate. Each task becomes
              a moment to ask, “Does this truly deserve my attention?”
            </p>
          </div>
          <div className="space-y-3 rounded-2xl border border-[#222b46] bg-[#10172f] p-4 text-xs text-text-secondary">
            <p className="font-medium text-text-primary">
              “What is important is seldom urgent, and what is urgent is seldom
              important.”
            </p>
            <p className="text-[11px] text-text-secondary/80">
              The Eisenhower Matrix translates this idea into a gentle framework for daily
              choices. EM To Do brings that framework into a calm, intimate interface.
            </p>
          </div>
        </section>

        <footer className="mt-16 flex items-center justify-between border-t border-[#1b2340] pt-6 text-[11px] text-text-secondary">
          <span>© {new Date().getFullYear()} EM To Do.</span>
          <span>A quiet space for thoughtful work.</span>
        </footer>
      </div>
    </main>
  );
}

function QuadrantPreview(props: {
  title: string;
  description: string;
  color: string;
}) {
  const { title, description, color } = props;
  return (
    <div className="rounded-xl bg-[#141b33] p-3">
      <div className={`mb-2 h-1.5 w-10 rounded-full ${color}`} />
      <p className="text-xs font-medium text-text-primary">{title}</p>
      <p className="mt-1 text-[11px] text-text-secondary">{description}</p>
    </div>
  );
}

