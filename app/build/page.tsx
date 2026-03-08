"use client";

import Link from "next/link";
import { ArrowRight, Radio, Camera, Building2, Leaf, Bike, Check } from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, fadeUp } from "@/lib/animations";

const guides = [
  {
    href: "/build/asset-tracker",
    icon: Radio,
    label: "FLAGSHIP GUIDE",
    title: "Global Asset Tracker",
    description:
      "Build a cellular-connected GPS tracker from scratch — hardware selection, AT command configuration, MicroPython and C++ firmware, GPS parsing, and full security hardening.",
    tech: "LTE-M / NB-IoT",
    connectivity: "Dual-mode",
    difficulty: "Intermediate",
    duration: "45 min",
    accentColor: "#BFFD11",
    highlights: [
      "Interactive Bill of Materials",
      "Full AT command walkthrough",
      "MicroPython + C++ firmware",
      "Live GPS coordinate parser",
      "Security hardening checklist",
    ],
  },
  {
    href: "/build/smart-camera",
    icon: Camera,
    label: "BUILD GUIDE",
    title: "Smart Camera",
    description:
      "IoT-enabled camera and video analytics. Edge vs cloud architecture decision, bandwidth planning for HD streaming, and antenna selection for 5G NR.",
    tech: "5G NR / LTE Cat 1",
    connectivity: "High-bandwidth",
    difficulty: "Advanced",
    duration: "25 min",
    accentColor: "#53F2FA",
    highlights: [
      "Edge vs cloud architecture comparison",
      "Bandwidth calculator",
      "4×4 MIMO antenna setup",
      "Event-based vs continuous streaming",
      "5G NR network selection",
    ],
  },
  {
    href: "/build/smart-building",
    icon: Building2,
    label: "BUILD GUIDE",
    title: "Smart Building Sensor",
    description:
      "NB-IoT sensors for air quality, metering, and lighting. Deep indoor Coverage Extension, UDP protocol selection, and CBOR payload optimization for 10-year battery life.",
    tech: "NB-IoT",
    connectivity: "LPWA static",
    difficulty: "Beginner",
    duration: "20 min",
    accentColor: "#BFFD11",
    highlights: [
      "Coverage Extension (CE) mode setup",
      "JSON vs CBOR payload comparison",
      "CoAP / MQTT-SN protocol guide",
      "Deployment density planning",
      "Interactive payload builder",
    ],
  },
  {
    href: "/build/smart-agriculture",
    icon: Leaf,
    label: "BUILD GUIDE",
    title: "Smart Agriculture Sensor",
    description:
      "Solar-powered field sensor node for precision agriculture — soil moisture, NPK nutrients, and weather monitoring with ruggedized enclosures and MPPT solar harvesting.",
    tech: "NB-IoT / LTE-M",
    connectivity: "Dual-mode",
    difficulty: "Intermediate",
    duration: "30 min",
    accentColor: "#BFFD11",
    highlights: [
      "SDI-12 / RS-485 sensor interfaces",
      "Solar MPPT power harvesting",
      "IP67 enclosure engineering",
      "eSIM / iSIM ruggedization",
      "Zero-Touch Provisioning",
    ],
  },
  {
    href: "/build/micromobility",
    icon: Bike,
    label: "BUILD GUIDE",
    title: "Connected Micromobility",
    description:
      "Cellular IoT-enabled electric scooter or e-bike — FOC motor control, BMS integration, centimeter GNSS positioning, Zephyr RTOS firmware, fleet security, and PTCRB certification.",
    tech: "LTE-M / Cat 1bis",
    connectivity: "Full mobility",
    difficulty: "Advanced",
    duration: "40 min",
    accentColor: "#53F2FA",
    highlights: [
      "FOC motor control architecture",
      "Dual-band GNSS + RTK positioning",
      "Zephyr RTOS + CAN bus firmware",
      "MQTT vs LwM2M comparison",
      "PTCRB certification guide",
    ],
  },
];

const difficultyColors: Record<string, string> = {
  Beginner: "#4ade80",
  Intermediate: "#BFFD11",
  Advanced: "#53F2FA",
};

export default function BuildPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
      {/* Header */}
      <motion.div
        className="mb-14"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.p
          variants={staggerItem}
          className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-3"
        >
          Build Guides
        </motion.p>
        <motion.h1 variants={staggerItem} className="text-4xl font-semibold mb-5">
          Pick your device archetype.
        </motion.h1>
        <motion.p
          variants={staggerItem}
          className="text-lg text-white/55 leading-relaxed max-w-2xl"
        >
          Five complete build guides covering the most common cellular IoT device categories.
          Each guide walks from hardware selection through firmware and security hardening.
        </motion.p>
      </motion.div>

      {/* Guide cards */}
      <motion.div
        className="space-y-5"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {guides.map((guide) => (
          <motion.div
            key={guide.href}
            variants={staggerItem}
            whileHover={{ scale: 1.01, x: 2 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <Link
              href={guide.href}
              className="group block rounded-2xl border border-[#3A3C46]/45 bg-[#060a14] hover:border-[#BFFD11]/25 transition-colors duration-200 cursor-pointer overflow-hidden"
            >
              <div className="grid sm:grid-cols-[auto_1fr_auto] gap-0 items-stretch">
                {/* Icon column */}
                <div
                  className="hidden sm:flex items-center justify-center w-20 border-r shrink-0"
                  style={{ borderColor: `${guide.accentColor}12`, background: `${guide.accentColor}06` }}
                >
                  <div
                    className="w-10 h-10 rounded-[6px] flex items-center justify-center"
                    style={{
                      background: `${guide.accentColor}12`,
                      border: `1px solid ${guide.accentColor}25`,
                    }}
                  >
                    <guide.icon size={18} style={{ color: guide.accentColor }} strokeWidth={1.75} />
                  </div>
                </div>

                {/* Main content */}
                <div className="p-6 sm:p-7 flex-1 min-w-0">
                  {/* Top row */}
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span
                      className="font-mono text-[10px] font-semibold tracking-widest uppercase"
                      style={{ color: guide.accentColor }}
                    >
                      {guide.label}
                    </span>
                    <span
                      className="text-[10px] font-mono font-semibold tracking-wider uppercase px-2 py-0.5 rounded"
                      style={{
                        color: difficultyColors[guide.difficulty],
                        background: `${difficultyColors[guide.difficulty]}10`,
                      }}
                    >
                      {guide.difficulty}
                    </span>
                    <span className="text-[11px] text-white/30 font-mono">{guide.duration}</span>
                  </div>

                  <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-[#BFFD11] transition-colors duration-200">
                    {guide.title}
                  </h2>
                  <p className="text-sm text-white/50 leading-relaxed mb-5 max-w-xl">
                    {guide.description}
                  </p>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                    {guide.highlights.map((h) => (
                      <span key={h} className="flex items-center gap-1.5 text-xs text-white/35">
                        <Check size={11} style={{ color: guide.accentColor }} className="shrink-0" />
                        {h}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: tech badge + arrow */}
                <div className="hidden sm:flex flex-col items-end justify-between p-7 border-l border-[#3A3C46]/20 shrink-0 w-44">
                  <div className="text-right">
                    <p className="font-mono text-[10px] tracking-widest uppercase text-white/20 mb-1">
                      Connectivity
                    </p>
                    <p
                      className="font-mono text-sm font-semibold"
                      style={{ color: guide.accentColor }}
                    >
                      {guide.tech}
                    </p>
                    <p className="text-xs text-white/30 mt-0.5">{guide.connectivity}</p>
                  </div>
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

      {/* Bottom note */}
      <motion.p
        className="mt-10 text-sm text-white/25 text-center"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        All guides use real hardware, copy-pasteable AT commands, and production-grade firmware patterns.
      </motion.p>
    </div>
  );
}
