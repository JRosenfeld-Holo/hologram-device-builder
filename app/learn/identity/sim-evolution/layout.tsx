import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SIM Evolution — Hologram Learn",
  description:
    "From SIM to eSIM to iSIM: the evolution of cellular identity for IoT devices.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
