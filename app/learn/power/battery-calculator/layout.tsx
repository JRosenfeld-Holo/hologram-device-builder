import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IoT Battery Life Calculator — Hologram Learn",
  description:
    "Interactive battery life calculator for LTE-M and NB-IoT IoT devices.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
