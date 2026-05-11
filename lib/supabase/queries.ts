import {
  BanknoteDetails,
  CardDetails,
  CoinDetails,
  CreateItemInput,
  Item,
  ItemCategory,
  ItemFilters,
  ItemWithDetails,
  UpdateItemInput,
} from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

function toAppError(error: unknown, fallback: string): Error {
  if (error instanceof Error) return error;
  if (error && typeof error === "object" && "message" in error) {
    const supabaseErr = error as { message?: string; code?: string };
    const details = [supabaseErr.code, supabaseErr.message].filter(Boolean).join(": ");
    return new Error(details || fallback);
  }
  return new Error(fallback);
}

const buildRarity = (price: number): ItemWithDetails["rarity"] => {
  if (price >= 700) return "Legendary";
  if (price >= 300) return "Rare";
  return "Common";
};

const attachDetails = (
  item: Item,
  cardMap: Map<string, CardDetails>,
  coinMap: Map<string, CoinDetails>,
  banknoteMap: Map<string, BanknoteDetails>,
): ItemWithDetails => ({
  ...item,
  rarity: buildRarity(item.price),
  details:
    item.category === "card"
      ? (cardMap.get(item.id) ?? null)
      : item.category === "coin"
        ? (coinMap.get(item.id) ?? null)
        : (banknoteMap.get(item.id) ?? null),
});

const loadDetailsMaps = async () => {
  const supabase = await createClient();
  const [{ data: cards, error: cardsError }, { data: coins, error: coinsError }, { data: banknotes, error: banknotesError }] =
    await Promise.all([
      supabase.from("card_details").select("*"),
      supabase.from("coin_details").select("*"),
      supabase.from("banknote_details").select("*"),
    ]);

  if (cardsError) throw toAppError(cardsError, "Failed to load card details.");
  if (coinsError) throw toAppError(coinsError, "Failed to load coin details.");
  if (banknotesError) throw toAppError(banknotesError, "Failed to load banknote details.");

  return {
    cardMap: new Map((cards ?? []).map((entry) => [entry.item_id, entry as CardDetails])),
    coinMap: new Map((coins ?? []).map((entry) => [entry.item_id, entry as CoinDetails])),
    banknoteMap: new Map((banknotes ?? []).map((entry) => [entry.item_id, entry as BanknoteDetails])),
  };
};

export async function getAllItems(filters?: ItemFilters): Promise<ItemWithDetails[]> {
  const supabase = await createClient();
  let query = supabase.from("items").select("*").order("created_at", { ascending: false });

  if (filters?.search) query = query.ilike("name", `%${filters.search}%`);
  if (filters?.category) query = query.eq("category", filters.category);
  if (typeof filters?.minPrice === "number") query = query.gte("price", filters.minPrice);
  if (typeof filters?.maxPrice === "number") query = query.lte("price", filters.maxPrice);

  const { data, error } = await query;

  if (error) throw toAppError(error, "Failed to fetch items.");
  const { cardMap, coinMap, banknoteMap } = await loadDetailsMaps();
  return (data ?? []).map((entry) => attachDetails(entry as Item, cardMap, coinMap, banknoteMap));
}

export async function getItemById(id: string): Promise<ItemWithDetails | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("items").select("*").eq("id", id).maybeSingle();
  if (error) throw toAppError(error, "Failed to fetch item.");
  if (!data) return null;

  const { cardMap, coinMap, banknoteMap } = await loadDetailsMaps();
  return attachDetails(data as Item, cardMap, coinMap, banknoteMap);
}

export async function createItem(input: CreateItemInput): Promise<ItemWithDetails> {
  const supabase = await createClient();
  const { data: item, error: itemError } = await supabase
    .from("items")
    .insert({
      name: input.name,
      category: input.category,
      image_url: input.image_url,
      price: input.price,
      purchase_date: input.purchase_date,
      purchase_place: input.purchase_place,
      notes: input.notes,
    })
    .select("*")
    .single();

  if (itemError) throw toAppError(itemError, "Failed to create item.");

  const detailPayload = { ...input.details, item_id: item.id };
  if (input.category === "card") {
    const { error } = await supabase.from("card_details").insert(detailPayload);
    if (error) throw toAppError(error, "Failed to create card details.");
  } else if (input.category === "coin") {
    const { error } = await supabase.from("coin_details").insert(detailPayload);
    if (error) throw toAppError(error, "Failed to create coin details.");
  } else {
    const { error } = await supabase.from("banknote_details").insert(detailPayload);
    if (error) throw toAppError(error, "Failed to create banknote details.");
  }

  const fresh = await getItemById(item.id);
  if (!fresh) throw new Error("Failed to retrieve created item.");
  return fresh;
}

export async function updateItem(id: string, category: ItemCategory, input: UpdateItemInput): Promise<ItemWithDetails> {
  const supabase = await createClient();
  const { error: itemError } = await supabase
    .from("items")
    .update({
      name: input.name,
      image_url: input.image_url,
      price: input.price,
      purchase_date: input.purchase_date,
      purchase_place: input.purchase_place,
      notes: input.notes,
    })
    .eq("id", id);

  if (itemError) throw toAppError(itemError, "Failed to update item.");

  const detailsPayload = { ...input.details };
  if (category === "card") {
    const { error } = await supabase.from("card_details").update(detailsPayload).eq("item_id", id);
    if (error) throw toAppError(error, "Failed to update card details.");
  } else if (category === "coin") {
    const { error } = await supabase.from("coin_details").update(detailsPayload).eq("item_id", id);
    if (error) throw toAppError(error, "Failed to update coin details.");
  } else {
    const { error } = await supabase.from("banknote_details").update(detailsPayload).eq("item_id", id);
    if (error) throw toAppError(error, "Failed to update banknote details.");
  }

  const fresh = await getItemById(id);
  if (!fresh) throw new Error("Failed to retrieve updated item.");
  return fresh;
}

export async function deleteItem(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: item, error: itemLookupError } = await supabase
    .from("items")
    .select("category")
    .eq("id", id)
    .maybeSingle();

  if (itemLookupError) throw toAppError(itemLookupError, "Failed to look up item.");
  if (!item) return;

  if (item.category === "card") {
    const { error } = await supabase.from("card_details").delete().eq("item_id", id);
    if (error) throw toAppError(error, "Failed to delete card details.");
  } else if (item.category === "coin") {
    const { error } = await supabase.from("coin_details").delete().eq("item_id", id);
    if (error) throw toAppError(error, "Failed to delete coin details.");
  } else {
    const { error } = await supabase.from("banknote_details").delete().eq("item_id", id);
    if (error) throw toAppError(error, "Failed to delete banknote details.");
  }

  const { error: deleteError } = await supabase.from("items").delete().eq("id", id);
  if (deleteError) throw toAppError(deleteError, "Failed to delete item.");
}
