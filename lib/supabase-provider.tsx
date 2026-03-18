"use client";

import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseClient } from "./supabase-client";

type SupabaseContextValue = {
  user: User | null;
  loading: boolean;
};

const SupabaseContext = createContext<SupabaseContextValue | undefined>(undefined);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <SupabaseContext.Provider
      value={{
        user,
        loading
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabaseAuth() {
  const ctx = useContext(SupabaseContext);
  if (!ctx) throw new Error("useSupabaseAuth must be used within SupabaseProvider");
  return ctx;
}

