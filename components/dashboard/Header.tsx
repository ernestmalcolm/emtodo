"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase-client";
import { useSupabaseAuth } from "@/lib/supabase-provider";

export function DashboardHeader() {
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.email ||
    null;

  const handleSignOut = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.replace("/");
  };

  return (
    <header className="mb-8 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-quadrant-doNow to-quadrant-schedule shadow-soft" />
          <span className="text-xs font-semibold tracking-[0.25em] text-text-secondary">
            EM TO DO
          </span>
        </div>
        <h1 className="mt-4 text-xl font-semibold">What deserves your attention today?</h1>
        {displayName && (
          <p className="mt-1 text-xs text-text-secondary">
            Signed in as <span className="text-text-primary/90">{displayName}</span>
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/analysis"
          className="rounded-full border border-[#2c3656] px-4 py-1.5 text-xs text-text-secondary transition hover:border-quadrant-schedule hover:text-text-primary"
        >
          Analysis
        </Link>
        <button
          onClick={handleSignOut}
          className="rounded-full border border-[#2c3656] px-4 py-1.5 text-xs text-text-secondary transition hover:border-quadrant-eliminate hover:text-text-primary"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}

