import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Network Security — Hologram Learn",
  description:
    "Network-layer security for cellular IoT: TLS, VPN tunnels, and private APN configuration.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
