import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn — Hologram IoT Device Builder",
  description: "Master cellular IoT fundamentals with interactive lessons.",
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
