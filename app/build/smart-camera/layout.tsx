import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smart Camera Build Guide — Hologram",
  description:
    "Guide to building cellular-connected smart cameras with video streaming and edge AI on LTE Cat-1.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
