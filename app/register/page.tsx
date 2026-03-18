"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TextInput, PasswordInput, Button } from "@mantine/core";
import { getSupabaseClient } from "@/lib/supabase-client";
import { useSupabaseAuth } from "@/lib/supabase-provider";

export default function RegisterPage() {
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) {
    router.replace("/dashboard");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // If Supabase auto-creates a session when email confirmations are disabled,
      // we still want the flow to continue via the login screen.
      await supabase.auth.signOut();
      router.replace("/login");
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const inputStyles = {
    label: { color: "#AAB6CF", fontSize: 12, marginBottom: 6 },
    input: {
      width: "100%",
      minHeight: 44,
      padding: "10px 14px",
      backgroundColor: "#0B132B",
      borderColor: "#2c3656",
      color: "#EAEFF7",
      borderRadius: 10,
      fontSize: 14,
    },
    inputPlaceholder: { color: "#6b7a99" },
  };

  const passwordStyles = {
    ...inputStyles,
    input: {
      ...inputStyles.input,
      backgroundColor: "#0B132B",
    },
    innerInput: {
      width: "100%",
      minHeight: 44,
      padding: "10px 14px",
      backgroundColor: "#0B132B",
      color: "#EAEFF7",
      border: "none",
      fontSize: 14,
    },
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy-900 px-4 py-10">
      <div className="w-full max-w-[420px] rounded-2xl border border-[#222b46] bg-[#11182f] p-10 shadow-soft ring-1 ring-[#1a2340]/50">
        <header className="mb-10 space-y-3 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-navy-800/80 px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-text-secondary">
            <span className="h-2 w-2 rounded-full bg-quadrant-schedule shadow-[0_0_8px_rgba(91,192,190,0.4)]" />
            <span>EM TO DO</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            Create your space
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed max-w-[320px] mx-auto">
            Set up a calm Eisenhower Matrix to hold your tasks with intention.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          <TextInput
            label="Name"
            placeholder="How should EM To Do greet you?"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            size="md"
            classNames={{ root: "w-full" }}
            styles={inputStyles}
            required
          />
          <TextInput
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            size="md"
            classNames={{ root: "w-full" }}
            styles={inputStyles}
            required
          />
          <PasswordInput
            label="Password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            size="md"
            classNames={{ root: "w-full auth-password-input" }}
            styles={passwordStyles}
            required
          />

          {error && (
            <p className="text-sm text-quadrant-doNow/90 rounded-lg bg-quadrant-doNow/10 px-3 py-2" aria-live="polite">
              {error}
            </p>
          )}

          <Button
            type="submit"
            fullWidth
            loading={loading}
            size="sm"
            variant="filled"
            className="mt-1 rounded-lg font-medium normal-case"
            styles={{
              root: {
                width: "100%",
                backgroundColor: "#5BC0BE",
                color: "#0B132B",
                minHeight: 40,
                border: "none"
              }
            }}
          >
            Create account
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="text-text-primary font-medium underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

