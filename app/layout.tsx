import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

export const metadata: Metadata = {
  title: "Mainer | Collector Vault",
  description: "Premium personal manager for football cards, coins and banknotes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={space.variable}>
      <body className="bg-vault-bg text-vault-text">{children}</body>
    </html>
  );
}
