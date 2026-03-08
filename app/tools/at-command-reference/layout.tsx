import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AT Command Reference — Hologram Tools",
  description:
    "Interactive AT command reference for LTE-M and NB-IoT modems — searchable, filterable by category.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
