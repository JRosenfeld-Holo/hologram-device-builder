import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Build Guides — Hologram IoT Device Builder",
  description:
    "Step-by-step hardware build guides for cellular IoT devices — asset trackers, smart cameras, smart buildings, agriculture sensors, micromobility, and remote patient monitoring.",
};

export default function BuildLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
