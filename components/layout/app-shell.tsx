import Link from "next/link";
import { NavBar } from "@/components/layout/nav-bar";

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
          <span className="inline-flex w-fit rounded-full border-[3px] border-vault-border bg-vault-accent px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-vault-text">
            Collector Mode
          </span>
        </div>
        <NavBar />
      </header>
      {children}
    </div>
  );
}
