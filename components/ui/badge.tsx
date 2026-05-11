import { ReactNode } from "react";

export function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex rounded-full border-[3px] border-vault-border px-2.5 py-1 text-xs font-bold ${className}`}
    >
      {children}
    </span>
  );
}
