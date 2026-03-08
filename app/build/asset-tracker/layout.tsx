import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Asset Tracker Build Guide — Hologram",
  description:
    "Hardware guide for building LTE-M/NB-IoT GPS asset trackers with Hologram SIM connectivity.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
