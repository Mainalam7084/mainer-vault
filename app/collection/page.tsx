import { CollectionGrid } from "@/components/cards/collection-grid";
import { AppShell } from "@/components/layout/app-shell";
import { getAllItems } from "@/lib/supabase/queries";
import { ItemCategory } from "@/lib/types";

export default async function CollectionPage({
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

  return (
    <AppShell title="Your Collection">
      <CollectionGrid
        items={items}
        initialSearch={search}
        initialCategory={params.category ?? "all"}
        initialMinPrice={params.minPrice ?? ""}
        initialMaxPrice={params.maxPrice ?? ""}
      />
    </AppShell>
  );
}
