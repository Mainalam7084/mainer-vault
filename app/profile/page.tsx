import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { CardContainer } from "@/components/ui/card-container";
import { getAllItems } from "@/lib/supabase/queries";
import { totalCollectionValue } from "@/lib/helpers/collection";
import { LogoutButton } from "@/components/layout/logout-button";
import Image from "next/image";

function IconUser() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const items = await getAllItems();
  const totalValue = totalCollectionValue(items);
  const rareCount = items.filter((i) => i.rarity !== "Common").length;
  const cardCount = items.filter((i) => i.category === "card").length;
  const coinCount = items.filter((i) => i.category === "coin").length;
  const banknoteCount = items.filter((i) => i.category === "banknote").length;

  const name =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "Collector";
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const memberSince = new Date(user.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <AppShell title="Profile">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Identity card */}
        <div className="lg:col-span-1">
          <CardContainer className="flex flex-col items-center gap-5 text-center">
            {/* Avatar */}
            <div className="relative">
              {avatarUrl ? (
                <div className="h-24 w-24 overflow-hidden rounded-vault border-[3px] border-vault-border shadow-vault">
                  <Image
                    src={avatarUrl}
                    alt={name}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-vault border-[3px] border-vault-border bg-vault-soft shadow-vault text-vault-muted">
                  <IconUser />
                </div>
              )}
              <span className="absolute -bottom-2 -right-2 rounded-full border-[3px] border-vault-border bg-vault-accent px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-vault-text">
                Pro
              </span>
            </div>

            {/* Name */}
            <div>
              <h2 className="text-2xl font-black tracking-tight text-vault-text">{name}</h2>
              <div className="mt-1 flex items-center justify-center gap-1.5 text-xs text-vault-muted">
                <IconMail />
                <span>{user.email}</span>
              </div>
              <div className="mt-1 flex items-center justify-center gap-1.5 text-xs text-vault-muted">
                <IconCalendar />
                <span>Member since {memberSince}</span>
              </div>
            </div>

            {/* Logout */}
            <div className="mt-2 w-full">
              <LogoutButton />
            </div>
          </CardContainer>
        </div>

        {/* Collection stats */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <CardContainer>
            <h3 className="text-xl font-black text-vault-text">Collection Overview</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Total Items", value: items.length, color: "bg-vault-primary text-white" },
                {
                  label: "Total Value",
                  value: `€${Math.round(totalValue).toLocaleString()}`,
                  color: "bg-vault-secondary text-vault-text",
                },
                {
                  label: "Rare / Legendary",
                  value: rareCount,
                  color: "bg-vault-accent text-vault-text",
                },
                {
                  label: "Categories",
                  value: [cardCount && "Cards", coinCount && "Coins", banknoteCount && "Notes"]
                    .filter(Boolean)
                    .length,
                  color: "bg-vault-soft text-vault-text",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`rounded-vault border-[3px] border-vault-border p-4 shadow-vault ${stat.color}`}
                >
                  <p className="text-2xl font-black">{stat.value}</p>
                  <p className="mt-0.5 text-xs font-bold uppercase tracking-wide opacity-80">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </CardContainer>

          {/* Category breakdown */}
          <CardContainer>
            <h3 className="text-xl font-black text-vault-text">By Category</h3>
            <div className="mt-4 flex flex-col gap-3">
              {[
                { label: "Football Cards", count: cardCount, color: "bg-vault-primary" },
                { label: "Coins", count: coinCount, color: "bg-vault-secondary" },
                { label: "Banknotes", count: banknoteCount, color: "bg-vault-accent" },
              ].map(({ label, count, color }) => {
                const pct = items.length > 0 ? Math.round((count / items.length) * 100) : 0;
                return (
                  <div key={label}>
                    <div className="mb-1 flex justify-between text-xs font-bold">
                      <span>{label}</span>
                      <span>
                        {count} item{count !== 1 ? "s" : ""} · {pct}%
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full border-[2px] border-vault-border bg-vault-soft">
                      <div
                        className={`h-full ${color} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContainer>

          {/* Account details */}
          <CardContainer>
            <h3 className="text-xl font-black text-vault-text">Account</h3>
            <dl className="mt-4 space-y-3">
              {[
                { label: "Auth Provider", value: "Google (OpenID Connect)" },
                { label: "User ID", value: user.id.slice(0, 18) + "…" },
                { label: "Email Verified", value: user.email_confirmed_at ? "Yes" : "No" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-lg border-[2px] border-vault-border px-4 py-2.5"
                >
                  <dt className="text-xs font-bold uppercase tracking-wide text-vault-muted">
                    {label}
                  </dt>
                  <dd className="text-sm font-bold text-vault-text">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContainer>
        </div>
      </div>
    </AppShell>
  );
}
