import Link from "next/link";
import Image from "next/image";
import { NavBar } from "@/components/layout/nav-bar";
import { createClient } from "@/lib/supabase/server";

async function UserBadge() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const name =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "Collector";
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const firstName = (name as string).split(" ")[0];

  return (
    <Link
      href="/profile"
      className="inline-flex items-center gap-2 rounded-full border-[3px] border-vault-border bg-vault-soft px-3 py-1.5 text-xs font-bold text-vault-text shadow-vault transition-all duration-200 hover:-translate-y-0.5 hover:shadow-vault-hover"
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={name as string}
          width={20}
          height={20}
          className="rounded-full border-[2px] border-vault-border"
        />
      ) : (
        <span className="flex h-5 w-5 items-center justify-center rounded-full border-[2px] border-vault-border bg-vault-primary text-[9px] font-black text-white">
          {(firstName as string).charAt(0).toUpperCase()}
        </span>
      )}
      <span>{firstName}</span>
    </Link>
  );
}

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 md:px-8 md:py-8">
      <header className="mb-8 rounded-vault border-[3px] border-vault-border bg-vault-card p-5 shadow-vault">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="text-xs font-bold uppercase tracking-[0.2em] text-vault-secondary hover:text-vault-primary transition-colors"
            >
              Mainer Vault
            </Link>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">{title}</h1>
            {subtitle && <p className="mt-0.5 text-sm text-vault-muted">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex w-fit rounded-full border-[3px] border-vault-border bg-vault-accent px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-vault-text">
              Collector Mode
            </span>
            <UserBadge />
          </div>
        </div>
        <NavBar />
      </header>
      {children}
    </div>
  );
}
