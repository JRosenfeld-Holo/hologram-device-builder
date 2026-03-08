import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LPWA Technologies — Hologram Learn",
  description:
    "Comparing LPWA options: LTE-M vs NB-IoT vs Sigfox vs LoRa for battery-powered IoT deployments.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
