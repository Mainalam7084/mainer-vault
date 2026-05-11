"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/collection", label: "Collection" },
  { href: "/add", label: "Add Item" },
  { href: "/profile", label: "Profile" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="mt-5 flex flex-wrap gap-2" aria-label="Main navigation">
      {nav.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-full border-[3px] border-vault-border px-3 py-1.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-vault-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vault-primary ${
              isActive
                ? "bg-vault-primary text-white shadow-vault"
                : "bg-white text-vault-text hover:bg-vault-primary hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
