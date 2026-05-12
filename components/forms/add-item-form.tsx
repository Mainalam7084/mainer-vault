"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CardContainer } from "@/components/ui/card-container";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { uploadImage } from "@/lib/supabase/storage";
import { CreateItemInput, ItemCategory } from "@/lib/types";

const DRAFT_KEY = "mainer_add_item_draft";

interface DraftFields {
  category: ItemCategory;
  name: string;
  price: string;
  purchase_date: string;
  purchase_place: string;
  notes: string;
  player: string;
  team: string;
  collection: string;
  serial_number: string;
  type: string;
  condition: string;
  country: string;
  year: string;
  material: string;
  currency: string;
}

const DEFAULT_FIELDS: DraftFields = {
  category: "card",
  name: "",
  price: "",
  purchase_date: "",
  purchase_place: "",
  notes: "",
  player: "",
  team: "",
  collection: "",
  serial_number: "",
  type: "base",
  condition: "",
  country: "",
  year: "",
  material: "",
  currency: "",
};

function loadDraft(): DraftFields {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return DEFAULT_FIELDS;
    return { ...DEFAULT_FIELDS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_FIELDS;
  }
}

function UploadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

export function AddItemForm() {
  const router = useRouter();
  const [fields, setFields] = useState<DraftFields>(DEFAULT_FIELDS);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile2, setImageFile2] = useState<File | null>(null);
  const [imagePreview2, setImagePreview2] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    setFields(loadDraft());
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(fields));
    } catch {
      // storage quota exceeded — ignore
    }
  }, [fields]);

  function set(key: keyof DraftFields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : "");
  }

  function handleFileChange2(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setImageFile2(file);
    setImagePreview2(file ? URL.createObjectURL(file) : "");
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setIsSaving(true);

    try {
      let finalImageUrl: string | null = null;
      let finalImageUrl2: string | null = null;

      if (imageFile) finalImageUrl = await uploadImage(imageFile);
      if (imageFile2) finalImageUrl2 = await uploadImage(imageFile2);

      const { category } = fields;

      const basePayload = {
        name: fields.name,
        category,
        image_url: finalImageUrl,
        image_url_2: finalImageUrl2,
        price: Number(fields.price) || 0,
        purchase_date: fields.purchase_date,
        purchase_place: fields.purchase_place,
        notes: fields.notes,
      };

      const details =
        category === "card"
          ? {
              player: fields.player,
              team: fields.team,
              collection: fields.collection,
              serial_number: fields.serial_number,
              type: fields.type as "auto" | "patch" | "base" | "case_hit",
              condition: fields.condition,
            }
          : category === "coin"
            ? {
                country: fields.country,
                year: Number(fields.year) || 0,
                material: fields.material,
                condition: fields.condition,
              }
            : {
                country: fields.country,
                currency: fields.currency,
                year: Number(fields.year) || 0,
                condition: fields.condition,
              };

      const payload = { ...basePayload, details } as CreateItemInput;

      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const created = (await response.json()) as { id?: string; error?: string };
      if (!response.ok || !created.id) throw new Error(created.error ?? "Failed to create item.");

      localStorage.removeItem(DRAFT_KEY);
      setFeedback({ type: "success", text: "Item saved successfully." });
      router.push(`/items/${created.id}`);
      router.refresh();
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Unexpected error while saving.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  const { category } = fields;

  return (
    <form className="grid gap-5 md:grid-cols-3" onSubmit={onSubmit} noValidate={false}>
      <CardContainer className="space-y-4 md:col-span-2">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-semibold text-vault-muted">Category</span>
            <Select value={category} onChange={set("category")}>
              <option value="card">Football Card</option>
              <option value="coin">Coin</option>
              <option value="banknote">Banknote</option>
            </Select>
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold text-vault-muted">Name</span>
            <Input placeholder="2018 Mbappe Select Silver" value={fields.name} onChange={set("name")} required />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold text-vault-muted">Price (€)</span>
            <Input type="number" placeholder="249.99" value={fields.price} onChange={set("price")} min={0} step="0.01" required />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold text-vault-muted">Purchase Date</span>
            <Input type="date" value={fields.purchase_date} onChange={set("purchase_date")} required />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold text-vault-muted">Purchase Place</span>
            <Input placeholder="eBay / Whatnot / Local Show" value={fields.purchase_place} onChange={set("purchase_place")} required />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {category === "card" && (
            <div className="contents">
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Player</span>
                <Input placeholder="Kylian Mbappe" value={fields.player} onChange={set("player")} required />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Team</span>
                <Input placeholder="Real Madrid" value={fields.team} onChange={set("team")} required />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Collection</span>
                <Input placeholder="Prizm / Select / Topps" value={fields.collection} onChange={set("collection")} required />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Serial Number</span>
                <Input placeholder="1/10" value={fields.serial_number} onChange={set("serial_number")} required />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Type</span>
                <Select value={fields.type} onChange={set("type")} required>
                  <option value="auto">Auto</option>
                  <option value="patch">Patch</option>
                  <option value="base">Base</option>
                  <option value="case_hit">Case Hit</option>
                </Select>
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Condition</span>
                <Input placeholder="Near Mint" value={fields.condition} onChange={set("condition")} required />
              </label>
            </div>
          )}

          {category === "coin" && (
            <div className="contents">
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Country</span>
                <Input placeholder="France" value={fields.country} onChange={set("country")} required />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Year</span>
                <Input type="number" placeholder="1901" value={fields.year} onChange={set("year")} required />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Material</span>
                <Input placeholder="Silver / Gold / Copper" value={fields.material} onChange={set("material")} required />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Condition</span>
                <Input placeholder="XF" value={fields.condition} onChange={set("condition")} required />
              </label>
            </div>
          )}

          {category === "banknote" && (
            <div className="contents">
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Country</span>
                <Input placeholder="Japan" value={fields.country} onChange={set("country")} required />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Currency</span>
                <Input placeholder="JPY" value={fields.currency} onChange={set("currency")} required />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Year</span>
                <Input type="number" placeholder="1984" value={fields.year} onChange={set("year")} required />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Condition</span>
                <Input placeholder="AU" value={fields.condition} onChange={set("condition")} required />
              </label>
            </div>
          )}
        </div>

        <label className="space-y-1">
          <span className="text-sm font-semibold text-vault-muted">Notes</span>
          <textarea
            className="w-full rounded-lg border-[3px] border-vault-border bg-white px-3 py-2 text-sm text-vault-text outline-none transition-all duration-200 placeholder:text-vault-muted focus:shadow-vault focus:border-vault-primary"
            rows={3}
            placeholder="Provenance, grading ideas, scratch notes..."
            value={fields.notes}
            onChange={set("notes")}
          />
        </label>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save To Vault"}
          </Button>
          {feedback && (
            <p
              role="status"
              aria-live="polite"
              className={`text-sm font-medium ${feedback.type === "error" ? "text-vault-danger" : "text-vault-secondary"}`}
            >
              {feedback.text}
            </p>
          )}
        </div>
      </CardContainer>

      <CardContainer className="md:col-span-1">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-vault-muted">Images</p>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-vault-muted">Front</p>
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-[3px] border-dashed border-vault-border bg-vault-soft px-3 py-4 text-center transition-all hover:border-vault-primary hover:bg-white focus-within:border-vault-primary focus-within:ring-2 focus-within:ring-vault-primary focus-within:ring-offset-1">
              <UploadIcon />
              <span className="text-xs font-semibold text-vault-muted">
                {imageFile ? imageFile.name : "Upload photo"}
              </span>
              <span className="text-xs text-vault-muted">PNG, JPG, WEBP</span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleFileChange}
                aria-label="Upload front image"
              />
            </label>
            {imagePreview && (
              <div className="overflow-hidden rounded-lg border-[3px] border-vault-border bg-vault-soft">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Front preview" className="h-auto w-full" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-vault-muted">Back</p>
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-[3px] border-dashed border-vault-border bg-vault-soft px-3 py-4 text-center transition-all hover:border-vault-primary hover:bg-white focus-within:border-vault-primary focus-within:ring-2 focus-within:ring-vault-primary focus-within:ring-offset-1">
              <UploadIcon />
              <span className="text-xs font-semibold text-vault-muted">
                {imageFile2 ? imageFile2.name : "Upload photo"}
              </span>
              <span className="text-xs text-vault-muted">PNG, JPG, WEBP</span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleFileChange2}
                aria-label="Upload back image"
              />
            </label>
            {imagePreview2 && (
              <div className="overflow-hidden rounded-lg border-[3px] border-vault-border bg-vault-soft">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview2} alt="Back preview" className="h-auto w-full" />
              </div>
            )}
          </div>
        </div>
      </CardContainer>
    </form>
  );
}
