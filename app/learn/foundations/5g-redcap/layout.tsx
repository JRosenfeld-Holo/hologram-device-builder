import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "5G RedCap for IoT — Hologram Learn",
  description:
    "5G Reduced Capability (RedCap) explained — use cases, power, and how it compares to LTE-M.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
