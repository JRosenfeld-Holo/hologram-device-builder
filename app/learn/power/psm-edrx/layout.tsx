import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PSM & eDRX Power Modes — Hologram Learn",
  description:
    "How to use LTE-M PSM and eDRX to extend battery life in cellular IoT devices.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
