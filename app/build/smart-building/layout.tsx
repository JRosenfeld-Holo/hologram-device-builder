import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smart Building Build Guide — Hologram",
  description:
    "NB-IoT sensor guide for smart building automation — HVAC, occupancy, energy, and access control.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
