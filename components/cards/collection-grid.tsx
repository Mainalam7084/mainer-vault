"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CollectibleCard } from "@/components/cards/collectible-card";
import { CardContainer } from "@/components/ui/card-container";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ItemCategory, ItemWithDetails } from "@/lib/types";

export function CollectionGrid({
  items,
  initialSearch,
  initialCategory,
  initialMinPrice,
  initialMaxPrice,
}: {
  items: ItemWithDetails[];
  initialSearch: string;
  initialCategory: string;
  initialMinPrice: string;
  initialMaxPrice: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category && category !== "all") params.set("category", category);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      router.replace(`${pathname}?${params.toString()}`);
    }, 400);

    return () => clearTimeout(timer);
  }, [category, maxPrice, minPrice, pathname, router, search]);

  return (
    <>
      <CardContainer className="mb-5">
        <fieldset className="grid gap-3 md:grid-cols-4">
          <legend className="sr-only">Filter collection</legend>
          <label className="space-y-1">
            <span className="sr-only">Search by name</span>
            <Input
              placeholder="Search by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search by name"
            />
          </label>
          <label className="space-y-1">
            <span className="sr-only">Filter by category</span>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value as ItemCategory | "all")}
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              <option value="card">Football Cards</option>
              <option value="coin">Coins</option>
              <option value="banknote">Banknotes</option>
            </Select>
          </label>
          <label className="space-y-1">
            <span className="sr-only">Minimum price</span>
            <Input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min price (€)"
              aria-label="Minimum price"
              min={0}
            />
          </label>
          <label className="space-y-1">
            <span className="sr-only">Maximum price</span>
            <Input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max price (€)"
              aria-label="Maximum price"
              min={0}
            />
          </label>
        </fieldset>
      </CardContainer>

      {items.length === 0 ? (
        <CardContainer>
          <h3 className="text-xl font-black">No items found</h3>
          <p className="mt-1 text-sm text-vault-muted">Try changing filters or add a new collectible.</p>
        </CardContainer>
      ) : (
        <section
          aria-label={`${items.length} item${items.length === 1 ? "" : "s"} in collection`}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          {items.map((item) => (
            <CollectibleCard key={item.id} item={item} />
          ))}
        </section>
      )}
    </>
  );
}
