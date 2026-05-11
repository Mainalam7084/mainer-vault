import { ReactNode } from "react";
import { CountUp } from "@/components/ui/count-up";

export function StatCard({
  label,
  value,
  icon,
  prefix,
  suffix,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <article className="rounded-vault border-[3px] border-vault-border bg-vault-card p-4 shadow-vault transition-all duration-200 hover:-translate-y-1 hover:shadow-vault-hover">
      <div className="mb-3 inline-flex rounded-lg border-[3px] border-vault-border bg-vault-accent p-2">
        {icon}
      </div>
      <p className="text-sm font-medium text-vault-muted">{label}</p>
      <h3 className="text-3xl font-black tracking-tight text-vault-text">
        <CountUp value={value} prefix={prefix} suffix={suffix} />
      </h3>
    </article>
  );
}
