"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, ExternalLink } from "lucide-react";
import Image from "next/image";

const navItems = [
  {
    label: "Learn",
    href: "/learn",
    children: [
      { label: "IoT Architecture", href: "/learn/foundations/architecture" },
      { label: "Cellular Networks", href: "/learn/foundations/cellular-networks" },
      { label: "LTE-M vs NB-IoT", href: "/learn/foundations/lpwa-technologies" },
      { label: "5G RedCap", href: "/learn/foundations/5g-redcap" },
      { label: "PSM / eDRX Power", href: "/learn/power/psm-edrx" },
      { label: "SIM Evolution", href: "/learn/identity/sim-evolution" },
      { label: "SGP.32", href: "/learn/identity/sgp32" },
      { label: "Security", href: "/learn/security/endpoint" },
    ],
  },
  {
    label: "Build",
    href: "/build",
    children: [
      { label: "Asset Tracker", href: "/build/asset-tracker" },
      { label: "Smart Camera", href: "/build/smart-camera" },
      { label: "Smart Building", href: "/build/smart-building" },
      { label: "Smart Agriculture", href: "/build/smart-agriculture" },
      { label: "Micromobility", href: "/build/micromobility" },
      { label: "Patient Monitoring", href: "/build/remote-patient-monitoring" },
    ],
  },
  {
    label: "Tools",
    href: "/tools",
    children: [
      { label: "AT Command Reference", href: "/tools/at-command-reference" },
      { label: "Protocol Picker", href: "/tools/protocol-picker" },
      { label: "GPS Parser", href: "/tools/gps-parser" },
    ],
  },
  {
    label: "Deploy",
    href: "/deploy",
    children: [
      { label: "Pilot Playbook", href: "/deploy/pilot-playbook" },
      { label: "Lifecycle Management", href: "/deploy/lifecycle" },
    ],
  },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const openDropdown = (label: string) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setActiveDropdown(label);
  };

  const scheduleClose = () => {
    closeTimerRef.current = setTimeout(() => {
      setActiveDropdown(null);
      closeTimerRef.current = null;
    }, 150);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#00040F]/95 backdrop-blur-sm border-b border-[#3A3C46]/40">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
            aria-label="Hologram IoT Device Builder home"
          >
            <Image
              src="/hologram-logo.svg"
              alt="Hologram"
              width={120}
              height={32}
              className="h-7 w-auto"
              priority
            />
            <span className="hidden md:block text-[#3A3C46] font-normal text-sm tracking-tight">
              / Device Builder
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1" role="menubar">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const isOpen = activeDropdown === item.label;
              return (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => item.children && openDropdown(item.label)}
                  onMouseLeave={() => scheduleClose()}
                  onFocus={() => item.children && openDropdown(item.label)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setActiveDropdown(null);
                    }
                  }}
                >
                  <Link
                    href={item.href}
                    role="menuitem"
                    aria-haspopup={item.children ? "true" : undefined}
                    aria-expanded={item.children ? isOpen : undefined}
                    className={`inline-flex items-center gap-1 px-3 py-2 rounded-md text-sm transition-colors duration-200 cursor-pointer ${active
                      ? "text-[#BFFD11] font-semibold"
                      : "text-white/70 font-medium hover:text-white"
                      }`}
                  >
                    {item.label}
                    {item.children && (
                      <ChevronDown
                        size={12}
                        className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                  {item.children && isOpen && (
                    <div className="absolute top-full left-0 pt-2 z-50">
                      <div
                        role="menu"
                        aria-label={`${item.label} submenu`}
                        className="w-52 rounded-xl bg-[#0A0E1A] border border-[#3A3C46]/60 shadow-2xl shadow-black/50 py-1.5"
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            role="menuitem"
                            className={`block px-4 py-2.5 text-sm transition-colors duration-150 cursor-pointer ${isActive(child.href)
                              ? "text-[#BFFD11] bg-[#BFFD11]/5 font-medium"
                              : "text-white/70 hover:text-white hover:bg-white/5"
                              }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://dashboard.hologram.io"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Get Started with Hologram (opens in new tab)"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#BFFD11] text-[#00040F] text-sm font-semibold hover:bg-[#d4ff3d] transition-colors duration-200 cursor-pointer"
            >
              Get Started
              <ExternalLink size={12} aria-hidden="true" />
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-md text-white/70 hover:text-white cursor-pointer transition-colors duration-200"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div id="mobile-nav" className="md:hidden py-4 border-t border-[#3A3C46]/40 space-y-1">
            {navItems.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 ${isActive(item.href)
                    ? "text-[#BFFD11] font-semibold"
                    : "text-white/70 hover:text-white"
                    }`}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="pl-4 space-y-0.5">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className={`block px-3 py-2.5 text-sm cursor-pointer transition-colors duration-150 ${isActive(child.href)
                          ? "text-[#BFFD11] font-medium"
                          : "text-white/50 hover:text-white/80"
                          }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-3 border-t border-[#3A3C46]/40">
              <a
                href="https://dashboard.hologram.io"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Get Started with Hologram (opens in new tab)"
                className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-lg bg-[#BFFD11] text-[#00040F] text-sm font-semibold text-center cursor-pointer"
              >
                Get Started
                <ExternalLink size={12} aria-hidden="true" />
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
