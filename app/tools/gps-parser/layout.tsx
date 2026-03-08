import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GPS Coordinate Parser — Hologram Tools",
  description:
    "Parse and convert GPS NMEA strings, decimal degrees, and DMS coordinates for IoT devices.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
