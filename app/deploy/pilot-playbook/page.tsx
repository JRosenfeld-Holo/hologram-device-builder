"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, ChevronRight, Check, Target, Cpu, Shield, Rocket, Radio, FileCheck, AlertTriangle } from "lucide-react";
import InfoCallout from "@/components/ui/InfoCallout";

/* ── Scoping Dimensions ── */
const scopingDimensions = [
  { dimension: "Problem Fit", objective: "Validating the core business pain point", artifact: "Value Proposition Statement" },
  { dimension: "Market Sizing", objective: "Determining TAM, SAM, and SOM", artifact: "Financial ROI Model" },
  { dimension: "Technical Feasibility", objective: "Scanning physics, range, and power constraints", artifact: "Initial Technical Scan" },
  { dimension: "Regulatory Mapping", objective: "Identifying regional compliance needs", artifact: "Certification Roadmap" },
  { dimension: "User Centricity", objective: "Mapping the service blueprint for operators", artifact: "Jobs-to-Be-Done Statements" },
];

/* ── Connectivity Options ── */
const connectivityOptions = [
  { tech: "Wi-Fi (802.11)", range: "50–100 m", power: "High", useCase: "Smart Home, Offices" },
  { tech: "Bluetooth / BLE", range: "< 10 m", power: "Very Low", useCase: "Wearables, Asset Tags" },
  { tech: "Cellular (LTE-M / NB-IoT)", range: "Kilometers", power: "Medium", useCase: "Global Logistics, Smart Meters" },
  { tech: "LPWAN (LoRaWAN)", range: "10+ km", power: "Low", useCase: "Agriculture, Smart Cities" },
  { tech: "Satellite (NTN)", range: "Global", power: "Very High", useCase: "Maritime, Remote Monitoring" },
];

/* ── ECC vs RSA ── */
const cryptoComparison = [
  { attribute: "Key Size (128-bit security)", rsa: "3,072 bits", ecc: "256 bits" },
  { attribute: "Computational Demand", rsa: "High", ecc: "Low" },
  { attribute: "Handshake Efficiency", rsa: "Slower", ecc: "Faster" },
  { attribute: "MCU Suitability", rsa: "Limited", ecc: "High" },
];

/* ── ZTP Steps ── */
const ztpSteps = [
  { step: "1", title: "Identity Establishment", detail: "During manufacturing, each device is pre-loaded with a unique \"birth certificate\" or initial credential via secure element.", icon: Shield },
  { step: "2", title: "Mutual Authentication", detail: "Upon activation, device and cloud verify each other's certificates via mutual TLS (mTLS) before any data exchange.", icon: FileCheck },
  { step: "3", title: "Credential Rotation", detail: "The temporary birth certificate is replaced with a permanent, long-term operational certificate issued by the provisioning service.", icon: Shield },
  { step: "4", title: "Declarative Configuration", detail: "Device receives a configuration profile defining operational state, reporting frequency, and security policies.", icon: Radio },
];

/* ── Validation Phases ── */
const validationPhases = [
  {
    id: "evt",
    label: "EVT",
    name: "Engineering Validation",
    color: "#3A3C46",
    objective: "Functional verification on bench",
    activities: "Testing analog accuracy, timing, failsafe states, and core sensor behavior in controlled conditions.",
    keyPoints: [
      "Verify core measurement accuracy",
      "Test timing and interrupt behavior",
      "Validate failsafe states",
      "First functional prototype",
    ],
  },
  {
    id: "dvt",
    label: "DVT",
    name: "Design Validation",
    color: "#3A3C46",
    objective: "Manufacturing & durability testing",
    activities: "Stress testing for RF interference, memory leaks, firmware edge cases, and thermal cycling limits.",
    keyPoints: [
      "RF interference and EMI testing",
      "Memory leak and firmware stress tests",
      "Thermal cycling endurance",
      "Drop, vibration, and shock tests",
    ],
  },
  {
    id: "pvt",
    label: "PVT",
    name: "Production Validation",
    color: "#53F2FA",
    objective: "Efficiency & quality control",
    activities: "Validating the final production line, QA protocols, yield rates, and manufacturing repeatability.",
    keyPoints: [
      "Production line efficiency metrics",
      "Quality assurance gate reviews",
      "Yield rate benchmarking",
      "Packaging and shipping validation",
    ],
  },
  {
    id: "pilot",
    label: "PILOT",
    name: "Field Pilot (MSU)",
    color: "#BFFD11",
    objective: "Real-world reliability at scale",
    activities: "Deploying the Minimum Scalable Unit — measuring user behavior, battery life, connectivity reliability, and maintenance burden in production conditions.",
    keyPoints: [
      "Full workflow instrumentation (alerts + actions)",
      "Real production constraints (noise, shift changes)",
      "Reusable SOPs and pre-validated connectors",
      "Operational Acceptance Testing (OAT)",
    ],
  },
];

/* ── Certifications ── */
const certifications = [
  { mark: "FCC ID", region: "USA", focus: "RF Interference (EMI)", testing: "Accredited lab testing for emissions" },
  { mark: "CE", region: "EU", focus: "Radio, Safety, EMC, Environment", testing: "Self-declaration or Notified Body review" },
  { mark: "UL / ETL", region: "North America", focus: "Electrical and battery safety", testing: "Overheating, fire, and shock tests" },
  { mark: "RoHS / REACH", region: "EU", focus: "Material composition", testing: "Chemical analysis for lead/mercury" },
];

export default function PilotPlaybookPage() {
  const [activePhase, setActivePhase] = useState<string | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-10" aria-label="Breadcrumb">
        <Link href="/deploy" className="hover:text-white/60 transition-colors cursor-pointer">Deploy</Link>
        <ChevronRight size={12} />
        <span className="text-[#BFFD11]">Pilot Playbook</span>
      </nav>

      {/* Header */}
      <div className="mb-12">
        <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-3">
          Deploy · 18 min
        </p>
        <h1 className="text-4xl font-semibold mb-5 leading-tight">
          From POC to Production
        </h1>
        <p className="text-lg text-white/55 leading-relaxed max-w-2xl">
          84% of IoT deployments get trapped in &quot;pilot purgatory.&quot; This playbook provides
          a structured methodology — from requirement analysis through provisioning, pilot
          validation, and certification — to break through to production at scale.
        </p>
      </div>

      {/* ── Section 1: Strategic Scoping ── */}
      <section className="mb-20">
        <h2 className="text-2xl font-semibold mb-2">Strategic Conception & Scoping</h2>
        <p className="text-white/45 mb-4 leading-relaxed">
          A successful IoT product starts with a high-value business problem — not a technology selection.
          Use the &quot;Jobs-to-Be-Done&quot; framework to identify friction points and translate them
          into precise functional requirements.
        </p>
        <p className="text-xs text-white/25 mb-8">Scroll horizontally on mobile to see all columns.</p>

        <div className="rounded-xl border border-[#3A3C46]/40 overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[550px]">
            <thead>
              <tr className="bg-[#0a0e1a] border-b border-[#3A3C46]/40">
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Dimension</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Strategic Objective</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-[#BFFD11]">Deliverable</th>
              </tr>
            </thead>
            <tbody className="bg-[#030710]">
              {scopingDimensions.map((row, idx) => (
                <tr key={idx} className="border-b border-[#3A3C46]/15 last:border-0">
                  <td className="px-5 py-3.5 text-white/70 font-medium">{row.dimension}</td>
                  <td className="px-5 py-3.5 text-white/45">{row.objective}</td>
                  <td className="px-5 py-3.5 text-[#BFFD11]/80 font-mono text-xs">{row.artifact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Section 2: Hardware & Connectivity ── */}
      <section className="mb-20">
        <h2 className="text-2xl font-semibold mb-2">Hardware & Connectivity Strategy</h2>
        <p className="text-white/45 mb-8 leading-relaxed">
          Once deployed in the thousands, hardware modifications are economically impossible.
          Right-size every component — processor, storage, and connectivity module — for the
          specific operational environment.
        </p>

        <div className="rounded-xl border border-[#3A3C46]/40 overflow-x-auto mb-8">
          <table className="w-full text-sm border-collapse min-w-[550px]">
            <thead>
              <tr className="bg-[#0a0e1a] border-b border-[#3A3C46]/40">
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Technology</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Range</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Power</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-[#BFFD11]">Key Use Case</th>
              </tr>
            </thead>
            <tbody className="bg-[#030710]">
              {connectivityOptions.map((row, idx) => (
                <tr key={idx} className="border-b border-[#3A3C46]/15 last:border-0">
                  <td className="px-5 py-3.5 text-white/70 font-medium">{row.tech}</td>
                  <td className="px-5 py-3.5 text-white/45 font-mono text-xs">{row.range}</td>
                  <td className="px-5 py-3.5 text-white/40">{row.power}</td>
                  <td className="px-5 py-3.5 text-[#BFFD11]/80 font-mono text-xs">{row.useCase}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] p-6 space-y-4">
          <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-1">Firmware Best Practices</p>
          {[
            { title: "Modular Architecture", detail: "Allow targeted updates to the networking stack or application logic without a full system wipe — preserves energy and bandwidth." },
            { title: "Sleep/Wake Optimization", detail: "Implement event-driven architectures with optimized radio duty cycles to extend battery life between maintenance visits." },
            { title: "Watchdog Timer", detail: "A non-negotiable reliability feature — automatically restarts the device if firmware freezes, preventing costly field-service calls." },
          ].map((item) => (
            <div key={item.title} className="border-b border-[#3A3C46]/20 last:border-0 pb-3 last:pb-0">
              <p className="text-sm font-semibold text-white/75 mb-1">{item.title}</p>
              <p className="text-sm text-white/45 leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <InfoCallout type="warning">
        <strong>Environmental hardening is critical.</strong> Physical designs must account for
        temperature shifts, humidity, and vibration. Use industrial-grade components with IP68/NEMA
        enclosure ratings for devices deployed in factory or outdoor conditions.
      </InfoCallout>

      {/* ── Section 3: Security Architecture ── */}
      <section className="mt-16 mb-20">
        <h2 className="text-2xl font-semibold mb-2">Security Architecture</h2>
        <p className="text-white/45 mb-8 leading-relaxed">
          Security is not a perimeter — it&apos;s an intrinsic property of device identity.
          Every device must be recognized as a unique, authenticated entity via PKI before
          it can publish data or receive commands.
        </p>

        <div className="grid sm:grid-cols-2 gap-5 mb-8">
          <div className="rounded-xl border border-[#BFFD11]/20 bg-[#BFFD11]/4 p-6">
            <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-3">
              Cryptographic Identity
            </p>
            <p className="text-sm text-white/55 leading-relaxed mb-4">
              X.509 certificates with ECC key pairs provide equivalent security to RSA but with
              dramatically smaller keys — ideal for resource-constrained MCUs.
            </p>
            <div className="rounded-lg border border-[#3A3C46]/40 overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0a0e1a] border-b border-[#3A3C46]/40">
                    <th className="text-left px-3 py-2 font-mono text-[9px] tracking-widest uppercase text-white/30">Attribute</th>
                    <th className="text-left px-3 py-2 font-mono text-[9px] tracking-widest uppercase text-white/30">RSA</th>
                    <th className="text-left px-3 py-2 font-mono text-[9px] tracking-widest uppercase text-[#BFFD11]">ECC</th>
                  </tr>
                </thead>
                <tbody className="bg-[#030710]">
                  {cryptoComparison.map((row, idx) => (
                    <tr key={idx} className="border-b border-[#3A3C46]/15 last:border-0">
                      <td className="px-3 py-2 text-white/50">{row.attribute}</td>
                      <td className="px-3 py-2 text-white/30">{row.rsa}</td>
                      <td className="px-3 py-2 text-[#BFFD11]/70">{row.ecc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-[#53F2FA]/15 bg-[#53F2FA]/3 p-6">
            <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#53F2FA] mb-3">
              Hardware Root of Trust
            </p>
            <p className="text-sm text-white/55 leading-relaxed mb-4">
              Private keys stored in general-purpose flash are vulnerable to tampering.
              Secure Elements (SE) and Trusted Platform Modules (TPM) ensure keys never leave
              the hardware boundary.
            </p>
            <ul className="space-y-2 text-sm text-white/55">
              {[
                "Tamper-resistant dedicated chip",
                "Private key never leaves hardware boundary",
                "eSIM (eUICC) as centralized Root of Trust",
                "GSMA IoT SAFE for zero-touch cloud binding",
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

      {/* ── Section 4: Zero-Touch Provisioning ── */}
      <section className="mb-20">
        <h2 className="text-xl font-semibold mb-2">Zero-Touch Provisioning (ZTP)</h2>
        <p className="text-white/45 mb-8 leading-relaxed text-sm">
          For a fleet of thousands of devices, manual configuration is impossible.
          ZTP automates the transition from manufactured device to managed asset.
        </p>

        <div className="space-y-3">
          {ztpSteps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] p-5 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-[#BFFD11]/8 border border-[#BFFD11]/15">
                  <span className="font-mono text-sm font-semibold text-[#BFFD11]">{s.step}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm mb-1">{s.title}</p>
                  <p className="text-sm text-white/45 leading-relaxed">{s.detail}</p>
                </div>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[#3A3C46]/15 hidden sm:flex">
                  <Icon size={14} className="text-white/25" strokeWidth={1.5} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <InfoCallout type="tip">
        <strong>Just-in-Time Registration.</strong> Only add devices to the production cloud
        when they are actually operational in the field. This minimizes the attack surface
        presented by devices sitting in warehouses.
      </InfoCallout>

      {/* ── Section 5: Validation Phases ── */}
      <section className="mt-16 mb-20">
        <h2 className="text-2xl font-semibold mb-2">Validation Phases</h2>
        <p className="text-white/45 mb-8 leading-relaxed">
          Four gates from bench prototype to production. The final &quot;Pilot&quot; gate uses
          the Minimum Scalable Unit (MSU) methodology to break free from pilot purgatory.
        </p>

        <div className="space-y-2">
          {validationPhases.map((phase) => {
            const isActive = activePhase === phase.id;
            return (
              <div
                key={phase.id}
                className={`rounded-xl border transition-all duration-200 cursor-pointer ${isActive
                    ? "border-[#BFFD11]/40 bg-[#BFFD11]/4"
                    : "border-[#3A3C46]/40 bg-[#060a14] hover:border-[#3A3C46]/70"
                  }`}
                onClick={() => setActivePhase(isActive ? null : phase.id)}
              >
                <div className="flex items-center gap-4 p-5">
                  <span
                    className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold shrink-0"
                    style={{
                      background: `${phase.color}15`,
                      color: phase.color,
                      border: `1px solid ${phase.color}25`,
                    }}
                  >
                    {phase.label}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-white">{phase.name}</p>
                  </div>

                  <p className="hidden sm:block text-sm text-white/40 max-w-xs text-right flex-1">
                    {phase.objective}
                  </p>

                  <div
                    className="w-5 h-5 flex items-center justify-center transition-transform duration-200 shrink-0"
                    style={{ transform: isActive ? "rotate(90deg)" : "rotate(0deg)" }}
                  >
                    <ChevronRight size={14} className="text-white/30" />
                  </div>
                </div>

                {isActive && (
                  <div className="px-5 pb-6 border-t border-[#BFFD11]/10 pt-5">
                    <p className="text-sm text-white/65 leading-relaxed mb-5">{phase.activities}</p>
                    <div>
                      <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-3">
                        Key Activities
                      </p>
                      <ul className="space-y-2">
                        {phase.keyPoints.map((point) => (
                          <li key={point} className="flex items-start gap-2.5 text-sm text-white/55">
                            <Check size={13} className="shrink-0 mt-0.5" style={{ color: phase.color }} />
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

      {/* ── Section 6: OAT ── */}
      <section className="mb-20">
        <h2 className="text-xl font-semibold mb-2">Operational Acceptance Testing (OAT)</h2>
        <p className="text-white/45 mb-8 leading-relaxed text-sm">
          The critical gate for scale — simulated failure scenarios that prove the system can recover
          without human intervention.
        </p>

        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: AlertTriangle, title: "Alarm Storms", detail: "Thousands of alerts triggered simultaneously to test prioritization and triage pipelines.", color: "#BFFD11" },
            { icon: Radio, title: "Data Dropouts", detail: "Simulated intermittent connectivity to validate buffering, retry logic, and data integrity.", color: "#53F2FA" },
            { icon: Target, title: "Sensor Drift", detail: "Gradual degradation of measurement accuracy to test anomaly detection and calibration workflows.", color: "#BFFD11" },
          ].map((scenario) => {
            const Icon = scenario.icon;
            return (
              <div
                key={scenario.title}
                className="rounded-xl border p-5"
                style={{ borderColor: `${scenario.color}20`, background: `${scenario.color}04` }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={15} style={{ color: scenario.color }} strokeWidth={1.5} />
                  <p className="font-semibold text-white text-sm">{scenario.title}</p>
                </div>
                <p className="text-xs text-white/45 leading-relaxed">{scenario.detail}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Section 7: Certifications ── */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-2">Regulatory Certifications</h2>
        <p className="text-white/45 mb-8 leading-relaxed text-sm">
          Every IoT product using wireless communication must pass regional RF, safety, and
          environmental testing before market entry.
        </p>
        <p className="text-xs text-white/25 mb-8">Scroll horizontally on mobile to see all columns.</p>

        <div className="rounded-xl border border-[#3A3C46]/40 overflow-x-auto mb-8">
          <table className="w-full text-sm border-collapse min-w-[550px]">
            <thead>
              <tr className="bg-[#0a0e1a] border-b border-[#3A3C46]/40">
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-[#BFFD11]">Mark</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Region</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Focus Areas</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Testing</th>
              </tr>
            </thead>
            <tbody className="bg-[#030710]">
              {certifications.map((row, idx) => (
                <tr key={idx} className="border-b border-[#3A3C46]/15 last:border-0">
                  <td className="px-5 py-3.5 text-[#BFFD11]/80 font-mono text-xs font-semibold">{row.mark}</td>
                  <td className="px-5 py-3.5 text-white/60">{row.region}</td>
                  <td className="px-5 py-3.5 text-white/45">{row.focus}</td>
                  <td className="px-5 py-3.5 text-white/40 text-xs">{row.testing}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <InfoCallout type="info">
          <strong>Software Bill of Materials (SBOM).</strong> The EU Cyber Resilience Act now
          requires a signed list of every third-party library used in device firmware. This
          allows rapid identification and patching when vulnerabilities are discovered in
          common software components.
        </InfoCallout>
      </section>

      {/* Navigation */}
      <div className="pt-8 border-t border-[#3A3C46]/30 flex justify-between items-center">
        <Link
          href="/learn/identity/sgp32"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          SGP.32 eSIM Standard
        </Link>
        <Link
          href="/deploy/lifecycle"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#BFFD11] hover:gap-3 transition-all duration-200 cursor-pointer"
        >
          Next: Lifecycle Management
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
