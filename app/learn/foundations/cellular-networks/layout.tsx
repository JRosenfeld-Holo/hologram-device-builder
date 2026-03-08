import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cellular Networks for IoT — Hologram Learn",
  description:
    "LTE-M, NB-IoT, and Cat-1 explained for IoT engineers — coverage, throughput, and power tradeoffs.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
