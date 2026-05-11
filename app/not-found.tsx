import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-screen max-w-xl place-content-center px-4 text-center">
      <div className="rounded-vault border-[3px] border-vault-border bg-vault-card p-8 shadow-vault">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-vault-primary">Mainer</p>
        <h1 className="mt-2 text-3xl font-black text-vault-text">Item Not Found</h1>
        <p className="mt-2 text-sm text-vault-muted">
          This collectible is not in the vault, or maybe it has been moved.
        </p>
        <Link
          href="/collection"
          className="mt-5 inline-flex rounded-full border-[3px] border-vault-border bg-vault-accent px-4 py-2 font-bold text-vault-text"
        >
          Return to Collection
        </Link>
      </div>
    </main>
  );
}
