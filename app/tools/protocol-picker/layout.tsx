import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IoT Protocol Picker — Hologram Tools",
  description:
    "Interactive tool to choose the right IoT data protocol: MQTT, CoAP, HTTP, or LwM2M.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
