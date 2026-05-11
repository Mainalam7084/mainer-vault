"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { CardContainer } from "@/components/ui/card-container";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { uploadImage } from "@/lib/supabase/storage";
import { CreateItemInput, ItemCategory } from "@/lib/types";

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
  const [category, setCategory] = useState<ItemCategory>("card");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile2, setImageFile2] = useState<File | null>(null);
  const [imagePreview2, setImagePreview2] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; text: string } | null>(
    null,
  );

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

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setIsSaving(true);

    try {
      const formData = new FormData(event.currentTarget);
      let finalImageUrl = "";
      let finalImageUrl2 = "";

      if (imageFile) finalImageUrl = await uploadImage(imageFile);
      if (imageFile2) finalImageUrl2 = await uploadImage(imageFile2);

      const basePayload = {
        name: String(formData.get("name") ?? ""),
        category,
        image_url: finalImageUrl,
        image_url_2: finalImageUrl2,
        price: Number(formData.get("price") ?? 0),
        purchase_date: String(formData.get("purchase_date") ?? ""),
        purchase_place: String(formData.get("purchase_place") ?? ""),
        notes: String(formData.get("notes") ?? ""),
      };

      const details =
        category === "card"
          ? {
              player: String(formData.get("player") ?? ""),
              team: String(formData.get("team") ?? ""),
              collection: String(formData.get("collection") ?? ""),
              serial_number: String(formData.get("serial_number") ?? ""),
              type: String(formData.get("type") ?? "base"),
              condition: String(formData.get("condition") ?? ""),
            }
          : category === "coin"
            ? {
                country: String(formData.get("country") ?? ""),
                year: Number(formData.get("year") ?? 0),
                material: String(formData.get("material") ?? ""),
                condition: String(formData.get("condition") ?? ""),
              }
            : {
                country: String(formData.get("country") ?? ""),
                currency: String(formData.get("currency") ?? ""),
                year: Number(formData.get("year") ?? 0),
                condition: String(formData.get("condition") ?? ""),
              };

      const payload = { ...basePayload, details } as CreateItemInput;

      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const created = (await response.json()) as { id?: string; error?: string };
      if (!response.ok || !created.id) throw new Error(created.error ?? "Failed to create item.");

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

  return (
    <form className="grid gap-5 md:grid-cols-3" onSubmit={onSubmit} noValidate={false}>
      <CardContainer className="space-y-4 md:col-span-2">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-semibold text-vault-muted">Category</span>
            <Select
              value={category}
              onChange={(event) => setCategory(event.target.value as ItemCategory)}
            >
              <option value="card">Football Card</option>
              <option value="coin">Coin</option>
              <option value="banknote">Banknote</option>
            </Select>
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold text-vault-muted">Name</span>
            <Input placeholder="2018 Mbappe Select Silver" name="name" required />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold text-vault-muted">Price (€)</span>
            <Input type="number" placeholder="249.99" name="price" min={0} step="0.01" required />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold text-vault-muted">Purchase Date</span>
            <Input type="date" name="purchase_date" required />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold text-vault-muted">Purchase Place</span>
            <Input placeholder="eBay / Whatnot / Local Show" name="purchase_place" required />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {category === "card" && (
            <div className="contents">
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Player</span>
                <Input placeholder="Kylian Mbappe" name="player" required />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Team</span>
                <Input placeholder="Real Madrid" name="team" required />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Collection</span>
                <Input placeholder="Prizm / Select / Topps" name="collection" required />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Serial Number</span>
                <Input placeholder="1/10" name="serial_number" required />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Type</span>
                <Select name="type" required>
                  <option value="auto">Auto</option>
                  <option value="patch">Patch</option>
                  <option value="base">Base</option>
                  <option value="case_hit">Case Hit</option>
                </Select>
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Condition</span>
                <Input placeholder="Near Mint" name="condition" required />
              </label>
            </div>
          )}

          {category === "coin" && (
            <div className="contents">
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Country</span>
                <Input placeholder="France" name="country" required />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Year</span>
                <Input type="number" placeholder="1901" name="year" required />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Material</span>
                <Input placeholder="Silver / Gold / Copper" name="material" required />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Condition</span>
                <Input placeholder="XF" name="condition" required />
              </label>
            </div>
          )}

          {category === "banknote" && (
            <div className="contents">
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Country</span>
                <Input placeholder="Japan" name="country" required />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Currency</span>
                <Input placeholder="JPY" name="currency" required />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Year</span>
                <Input type="number" placeholder="1984" name="year" required />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Condition</span>
                <Input placeholder="AU" name="condition" required />
              </label>
            </div>
          )}
        </div>

        <label className="space-y-1">
          <span className="text-sm font-semibold text-vault-muted">Notes</span>
          <textarea
            className="w-full rounded-lg border-[3px] border-vault-border bg-white px-3 py-2 text-sm text-vault-text outline-none transition-all duration-200 placeholder:text-vault-muted focus:shadow-vault focus:border-vault-primary"
            rows={3}
            name="notes"
            placeholder="Provenance, grading ideas, scratch notes..."
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
