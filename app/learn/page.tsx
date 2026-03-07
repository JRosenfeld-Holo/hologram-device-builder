"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  Radio,
  Globe,
  Signal,
  Zap,
  Battery,
  Calculator,
  CreditCard,
  ScanLine,
  Shield,
  Lock,
  Server,
  FileKey,
} from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, fadeUp, slideInLeft } from "@/lib/animations";

/* ── Section definitions ── */
const sections = [
  {
    label: "FOUNDATIONS",
    title: "Network Fundamentals",
    description:
      "Understand how cellular IoT works — from network architecture and radio access technologies to next-gen 5G standards.",
    accentColor: "#BFFD11",
    lessons: [
      {
        href: "/learn/foundations/architecture",
        icon: Globe,
        title: "IoT Architecture & Protocol Stack",
        description:
          "The 4-layer IoT stack and 5-layer protocol breakdown. Understand how data flows from sensor to cloud through the Radio Access Network, Core Network, and Internet.",
        difficulty: "Beginner",
        duration: "12 min",
        accentColor: "#BFFD11",
        highlights: [
          "4-layer device stack",
          "Protocol stack breakdown",
          "Data flow visualization",
        ],
      },
      {
        href: "/learn/foundations/cellular-networks",
        icon: Radio,
        title: "Cellular Networks Deep-Dive",
        description:
          "EPC architecture, RAN, MME, SGW, and how your IoT device authenticates with the cellular network. Covers 2G through 5G evolution.",
        difficulty: "Intermediate",
        duration: "15 min",
        accentColor: "#53F2FA",
        highlights: [
          "EPC core architecture",
          "RAN & eNodeB basics",
          "Device authentication flow",
        ],
      },
      {
        href: "/learn/foundations/lpwa-technologies",
        icon: Signal,
        title: "LTE-M vs NB-IoT",
        description:
          "Interactive decision tool comparing LPWA technologies — bandwidth, latency, mobility, coverage, and power. Pick the right one for your use case.",
        difficulty: "Beginner",
        duration: "10 min",
        accentColor: "#BFFD11",
        highlights: [
          "Interactive comparison tool",
          "Decision framework",
          "Coverage vs mobility tradeoffs",
        ],
      },
      {
        href: "/learn/foundations/5g-redcap",
        icon: Zap,
        title: "5G RedCap for IoT",
        description:
          "How Reduced Capability 5G targets IoT with lower cost, lower power consumption, and network slicing. The bridge between LTE-M and full 5G NR.",
        difficulty: "Advanced",
        duration: "8 min",
        accentColor: "#53F2FA",
        highlights: [
          "RedCap vs LTE-M comparison",
          "Network slicing",
          "3GPP Release 17 & 18",
        ],
      },
    ],
  },
  {
    label: "POWER",
    title: "Power Management",
    description:
      "Maximize battery life with PSM, eDRX, and advanced power profiling techniques for 10+ year deployments.",
    accentColor: "#53F2FA",
    lessons: [
      {
        href: "/learn/power/psm-edrx",
        icon: Battery,
        title: "PSM / eDRX Power Simulator",
        description:
          "Configure PSM and eDRX parameters with an interactive simulator. See real-time battery life estimates as you adjust T3412, T3324, and paging cycles.",
        difficulty: "Intermediate",
        duration: "20 min",
        accentColor: "#BFFD11",
        highlights: [
          "Interactive PSM simulator",
          "eDRX parameter tuning",
          "Battery life estimator",
        ],
      },
      {
        href: "/learn/power/battery-calculator",
        icon: Calculator,
        title: "Battery Life Calculator",
        description:
          "Estimate battery life for any device profile. Adjust sleep current, active current, transmission duration, and reporting interval to model real-world scenarios.",
        difficulty: "Beginner",
        duration: "10 min",
        accentColor: "#53F2FA",
        highlights: [
          "Custom current profiles",
          "Battery chemistry comparison",
          "Exportable results",
        ],
      },
    ],
  },
  {
    label: "IDENTITY",
    title: "SIM & eSIM",
    description:
      "From plastic SIM cards to iSIM silicon — understand the identity layer that enables global IoT connectivity.",
    accentColor: "#BFFD11",
    lessons: [
      {
        href: "/learn/identity/sim-evolution",
        icon: CreditCard,
        title: "SIM → eSIM → iSIM Timeline",
        description:
          "The evolution of SIM technology from 1991 to today. Learn why the form factor matters for manufacturing, ruggedization, and global deployment at scale.",
        difficulty: "Beginner",
        duration: "8 min",
        accentColor: "#BFFD11",
        highlights: [
          "Interactive timeline",
          "Form factor comparison",
          "Manufacturing implications",
        ],
      },
      {
        href: "/learn/identity/sgp32",
        icon: ScanLine,
        title: "SGP.32 eSIM Standard",
        description:
          "The eSIM IoT standard purpose-built for headless devices. Remote SIM provisioning at scale without human interaction — the key to global fleet management.",
        difficulty: "Intermediate",
        duration: "12 min",
        accentColor: "#53F2FA",
        highlights: [
          "IoT-first architecture",
          "Remote provisioning flow",
          "SGP.32 vs SGP.22 comparison",
        ],
      },
    ],
  },
  {
    label: "SECURITY",
    title: "Security Architecture",
    description:
      "Defense-in-depth for IoT — from hardware root of trust through network isolation to application-layer encryption.",
    accentColor: "#53F2FA",
    lessons: [
      {
        href: "/learn/security/endpoint",
        icon: Shield,
        title: "Endpoint Security Checklist",
        description:
          "Secure boot, hardware root of trust, Tamper-Resistant Element (TRE), and firmware storage security. The foundation of trustworthy IoT endpoints.",
        difficulty: "Intermediate",
        duration: "15 min",
        accentColor: "#BFFD11",
        highlights: [
          "Interactive checklist",
          "Hardware RoT guide",
          "Secure boot chain",
        ],
      },
      {
        href: "/learn/security/network",
        icon: Server,
        title: "Network Security",
        description:
          "Private APNs, VPN tunnels, static IPs, and isolating your device fleet from the public internet. Network-level controls to reduce your attack surface.",
        difficulty: "Intermediate",
        duration: "12 min",
        accentColor: "#53F2FA",
        highlights: [
          "Private APN setup",
          "VPN tunnel architecture",
          "Network isolation patterns",
        ],
      },
      {
        href: "/learn/security/application",
        icon: FileKey,
        title: "Application-Layer Security",
        description:
          "TLS/DTLS encryption, certificate pinning, mutual authentication, and payload-level encryption. The last line of defense for your IoT data.",
        difficulty: "Intermediate",
        duration: "10 min",
        accentColor: "#BFFD11",
        highlights: [
          "TLS vs DTLS comparison",
          "Certificate management",
          "Mutual auth setup",
        ],
      },
    ],
  },
];

const difficultyColors: Record<string, string> = {
  Beginner: "#4ade80",
  Intermediate: "#BFFD11",
  Advanced: "#53F2FA",
};

export default function LearnPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
      {/* Header */}
      <motion.div
        className="mb-16"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.p
          variants={staggerItem}
          className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-3"
        >
          Curriculum
        </motion.p>
        <motion.h1 variants={staggerItem} className="text-4xl font-semibold mb-5">
          Master cellular IoT.
        </motion.h1>
        <motion.p
          variants={staggerItem}
          className="text-lg text-white/55 leading-relaxed max-w-2xl"
        >
          Eleven in-depth lessons covering cellular fundamentals, power optimization, identity
          management, and security architecture — everything you need before building.
        </motion.p>
      </motion.div>

      {/* Section groups */}
      <div className="space-y-20">
        {sections.map((section, sectionIdx) => (
          <div key={section.label}>
            {/* Section header */}
            <motion.div
              className="flex items-center gap-4 mb-3"
              variants={slideInLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: sectionIdx * 0.05 }}
            >
              <p
                className="font-mono text-[11px] font-semibold tracking-widest uppercase"
                style={{ color: section.accentColor }}
              >
                {section.label}
              </p>
              <motion.div
                className="flex-1 h-px bg-[#3A3C46]/30"
                initial={{ scaleX: 0, originX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              />
              <h2 className="text-lg font-semibold text-white/70">{section.title}</h2>
            </motion.div>
            <p className="text-sm text-white/40 leading-relaxed mb-6 max-w-xl">
              {section.description}
            </p>

            {/* Lesson cards — Build-style rich cards */}
            <motion.div
              className="space-y-3"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
            >
              {section.lessons.map((lesson) => (
                <motion.div
                  key={lesson.href}
                  variants={staggerItem}
                  whileHover={{ scale: 1.01, x: 2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <Link
                    href={lesson.href}
                    className="group block rounded-2xl border border-[#3A3C46]/45 bg-[#060a14] hover:border-[#BFFD11]/25 transition-colors duration-200 cursor-pointer overflow-hidden"
                  >
                    <div className="grid sm:grid-cols-[auto_1fr_auto] gap-0 items-stretch">
                      {/* Icon column */}
                      <div
                        className="hidden sm:flex items-center justify-center w-16 border-r shrink-0"
                        style={{
                          borderColor: `${lesson.accentColor}12`,
                          background: `${lesson.accentColor}06`,
                        }}
                      >
                        <div
                          className="w-9 h-9 rounded-[6px] flex items-center justify-center"
                          style={{
                            background: `${lesson.accentColor}12`,
                            border: `1px solid ${lesson.accentColor}25`,
                          }}
                        >
                          <lesson.icon
                            size={16}
                            style={{ color: lesson.accentColor }}
                            strokeWidth={1.75}
                          />
                        </div>
                      </div>

                      {/* Main content */}
                      <div className="p-5 sm:p-6 flex-1 min-w-0">
                        {/* Top row */}
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span
                            className="text-[10px] font-mono font-semibold tracking-wider uppercase px-2 py-0.5 rounded"
                            style={{
                              color: difficultyColors[lesson.difficulty],
                              background: `${difficultyColors[lesson.difficulty]}10`,
                            }}
                          >
                            {lesson.difficulty}
                          </span>
                          <span className="text-[11px] text-white/30 font-mono">
                            {lesson.duration}
                          </span>
                        </div>

                        <h3 className="text-base font-semibold text-white mb-1.5 group-hover:text-[#BFFD11] transition-colors duration-200">
                          {lesson.title}
                        </h3>
                        <p className="text-sm text-white/45 leading-relaxed mb-4 max-w-xl">
                          {lesson.description}
                        </p>

                        {/* Highlights */}
                        <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                          {lesson.highlights.map((h) => (
                            <span
                              key={h}
                              className="flex items-center gap-1.5 text-xs text-white/35"
                            >
                              <Check
                                size={11}
                                style={{ color: lesson.accentColor }}
                                className="shrink-0"
                              />
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right arrow */}
                      <div className="hidden sm:flex items-center justify-center px-6 border-l border-[#3A3C46]/20 shrink-0">
                        <ArrowRight
                          size={18}
                          className="text-white/20 group-hover:text-[#BFFD11] group-hover:translate-x-1 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        ))}
      </div>

      {/* Bottom note */}
      <motion.p
        className="mt-14 text-sm text-white/25 text-center"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        All lessons include interactive tools, real AT commands, and production-ready
        configuration patterns.
      </motion.p>
    </div>
  );
}
