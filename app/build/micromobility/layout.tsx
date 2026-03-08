import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Micromobility Build Guide — Hologram",
  description:
    "Hardware guide for LTE-M connected scooters and bikes — GPS, cellular data, and anti-theft.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
