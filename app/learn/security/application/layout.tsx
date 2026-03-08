import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Application Security — Hologram Learn",
  description:
    "Application-layer security for IoT: MQTT TLS, certificate management, and API authentication.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
