import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

const footerLinks = {
  Learn: [
    { label: "IoT Architecture", href: "/learn/foundations/architecture" },
    { label: "Cellular Networks", href: "/learn/foundations/cellular-networks" },
    { label: "LTE-M vs NB-IoT", href: "/learn/foundations/lpwa-technologies" },
    { label: "5G RedCap", href: "/learn/foundations/5g-redcap" },
    { label: "PSM / eDRX Power", href: "/learn/power/psm-edrx" },
    { label: "SIM Evolution", href: "/learn/identity/sim-evolution" },
    { label: "SGP.32", href: "/learn/identity/sgp32" },
    { label: "Security", href: "/learn/security/endpoint" },
  ],
  Build: [
    { label: "Asset Tracker", href: "/build/asset-tracker" },
    { label: "Smart Camera", href: "/build/smart-camera" },
    { label: "Smart Building", href: "/build/smart-building" },
    { label: "Smart Agriculture", href: "/build/smart-agriculture" },
    { label: "Micromobility", href: "/build/micromobility" },
  ],
  Tools: [
    { label: "AT Command Reference", href: "/tools/at-command-reference" },
    { label: "Protocol Picker", href: "/tools/protocol-picker" },
    { label: "GPS Parser", href: "/tools/gps-parser" },
  ],
  Deploy: [
    { label: "Pilot Playbook", href: "/deploy/pilot-playbook" },
    { label: "Lifecycle Management", href: "/deploy/lifecycle" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#000209] border-t border-[#3A3C46]/30 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-x-10 gap-y-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="block mb-5 w-fit">
              <Image
                src="/hologram-logo.svg"
                alt="Hologram"
                width={130}
                height={34}
                className="h-8 w-auto opacity-90 hover:opacity-100 transition-opacity duration-200"
              />
            </Link>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              Interactive platform for learning cellular IoT device development.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <p className="font-mono-label text-[#BFFD11] mb-4 text-xs">{category}</p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 hover:text-white transition-colors duration-200 cursor-pointer"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-[#3A3C46]/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-xs text-white/30">
            © 2026 Hologram Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {[
              { label: "Privacy", href: "https://hologram.io/privacy" },
              { label: "Terms", href: "https://hologram.io/terms" },
              { label: "Docs", href: "https://hologram.io/docs" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${label} (opens in new tab)`}
              >
                {label}
                <ExternalLink size={9} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
