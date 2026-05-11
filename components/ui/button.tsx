import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const base =
    "rounded-lg border-[3px] px-4 py-2 text-sm font-extrabold transition-all duration-200 hover:-translate-y-0.5";
  const styles = {
    primary:
      "border-vault-border bg-vault-primary text-white shadow-vault hover:shadow-vault-hover",
    secondary:
      "border-vault-border bg-vault-secondary text-vault-text shadow-vault hover:shadow-vault-hover",
    danger: "border-vault-border bg-vault-danger text-white shadow-vault hover:shadow-vault-hover",
  };

  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}
