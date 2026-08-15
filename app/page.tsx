import { useEffect, useState } from "react";

import { AuthScreen } from "@/components/auth-screen";
import { DashboardPage } from "@/components/dashboard-page";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";

import type { Session } from "@supabase/supabase-js";

export default function HomePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(() => hasSupabaseConfig());
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const supabaseClient = supabase;

    let active = true;

    const initializeSession = async () => {
      const { data } = await supabaseClient.auth.getSession();

      if (!active) {
        return;
      }

      if (data.session) {
        setAuthLoading(true);
        if (!active) {
          return;
        }
        setSession(data.session);
      } else {
        setSession(null);
      }

      if (active) {
        setAuthLoading(false);
      }
    };

    void initializeSession();

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!active) {
        return;
      }

      setAuthError(null);
      setAuthMessage(null);

      if (nextSession) {
        setAuthLoading(true);
        setSession(nextSession);
        if (!active) {
          return;
        }
        setAuthLoading(false);
      } else {
        setSession(null);
        setAuthLoading(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthSubmit = async (email: string, password: string, mode: "signIn" | "signUp") => {
    if (!supabase) {
      return;
    }

    const supabaseClient = supabase;

    setAuthError(null);
    setAuthMessage(null);

    if (mode === "signIn") {
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthError(error.message);
      }
      return;
    }

    const { data, error } = await supabaseClient.auth.signUp({ email, password });
    if (error) {
      setAuthError(error.message);
      return;
    }

    if (!data.session) {
      setAuthMessage("Check your email to confirm your account, then sign in.");
    }
  };

  if (!hasSupabaseConfig) {
    return (
      <main className="min-h-dvh bg-background text-foreground">
        <div className="mx-auto flex min-h-dvh max-w-md items-center px-4 py-10">
          <div className="w-full rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or
            NEXT_PUBLIC_SUPABASE_ANON_KEY) to use authentication.
          </div>
        </div>
      </main>
    );
  }

  if (authLoading) {
    return (
      <main className="min-h-dvh bg-background text-foreground">
        <div className="mx-auto flex min-h-dvh max-w-md items-center px-4 py-10">
          <div className="w-full rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Loading session...
          </div>
        </div>
      </main>
    );
  }

  if (session) {
    return <DashboardPage />;
  }

  return (
    <AuthScreen
      onSubmit={handleAuthSubmit}
      loading={authLoading}
      error={authError}
      message={authMessage}
    />
  );
}
