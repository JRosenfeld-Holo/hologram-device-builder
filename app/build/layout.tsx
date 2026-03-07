import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Build Guides — Hologram IoT Device Builder",
  description:
    "Step-by-step device build guides for asset trackers, smart cameras, and smart building sensors.",
};

export default function BuildLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
