import { StatCard } from "@/components/ui/stat-card";
import { AppShell } from "@/components/layout/app-shell";
import { CollectionGrid } from "@/components/cards/collection-grid";
import { totalCollectionValue } from "@/lib/helpers/collection";
import { getAllItems } from "@/lib/supabase/queries";
import { ItemCategory } from "@/lib/types";

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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; minPrice?: string; maxPrice?: string }>;
}) {
  const params = await searchParams;
  const search = params.search ?? "";
  const category = params.category as ItemCategory | undefined;
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;

  const items = await getAllItems({ search, category, minPrice, maxPrice });
  const allItems = await getAllItems();
  const totalValue = totalCollectionValue(allItems);
  const rareCount = allItems.filter((item) => item.rarity !== "Common").length;

  return (
    <AppShell title="Dashboard">
      <section aria-label="Collection stats" className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Items" value={allItems.length} icon={<IconBox />} />
        <StatCard label="Total Value" value={Math.round(totalValue)} prefix="€" icon={<IconValue />} />
        <StatCard label="Rare Items" value={rareCount} icon={<IconTrophy />} />
      </section>

      <div className="mt-8">
        <CollectionGrid
          items={items}
          initialSearch={search}
          initialCategory={params.category ?? "all"}
          initialMinPrice={params.minPrice ?? ""}
          initialMaxPrice={params.maxPrice ?? ""}
        />
      </div>
    </AppShell>
  );
}
