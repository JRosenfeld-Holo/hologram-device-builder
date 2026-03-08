import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Remote Patient Monitoring Build Guide — Hologram",
  description:
    "Cellular IoT hardware guide for HIPAA-compliant remote patient monitoring devices.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
