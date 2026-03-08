import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smart Agriculture Build Guide — Hologram",
  description:
    "Build solar-powered NB-IoT agriculture sensors for soil, weather, and livestock monitoring.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
