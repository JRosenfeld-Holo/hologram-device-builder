"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, ChevronRight, Check, Radio, Globe, TrendingUp, Wifi, Zap, Shield, BrainCircuit } from "lucide-react";
import InfoCallout from "@/components/ui/InfoCallout";

/* ── 2G/3G Sunset Status ── */
const sunsetStatus = [
  { region: "North America", g2: "Largely completed (AT&T Jan 2017)", g3: "Completed by late 2022", implication: "High urgency for 4G/5G migration" },
  { region: "Europe", g2: "Fragmented; extensions to 2027–2030", g3: "Rapid shutdowns (by end 2025)", implication: "2G retained for eCall, smart meters" },
  { region: "Asia", g2: "Prioritizing shutdowns to refarm for 4G", g3: "Often retained longer than 2G", implication: "Strong Cat-1 bis adoption" },
  { region: "Africa", g2: "Negligible activity; 2G dominant", g3: "Limited announcements", implication: "Continued reliance on legacy hardware" },
];

/* ── NB-IoT vs LTE-M Technical Specs ── */
const lpwaComparison = [
  { feature: "Bandwidth", nbiot: "~200 kHz", ltem: "1.4 MHz" },
  { feature: "Peak Data Rate", nbiot: "26–127 kbps", ltem: "~1 Mbps" },
  { feature: "Latency", nbiot: "1.5–10 seconds", ltem: "50–150 ms" },
  { feature: "Link Budget (MCL)", nbiot: "164 dB", ltem: "156–160.7 dB" },
  { feature: "Mobility Support", nbiot: "Stationary / Limited", ltem: "Full Handover" },
  { feature: "Voice (VoLTE)", nbiot: "Not Supported", ltem: "Supported" },
];

/* ── Performance Bar Chart ── */
const performanceBars = [
  { label: "Data Rate", ltem: 100, nbiot: 12, cat1bis: 50, redcap: 85 },
  { label: "Coverage Depth", ltem: 60, nbiot: 100, cat1bis: 55, redcap: 70 },
  { label: "Battery Life", ltem: 80, nbiot: 100, cat1bis: 50, redcap: 75 },
  { label: "Mobility", ltem: 100, nbiot: 10, cat1bis: 100, redcap: 100 },
];

/* ── RAT Tiers ── */
const ratTiers = [
  {
    id: "lpwa",
    icon: Wifi,
    label: "Massive IoT",
    name: "NB-IoT & LTE-M",
    color: "#BFFD11",
    description: "Ultra-low power, long-range connectivity for battery-powered sensors and meters.",
    detail: "NB-IoT operates on a 200 kHz bandwidth, maximizing spectral power density for a 164 dB link budget — enabling deep indoor/underground coverage. LTE-M uses 1.4 MHz for ~1 Mbps throughput with full cell handover. Both support PSM and eDRX for 10+ year battery life on small cells.",
    keyPoints: [
      "NB-IoT: best for static sensors in challenging locations",
      "LTE-M: best for mobile assets needing handover and VoLTE",
      "Both achieve 10+ year battery life with PSM/eDRX",
      "NB-IoT dominant in China; LTE-M dominant in North America",
    ],
  },
  {
    id: "cat1bis",
    icon: Radio,
    label: "Mid-Speed Volume",
    name: "LTE Cat-1 bis",
    color: "#53F2FA",
    description: "Single-antenna 4G — the new volume anchor with 122% YoY shipment growth.",
    detail: "Cat-1 bis allows single-antenna operation (vs two for Cat-1), reducing the RF chain cost and module size. It delivers ~10 Mbps on existing LTE infrastructure without carrier upgrades. In Q3 2025, Cat-1 bis accounted for nearly half of all cellular IoT module shipments globally — becoming the preferred migration path from 2G/3G.",
    keyPoints: [
      "Single antenna: smaller modules, lower BOM cost",
      "~10 Mbps on any existing 4G network",
      "No carrier-specific upgrades required",
      "122% YoY shipment growth — displacing both NB-IoT and 2G",
    ],
  },
  {
    id: "redcap",
    icon: Zap,
    label: "5G Mid-Tier",
    name: "5G RedCap / eRedCap",
    color: "#BFFD11",
    description: "Right-sized 5G for industrial IoT — 65% less modem complexity, native network slicing.",
    detail: "RedCap (Release 17) limits bandwidth to 20 MHz and antennas to 1–2, reducing modem complexity by ~65%. Peak rates reach ~150 Mbps DL / ~50 Mbps UL with latency < 100 ms. eRedCap (Release 18) further caps rates at 10 Mbps, targeting direct Cat-1 replacement. Both inherit 5G SA features: network slicing, enhanced positioning, and 5G LAN.",
    keyPoints: [
      "50–60% module cost reduction vs standard 5G",
      "Native network slicing and 5G positioning",
      "eRedCap targets LTE Cat-1 replacement at ~10 Mbps",
      "Commercial ramp-up in 2025–2026",
    ],
  },
];

/* ── Cross-RAT Comparison ── */
const crossRatComparison = [
  { metric: "Downlink Peak", ltem: "~1 Mbps", redcap: "150 Mbps", nr: "1–10 Gbps" },
  { metric: "Uplink Peak", ltem: "~1 Mbps", redcap: "50 Mbps", nr: "1–5 Gbps" },
  { metric: "Latency", ltem: "50–150 ms", redcap: "< 100 ms", nr: "< 10 ms" },
  { metric: "Module Cost (2025)", ltem: "~$15", redcap: "~$50", nr: "~$100+" },
  { metric: "Battery Life", ltem: "10+ years", redcap: "Up to 10 years", nr: "2–3 years" },
];

/* ── TCO Breakdown ── */
const tcoComponents = [
  { component: "Hardware & Setup", percent: "20–30%", color: "#BFFD11", mitigation: "Use eSIM/iSIM to reduce physical maintenance and enable single-SKU global manufacturing." },
  { component: "Management & Admin", percent: "60–70%", color: "#53F2FA", mitigation: "Implement automated fleet operations, remote diagnostics, and multi-network SIMs to eliminate manual carrier management." },
  { component: "Connectivity & Platform", percent: "10–20%", color: "#BFFD11", mitigation: "Utilize pooled data plans, edge data filtering, and protocol-level optimization to minimize cloud egress fees." },
];

/* ── Future Roadmap ── */
const futureFeatures = [
  {
    icon: Globe,
    title: "Ambient IoT (Rel-19/20)",
    color: "#53F2FA",
    description: "Battery-less sensors that harvest energy from ambient RF, thermal, or kinetic sources. They communicate by backscattering an external RF carrier — no active radio needed.",
    target: "Trillions of indoor inventory, supply chain, and digital twin sensors",
  },
  {
    icon: BrainCircuit,
    title: "6G: AI-Native Architecture (~2030)",
    color: "#BFFD11",
    description: "The network becomes a distributed neural network integrating communication, sensing, and computing. Integrated Sensing and Communication (ISAC) enables high-resolution mapping without device connectivity.",
    target: "Autonomous robots, satellite-terrestrial integration, cyber-physical systems",
  },
];

/* ── Market share data ── */
const vendorShares = [
  { vendor: "Quectel", share: 37, color: "#BFFD11" },
  { vendor: "China Mobile", share: 15, color: "#53F2FA" },
  { vendor: "Fibocom", share: 9, color: "#BFFD11" },
  { vendor: "SIMCom", share: 7, color: "#53F2FA" },
  { vendor: "Telit Cinterion", share: 6, color: "#BFFD11" },
  { vendor: "Others", share: 26, color: "#3A3C46" },
];

export default function CellularNetworksPage() {
  const [activeTier, setActiveTier] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-10" aria-label="Breadcrumb">
        <Link href="/learn" className="hover:text-white/60 transition-colors cursor-pointer">Learn</Link>
        <ChevronRight size={12} />
        <span className="text-white/50">Foundations</span>
        <ChevronRight size={12} />
        <span className="text-[#BFFD11]">Cellular Networks</span>
      </nav>

      {/* Header */}
      <div className="mb-12">
        <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-3">
          Foundations · 15 min
        </p>
        <h1 className="text-4xl font-semibold mb-5 leading-tight">
          Cellular Networks Deep-Dive
        </h1>
        <p className="text-lg text-white/55 leading-relaxed max-w-2xl">
          The cellular IoT ecosystem supports 18.5 billion endpoints in a $1 trillion market.
          The choice of radio access technology (RAT) is no longer a simple engineering decision
          — it&apos;s a strategic maneuver that dictates total cost of ownership, fleet resilience,
          and long-term viability.
        </p>
      </div>

      {/* ── Section 1: The Great Migration ── */}
      <section className="mb-20">
        <h2 className="text-2xl font-semibold mb-2">The Great Migration: 2G/3G Sunsets</h2>
        <p className="text-white/45 mb-4 leading-relaxed">
          278 switch-offs completed or in progress across 83 countries. Operators are refarming
          legacy spectrum for 4G/5G — devices on 2G/3G face absolute inoperability.
        </p>
        <p className="text-xs text-white/25 mb-8">Scroll horizontally on mobile to see all columns.</p>

        <div className="rounded-xl border border-[#3A3C46]/40 overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-[#0a0e1a] border-b border-[#3A3C46]/40">
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Region</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">2G Status</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">3G Status</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-[#BFFD11]">Strategic Implication</th>
              </tr>
            </thead>
            <tbody className="bg-[#030710]">
              {sunsetStatus.map((row, idx) => (
                <tr key={idx} className="border-b border-[#3A3C46]/15 last:border-0">
                  <td className="px-5 py-3.5 text-white/70 font-medium">{row.region}</td>
                  <td className="px-5 py-3.5 text-white/40">{row.g2}</td>
                  <td className="px-5 py-3.5 text-white/40">{row.g3}</td>
                  <td className="px-5 py-3.5 text-[#BFFD11]/80 font-mono text-xs">{row.implication}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <InfoCallout type="warning">
        <strong>Stranded asset risk.</strong> Any device intended for global deployment must
        support multiple RATs beyond 2G/3G. Devices on sunset networks face absolute inoperability
        — leading to business disruption, expensive truck rolls, and potential regulatory non-compliance
        for critical infrastructure.
      </InfoCallout>

      {/* ── Section 2: RAT Landscape ── */}
      <section className="mt-16 mb-20">
        <h2 className="text-2xl font-semibold mb-2">The RAT Landscape</h2>
        <p className="text-white/45 mb-8 leading-relaxed">
          Three tiers of connectivity serve different IoT segments. Click any tier to
          explore its role, tradeoffs, and best-fit applications.
        </p>

        <div className="space-y-2">
          {ratTiers.map((tier) => {
            const isActive = activeTier === tier.id;
            const Icon = tier.icon;
            return (
              <div
                key={tier.id}
                className={`rounded-xl border transition-all duration-200 cursor-pointer ${isActive
                    ? "border-[#BFFD11]/40 bg-[#BFFD11]/4"
                    : "border-[#3A3C46]/40 bg-[#060a14] hover:border-[#3A3C46]/70"
                  }`}
                onClick={() => setActiveTier(isActive ? null : tier.id)}
              >
                <div className="flex items-center gap-4 p-5">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: `${tier.color}12`,
                      border: `1px solid ${tier.color}25`,
                    }}
                  >
                    <Icon size={18} style={{ color: tier.color }} strokeWidth={1.5} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[10px] font-semibold tracking-widest uppercase mb-0.5" style={{ color: tier.color }}>
                      {tier.label}
                    </p>
                    <p className="text-base font-semibold text-white">{tier.name}</p>
                  </div>

                  <p className="hidden sm:block text-sm text-white/40 max-w-xs text-right flex-1">
                    {tier.description}
                  </p>

                  <div
                    className="w-5 h-5 flex items-center justify-center transition-transform duration-200 shrink-0"
                    style={{ transform: isActive ? "rotate(90deg)" : "rotate(0deg)" }}
                  >
                    <ChevronRight size={14} className="text-white/30" />
                  </div>
                </div>

                <p className="sm:hidden px-5 pb-3 text-sm text-white/40">{tier.description}</p>

                {isActive && (
                  <div className="px-5 pb-6 border-t border-[#BFFD11]/10 pt-5">
                    <p className="text-sm text-white/65 leading-relaxed mb-5">{tier.detail}</p>
                    <div>
                      <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-3">
                        Key Points
                      </p>
                      <ul className="space-y-2">
                        {tier.keyPoints.map((point) => (
                          <li key={point} className="flex items-start gap-2.5 text-sm text-white/55">
                            <Check size={13} className="shrink-0 mt-0.5" style={{ color: tier.color }} />
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

      {/* ── Section 3: Performance Bars ── */}
      <section className="mb-20">
        <h2 className="text-xl font-semibold mb-2">Performance at a Glance</h2>
        <p className="text-white/40 text-sm mb-8">Relative comparison across key RAT dimensions (higher = better)</p>
        <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] p-6">
          <div className="space-y-6">
            {performanceBars.map((metric) => (
              <div key={metric.label}>
                <p className="text-sm text-white/60 mb-2">{metric.label}</p>
                <div className="space-y-1.5">
                  {[
                    { name: "LTE-M", value: metric.ltem, color: "#BFFD11" },
                    { name: "NB-IoT", value: metric.nbiot, color: "#3A3C46" },
                    { name: "Cat‑1bis", value: metric.cat1bis, color: "#53F2FA" },
                    { name: "RedCap", value: metric.redcap, color: "#BFFD11" },
                  ].map((bar) => (
                    <div key={bar.name} className="flex items-center gap-2">
                      <span className="w-16 text-[10px] font-mono uppercase tracking-wider" style={{ color: bar.color === "#3A3C46" ? "rgba(255,255,255,0.3)" : bar.color }}>
                        {bar.name}
                      </span>
                      <div className="flex-1 h-2 bg-[#0a0e1a] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${bar.value}%`, background: bar.color }}
                        />
                      </div>
                      <span className="w-8 text-right text-[10px] font-mono text-white/25">{bar.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: NB-IoT vs LTE-M Specs ── */}
      <section className="mb-20">
        <h2 className="text-xl font-semibold mb-2">NB-IoT vs LTE-M: Technical Specs</h2>
        <p className="text-white/45 mb-8 leading-relaxed text-sm">
          The massive IoT duel — a fundamental trade-off between bandwidth, mobility, and power.
        </p>

        <div className="rounded-xl border border-[#3A3C46]/40 overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[450px]">
            <thead>
              <tr className="bg-[#0a0e1a] border-b border-[#3A3C46]/40">
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Feature</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">NB-IoT</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-[#BFFD11]">LTE-M</th>
              </tr>
            </thead>
            <tbody className="bg-[#030710]">
              {lpwaComparison.map((row, idx) => (
                <tr key={idx} className="border-b border-[#3A3C46]/15 last:border-0">
                  <td className="px-5 py-3.5 text-white/70 font-medium">{row.feature}</td>
                  <td className="px-5 py-3.5 text-white/45 font-mono text-xs">{row.nbiot}</td>
                  <td className="px-5 py-3.5 text-[#BFFD11]/80 font-mono text-xs">{row.ltem}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Section 5: Power & Battery ── */}
      <section className="mb-20">
        <h2 className="text-xl font-semibold mb-2">Power Saving & Battery Life</h2>
        <p className="text-white/45 mb-8 leading-relaxed text-sm">
          Both NB-IoT and LTE-M achieve extreme battery life through two complementary mechanisms.
        </p>

        <div className="grid sm:grid-cols-2 gap-5">
          <div className="rounded-xl border border-[#BFFD11]/20 bg-[#BFFD11]/4 p-6">
            <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-3">
              PSM (Power Saving Mode)
            </p>
            <p className="text-sm text-white/55 leading-relaxed mb-4">
              Device enters deep sleep for days or weeks while staying registered with the
              network. Radio is completely shut down — only wakes for scheduled transmissions or
              periodic tracking area updates.
            </p>
            <ul className="space-y-2 text-sm text-white/55">
              {[
                "Deepest possible sleep state",
                "Current draw: ~3 µA (device-dependent)",
                "Best for: infrequent telemetry (hourly/daily)",
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
              eDRX (Extended Discontinuous Reception)
            </p>
            <p className="text-sm text-white/55 leading-relaxed mb-4">
              Extends the time between paging cycles — device &quot;listens&quot; for incoming
              data less frequently. Maintains reachability while substantially reducing
              power consumption.
            </p>
            <ul className="space-y-2 text-sm text-white/55">
              {[
                "Device remains reachable by the network",
                "Configurable cycle lengths (seconds to hours)",
                "Best for: devices needing occasional downlink",
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

      <InfoCallout type="tip">
        <strong>Coverage conditions dominate battery life.</strong> Under optimal conditions, NB-IoT
        achieves 10+ years on two AA batteries sending once per day. But in poor signal areas with
        multiple repetitions, &quot;energy per bit&quot; rises sharply — potentially halving
        expected battery life. For FOTA-intensive devices, LTE-M&apos;s higher throughput is often more
        energy-efficient because the radio stays active for a shorter duration.
      </InfoCallout>

      {/* ── Section 6: Cross-RAT Performance ── */}
      <section className="mt-16 mb-20">
        <h2 className="text-xl font-semibold mb-2">RAT Performance Comparison</h2>
        <p className="text-white/45 mb-8 leading-relaxed text-sm">
          How LTE-M, 5G RedCap, and standard 5G NR stack up across the metrics that matter
          for deployment decisions.
        </p>

        <div className="rounded-xl border border-[#3A3C46]/40 overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-[#0a0e1a] border-b border-[#3A3C46]/40">
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Metric</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">LTE-M</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-[#BFFD11]">5G RedCap</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">5G NR (eMBB)</th>
              </tr>
            </thead>
            <tbody className="bg-[#030710]">
              {crossRatComparison.map((row, idx) => (
                <tr key={idx} className="border-b border-[#3A3C46]/15 last:border-0">
                  <td className="px-5 py-3.5 text-white/70 font-medium">{row.metric}</td>
                  <td className="px-5 py-3.5 text-white/45 font-mono text-xs">{row.ltem}</td>
                  <td className="px-5 py-3.5 text-[#BFFD11]/80 font-mono text-xs">{row.redcap}</td>
                  <td className="px-5 py-3.5 text-white/40 font-mono text-xs">{row.nr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Section 7: TCO Framework ── */}
      <section className="mb-20">
        <h2 className="text-2xl font-semibold mb-2">Total Cost of Ownership</h2>
        <p className="text-white/45 mb-8 leading-relaxed">
          60–70% of IoT device costs occur <em>after</em> the initial purchase. The industry is
          shifting from CapEx-heavy project thinking to OpEx-driven &quot;IoT FinOps&quot;.
        </p>

        <div className="space-y-4 mb-8">
          {tcoComponents.map((comp) => (
            <div
              key={comp.component}
              className="rounded-xl border p-5"
              style={{ borderColor: `${comp.color}20`, background: `${comp.color}04` }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-white">{comp.component}</p>
                <span
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold"
                  style={{
                    background: `${comp.color}15`,
                    color: comp.color,
                    border: `1px solid ${comp.color}25`,
                  }}
                >
                  {comp.percent}
                </span>
              </div>
              {/* Visual bar */}
              <div className="h-2 bg-[#0a0e1a] rounded-full overflow-hidden mb-3">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: comp.percent.split("–")[1]?.replace("%", "") + "%" || "50%",
                    background: comp.color,
                  }}
                />
              </div>
              <p className="text-sm text-white/45 leading-relaxed">
                <span className="font-mono text-[10px] uppercase tracking-wider text-white/30">Mitigation: </span>
                {comp.mitigation}
              </p>
            </div>
          ))}
        </div>
      </section>

      <InfoCallout type="info">
        <strong>The &quot;complexity tax&quot; of multi-carrier management.</strong> Organizations
        scaling to 1,000+ devices find that manual troubleshooting and juggling separate carrier
        portals becomes impossible. This drives adoption of multi-network SIMs and eSIM (eUICC)
        technology — enabling remote provisioning and carrier swapping without hardware intervention.
      </InfoCallout>

      {/* ── Section 8: Market Landscape ── */}
      <section className="mt-16 mb-20">
        <h2 className="text-xl font-semibold mb-2">Module Market Landscape (2025)</h2>
        <p className="text-white/45 mb-8 leading-relaxed text-sm">
          Q1 2025 shipments grew 23% YoY. The top 5 vendors hold ~74% of the global market,
          increasingly bifurcated by geopolitical factors.
        </p>

        <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] p-6">
          <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-4">
            Global Module Market Share (Approximate)
          </p>
          <div className="space-y-3 mb-6">
            {vendorShares.map((v) => (
              <div key={v.vendor} className="flex items-center gap-3">
                <span className="w-28 text-sm text-white/60 shrink-0">{v.vendor}</span>
                <div className="flex-1 h-3 bg-[#0a0e1a] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${v.share}%`, background: v.color }}
                  />
                </div>
                <span className="w-10 text-right text-xs font-mono" style={{ color: v.color === "#3A3C46" ? "rgba(255,255,255,0.3)" : v.color }}>
                  {v.share}%
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-[#3A3C46]/20 pt-4 space-y-3">
            {[
              { label: "Chinese Dominance", detail: "Quectel (35–40%) and China Mobile (15%) lead in high-volume NB-IoT and Cat-1 bis. Western dual-sourcing strategies emerging due to US DOD 1260H listing." },
              { label: "Western Realignment", detail: "u-blox exited cellular modules mid-2025. Telit Cinterion is the top international vendor, strong in telematics and healthcare." },
              { label: "Edge AI Trend", detail: "Top vendors are integrating AI accelerators into modules for on-device data processing — vibration analysis, anomaly detection, and local inference." },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-sm font-semibold text-white/70 mb-0.5">{item.label}</p>
                <p className="text-xs text-white/40 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 9: Future Roadmap ── */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-2">Future Roadmap</h2>
        <p className="text-white/45 mb-8 leading-relaxed">
          As 5G-Advanced becomes the operational baseline, the industry is charting the course
          for ambient IoT and 6G.
        </p>

        <div className="grid gap-5">
          {futureFeatures.map((feat) => {
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
                  <span className="font-mono uppercase tracking-wider">Target applications:</span>{" "}
                  {feat.target}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Section 10: Strategic Recommendations ── */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-6">Strategic Recommendations</h2>
        <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] p-6 space-y-4">
          {[
            {
              icon: Shield,
              title: "Hedge Against Sunset Risks",
              detail: "Audit all fleets for 2G/3G dependencies. Transition immediately to LTE-M or Cat-1 bis for assets with lifecycles exceeding 5 years.",
            },
            {
              icon: TrendingUp,
              title: "Adopt IoT FinOps",
              detail: "Move beyond unit-price comparisons. Evaluate TCO through \"cost-per-device-year\" — factoring in the 60%+ of costs in management and administration.",
            },
            {
              icon: Radio,
              title: "Future-Proof via eSIM + RedCap",
              detail: "For new high-value deployments, prioritize 5G RedCap for network slicing and enhanced positioning. Ensure all global devices use eSIM (eUICC) for carrier flexibility.",
            },
            {
              icon: BrainCircuit,
              title: "Implement Edge Intelligence",
              detail: "Prioritize modules with integrated AI. Filter and process data locally, transmitting only high-value exceptions rather than redundant raw data.",
            },
          ].map((rec) => {
            const Icon = rec.icon;
            return (
              <div key={rec.title} className="flex items-start gap-4 border-b border-[#3A3C46]/20 last:border-0 pb-4 last:pb-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "#BFFD1112", border: "1px solid #BFFD1120" }}
                >
                  <Icon size={15} className="text-[#BFFD11]" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/75 mb-1">{rec.title}</p>
                  <p className="text-sm text-white/45 leading-relaxed">{rec.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Navigation */}
      <div className="pt-8 border-t border-[#3A3C46]/30 flex justify-between items-center">
        <Link
          href="/learn/foundations/architecture"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          IoT Architecture
        </Link>
        <Link
          href="/learn/foundations/lpwa-technologies"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#BFFD11] hover:gap-3 transition-all duration-200 cursor-pointer"
        >
          Next: LTE-M vs NB-IoT
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
