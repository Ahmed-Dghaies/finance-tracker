import { useEffect, useState, type ReactNode } from "react";

import { useRouter } from "next/navigation";

import { hasSupabaseConfig, supabase } from "@/lib/supabase";

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!hasSupabaseConfig || !supabase) {
      router.replace("/");
      return;
    }

    const supabaseClient = supabase;
    let active = true;

    const checkSession = async () => {
      const { data } = await supabaseClient.auth.getSession();

      if (!active) {
        return;
      }

      if (!data.session) {
        router.replace("/");
        return;
      }

      setIsAuthorized(true);
      setIsChecking(false);
    };

    void checkSession();

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (!active) {
        return;
      }

      if (!session) {
        setIsAuthorized(false);
        setIsChecking(true);
        router.replace("/");
        return;
      }

      setIsAuthorized(true);
      setIsChecking(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (!isAuthorized || isChecking) {
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

  return <>{children}</>;
}
