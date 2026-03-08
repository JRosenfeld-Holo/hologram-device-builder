import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn — Hologram IoT Device Builder",
  description: "Interactive lessons on cellular IoT fundamentals — LTE-M, NB-IoT, 5G RedCap, PSM, eDRX, iSIM, eSIM, and end-to-end security architecture.",
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
