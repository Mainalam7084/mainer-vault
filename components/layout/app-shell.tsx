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
      className="group inline-flex items-center gap-3 rounded-vault border-[3px] border-vault-border bg-vault-soft px-4 py-2 text-sm font-bold text-vault-text shadow-vault transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-vault-hover"
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={name as string}
          width={32}
          height={32}
          className="rounded-lg border-[2px] border-vault-border object-cover"
        />
      ) : (
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border-[2px] border-vault-border bg-vault-primary text-sm font-black text-white">
          {(firstName as string).charAt(0).toUpperCase()}
        </span>
      )}
      <span className="flex flex-col leading-tight">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-vault-muted">Profile</span>
        <span className="font-black text-vault-text">{firstName}</span>
      </span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-vault-muted transition-transform duration-200 group-hover:translate-x-0.5"
        aria-hidden="true"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
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
            <UserBadge />
          </div>
        </div>
        <NavBar />
      </header>
      {children}
    </div>
  );
}
