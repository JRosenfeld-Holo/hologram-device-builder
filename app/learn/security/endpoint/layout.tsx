import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Endpoint Security — Hologram Learn",
  description:
    "Securing cellular IoT endpoints: secure boot, firmware signing, and hardware attestation.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
