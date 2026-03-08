"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, ChevronRight, Check, CreditCard, Cpu, Cloud, Shield, Factory, TrendingUp, Globe, Zap } from "lucide-react";
import InfoCallout from "@/components/ui/InfoCallout";

/* ── Form Factor Timeline ── */
const formFactors = [
  { year: "1991", name: "Full-size (1FF)", dims: "85.6 × 53.98 mm", era: "Early GSM car phones", active: false },
  { year: "1996", name: "Mini-SIM (2FF)", dims: "25 × 15 mm", era: "Standard for GSM/3G era", active: false },
  { year: "2003", name: "Micro-SIM (3FF)", dims: "15 × 12 mm", era: "iPhone 4, early 4G devices", active: false },
  { year: "2012", name: "Nano-SIM (4FF)", dims: "12.3 × 8.8 mm", era: "Current smartphone standard", active: false },
  { year: "2016+", name: "eSIM (MFF2)", dims: "5 × 6 mm", era: "Soldered; Remote SIM Provisioning", active: true },
  { year: "2023+", name: "iSIM", dims: "Nanometers (in-SoC)", era: "Integrated into System-on-Chip", active: true },
];

/* ── RSP Component Table ── */
const rspComponents = [
  { component: "SM-DP+", description: "Data Preparation Server — encrypts and stores carrier profiles", standard: "SGP.22 / SGP.32" },
  { component: "SM-SR", description: "Secure Routing Server — manages status and routing", standard: "SGP.02 (M2M only)" },
  { component: "eIM", description: "eSIM IoT Manager — orchestrates fleet-wide profile tasks", standard: "SGP.32" },
  { component: "IPA", description: "IoT Profile Assistant — device-side execution of RSP commands", standard: "SGP.32" },
  { component: "eUICC", description: "Secure Element — hardware vault for profile data and keys", standard: "ETSI TS 103 383" },
];

/* ── eSIM vs iSIM Comparison ── */
const simComparison = [
  { metric: "Component Count", traditional: "High (Tray + Connector)", esim: "Low (Discrete Chip)", isim: "Zero (Integrated)" },
  { metric: "Board Space", traditional: "~120 mm²", esim: "~30 mm²", isim: "0 mm² (in SoC)" },
  { metric: "Standby Power", traditional: "Moderate", esim: "Low", isim: "Very Low" },
  { metric: "Manufacturing", traditional: "Manual/Auto Insertion", esim: "SMT Soldering", isim: "Integrated in SoC" },
  { metric: "Durability", traditional: "Low (Contacts)", esim: "High (Soldered)", isim: "Highest (Silicon)" },
  { metric: "IP Rating", traditional: "Limited", esim: "IP68/IP69K capable", isim: "Inherent" },
];

/* ── Architecture Eras ── */
const architectureEras = [
  {
    id: "m2m",
    icon: Factory,
    label: "M2M Standard",
    name: "SGP.02 — Push Model",
    color: "#3A3C46",
    description: "Operator-driven provisioning for always-on industrial devices.",
    detail: "The SM-SR (Secure Routing Server) initiates profile changes via server-to-server integrations. Uses SMS triggers — problematic for LPWAN technologies like NB-IoT that don't support SMS. Complex, rigid, but proven for industrial M2M.",
    keyPoints: [
      "Push model: operator initiates changes via SM-SR",
      "Requires SMS for triggering — incompatible with NB-IoT",
      "Server-to-server integrations between operators",
      "Proven for legacy industrial M2M deployments",
    ],
  },
  {
    id: "consumer",
    icon: CreditCard,
    label: "Consumer Standard",
    name: "SGP.22 — Pull Model",
    color: "#3A3C46",
    description: "User-initiated provisioning via QR code or on-device app.",
    detail: "Built for smartphones and wearables — the user scans a QR code or uses an on-device Local Profile Assistant (LPA) to download profiles. Excellent UX for consumer devices, but fundamentally incompatible with headless IoT sensors that lack screens and cameras.",
    keyPoints: [
      "Pull model: user initiates via QR code scan",
      "Local Profile Assistant (LPA) manages downloads",
      "Ideal for smartphones and wearables",
      "Cannot work on \"headless\" IoT devices (no screen)",
    ],
  },
  {
    id: "iot",
    icon: Cloud,
    label: "IoT Standard",
    name: "SGP.32 — Hybrid Model",
    color: "#BFFD11",
    description: "Server-driven orchestration built for headless, resource-constrained IoT.",
    detail: "Introduces the eSIM IoT Manager (eIM) as a proxy for human interaction, triggering profile downloads across entire fleets. Uses CoAP over UDP (not TCP/HTTPS) and DTLS for security — dramatically reducing power and bandwidth requirements. Works with both IPAd (device-hosted) and IPAe (eUICC-hosted) implementations.",
    keyPoints: [
      "eIM acts as proxy for headless devices",
      "CoAP/UDP replaces heavy TCP/HTTPS",
      "IPAd (512KB) or IPAe (64KB) implementation paths",
      "Designed for 10+ year battery-powered devices",
    ],
  },
];

/* ── TCO Savings ── */
const tcoSavings = [
  { category: "Logistics & Procurement", impact: "Eliminates physical SIM handling, storage, and customs clearance", icon: Globe, color: "#BFFD11" },
  { category: "Connectivity Fees", impact: "Remote provisioning avoids roaming tax — savings of 60–80% on data costs in some markets", icon: TrendingUp, color: "#53F2FA" },
  { category: "Field Service Avoidance", impact: "A single truck roll to replace a failed SIM can exceed the total device cost. eSIM/iSIM virtually eliminates these", icon: Zap, color: "#BFFD11" },
  { category: "Extended Lifespan", impact: "Devices survive carrier 2G/3G sunsets via remote reprovisioning — extending hardware life to 10–15 years", icon: Shield, color: "#53F2FA" },
];

/* ── iSIM Benefits ── */
const isimBenefits = [
  { stat: "0 mm²", label: "Extra PCB Space", detail: "SIM occupies zero board space beyond the SoC footprint — transformative for micro-trackers, healthcare patches, and smart labels." },
  { stat: "~70%", label: "Power Reduction", detail: "Eliminates the external bus between modem and discrete SIM chip. Authentication cycles consume dramatically less energy." },
  { stat: "~50%", label: "BOM Cost Reduction", detail: "Removes SIM as a separate component — eliminates sourcing, soldering, testing, and inventory management costs at scale." },
];

export default function SimEvolutionPage() {
  const [activeEra, setActiveEra] = useState<string | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-10" aria-label="Breadcrumb">
        <Link href="/learn" className="hover:text-white/60 transition-colors cursor-pointer">Learn</Link>
        <ChevronRight size={12} />
        <span className="text-white/50">Identity</span>
        <ChevronRight size={12} />
        <span className="text-[#BFFD11]">SIM Evolution</span>
      </nav>

      {/* Header */}
      <div className="mb-12">
        <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-3">
          Identity · 12 min
        </p>
        <h1 className="text-4xl font-semibold mb-5 leading-tight">
          SIM → eSIM → iSIM
        </h1>
        <p className="text-lg text-white/55 leading-relaxed max-w-2xl">
          The SIM has evolved from a credit-card-sized token to a silicon-integrated identity
          layer within the modem&apos;s SoC. This isn&apos;t just miniaturization — it&apos;s a fundamental
          redesign of device lifecycles, global logistics, and hardware security that enables
          software-defined connectivity at massive IoT scale.
        </p>
      </div>

      {/* ── Section 1: Physical Evolution Timeline ── */}
      <section className="mb-20">
        <h2 className="text-2xl font-semibold mb-2">The Miniaturization Timeline</h2>
        <p className="text-white/45 mb-8 leading-relaxed">
          30+ years of continuous physical reduction — from 85mm credit cards to nanometer-scale
          silicon blocks integrated into the modem die.
        </p>

        <div className="space-y-1.5">
          {formFactors.map((ff, idx) => (
            <div
              key={idx}
              className={`rounded-xl border p-4 flex items-center gap-4 ${ff.active
                  ? "border-[#BFFD11]/30 bg-[#BFFD11]/4"
                  : "border-[#3A3C46]/40 bg-[#060a14]"
                }`}
            >
              <div className={`w-14 text-center shrink-0 ${ff.active ? "text-[#BFFD11]" : "text-white/30"}`}>
                <p className="font-mono text-xs font-semibold">{ff.year}</p>
              </div>
              <div className="w-px h-8 bg-[#3A3C46]/40 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${ff.active ? "text-white" : "text-white/60"}`}>
                  {ff.name}
                </p>
                <p className="text-xs text-white/30">{ff.era}</p>
              </div>
              <p className="font-mono text-xs text-white/25 shrink-0 hidden sm:block">{ff.dims}</p>
              {ff.active && (
                <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-semibold bg-[#BFFD11]/15 text-[#BFFD11] border border-[#BFFD11]/20 shrink-0">
                  CURRENT
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      <InfoCallout type="info">
        <strong>Environmental impact.</strong> Billions of physical SIM cards are produced annually,
        shipped in oversized plastic carriers — creating thousands of tons of plastic waste.
        The physical SIM also represents a single point of mechanical failure: oxidizing contacts
        and failing tray mechanisms drive costly &quot;truck rolls&quot; for field replacement.
      </InfoCallout>

      {/* ── Section 2: The eSIM Paradigm Shift ── */}
      <section className="mt-16 mb-20">
        <h2 className="text-2xl font-semibold mb-2">The eSIM Paradigm Shift</h2>
        <p className="text-white/45 mb-8 leading-relaxed">
          The eSIM (eUICC) isn&apos;t just a smaller SIM — it&apos;s a software-defined identity layer.
          Soldered directly to the PCB in an MFF2 package, it enables Remote SIM Provisioning
          (RSP): over-the-air download, activation, and management of carrier profiles.
        </p>

        <div className="grid sm:grid-cols-2 gap-5 mb-8">
          <div className="rounded-xl border border-[#BFFD11]/20 bg-[#BFFD11]/4 p-6">
            <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-3">
              Hardware Benefits
            </p>
            <ul className="space-y-2 text-sm text-white/55">
              {[
                "No SIM tray — fully hermetic designs possible",
                "IP68/IP69K ratings for water and dust",
                "Superior shock and vibration resistance",
                "Reduced PCB footprint (~30 mm²)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check size={13} className="text-[#BFFD11] shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-[#53F2FA]/15 bg-[#53F2FA]/3 p-6">
            <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#53F2FA] mb-3">
              Software Benefits
            </p>
            <ul className="space-y-2 text-sm text-white/55">
              {[
                "Over-the-air carrier profile switching",
                "Remote provisioning for deployed fleets",
                "No physical access needed for carrier changes",
                "Multi-profile storage on a single chip",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check size={13} className="text-[#53F2FA] shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Section 3: RSP Architecture Components ── */}
      <section className="mb-20">
        <h2 className="text-xl font-semibold mb-2">Remote Provisioning Architecture</h2>
        <p className="text-white/45 mb-8 leading-relaxed text-sm">
          The eSIM ecosystem relies on standardized components to manage the profile lifecycle.
        </p>

        <div className="rounded-xl border border-[#3A3C46]/40 overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-[#0a0e1a] border-b border-[#3A3C46]/40">
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Component</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Description</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-[#BFFD11]">Standard</th>
              </tr>
            </thead>
            <tbody className="bg-[#030710]">
              {rspComponents.map((comp, idx) => (
                <tr key={idx} className="border-b border-[#3A3C46]/15 last:border-0">
                  <td className="px-5 py-3.5 font-mono text-sm text-[#BFFD11]">{comp.component}</td>
                  <td className="px-5 py-3.5 text-white/45">{comp.description}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-white/40">{comp.standard}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Section 4: Architecture Eras ── */}
      <section className="mb-20">
        <h2 className="text-2xl font-semibold mb-2">Standards Evolution</h2>
        <p className="text-white/45 mb-8 leading-relaxed">
          Three generations of standards — each solving the limitations of the last.
          Click any era to explore its architecture and tradeoffs.
        </p>

        <div className="space-y-2">
          {architectureEras.map((era) => {
            const isActive = activeEra === era.id;
            const Icon = era.icon;
            return (
              <div
                key={era.id}
                className={`rounded-xl border transition-all duration-200 cursor-pointer ${isActive
                    ? "border-[#BFFD11]/40 bg-[#BFFD11]/4"
                    : "border-[#3A3C46]/40 bg-[#060a14] hover:border-[#3A3C46]/70"
                  }`}
                onClick={() => setActiveEra(isActive ? null : era.id)}
              >
                <div className="flex items-center gap-4 p-5">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: `${era.color}12`,
                      border: `1px solid ${era.color}25`,
                    }}
                  >
                    <Icon size={18} style={{ color: era.color }} strokeWidth={1.5} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[10px] font-semibold tracking-widest uppercase mb-0.5" style={{ color: era.color }}>
                      {era.label}
                    </p>
                    <p className="text-base font-semibold text-white">{era.name}</p>
                  </div>

                  <p className="hidden sm:block text-sm text-white/40 max-w-xs text-right flex-1">
                    {era.description}
                  </p>

                  <div
                    className="w-5 h-5 flex items-center justify-center transition-transform duration-200 shrink-0"
                    style={{ transform: isActive ? "rotate(90deg)" : "rotate(0deg)" }}
                  >
                    <ChevronRight size={14} className="text-white/30" />
                  </div>
                </div>

                <p className="sm:hidden px-5 pb-3 text-sm text-white/40">{era.description}</p>

                {isActive && (
                  <div className="px-5 pb-6 border-t border-[#BFFD11]/10 pt-5">
                    <p className="text-sm text-white/65 leading-relaxed mb-5">{era.detail}</p>
                    <div>
                      <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-3">
                        Key Points
                      </p>
                      <ul className="space-y-2">
                        {era.keyPoints.map((point) => (
                          <li key={point} className="flex items-start gap-2.5 text-sm text-white/55">
                            <Check size={13} className="shrink-0 mt-0.5" style={{ color: era.color }} />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Section 5: iSIM Deep-Dive ── */}
      <section className="mb-20">
        <h2 className="text-2xl font-semibold mb-2">The iSIM: Virtualizing the Hardware</h2>
        <p className="text-white/45 mb-8 leading-relaxed">
          iSIM integrates SIM functionality directly into the modem&apos;s SoC — the SIM
          no longer exists as a discrete physical component. A hardware-secured Tamper-Resistant
          Element (TRE) provides security equivalent to discrete secure elements.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {isimBenefits.map((benefit) => (
            <div
              key={benefit.label}
              className="rounded-xl border border-[#BFFD11]/20 bg-[#BFFD11]/4 p-5"
            >
              <p className="text-2xl font-semibold text-[#BFFD11] mb-1">{benefit.stat}</p>
              <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/50 mb-2">
                {benefit.label}
              </p>
              <p className="text-xs text-white/40 leading-relaxed">{benefit.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <InfoCallout type="tip">
        <strong>First GSMA-certified iSIM:</strong> In February 2023, Qualcomm and Thales
        announced the first certified iSIM on Snapdragon 8 Gen 2. For IoT, Sony&apos;s ALT1250
        and Kigen&apos;s chipsets combine MCU, modem, and SIM into a single power-efficient package.
      </InfoCallout>

      {/* ── Section 6: SIM Comparison Table ── */}
      <section className="mt-16 mb-20">
        <h2 className="text-xl font-semibold mb-2">Traditional SIM vs eSIM vs iSIM</h2>
        <p className="text-white/45 mb-8 leading-relaxed text-sm">
          How the three paradigms compare across manufacturing and operational dimensions.
        </p>
        <p className="text-xs text-white/25 mb-8">Scroll horizontally on mobile to see all columns.</p>

        <div className="rounded-xl border border-[#3A3C46]/40 overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[550px]">
            <thead>
              <tr className="bg-[#0a0e1a] border-b border-[#3A3C46]/40">
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Metric</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Traditional (4FF)</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">eSIM (MFF2)</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-[#BFFD11]">iSIM</th>
              </tr>
            </thead>
            <tbody className="bg-[#030710]">
              {simComparison.map((row, idx) => (
                <tr key={idx} className="border-b border-[#3A3C46]/15 last:border-0">
                  <td className="px-5 py-3.5 text-white/70 font-medium">{row.metric}</td>
                  <td className="px-5 py-3.5 text-white/40">{row.traditional}</td>
                  <td className="px-5 py-3.5 text-white/45">{row.esim}</td>
                  <td className="px-5 py-3.5 text-[#BFFD11]/80 font-mono text-xs">{row.isim}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Section 7: Single SKU Strategy ── */}
      <section className="mb-20">
        <h2 className="text-2xl font-semibold mb-2">Single SKU & Late-Stage Provisioning</h2>
        <p className="text-white/45 mb-8 leading-relaxed">
          eSIM/iSIM eliminates &quot;SKU sprawl&quot; — a single hardware variant ships globally
          with a bootstrap profile. The carrier is selected at deployment time, not manufacturing time.
        </p>

        <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] p-6 space-y-4">
          {[
            {
              title: "Single Global SKU",
              detail: "One hardware variant for all markets. A generic bootstrap profile provides enough connectivity to wake up, connect to the RSP platform, and download the local operator profile.",
            },
            {
              title: "Late-Stage Provisioning",
              detail: "Carrier selection happens at deployment. If a batch of trackers destined for Germany is rerouted to Brazil, the change is software-only — no hardware modification needed.",
            },
            {
              title: "In-Factory Profile Provisioning (IFPP)",
              detail: "SGP.41/42 standards enable profile injection during manufacturing (via USB, UART, or Wi-Fi). Device ships with optimal local connectivity, avoiding power-intensive OTA download on first boot.",
            },
          ].map((item) => (
            <div key={item.title} className="border-b border-[#3A3C46]/20 last:border-0 pb-4 last:pb-0">
              <p className="text-sm font-semibold text-white/75 mb-1">{item.title}</p>
              <p className="text-sm text-white/45 leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 8: TCO Savings ── */}
      <section className="mb-20">
        <h2 className="text-2xl font-semibold mb-2">Total Cost of Ownership Savings</h2>
        <p className="text-white/45 mb-8 leading-relaxed">
          eSIM/iSIM saves 8–13% of total lifetime connectivity costs. The savings come from
          four key operational areas.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {tcoSavings.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.category}
                className="rounded-xl border p-5"
                style={{ borderColor: `${item.color}20`, background: `${item.color}04` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${item.color}12`, border: `1px solid ${item.color}20` }}
                  >
                    <Icon size={15} style={{ color: item.color }} strokeWidth={1.5} />
                  </div>
                  <p className="font-semibold text-white text-sm">{item.category}</p>
                </div>
                <p className="text-sm text-white/45 leading-relaxed">{item.impact}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Section 9: Security Evolution ── */}
      <section className="mb-20">
        <h2 className="text-xl font-semibold mb-2">Security: From Physical Locks to Crypto Enclaves</h2>
        <p className="text-white/45 mb-8 leading-relaxed text-sm">
          The SIM has always been the Root of Trust for cellular networks. Its evolution
          has dramatically strengthened the cryptographic posture.
        </p>

        <div className="grid sm:grid-cols-2 gap-5">
          <div className="rounded-xl border border-[#BFFD11]/20 bg-[#BFFD11]/4 p-6">
            <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-3">
              IoT SAFE Framework
            </p>
            <p className="text-sm text-white/55 leading-relaxed mb-4">
              The GSMA&apos;s IoT SAFE leverages eSIM/iSIM as a hardware Root of Trust for
              chip-to-cloud communication. Cryptographic keys are stored within the eUICC
              or TRE and never leave the secure element.
            </p>
            <ul className="space-y-2 text-sm text-white/55">
              {[
                "Mutual authentication with AWS, Azure, GCP",
                "Keys never exposed to main OS",
                "Foundation for Zero-Trust architectures",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check size={13} className="text-[#BFFD11] shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-[#53F2FA]/15 bg-[#53F2FA]/3 p-6">
            <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#53F2FA] mb-3">
              iSIM Tamper Resistance
            </p>
            <p className="text-sm text-white/55 leading-relaxed mb-4">
              Because iSIM is in the SoC, there are no exposed PCB traces between modem
              and SIM that an attacker could monitor. The TRE is physically and logically
              isolated with its own secure memory and crypto engine.
            </p>
            <ul className="space-y-2 text-sm text-white/55">
              {[
                "Smallest possible attack surface",
                "No physical interception path",
                "AES/ECC encryption for profile operations",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check size={13} className="text-[#53F2FA] shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Section 10: Market & Future ── */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-2">The 2026 Tipping Point & Beyond</h2>
        <p className="text-white/45 mb-8 leading-relaxed">
          2026 is the definitive inflection point for virtualized SIM technology in IoT.
        </p>

        <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] p-6 space-y-4 mb-8">
          {[
            { label: "eSIM Device Shipments", value: "633M+ units/year by 2026" },
            { label: "iSIM Connections", value: "~10M by 2026 → 210M+ by 2028" },
            { label: "Smart Meter SIMs", value: "230M+ installations globally by 2026" },
            { label: "Automotive eSIM", value: "70%+ of new vehicles in North America" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center justify-between border-b border-[#3A3C46]/20 last:border-0 pb-3 last:pb-0">
              <p className="text-sm text-white/55">{stat.label}</p>
              <p className="font-mono text-xs text-[#BFFD11]">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-[#53F2FA]/15 bg-[#53F2FA]/3 p-6">
          <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#53F2FA] mb-3">
            Future Outlook
          </p>
          <ul className="space-y-3 text-sm text-white/55">
            {[
              "AI-driven autonomous profile management — devices analyze network performance and switch carriers without human intervention",
              "Post-Quantum Cryptography (PQC) in future SIM specifications to protect against quantum decryption threats",
              "Ambient IoT — paper-thin, battery-less sensors using ultra-lightweight iSIM for secure identity",
              "Satellite NTN integration — seamless switching between terrestrial and LEO satellite networks using the same virtualized profile",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <Check size={13} className="text-[#53F2FA] shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Navigation */}
      <div className="pt-8 border-t border-[#3A3C46]/30 flex justify-between items-center">
        <Link
          href="/learn/foundations/5g-redcap"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          5G RedCap
        </Link>
        <Link
          href="/learn/identity/sgp32"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#BFFD11] hover:gap-3 transition-all duration-200 cursor-pointer"
        >
          Next: SGP.32 eSIM Standard
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
