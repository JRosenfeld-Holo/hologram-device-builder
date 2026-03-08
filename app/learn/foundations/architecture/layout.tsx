import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IoT Architecture — Hologram Learn",
  description:
    "End-to-end cellular IoT system architecture: device, connectivity, cloud, and data layers explained.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
