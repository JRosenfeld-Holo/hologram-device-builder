"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, ChevronRight, Check, Cpu, Radio, Zap, Signal, Crosshair, Layers } from "lucide-react";
import { motion } from "framer-motion";
import InfoCallout from "@/components/ui/InfoCallout";
import { staggerContainer, staggerItem } from "@/lib/animations";

/* ── Spec Comparison ── */
const specComparison = [
  { spec: "Release Year", nr: "2019", redcap: "2022/2023", eredcap: "2024/2025" },
  { spec: "Max Bandwidth (FR1)", nr: "100 MHz", redcap: "20 MHz", eredcap: "20 MHz (Reduced Data)" },
  { spec: "Rx Antennas", nr: "2 or 4", redcap: "1 or 2", eredcap: "1 (Typical)" },
  { spec: "Peak DL Rate", nr: ">2 Gbps", redcap: "~220 Mbps", eredcap: "10 Mbps" },
  { spec: "Peak UL Rate", nr: ">1 Gbps", redcap: "~120 Mbps", eredcap: "10 Mbps" },
  { spec: "Modulation (DL/UL)", nr: "256 QAM / 64 QAM", redcap: "64 QAM / 64 QAM", eredcap: "64 QAM / 64 QAM" },
  { spec: "Duplexing", nr: "Full-Duplex FDD/TDD", redcap: "HD-FDD, FDD, TDD", eredcap: "HD-FDD, FDD, TDD" },
  { spec: "Target Use Cases", nr: "Smartphones, XR, FWA", redcap: "Industrial sensors, cameras", eredcap: "Simple tracking, basic IoT" },
];

/* ── Complexity Reductions ── */
const complexityReductions = [
  {
    id: "bandwidth",
    icon: Radio,
    label: "Bandwidth Reduction",
    color: "#BFFD11",
    stat: "20 MHz",
    statLabel: "vs 100 MHz in standard NR",
    description: "Maximum bandwidth limited to 20 MHz in FR1 (sub-7 GHz) and 100 MHz in FR2, down from 100 MHz and 400 MHz respectively.",
    detail: "This directly reduces the complexity of the RF front-end, ADC/DAC requirements, and baseband processing. The narrower bandwidth means simpler filters, lower sampling rates, and smaller FFT sizes in the OFDM processor.",
  },
  {
    id: "antennas",
    icon: Signal,
    label: "Antenna Simplification",
    color: "#53F2FA",
    stat: "1–2 Rx",
    statLabel: "vs 2–4 Rx in standard NR",
    description: "Mandatory antenna count reduced to 1Rx or 2Rx, eliminating the need for complex 4×4 MIMO configurations.",
    detail: "Fewer antennas mean fewer RF chains, fewer amplifiers, fewer phase shifters, and a simpler PCB layout. For 1Rx SISO mode, a single antenna saves significant BOM cost and board space — ideal for compact trackers and sensors.",
  },
  {
    id: "duplex",
    icon: Layers,
    label: "Half-Duplex FDD",
    color: "#BFFD11",
    stat: "No Duplexer",
    statLabel: "HD-FDD eliminates expensive component",
    description: "Optional Half-Duplex FDD mode allows the device to avoid simultaneous transmit/receive, removing the need for costly duplexers.",
    detail: "Duplexers are one of the most expensive and bulky components in the RF front-end. HD-FDD swaps the duplexer for a simple RF switch, reducing BOM cost by $1–2 per unit and freeing PCB real estate. The tradeoff is slightly reduced throughput, which is acceptable for most IoT workloads.",
  },
  {
    id: "modulation",
    icon: Cpu,
    label: "Lower Modulation Order",
    color: "#53F2FA",
    stat: "64 QAM",
    statLabel: "vs 256 QAM in standard NR",
    description: "Default modulation of 64 QAM (vs 256 QAM) reduces baseband processor complexity and power consumption.",
    detail: "256 QAM requires extremely precise signal processing and high signal-to-noise ratios. By capping at 64 QAM, RedCap reduces the bit precision needed in the baseband DSP, which directly lowers silicon area and dynamic power consumption. This translates to ~65% modem complexity reduction for mid-band devices.",
  },
];

/* ── Chipset Providers ── */
const chipsets = [
  {
    provider: "Qualcomm",
    chipset: "Snapdragon X35",
    process: "—",
    highlights: [
      "First commercial RedCap modem-RF system",
      "Integrated baseband, RF transceiver, and PMIC",
      "LTE Cat 4 backward compatibility",
      "Industry-leading global carrier certifications",
    ],
    color: "#BFFD11",
  },
  {
    provider: "MediaTek",
    chipset: "T300 / M60",
    process: "6nm TSMC",
    highlights: [
      "Single-die RFSoC — lowest component count",
      "Up to 60% power reduction vs LTE Cat 4",
      "Cost-optimized for high-volume IoT",
      "Strong in Asian market certifications",
    ],
    color: "#53F2FA",
  },
  {
    provider: "UNISOC / ASR",
    chipset: "V517 / ASR1903",
    process: "—",
    highlights: [
      "Lowest cost per unit for mass-market IoT",
      "Tailored for high-volume deployments",
      "Regional (Asia-focused) certifications",
      "Growing global operator support",
    ],
    color: "#BFFD11",
  },
];

/* ── Module Form Factors ── */
const moduleFormFactors = [
  { name: "LGA", type: "Surface-mount", bestFor: "High-volume industrial sensors, compact wearables", pros: "Smallest footprint, lowest profile" },
  { name: "M.2", type: "Plug-and-play card", bestFor: "Routers, gateways, industrial computing", pros: "Easy prototyping, swappable" },
  { name: "Mini PCIe", type: "Plug-and-play card", bestFor: "Legacy industrial platforms, upgrading Cat 4 devices", pros: "Drop-in 4G replacement" },
];

/* ── Power Design ── */
const powerSpecs = [
  { label: "Supply Voltage", value: "3.3–4.3V", detail: "Nominal 3.8V; direct Li-Ion/Li-Po battery connection", color: "#BFFD11" },
  { label: "Peak Current", value: "Up to 2A", detail: "During RF transmission bursts; needs robust decoupling", color: "#53F2FA" },
  { label: "Bulk Cap", value: "≥ 470 µF", detail: "Low ESR, placed as close to VBAT pin as possible", color: "#BFFD11" },
];

/* ── AT Commands ── */
const atCommands = [
  { category: "Network Preference", command: "AT+QNWPREFCFG=\"mode_pref\",LTE:NR5G", purpose: "Enable multi-mode LTE + 5G NR (RedCap)" },
  { category: "Network Preference", command: "AT+QNWPREFCFG=\"mode_pref\",NR5G", purpose: "Force 5G NR only (no LTE fallback)" },
  { category: "APN Configuration", command: "AT+CGDCONT=1,\"IP\",\"iot.provider.apn\"", purpose: "Set IP context with carrier APN" },
  { category: "Registration Check", command: "AT+CEREG?", purpose: "Query 5G NR registration status" },
  { category: "Power Saving", command: "AT+CEDRXS=1,5,\"0010\"", purpose: "Enable eDRX with configured cycle" },
  { category: "Power Saving", command: "AT+CPSMS=1,,,\"01000011\",\"00000001\"", purpose: "Enable PSM with TAU and active timers" },
  { category: "BIP/STK", command: "AT+QCFG=\"stk/sms\",1", purpose: "Activate SIM Toolkit (required for SGP.32)" },
  { category: "BIP/STK", command: "AT+QCFG=\"bip/enable\",1", purpose: "Enable Bearer Independent Protocol" },
];

/* ── Advanced Features ── */
const advancedFeatures = [
  {
    icon: Crosshair,
    title: "Enhanced Positioning (Rel-18)",
    color: "#BFFD11",
    description:
      "Despite the 20 MHz bandwidth limitation, Release 18 enables centimeter-level accuracy by aggregating Positioning Reference Signals (PRS) across up to 3 frequency layers — achieving an effective 100 MHz bandwidth for positioning.",
    useCases: "AGVs in factories, high-precision asset tracking, logistics",
  },
  {
    icon: Layers,
    title: "Network Slicing",
    color: "#53F2FA",
    description:
      "RedCap natively supports 5G network slicing — partitioning a single physical network into virtual networks with different QoS characteristics. Assign a dedicated low-latency slice for safety sensors while using a separate slice for routine telemetry.",
    useCases: "Industrial automation, mixed-criticality IoT deployments",
  },
  {
    icon: Radio,
    title: "5G LAN",
    color: "#BFFD11",
    description:
      "Cellular devices can communicate within a private network as if on a local Ethernet LAN using Layer-2 communication. This eliminates complex VPN or routing configurations for factory automation integration.",
    useCases: "Factory floors, private enterprise networks, OT/IT convergence",
  },
];

/* ── Bar chart data ── */
const performanceBars = [
  { label: "Modem Complexity", nr: 100, redcap: 35, eredcap: 20, unit: "%" },
  { label: "Peak Downlink", nr: 100, redcap: 11, eredcap: 0.5, unit: "% of NR" },
  { label: "Power Efficiency", nr: 30, redcap: 75, eredcap: 100, unit: "(higher = better)" },
  { label: "Module Cost", nr: 100, redcap: 40, eredcap: 25, unit: "(lower = better)" },
];

export default function RedCapPage() {
  const [activeReduction, setActiveReduction] = useState<string | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-10" aria-label="Breadcrumb">
        <Link href="/learn" className="hover:text-white/60 transition-colors cursor-pointer">Learn</Link>
        <ChevronRight size={12} />
        <span className="text-white/50">Foundations</span>
        <ChevronRight size={12} />
        <span className="text-[#BFFD11]">5G RedCap</span>
      </nav>

      {/* Header */}
      <motion.div className="mb-12" variants={staggerContainer} initial="hidden" animate="visible">
        <motion.p variants={staggerItem} className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-3">
          Foundations · 8 min
        </motion.p>
        <motion.h1 variants={staggerItem} className="text-4xl font-semibold mb-5 leading-tight">
          5G RedCap for IoT
        </motion.h1>
        <motion.p variants={staggerItem} className="text-lg text-white/55 leading-relaxed max-w-2xl">
          5G Reduced Capability (RedCap), standardized in 3GPP Release 17, bridges the gap between
          high-throughput 5G NR and low-power LPWA technologies. It delivers the right-sized
          connectivity for industrial sensors, wearables, and smart cameras &mdash; with ~65% lower modem
          complexity and native support for network slicing.
        </motion.p>
      </motion.div>

      {/* ── Section 1: Performance at a Glance ── */}
      <section className="mb-20">
        <h2 className="text-xl font-semibold mb-2">Performance at a Glance</h2>
        <p className="text-white/40 text-sm mb-8">Relative comparison across key dimensions (normalized to standard 5G NR)</p>
        <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] p-6">
          <div className="space-y-6">
            {performanceBars.map((metric) => (
              <div key={metric.label}>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-white/60">{metric.label}</p>
                  <p className="text-xs font-mono text-white/25">{metric.unit}</p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-16 text-[10px] font-mono text-white/30 uppercase tracking-wider">5G NR</span>
                    <div className="flex-1 h-2.5 bg-[#0a0e1a] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#3A3C46] transition-all duration-700" style={{ width: `${metric.nr}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-16 text-[10px] font-mono text-[#BFFD11] uppercase tracking-wider">RedCap</span>
                    <div className="flex-1 h-2.5 bg-[#0a0e1a] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#BFFD11] transition-all duration-700" style={{ width: `${metric.redcap}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-16 text-[10px] font-mono text-[#53F2FA] uppercase tracking-wider">eRedCap</span>
                    <div className="flex-1 h-2.5 bg-[#0a0e1a] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#53F2FA] transition-all duration-700" style={{ width: `${metric.eredcap}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 2: Full Spec Table ── */}
      <section className="mb-20">
        <h2 className="text-xl font-semibold mb-2">Specification Comparison</h2>
        <p className="text-white/45 mb-4 leading-relaxed text-sm">
          Release 17 RedCap vs Release 18 eRedCap vs standard 5G NR.
        </p>
        <p className="text-xs text-white/25 mb-8">Scroll horizontally on mobile to see all columns.</p>

        <div className="rounded-xl border border-[#3A3C46]/40 overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-[#0a0e1a] border-b border-[#3A3C46]/40">
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Specification</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Standard 5G NR</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-[#BFFD11]">5G RedCap (Rel-17)</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-[#53F2FA]">eRedCap (Rel-18)</th>
              </tr>
            </thead>
            <tbody className="bg-[#030710]">
              {specComparison.map((row, idx) => (
                <tr key={idx} className="border-b border-[#3A3C46]/15 last:border-0">
                  <td className="px-5 py-3.5 text-white/70 font-medium">{row.spec}</td>
                  <td className="px-5 py-3.5 text-white/40">{row.nr}</td>
                  <td className="px-5 py-3.5 text-[#BFFD11]/80 font-mono text-xs">{row.redcap}</td>
                  <td className="px-5 py-3.5 text-[#53F2FA]/80 font-mono text-xs">{row.eredcap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Section 3: Complexity Reductions ── */}
      <section className="mb-20">
        <h2 className="text-2xl font-semibold mb-2">How RedCap Reduces Complexity</h2>
        <p className="text-white/45 mb-8 leading-relaxed">
          Four key design simplifications that reduce modem complexity by ~65% for mid-band devices.
          Click any mechanism to explore the engineering tradeoffs.
        </p>

        <div className="space-y-2">
          {complexityReductions.map((item) => {
            const isActive = activeReduction === item.id;
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`rounded-xl border transition-all duration-200 cursor-pointer ${isActive
                  ? "border-[#BFFD11]/40 bg-[#BFFD11]/4"
                  : "border-[#3A3C46]/40 bg-[#060a14] hover:border-[#3A3C46]/70"
                  }`}
                onClick={() => setActiveReduction(isActive ? null : item.id)}
              >
                <div className="flex items-center gap-4 p-5">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: `${item.color}12`,
                      border: `1px solid ${item.color}25`,
                    }}
                  >
                    <Icon size={18} style={{ color: item.color }} strokeWidth={1.5} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[10px] font-semibold tracking-widest uppercase mb-0.5" style={{ color: item.color }}>
                      {item.label}
                    </p>
                    <p className="text-base font-semibold text-white">
                      {item.stat}
                      <span className="text-white/30 text-sm font-normal ml-2">{item.statLabel}</span>
                    </p>
                  </div>

                  <p className="hidden sm:block text-sm text-white/40 max-w-xs text-right flex-1">
                    {item.description}
                  </p>

                  <div
                    className="w-5 h-5 flex items-center justify-center transition-transform duration-200 shrink-0"
                    style={{ transform: isActive ? "rotate(90deg)" : "rotate(0deg)" }}
                  >
                    <ChevronRight size={14} className="text-white/30" />
                  </div>
                </div>

                <p className="sm:hidden px-5 pb-3 text-sm text-white/40">{item.description}</p>

                {isActive && (
                  <div className="px-5 pb-6 border-t border-[#BFFD11]/10 pt-5">
                    <p className="text-sm text-white/65 leading-relaxed">{item.detail}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <InfoCallout type="info">
        <strong>Release 18 eRedCap goes further.</strong> Enhanced RedCap caps the peak data rate
        at 10 Mbps (both DL and UL) and typically uses a single Rx antenna. This targets the
        direct replacement of LTE Cat-1 and Cat-1bis for the simplest IoT devices — basic
        trackers, smart meters, and environmental sensors.
      </InfoCallout>

      {/* ── Section 4: Chipset Landscape ── */}
      <section className="mt-16 mb-20">
        <h2 className="text-2xl font-semibold mb-2">Chipset & Silicon Landscape</h2>
        <p className="text-white/45 mb-8 leading-relaxed">
          The RedCap silicon market has consolidated around key providers. Choose based on your
          regional certification needs and power budget.
        </p>

        <div className="grid gap-5">
          {chipsets.map((chip) => (
            <div
              key={chip.provider}
              className="rounded-xl border p-6"
              style={{ borderColor: `${chip.color}20`, background: `${chip.color}04` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-mono text-[10px] font-semibold tracking-widest uppercase mb-1" style={{ color: chip.color }}>
                    {chip.provider}
                  </p>
                  <p className="text-xl font-semibold text-white">{chip.chipset}</p>
                </div>
                {chip.process !== "—" && (
                  <span
                    className="px-2.5 py-1 rounded-lg text-xs font-mono"
                    style={{
                      background: `${chip.color}10`,
                      color: `${chip.color}CC`,
                      border: `1px solid ${chip.color}20`,
                    }}
                  >
                    {chip.process}
                  </span>
                )}
              </div>
              <ul className="space-y-2">
                {chip.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5 text-sm text-white/55">
                    <Check size={13} className="shrink-0 mt-0.5" style={{ color: chip.color }} />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 5: Module Form Factors ── */}
      <section className="mb-20">
        <h2 className="text-xl font-semibold mb-2">Module Form Factors</h2>
        <p className="text-white/45 mb-8 leading-relaxed text-sm">
          Leading module vendors (Quectel, Fibocom, Telit Cinterion) offer RedCap modules based
          on Snapdragon X35 and MediaTek T300 in these standard form factors.
        </p>

        <div className="rounded-xl border border-[#3A3C46]/40 overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-[#0a0e1a] border-b border-[#3A3C46]/40">
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Form Factor</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Type</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Best For</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Advantage</th>
              </tr>
            </thead>
            <tbody className="bg-[#030710]">
              {moduleFormFactors.map((ff, idx) => (
                <tr key={idx} className="border-b border-[#3A3C46]/15 last:border-0">
                  <td className="px-5 py-3.5 font-mono text-sm text-[#BFFD11]">{ff.name}</td>
                  <td className="px-5 py-3.5 text-white/55 text-xs">{ff.type}</td>
                  <td className="px-5 py-3.5 text-white/45">{ff.bestFor}</td>
                  <td className="px-5 py-3.5 text-white/45">{ff.pros}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Section 6: RF & Antenna Design ── */}
      <section className="mb-20">
        <h2 className="text-2xl font-semibold mb-2">RF & Antenna Design</h2>
        <p className="text-white/45 mb-8 leading-relaxed">
          RedCap reduces antenna count but expands the frequency range — requiring careful
          design across 600 MHz to 6 GHz.
        </p>

        <div className="grid sm:grid-cols-2 gap-5">
          <div className="rounded-xl border border-[#BFFD11]/20 bg-[#BFFD11]/4 p-6">
            <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-3">
              1T2R (Standard)
            </p>
            <p className="text-sm text-white/55 leading-relaxed mb-4">
              1 transmit, 2 receive antennas. Offers a balance of throughput, MIMO diversity,
              and reasonable PCB complexity. Standard for industrial gateways and cameras.
            </p>
            <ul className="space-y-2 text-sm text-white/55">
              {[
                "Requires antenna isolation engineering",
                "Challenging in n77/n78 bands (3.3–3.8 GHz)",
                "Higher data rates via 2×2 MIMO",
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
              1×1 SISO (Ultra-Compact)
            </p>
            <p className="text-sm text-white/55 leading-relaxed mb-4">
              Single antenna — maximum PCB savings and lowest BOM cost. Ideal for tracking
              tags, wearables, and space-constrained sensors.
            </p>
            <ul className="space-y-2 text-sm text-white/55">
              {[
                "No MIMO isolation concerns",
                "Significant PCB real estate savings",
                "Lower throughput (acceptable for telemetry)",
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

      <InfoCallout type="warning">
        <strong>Legacy 4G antennas won&apos;t work.</strong> A standard LTE Cat 4 antenna typically
        drops in efficiency above 2.7 GHz. RedCap requires coverage up to 6 GHz (n96 band). Always
        verify VSWR and efficiency across 600 MHz to 6 GHz — or use an antenna rated for 5G NR
        sub-6 operation.
      </InfoCallout>

      {/* ── Section 7: Power Design ── */}
      <section className="mt-16 mb-20">
        <h2 className="text-xl font-semibold mb-2">Power Supply Design</h2>
        <p className="text-white/45 mb-8 leading-relaxed text-sm">
          Extended battery life requires meticulous electrical design. RedCap modules can draw up
          to 2A during RF bursts — inadequate decoupling causes brown-outs and resets.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {powerSpecs.map((spec) => (
            <div
              key={spec.label}
              className="rounded-xl border p-5"
              style={{ borderColor: `${spec.color}20`, background: `${spec.color}04` }}
            >
              <p className="font-mono text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: spec.color }}>
                {spec.label}
              </p>
              <p className="text-2xl font-semibold text-white mb-1">{spec.value}</p>
              <p className="text-xs text-white/40">{spec.detail}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] p-6">
          <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-3">
            Capacitor & Regulator Guidelines
          </p>
          <ul className="space-y-2.5 text-sm text-white/55">
            {[
              "Place ≥470 µF low-ESR bulk capacitor as close to VBAT pins as possible",
              "Add 100 nF + 33 pF ceramic caps for high-frequency ripple filtering",
              "Use a high-efficiency buck regulator (≥90%) — never an LDO for battery-powered designs",
              "Caution: a ±3% tolerance on 3.3V can dip to 3.2V, dangerously close to the 3.135V minimum",
              "A 400 mV droop during TX bursts will trigger module reset or brown-out",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <Zap size={13} className="text-[#BFFD11] shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Section 8: AT Commands ── */}
      <section className="mb-20">
        <h2 className="text-xl font-semibold mb-2">Key AT Commands</h2>
        <p className="text-white/45 mb-8 leading-relaxed text-sm">
          Essential commands for network registration, power saving, and SGP.32 eSIM enablement.
          Examples shown for Quectel modules (most are 3GPP standard).
        </p>

        <div className="rounded-xl border border-[#3A3C46]/40 overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[550px]">
            <thead>
              <tr className="bg-[#0a0e1a] border-b border-[#3A3C46]/40">
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Category</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Command</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Purpose</th>
              </tr>
            </thead>
            <tbody className="bg-[#030710]">
              {atCommands.map((cmd, idx) => (
                <tr key={idx} className="border-b border-[#3A3C46]/15 last:border-0">
                  <td className="px-5 py-3.5 text-white/50 text-xs">{cmd.category}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-[#53F2FA]">{cmd.command}</td>
                  <td className="px-5 py-3.5 text-white/45">{cmd.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <InfoCallout type="tip">
        <strong>eDRX can extend battery life 10–70×.</strong> For stationary devices, configure
        eDRX to listen for paging only at specific intervals. Combined with PSM (which shuts down
        the radio entirely between transmissions), you can achieve multi-year battery life on
        RedCap — something not possible with standard 5G NR.
      </InfoCallout>

      {/* ── Section 9: Advanced Features ── */}
      <section className="mt-16 mb-20">
        <h2 className="text-2xl font-semibold mb-2">Advanced 5G Features</h2>
        <p className="text-white/45 mb-8 leading-relaxed">
          RedCap inherits powerful capabilities from the 5G core that were unavailable in
          the 4G ecosystem.
        </p>

        <div className="grid gap-5">
          {advancedFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="rounded-xl border p-6"
                style={{ borderColor: `${feat.color}20`, background: `${feat.color}04` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${feat.color}12`, border: `1px solid ${feat.color}20` }}
                  >
                    <Icon size={16} style={{ color: feat.color }} strokeWidth={1.5} />
                  </div>
                  <p className="font-semibold text-white">{feat.title}</p>
                </div>
                <p className="text-sm text-white/50 leading-relaxed mb-3">{feat.description}</p>
                <p className="text-xs text-white/30">
                  <span className="font-mono uppercase tracking-wider">Use cases:</span>{" "}
                  {feat.useCases}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Section 10: Deployment ── */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-2">Deployment & Certification</h2>
        <p className="text-white/45 mb-8 leading-relaxed">
          Bringing a RedCap product to market requires navigating 5G SA network availability
          and carrier-specific certifications.
        </p>

        <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] p-6 space-y-4">
          {[
            {
              title: "5G Standalone Required",
              detail:
                "RedCap requires explicit support in the operator's 5G SA core. Non-Standalone (NSA) deployments won't recognize RedCap device profiles. Coverage is growing but uneven globally.",
            },
            {
              title: "Certification Path",
              detail:
                "Modules must pass GCF or PTCRB certification plus operator-specific testing (AT&T, T-Mobile, Verizon, etc.). The Quectel RG255C-GL has already passed major North American operator certifications.",
            },
            {
              title: "SKU Optimization with SGP.32",
              detail:
                "Manufacture a single global hardware variant with a bootstrap eSIM profile. When the device powers on at its destination, the eIM pushes the local carrier profile automatically — eliminating regional SKU inventory.",
            },
          ].map((item) => (
            <div key={item.title} className="border-b border-[#3A3C46]/20 last:border-0 pb-4 last:pb-0">
              <p className="text-sm font-semibold text-white/75 mb-1">{item.title}</p>
              <p className="text-sm text-white/45 leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Navigation */}
      <div className="pt-8 border-t border-[#3A3C46]/30 flex justify-between items-center">
        <Link
          href="/learn/foundations/cellular-networks"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Cellular Networks
        </Link>
        <Link
          href="/learn/identity/sim-evolution"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#BFFD11] hover:gap-3 transition-all duration-200 cursor-pointer"
        >
          Next: SIM Evolution
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
