import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { AppShell } from "@/components/layout/app-shell";
import { CardContainer } from "@/components/ui/card-container";
import { categoryColor, categoryLabel, formatCurrency } from "@/lib/helpers/collection";
import { getItemById } from "@/lib/supabase/queries";
import { ItemDetailActions } from "@/components/forms/item-detail-actions";

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getItemById(id);

  if (!item) {
    notFound();
  }

  return (
    <AppShell title={item.name} subtitle="Detailed collectible profile with value and provenance.">
      <CardContainer className="grid gap-5 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-vault border-[3px] border-vault-border bg-vault-soft">
          {item.image_url ? (
            <Image src={item.image_url} alt={item.name} fill className="object-cover" />
          ) : null}
        </div>
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge className={categoryColor[item.category]}>{categoryLabel[item.category]}</Badge>
            <Badge className="bg-white text-vault-text">{item.rarity}</Badge>
          </div>
          <p className="text-3xl font-black text-vault-primary">{formatCurrency(item.price)}</p>
          <p className="mt-3 text-sm text-vault-muted">{item.notes}</p>

          <div className="mt-5 grid gap-2 text-sm">
            <p>
              <strong>Purchased:</strong> {item.purchase_date}
            </p>
            <p>
              <strong>Place:</strong> {item.purchase_place}
            </p>
            {item.category === "card" && item.details && "player" in item.details && (
              <>
                <p>
                  <strong>Player:</strong> {item.details.player}
                </p>
                <p>
                  <strong>Team:</strong> {item.details.team}
                </p>
                <p>
                  <strong>Set:</strong> {item.details.collection}
                </p>
                <p>
                  <strong>Serial:</strong> {item.details.serial_number}
                </p>
              </>
            )}
            {item.category === "coin" && item.details && "material" in item.details && (
              <>
                <p>
                  <strong>Country:</strong> {item.details.country}
                </p>
                <p>
                  <strong>Material:</strong> {item.details.material}
                </p>
                <p>
                  <strong>Year:</strong> {item.details.year}
                </p>
              </>
            )}
            {item.category === "banknote" && item.details && "currency" in item.details && (
              <>
                <p>
                  <strong>Country:</strong> {item.details.country}
                </p>
                <p>
                  <strong>Currency:</strong> {item.details.currency}
                </p>
                <p>
                  <strong>Year:</strong> {item.details.year}
                </p>
              </>
            )}
          </div>
          <ItemDetailActions item={item} />
        </div>
      </CardContainer>
    </AppShell>
  );
}
