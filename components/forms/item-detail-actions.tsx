"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { uploadImage } from "@/lib/supabase/storage";
import { CardDetails, ItemWithDetails, UpdateItemInput } from "@/lib/types";

function UploadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
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

export function ItemDetailActions({ item }: { item: ItemWithDetails }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview("");
    }
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      let imageUrl = item.image_url;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const formData = new FormData(event.currentTarget);
      const details =
        item.category === "card"
          ? {
              player: String(formData.get("player") ?? ""),
              team: String(formData.get("team") ?? ""),
              collection: String(formData.get("collection") ?? ""),
              serial_number: String(formData.get("serial_number") ?? ""),
              type: String(formData.get("type") ?? "base") as CardDetails["type"],
              condition: String(formData.get("condition") ?? ""),
            }
          : item.category === "coin"
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

      const payload: UpdateItemInput = {
        name: String(formData.get("name") ?? ""),
        image_url: imageUrl,
        price: Number(formData.get("price") ?? 0),
        purchase_date: String(formData.get("purchase_date") ?? ""),
        purchase_place: String(formData.get("purchase_place") ?? ""),
        notes: String(formData.get("notes") ?? ""),
        details,
      };

      const response = await fetch(`/api/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: item.category, data: payload }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Failed to update item.");

      setMessage({ type: "success", text: "Item updated." });
      setIsEditing(false);
      setImageFile(null);
      setImagePreview("");
      router.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update item.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/items/${item.id}`, { method: "DELETE" });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Failed to delete item.");
      router.push("/collection");
      router.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to delete item.",
      });
      setIsSaving(false);
    }
  }

  return (
    <div className="mt-6 space-y-4">
      {isEditing ? (
        <form
          onSubmit={handleUpdate}
          className="grid gap-3 rounded-vault border-[3px] border-vault-border p-4"
        >
          <h4 className="font-black text-vault-text">Edit Item</h4>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-semibold text-vault-muted">Name</span>
              <Input name="name" defaultValue={item.name} required />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-semibold text-vault-muted">Price ($)</span>
              <Input name="price" type="number" defaultValue={item.price} required min={0} step="0.01" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-semibold text-vault-muted">Purchase Date</span>
              <Input name="purchase_date" type="date" defaultValue={item.purchase_date} required />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-semibold text-vault-muted">Purchase Place</span>
              <Input name="purchase_place" defaultValue={item.purchase_place} required />
            </label>
          </div>

          <label className="space-y-1">
            <span className="text-sm font-semibold text-vault-muted">Notes</span>
            <Input name="notes" defaultValue={item.notes} />
          </label>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-vault-muted">Image</p>
            {item.image_url && !imagePreview && (
              <div className="relative mb-2 h-24 w-24 overflow-hidden rounded-lg border-[3px] border-vault-border">
                <Image src={item.image_url} alt="Current image" fill className="object-cover" />
              </div>
            )}
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border-[3px] border-dashed border-vault-border bg-vault-soft px-4 py-3 transition-all hover:border-vault-primary hover:bg-white focus-within:border-vault-primary">
              <UploadIcon />
              <span className="text-sm font-semibold text-vault-muted">
                {imageFile ? imageFile.name : "Replace image (optional)"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleFileChange}
                aria-label="Replace item image"
              />
            </label>
            {imagePreview && (
              <div className="mt-2 overflow-hidden rounded-lg border-[3px] border-vault-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="New image preview" className="h-32 w-full object-cover" />
              </div>
            )}
          </div>

          {item.category === "card" && item.details && "player" in item.details ? (
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Player</span>
                <Input name="player" defaultValue={item.details.player} required />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Team</span>
                <Input name="team" defaultValue={item.details.team} required />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Collection</span>
                <Input name="collection" defaultValue={item.details.collection} required />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Serial Number</span>
                <Input name="serial_number" defaultValue={item.details.serial_number} required />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Type</span>
                <Select name="type" defaultValue={item.details.type} required>
                  <option value="auto">Auto</option>
                  <option value="patch">Patch</option>
                  <option value="base">Base</option>
                  <option value="case_hit">Case Hit</option>
                </Select>
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Condition</span>
                <Input name="condition" defaultValue={item.details.condition} required />
              </label>
            </div>
          ) : null}

          {item.category === "coin" && item.details && "material" in item.details ? (
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Country</span>
                <Input name="country" defaultValue={item.details.country} required />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Year</span>
                <Input name="year" type="number" defaultValue={item.details.year} required />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Material</span>
                <Input name="material" defaultValue={item.details.material} required />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Condition</span>
                <Input name="condition" defaultValue={item.details.condition} required />
              </label>
            </div>
          ) : null}

          {item.category === "banknote" && item.details && "currency" in item.details ? (
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Country</span>
                <Input name="country" defaultValue={item.details.country} required />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Currency</span>
                <Input name="currency" defaultValue={item.details.currency} required />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Year</span>
                <Input name="year" type="number" defaultValue={item.details.year} required />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-vault-muted">Condition</span>
                <Input name="condition" defaultValue={item.details.condition} required />
              </label>
            </div>
          ) : null}

          <div className="flex gap-2">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving…" : "Save Changes"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => { setIsEditing(false); setImageFile(null); setImagePreview(""); }}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setIsEditing(true)}>Edit Item</Button>
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>
            Delete
          </Button>
          <Link
            href="/collection"
            className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold text-vault-muted underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vault-primary"
          >
            Back to collection
          </Link>
        </div>
      )}

      {confirmDelete && (
        <div
          role="alertdialog"
          aria-labelledby="delete-heading"
          aria-describedby="delete-desc"
          className="rounded-vault border-[3px] border-vault-danger bg-white p-4 shadow-vault"
        >
          <h4 id="delete-heading" className="text-lg font-black text-vault-danger">
            Delete this item?
          </h4>
          <p id="delete-desc" className="mt-1 text-sm text-vault-muted">
            This will permanently remove the item and all its details. This cannot be undone.
          </p>
          <div className="mt-3 flex gap-2">
            <Button variant="danger" onClick={handleDelete} disabled={isSaving}>
              {isSaving ? "Deleting…" : "Yes, Delete"}
            </Button>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {message && (
        <p
          role="status"
          aria-live="polite"
          className={`text-sm font-medium ${message.type === "error" ? "text-vault-danger" : "text-vault-secondary"}`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
