import { StatCard } from "@/components/ui/stat-card";
import { AppShell } from "@/components/layout/app-shell";
import { CardContainer } from "@/components/ui/card-container";
import { totalCollectionValue } from "@/lib/helpers/collection";
import { getAllItems } from "@/lib/supabase/queries";

function IconBox() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function IconValue() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function IconTrophy() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export default async function DashboardPage() {
  const items = await getAllItems();
  const totalValue = totalCollectionValue(items);
  const rareCount = items.filter((item) => item.rarity !== "Common").length;
  const recentItems = items.slice(0, 3);

  return (
    <AppShell title="Dashboard">
      <section aria-label="Collection stats" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Items" value={items.length} icon={<IconBox />} />
        <StatCard label="Total Value" value={Math.round(totalValue)} prefix="€" icon={<IconValue />} />
        <StatCard label="Rare Items" value={rareCount} icon={<IconTrophy />} />
        <StatCard label="Recent Additions" value={recentItems.length} icon={<IconClock />} />
      </section>

      {recentItems.length > 0 && (
        <CardContainer className="mt-8">
          <h2 className="text-xl font-black">Recent Items</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {recentItems.map((item) => (
              <article
                key={item.id}
                className="rounded-lg border-[3px] border-vault-border bg-white p-3 shadow-vault"
              >
                <p className="text-sm font-bold text-vault-primary">{item.category}</p>
                <h3 className="font-black text-vault-text">{item.name}</h3>
                <p className="text-sm text-vault-muted">{item.purchase_place}</p>
              </article>
            ))}
          </div>
        </CardContainer>
      )}
    </AppShell>
  );
}
