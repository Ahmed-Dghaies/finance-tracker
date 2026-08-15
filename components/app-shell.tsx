import { useEffect, useState, type ReactNode } from "react";

import { usePathname, useRouter } from "next/navigation";

import { Navigation } from "@/components/navigation";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";

import type { Session } from "@supabase/supabase-js";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(Boolean(hasSupabaseConfig));

  useEffect(() => {
    if (!hasSupabaseConfig || !supabase) {
      return;
    }

    const supabaseClient = supabase;
    let active = true;

    const syncSession = async () => {
      const { data } = await supabaseClient.auth.getSession();

      if (!active) {
        return;
      }

      setSession(data.session);
      setIsCheckingSession(false);

      if (!data.session && pathname !== "/") {
        router.replace("/");
      }
    };

    void syncSession();

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event: string, nextSession: Session | null) => {
      if (!active) {
        return;
      }

      setSession(nextSession);
      setIsCheckingSession(false);

      if (!nextSession && pathname !== "/") {
        router.replace("/");
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (isCheckingSession) {
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

  const handleSignOut = async () => {
    if (!supabase) {
      return;
    }

    const supabaseClient = supabase;

    await supabaseClient.auth.signOut();
    setSession(null);
    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {session && (
        <Navigation userEmail={session.user.email ?? undefined} onSignOut={handleSignOut} />
      )}
      {children}
    </div>
  );
}
