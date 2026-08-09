"use client";

import { useState } from "react";

import { LockKeyhole, Mail, Sparkles, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthMode = "signIn" | "signUp";

interface AuthScreenProps {
  onSubmit: (email: string, password: string, mode: AuthMode) => Promise<void>;
  loading: boolean;
  error: string | null;
  message: string | null;
}

export function AuthScreen({ onSubmit, loading, error, message }: AuthScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<AuthMode>("signIn");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email.trim() || !password || submitting) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(email.trim(), password, mode);
    } finally {
      setSubmitting(false);
    }
  };

  const isBusy = submitting || loading;

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.14),transparent_34%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)/0.28))] text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,hsl(var(--border)/0.2)_1px,transparent_1px),linear-gradient(225deg,hsl(var(--border)/0.2)_1px,transparent_1px)] bg-size-[32px_32px] opacity-40" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-dvh max-w-md items-center px-4 py-10">
        <Card className="w-full border-border/70 bg-card/90 shadow-2xl shadow-black/15 backdrop-blur">
          <CardHeader className="space-y-4">
            <Badge variant="secondary" className="w-fit gap-1.5 rounded-full px-3 py-1.5">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Supabase auth
            </Badge>

            <div className="space-y-2">
              <CardTitle className="text-3xl font-semibold tracking-tight text-card-foreground">
                Sign in to your finances
              </CardTitle>
              <CardDescription className="text-sm leading-6 text-muted-foreground">
                Keep every expense, investment, and balance isolated to your own Supabase account.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 rounded-full border border-border bg-background p-1">
              <Button
                type="button"
                variant={mode === "signIn" ? "default" : "ghost"}
                onClick={() => setMode("signIn")}
                className="h-10 rounded-full"
              >
                Sign in
              </Button>
              <Button
                type="button"
                variant={mode === "signUp" ? "default" : "ghost"}
                onClick={() => setMode("signUp")}
                className="h-10 rounded-full"
              >
                Create account
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block space-y-1.5">
                <Label htmlFor="auth-email" className="text-xs font-medium text-muted-foreground">
                  Email
                </Label>
                <div className="flex h-11 items-center gap-2 rounded-md border border-border bg-background px-3 transition-colors focus-within:border-primary">
                  <Mail size={16} className="text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                  />
                </div>
              </label>

              <label className="block space-y-1.5">
                <Label
                  htmlFor="auth-password"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Password
                </Label>
                <div className="flex h-11 items-center gap-2 rounded-md border border-border bg-background px-3 transition-colors focus-within:border-primary">
                  <LockKeyhole size={16} className="text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="auth-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={6}
                    autoComplete={mode === "signIn" ? "current-password" : "new-password"}
                    placeholder="••••••••"
                    className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                  />
                </div>
              </label>

              <Button type="submit" disabled={isBusy} className="h-11 w-full">
                {isBusy ? (
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="h-4 w-4 animate-pulse" aria-hidden="true" />
                    Working...
                  </span>
                ) : mode === "signIn" ? (
                  "Sign in"
                ) : (
                  "Create account"
                )}
              </Button>
            </form>

            {(error || message) && (
              <div
                className={`rounded-md border p-3 text-sm ${
                  error
                    ? "border-destructive/40 bg-destructive/10 text-foreground"
                    : "border-border bg-muted text-card-foreground"
                }`}
                aria-live="polite"
              >
                {error ?? message}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default AuthScreen;
