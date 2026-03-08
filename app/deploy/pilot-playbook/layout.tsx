import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IoT Pilot Playbook — Hologram Deploy",
  description:
    "Step-by-step pilot playbook for deploying cellular IoT devices — from bench testing to field validation.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
