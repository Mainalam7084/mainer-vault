import { Item, ItemCategory } from "@/lib/types";

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    amount,
  );

export const categoryLabel: Record<ItemCategory, string> = {
  card: "Football Card",
  banknote: "Banknote",
  coin: "Coin",
};

export const categoryColor: Record<ItemCategory, string> = {
  card: "bg-vault-primary text-white",
  banknote: "bg-vault-secondary text-vault-text",
  coin: "bg-vault-accent text-vault-text",
};

export const totalCollectionValue = (items: Item[]) =>
  items.reduce((sum, item) => sum + item.price, 0);
