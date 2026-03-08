import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Device Lifecycle Management — Hologram Deploy",
  description:
    "Managing cellular IoT devices from provisioning through firmware updates and end-of-life decommission.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
