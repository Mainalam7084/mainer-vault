"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

function IconGoogle() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function IconVault() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      <circle cx="12" cy="16" r="1" />
    </svg>
  );
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError("Failed to start sign-in. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-vault-bg px-4">
      <div className="w-full max-w-md">
        {/* Logo & branding */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-vault border-[3px] border-vault-border bg-vault-primary text-white shadow-vault">
            <IconVault />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-vault-text">
            Mainer Vault
          </h1>
          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.15em] text-vault-muted">
            Your Personal Collector Hub
          </p>
        </div>

        {/* Login card */}
        <div className="rounded-vault border-[3px] border-vault-border bg-vault-card p-8 shadow-vault">
          <div className="mb-6">
            <span className="inline-flex rounded-full border-[3px] border-vault-border bg-vault-accent px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-vault-text">
              Collector Mode
            </span>
            <h2 className="mt-3 text-2xl font-black text-vault-text">
              Sign in to your vault
            </h2>
            <p className="mt-1 text-sm text-vault-muted">
              Your collection is private and tied to your account.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border-[3px] border-vault-danger bg-red-50 px-4 py-3 text-sm font-semibold text-vault-danger">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border-[3px] border-vault-border bg-white px-5 py-3.5 text-sm font-extrabold text-vault-text shadow-vault transition-all duration-200 hover:-translate-y-0.5 hover:shadow-vault-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-[3px] border-vault-border border-t-vault-primary" />
            ) : (
              <IconGoogle />
            )}
            {loading ? "Redirecting to Google…" : "Continue with Google"}
          </button>

          <p className="mt-5 text-center text-xs text-vault-muted">
            Sign in once — your cards, coins, and banknotes are always here.
          </p>
        </div>

        {/* Bottom tagline */}
        <p className="mt-6 text-center text-xs font-semibold uppercase tracking-widest text-vault-muted">
          Football Cards · Coins · Banknotes
        </p>
      </div>
    </div>
  );
}
