"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="w-full rounded-lg border-[3px] border-vault-border bg-vault-danger px-4 py-2.5 text-sm font-extrabold text-white shadow-vault transition-all duration-200 hover:-translate-y-0.5 hover:shadow-vault-hover disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Signing out…" : "Sign Out"}
    </button>
  );
}
