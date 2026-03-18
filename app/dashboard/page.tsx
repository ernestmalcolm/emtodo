"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSupabaseAuth } from "@/lib/supabase-provider";
import { DashboardHeader } from "@/components/dashboard/Header";
import { Matrix } from "@/components/dashboard/Matrix";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useSupabaseAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-navy-900 text-sm text-text-secondary">
        <p>Preparing your Eisenhower Matrix...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-navy-900 via-[#0b1227] to-[#050814] px-4 py-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col">
        <DashboardHeader />
        <Matrix />
      </div>
    </main>
  );
}

