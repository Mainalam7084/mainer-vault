import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { categoryColor, categoryLabel, formatCurrency } from "@/lib/helpers/collection";
import { ItemWithDetails } from "@/lib/types";

export function CollectibleCard({ item }: { item: ItemWithDetails }) {
  const rare = item.rarity !== "Common";

  return (
    <Link
      href={`/items/${item.id}`}
      className={`group block rounded-vault border-[3px] p-3 transition-all duration-200 hover:-translate-y-1 hover:scale-[1.03] ${
        rare
          ? "border-vault-accent bg-vault-card shadow-gold hover:shadow-gold"
          : "border-vault-border bg-vault-card shadow-vault hover:shadow-vault-hover"
      }`}
    >
      {(item.image_url || item.image_url_2) && (
        <div
          className={`mb-3 overflow-hidden rounded-lg border-[3px] border-vault-border bg-vault-soft ${item.image_url && item.image_url_2 ? "grid grid-cols-2" : ""}`}
        >
          {item.image_url && (
            <Image
              src={item.image_url}
              alt={`${item.name} front`}
              width={0}
              height={0}
              sizes="(max-width: 768px) 50vw, 20vw"
              className="h-auto w-full transition duration-300 group-hover:scale-105"
            />
          )}
          {item.image_url_2 && (
            <Image
              src={item.image_url_2}
              alt={`${item.name} back`}
              width={0}
              height={0}
              sizes="(max-width: 768px) 50vw, 20vw"
              className="h-auto w-full transition duration-300 group-hover:scale-105"
            />
          )}
        </div>
      )}
      <div className="mb-2 flex items-center justify-between">
        <Badge className={categoryColor[item.category]}>{categoryLabel[item.category]}</Badge>
        <Badge className="bg-white text-vault-text">{item.rarity}</Badge>
      </div>
      <h3 className="line-clamp-1 text-lg font-black text-vault-text">{item.name}</h3>
      <p className="mt-1 text-sm text-vault-muted">{item.purchase_place}</p>
      <p className="mt-3 text-xl font-black text-vault-primary">{formatCurrency(item.price)}</p>
    </Link>
  );
}
