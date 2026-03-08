import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SGP.32 iSIM Standard — Hologram Learn",
  description:
    "Technical deep dive into SGP.32, the iSIM standard for IoT remote SIM provisioning.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
