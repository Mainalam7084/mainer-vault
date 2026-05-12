# Mainer — Agent & Contributor Guide

## This is NOT the Next.js you know

Next.js **16.2.5** has breaking changes from prior versions. Before writing any code, read the relevant guide in `node_modules/next/dist/docs/`. Key differences that bite agents:

- **`params` and `searchParams` are Promises** — always `await` them before accessing properties.
- **`middleware.ts` is deprecated** — auth guarding is done in `proxy.ts` at the project root.
- Route handler params must also be awaited: `const { id } = await params`.

---

## Tech Stack

| Layer | Package | Version |
|---|---|---|
| Framework | Next.js App Router | 16.2.5 |
| UI library | React | 19.2.6 |
| Styling | Tailwind CSS | v4 |
| Database / Auth / Storage | Supabase JS | ^2.105.1 |
| Language | TypeScript | strict |

Font: **Space Grotesk** (loaded via `app/layout.tsx`).

---

## Project Purpose

Personal collectibles vault — tracks **football cards**, **coins**, and **banknotes**. Items have metadata, two photos (front + back), and category-specific detail fields. Each user sees only their own items via Supabase RLS.

---

## File Map

```
app/
  layout.tsx                  # Root layout, Space Grotesk font
  page.tsx                    # Redirect root → /dashboard
  not-found.tsx
  dashboard/page.tsx          # Stats: total items, value, rare count, recent items
  collection/page.tsx         # Filterable grid of all items (search, category, price range)
  collection/loading.tsx
  add/page.tsx                # Add-item form page
  items/[id]/page.tsx         # Item detail page
  items/[id]/loading.tsx
  login/page.tsx              # Google OAuth sign-in button
  profile/page.tsx            # User profile
  auth/callback/route.ts      # Supabase OAuth code exchange
  api/items/route.ts          # POST → createItem
  api/items/[id]/route.ts     # GET, PATCH, DELETE for a single item

proxy.ts                      # Auth guard (replaces middleware.ts — do NOT use middleware.ts)

components/
  layout/
    app-shell.tsx             # Server component shell — wraps every page, renders UserBadge
    nav-bar.tsx               # Client nav bar (child of app-shell)
    logout-button.tsx         # Client component — triggers Supabase sign-out
  cards/
    collectible-card.tsx      # Card shown in /collection grid; shows front + back photos
    collection-grid.tsx       # Client grid with search/filter controls
  forms/
    add-item-form.tsx         # Create new item (uploads front + back photos)
    item-detail-actions.tsx   # Edit + delete item; inline edit form with dual image upload
  ui/
    button.tsx                # Variants: default, secondary, danger
    badge.tsx
    input.tsx
    select.tsx
    card-container.tsx
    stat-card.tsx
    count-up.tsx

lib/
  types.ts                    # All shared TypeScript interfaces (see Data Model below)
  helpers/collection.ts       # formatCurrency, categoryLabel, categoryColor, totalCollectionValue
  supabase/
    client.ts                 # Browser Supabase client (createBrowserClient)
    server.ts                 # RSC / Route Handler Supabase client (createServerClient)
    queries.ts                # getAllItems, getItemById, createItem, updateItem, deleteItem
    storage.ts                # uploadImage(file) → public URL (bucket: items)
```

---

## Data Model (`lib/types.ts`)

```ts
// items table
interface Item {
  id: string;
  user_id: string;          // FK → auth.users(id), RLS enforced
  name: string;
  category: "card" | "coin" | "banknote";
  image_url: string | null;   // front photo — Supabase Storage public URL
  image_url_2: string | null; // back photo — added via ALTER TABLE (see DB section)
  price: number;              // in EUR
  purchase_date: string;      // ISO date string
  purchase_place: string;
  notes: string;
  created_at: string;
}

// rarity is DERIVED in JS from price — NOT stored in DB
// price >= 700 → "Legendary" | price >= 300 → "Rare" | else → "Common"

// card_details table
interface CardDetails {
  item_id: string;
  player: string;
  team: string;
  collection: string;
  serial_number: string;
  type: "auto" | "patch" | "base" | "case_hit";
  condition: string;
}

// coin_details table
interface CoinDetails {
  item_id: string;
  country: string;
  year: number;
  material: string;
  condition: string;
}

// banknote_details table
interface BanknoteDetails {
  item_id: string;
  country: string;
  currency: string;
  year: number;
  condition: string;
}
```

`ItemWithDetails` extends `Item` with `rarity` and the appropriate `details` union (or `null`).

---

## Database

### Tables
- `items` — core item record
- `card_details` — FK `item_id`, one-to-one with cards
- `coin_details` — FK `item_id`, one-to-one with coins
- `banknote_details` — FK `item_id`, one-to-one with banknotes

### Required migrations (run in Supabase SQL Editor)

```sql
-- Add second image column (if not already present)
ALTER TABLE items ADD COLUMN image_url_2 text NOT NULL DEFAULT '';

-- Add user_id column and RLS (if not already present)
ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
```

RLS policies must enforce `auth.uid() = user_id` on all operations.

### Storage
Bucket: `items` (public). Images are uploaded browser-side via `lib/supabase/storage.ts → uploadImage()`. Path format: `items/<uuid>.<ext>`.

---

## Auth

Google OAuth via Supabase OpenID Connect.

- Sign-in page: `app/login/page.tsx`
- OAuth callback (code exchange): `app/auth/callback/route.ts`
- Auth guard: `proxy.ts` (NOT `middleware.ts`)
- Google avatar domain whitelisted in `next.config.ts`: `lh3.googleusercontent.com`

### One-time Supabase setup
1. Dashboard → Authentication → Providers → enable Google, paste Client ID + Secret
2. Add `<origin>/auth/callback` to both Google Cloud Console OAuth redirect URIs and Supabase Auth redirect URLs

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=   # or NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## Design System

**Neo-brutalist** — strict rules, do not drift:

- **Borders**: `border-[3px]` solid, always `border-vault-border` (black) — never `border` alone
- **Shadows**: `shadow-vault` (offset box shadow), `shadow-gold` for rare items — no Tailwind default shadows
- **Rounding**: `rounded-vault` or `rounded-lg` — never `rounded-xl` or `rounded-full`
- **Typography**: `font-black` for headings, `font-semibold` for labels, `text-vault-muted` for secondary text
- **Colors** (CSS vars): `vault-primary`, `vault-secondary`, `vault-accent`, `vault-text`, `vault-muted`, `vault-border`, `vault-soft`, `vault-card`, `vault-danger`
- **Category badge colors**: card → `bg-vault-primary text-white`, banknote → `bg-vault-secondary text-vault-text`, coin → `bg-vault-accent text-vault-text`
- Prices displayed in **EUR** via `Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" })`

---

## Key Patterns

### Queries
`getAllItems` and `getItemById` load all three detail tables in parallel, then assemble `ItemWithDetails` in JS. No joins in SQL — detail lookup uses in-memory Maps keyed by `item_id`.

### Type narrowing for detail fields
Use `d && "player" in d` (not just `"player" in d`) because `details` can be `null`. Checking `"player" in d` on `null` throws; the null guard is required.

### Image display
`CollectibleCard` renders both photos side-by-side (`grid-cols-2`) when both are present. Uses `width={0} height={0} sizes="..."` with `w-full h-auto` — no fixed aspect ratio — so the card height adjusts to the photo's natural proportions.

### Form uploads
Both `add-item-form.tsx` and `item-detail-actions.tsx` upload images directly from the browser to Supabase Storage before the API POST/PATCH, then include the resulting public URLs in the JSON payload.

### API shape — PATCH `/api/items/[id]`
Body: `{ category: ItemCategory, data: UpdateItemInput }` — category is passed separately because it is not part of `UpdateItemInput`.
