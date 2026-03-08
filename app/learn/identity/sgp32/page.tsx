"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, ChevronRight, Check, Server, Cpu, Cloud, Radio, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import InfoCallout from "@/components/ui/InfoCallout";
import { staggerContainer, staggerItem } from "@/lib/animations";

/* ── Standards Evolution ── */
const standardsComparison = [
  { feature: "Target Devices", sgp02: "Industrial M2M", sgp22: "Smartphones, tablets", sgp32: "IoT: sensors, routers, meters" },
  { feature: "Control Model", sgp02: "Operator-centric (Push)", sgp22: "User-centric (Pull)", sgp32: "Enterprise-centric (Hybrid)" },
  { feature: "User Interaction", sgp02: "Minimal (Operator-managed)", sgp22: "Required (QR code, app)", sgp32: "None (Automated)" },
  { feature: "Profile Manager", sgp02: "SM-SR (Operator-locked)", sgp22: "LPA (On-device)", sgp32: "eIM (Portable, fleet-scale)" },
  { feature: "Device-side Component", sgp02: "—", sgp22: "LPA", sgp32: "IPA (IPAd or IPAe)" },
  { feature: "Transport", sgp02: "SMS-based", sgp22: "IP-based (HTTPS/TCP)", sgp32: "IP-based (CoAP, UDP, DTLS)" },
  { feature: "Lock-in Risk", sgp02: "High (Tied to SM-SR)", sgp22: "Low (User controls)", sgp32: "Low (eIM is portable)" },
  { feature: "NB-IoT Compatible", sgp02: "Problematic (SMS)", sgp22: "Not applicable", sgp32: "Yes (IP-native)" },
];

/* ── Architecture Components ── */
const architectureComponents = [
  {
    id: "eim",
    icon: Server,
    label: "Server-side",
    name: "eSIM IoT Remote Manager (eIM)",
    color: "#BFFD11",
    description:
      "The strategic orchestrator — a server-side manager that acts as the 'remote user' for headless devices.",
    detail:
      "The eIM issues commands to enable, disable, delete, or download profiles without requiring physical access. Unlike the legacy SM-SR, the eIM is portable and can be swapped over a device's lifetime, ensuring the enterprise retains control regardless of initial carrier selection. It communicates via the ESipa interface, prepares cryptographically signed eUICC Packages, and can manage millions of devices from a single pane of glass.",
    keyPoints: [
      "Portable — can be updated or swapped over device lifetime",
      "Orchestrates Profile State Management Operations (PSMOs)",
      "Communicates via ESipa interface optimized for constrained networks",
      "Replaces the locked-in SM-SR from SGP.02",
    ],
  },
  {
    id: "ipa",
    icon: Cpu,
    label: "Device-side",
    name: "IoT Profile Assistant (IPA)",
    color: "#53F2FA",
    description:
      "The on-device software bridge between the eUICC secure element and the cloud-based eIM.",
    detail:
      "The IPA performs the functions of the legacy LPA but is re-engineered for unattended operation. It manages both direct profile download from the SM-DP+ and indirect download orchestrated by the eIM. A key flexibility of SGP.32 is the IPA placement: IPAd runs on the device's application processor (ideal for routers and gateways), while IPAe is embedded directly in the eUICC (simplifying the OEM's hardware design).",
    keyPoints: [
      "IPAd — hosted on device MCU (Linux, Android, RTOS)",
      "IPAe — embedded inside eUICC secure element",
      "Handles both direct and indirect profile downloads",
      "Manages APDU communication with the eUICC",
    ],
  },
  {
    id: "smdp",
    icon: Cloud,
    label: "Infrastructure",
    name: "SM-DP+ & SM-DS",
    color: "#BFFD11",
    description:
      "Profile preparation, encryption, and discovery infrastructure reused from the SGP.22 consumer ecosystem.",
    detail:
      "The SM-DP+ handles the creation and encryption of Bound Profile Packages (BPP) delivered to devices. By reusing consumer infrastructure, SGP.32 avoids ecosystem fragmentation. The SM-DS (Discovery Server) is an optional component that stores download events, allowing the IPA to discover pending profiles when no static SM-DP+ association exists.",
    keyPoints: [
      "SM-DP+ creates encrypted Bound Profile Packages",
      "Reused from SGP.22 — no ecosystem fragmentation",
      "SM-DS enables discovery of pending profile events",
      "Supports both direct and proxied delivery models",
    ],
  },
];

/* ── Interfaces ── */
const interfaces = [
  { name: "ESipa", points: "eIM ↔ IPA", purpose: "Orchestration commands (PSMO/eCO) and indirect downloads" },
  { name: "ES9+", points: "SM-DP+ ↔ IPA", purpose: "Direct secure download of encrypted operator profiles" },
  { name: "ES10a", points: "IPA ↔ eUICC", purpose: "Configuration and address management of the secure element" },
  { name: "ES10b", points: "IPA ↔ eUICC", purpose: "Execution of profile management APDUs" },
  { name: "ES11", points: "IPA ↔ SM-DS", purpose: "Discovery of pending profile events from discovery servers" },
  { name: "ESep", points: "eIM ↔ eUICC", purpose: "Secure end-to-end channel for eIM-signed packages" },
];

/* ── Provisioning Flow ── */
const provisioningSteps = [
  { step: 1, title: "Bootstrap Attach", description: "Device powers on and uses the pre-installed bootstrap profile to attach to a roaming network." },
  { step: 2, title: "eIM Registration", description: "The IPA initiates a polling request to the eIM endpoint configured during manufacturing, sharing its EID and auth credentials." },
  { step: 3, title: "eIM Association", description: "The eIM sends an eCO (eIM Configuration Operation) to the device to establish its role as the Associated eIM for that eUICC." },
  { step: 4, title: "Profile Download", description: "The eIM issues a download command. The IPA retrieves the profile (direct or indirect) and segments it for delivery to the eUICC." },
  { step: 5, title: "Profile Activation", description: "The eUICC installs the profile, sends a PSMO enable result to the eIM, and triggers a REFRESH command to the modem." },
  { step: 6, title: "Network Switch", description: "The modem attaches to the new operational network using the newly enabled profile. The device is now live." },
];

/* ── Hardware Form Factors ── */
const formFactors = [
  { name: "MFF2", dimensions: "5mm × 6mm", integration: "Soldered to PCB", application: "Industrial routers, smart meters, chargers" },
  { name: "MFF4", dimensions: "2mm × 2mm", integration: "Soldered to PCB", application: "Ultra-compact wearables, medical sensors" },
  { name: "WLCSP", dimensions: "< 2mm × 2mm", integration: "Wafer-level package", application: "Space-constrained tracking tags" },
  { name: "iSIM", dimensions: "N/A", integration: "Integrated into SoC", application: "Mass-market IoT, lowest cost/footprint" },
  { name: "Removable", dimensions: "2FF/3FF/4FF", integration: "Socketed", application: "Legacy industrial equipment, vehicles" },
];

/* ── Modem AT Commands ── */
const modemCommands = [
  { manufacturer: "Quectel", model: "BG95/EG91", commands: ["AT+QCFG=\"stk/sms\",1", "AT+QCFG=\"bip/enable\",1"], purpose: ["Activates SIM Toolkit support", "Enables Bearer Independent Protocol"] },
  { manufacturer: "Telit", model: "LE910/ME910", commands: ["AT#STKM=1", "AT#STKC?"], purpose: ["Activates STK management", "Checks BIP client availability"] },
  { manufacturer: "Thales/Cinterion", model: "", commands: ["AT^SSTK=1", "AT^SSTK?"], purpose: ["Enables Secure STK support", "Verifies BIP and STK status"] },
  { manufacturer: "Sierra Wireless", model: "", commands: ["AT+STKCFG=1"], purpose: ["Enables STK and BIP functionality"] },
  { manufacturer: "Fibocom", model: "", commands: ["AT+STKCFG=1", "AT+FIBIP=1"], purpose: ["Activates SIM Toolkit", "Enables BIP (model-dependent)"] },
];

/* ── Testing Checklist ── */
const testingChecklist = [
  { label: "Atomic State Transitions", description: "Verify that a failed enable operation does not leave the device in an un-provisioned state." },
  { label: "Fallback Attribute Testing", description: "Simulate network attachment failure to confirm the device correctly rolls back to the bootstrap profile." },
  { label: "Memory Management", description: "Stress-test the IPA's ability to handle profile packages larger than available RAM via segment-by-segment transfer." },
  { label: "Intermittent Connectivity", description: "Simulate devices waking for only 60 seconds every 24 hours to ensure the eIM can deliver packages in the narrow window." },
];

export default function SGP32Page() {
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  const [activeProvStep, setActiveProvStep] = useState<number | null>(null);
  const [checkedTests, setCheckedTests] = useState<Set<number>>(new Set());

  const toggleTest = (idx: number) => {
    setCheckedTests((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-10" aria-label="Breadcrumb">
        <Link href="/learn" className="hover:text-white/60 transition-colors cursor-pointer">Learn</Link>
        <ChevronRight size={12} />
        <span className="text-white/50">Identity</span>
        <ChevronRight size={12} />
        <span className="text-[#BFFD11]">SGP.32</span>
      </nav>

      {/* Header */}
      <motion.div className="mb-12" variants={staggerContainer} initial="hidden" animate="visible">
        <motion.p variants={staggerItem} className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-3">
          Identity · 12 min
        </motion.p>
        <motion.h1 variants={staggerItem} className="text-4xl font-semibold mb-5 leading-tight">
          SGP.32 eSIM Standard
        </motion.h1>
        <motion.p variants={staggerItem} className="text-lg text-white/55 leading-relaxed max-w-2xl">
          The GSMA SGP.32 specification is the first eSIM standard designed from the ground up for
          headless IoT devices. It introduces a server-driven architecture for zero-touch provisioning
          at scale &mdash; enabling remote carrier management across millions of devices without physical
          access.
        </motion.p>
      </motion.div>

      {/* ── Section 1: Standards Evolution ── */}
      <section className="mb-20">
        <h2 className="text-2xl font-semibold mb-2">Standards Evolution</h2>
        <p className="text-white/45 mb-4 leading-relaxed">
          SGP.32 resolves the gap between the operator-locked M2M standard (SGP.02) and the
          human-dependent consumer standard (SGP.22) — combining the remote orchestration of M2M
          with the architectural flexibility of consumer eSIMs.
        </p>
        <p className="text-sm text-white/35 mb-8">
          Scroll horizontally on mobile to see all columns.
        </p>

        <div className="rounded-xl border border-[#3A3C46]/40 overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-[#0a0e1a] border-b border-[#3A3C46]/40">
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Feature</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">SGP.02 (M2M)</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">SGP.22 (Consumer)</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-[#BFFD11]">SGP.32 (IoT)</th>
              </tr>
            </thead>
            <tbody className="bg-[#030710]">
              {standardsComparison.map((row, idx) => (
                <tr key={idx} className="border-b border-[#3A3C46]/15 last:border-0">
                  <td className="px-5 py-3.5 text-white/70 font-medium">{row.feature}</td>
                  <td className="px-5 py-3.5 text-white/40">{row.sgp02}</td>
                  <td className="px-5 py-3.5 text-white/40">{row.sgp22}</td>
                  <td className="px-5 py-3.5 text-[#BFFD11]/80 font-mono text-xs">{row.sgp32}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Section 2: Architecture Components ── */}
      <section className="mb-20">
        <h2 className="text-2xl font-semibold mb-2">Architecture Components</h2>
        <p className="text-white/45 mb-8 leading-relaxed">
          SGP.32 decouples orchestration from secure storage through three core components.
          Click any component to explore its role and key capabilities.
        </p>

        <div className="space-y-2">
          {architectureComponents.map((comp) => {
            const isActive = activeComponent === comp.id;
            const Icon = comp.icon;
            return (
              <div
                key={comp.id}
                className={`rounded-xl border transition-all duration-200 cursor-pointer ${isActive
                  ? "border-[#BFFD11]/40 bg-[#BFFD11]/4"
                  : "border-[#3A3C46]/40 bg-[#060a14] hover:border-[#3A3C46]/70"
                  }`}
                onClick={() => setActiveComponent(isActive ? null : comp.id)}
              >
                <div className="flex items-center gap-4 p-5">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: `${comp.color}12`,
                      border: `1px solid ${comp.color}25`,
                    }}
                  >
                    <Icon size={18} style={{ color: comp.color }} strokeWidth={1.5} />
                  </div>

                  <div className="flex-1">
                    <p
                      className="font-mono text-[10px] font-semibold tracking-widest uppercase mb-0.5"
                      style={{ color: comp.color }}
                    >
                      {comp.label}
                    </p>
                    <p className="text-base font-semibold text-white">{comp.name}</p>
                  </div>

                  <p className="hidden sm:block text-sm text-white/40 max-w-xs text-right flex-1">
                    {comp.description}
                  </p>

                  <div
                    className="w-5 h-5 flex items-center justify-center transition-transform duration-200 shrink-0"
                    style={{ transform: isActive ? "rotate(90deg)" : "rotate(0deg)" }}
                  >
                    <ChevronRight size={14} className="text-white/30" />
                  </div>
                </div>

                <p className="sm:hidden px-5 pb-3 text-sm text-white/40">{comp.description}</p>

                {isActive && (
                  <div className="px-5 pb-6 border-t border-[#BFFD11]/10 pt-5">
                    <p className="text-sm text-white/65 leading-relaxed mb-5">{comp.detail}</p>
                    <div>
                      <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-3">
                        Key Points
                      </p>
                      <ul className="space-y-2">
                        {comp.keyPoints.map((point) => (
                          <li key={point} className="flex items-start gap-2.5 text-sm text-white/55">
                            <Check size={13} className="shrink-0 mt-0.5" style={{ color: comp.color }} />
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

      {/* ── Section 3: Interfaces ── */}
      <section className="mb-20">
        <h2 className="text-xl font-semibold mb-2">Interface & Protocol Reference</h2>
        <p className="text-white/45 mb-8 leading-relaxed text-sm">
          SGP.32 defines standardized interfaces between all architectural components. The shift to
          CoAP over UDP (secured by DTLS) dramatically reduces radio-on time for LPWA devices
          compared to TCP-based HTTPS.
        </p>

        <div className="rounded-xl border border-[#3A3C46]/40 overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-[#0a0e1a] border-b border-[#3A3C46]/40">
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Interface</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Connecting Points</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Primary Purpose</th>
              </tr>
            </thead>
            <tbody className="bg-[#030710]">
              {interfaces.map((iface, idx) => (
                <tr key={idx} className="border-b border-[#3A3C46]/15 last:border-0">
                  <td className="px-5 py-3.5 font-mono text-sm text-[#BFFD11]">{iface.name}</td>
                  <td className="px-5 py-3.5 text-white/55 font-mono text-xs">{iface.points}</td>
                  <td className="px-5 py-3.5 text-white/45">{iface.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <InfoCallout type="info">
        <strong>Protocol efficiency matters for battery life.</strong> Consumer eSIMs use HTTPS
        over TCP, requiring a multi-packet handshake and persistent acknowledgments. SGP.32
        supports CoAP over UDP (secured by DTLS), which eliminates TCP state management and
        minimizes radio-on time — critical for devices expected to last 10–15 years on a single battery.
      </InfoCallout>

      {/* ── Section 4: Direct vs Indirect Download ── */}
      <section className="mt-16 mb-20">
        <h2 className="text-xl font-semibold mb-2">Download Models</h2>
        <p className="text-white/45 mb-8 leading-relaxed text-sm">
          SGP.32 provides two flexible approaches for profile delivery, matching different
          network environments and device power budgets.
        </p>

        <div className="grid sm:grid-cols-2 gap-5">
          <div className="rounded-xl border border-[#BFFD11]/20 bg-[#BFFD11]/4 p-6">
            <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-3">
              Direct Download
            </p>
            <p className="text-sm text-white/55 leading-relaxed mb-4">
              The IPA communicates directly with the SM-DP+ over the ES9+ interface. Efficient
              for devices with high-bandwidth connections and sufficient processing power.
            </p>
            <ul className="space-y-2 text-sm text-white/55">
              {[
                "IPA ↔ SM-DP+ via ES9+",
                "Device handles its own TLS/DTLS sessions",
                "Best for gateways, routers, high-power devices",
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
              Indirect Download
            </p>
            <p className="text-sm text-white/55 leading-relaxed mb-4">
              The eIM acts as a proxy, retrieving the profile from the SM-DP+ and holding it
              until the device wakes up. Optimized for &quot;sleepy&quot; LPWA devices.
            </p>
            <ul className="space-y-2 text-sm text-white/55">
              {[
                "eIM proxies profile via ESipa interface",
                "eIM manages retries and scheduling",
                "Best for sensors, meters, battery-powered IoT",
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

      {/* ── Section 5: Provisioning Flow ── */}
      <section className="mb-20">
        <h2 className="text-2xl font-semibold mb-2">Provisioning & Onboarding Flow</h2>
        <p className="text-white/45 mb-8 leading-relaxed">
          The zero-touch onboarding sequence from first boot to operational network.
          Click any step to see details.
        </p>

        <div className="space-y-2">
          {provisioningSteps.map((step, idx) => {
            const isActive = activeProvStep === idx;
            return (
              <div
                key={step.step}
                className={`rounded-xl border transition-all duration-200 cursor-pointer ${isActive
                  ? "border-[#BFFD11]/40 bg-[#BFFD11]/4"
                  : "border-[#3A3C46]/40 bg-[#060a14] hover:border-[#3A3C46]/70"
                  }`}
                onClick={() => setActiveProvStep(isActive ? null : idx)}
              >
                <div className="flex items-center gap-4 p-5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-mono text-xs font-semibold"
                    style={{
                      background: isActive ? "#BFFD1118" : "rgba(255,255,255,0.03)",
                      color: isActive ? "#BFFD11" : "rgba(255,255,255,0.35)",
                      border: `1px solid ${isActive ? "#BFFD1130" : "#3A3C4640"}`,
                    }}
                  >
                    {step.step}
                  </div>
                  <p className={`text-base font-semibold ${isActive ? "text-white" : "text-white/75"}`}>
                    {step.title}
                  </p>
                  <div
                    className="ml-auto w-5 h-5 flex items-center justify-center transition-transform duration-200 shrink-0"
                    style={{ transform: isActive ? "rotate(90deg)" : "rotate(0deg)" }}
                  >
                    <ChevronRight size={14} className="text-white/30" />
                  </div>
                </div>

                {isActive && (
                  <div className="px-5 pb-5 border-t border-[#BFFD11]/10 pt-4">
                    <p className="text-sm text-white/60 leading-relaxed">{step.description}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <InfoCallout type="warning">
        <strong>Rollback is critical.</strong> SGP.32 mandates that if a device enables a new profile
        but fails to establish a network connection within a specified timeout, the eUICC automatically
        rolls back to the previous known-good profile. Without this failsafe, a failed profile swap
        could &quot;brick&quot; a remote device requiring expensive manual recovery.
      </InfoCallout>

      {/* ── Section 6: Hardware — Form Factors ── */}
      <section className="mt-16 mb-20">
        <h2 className="text-2xl font-semibold mb-2">Hardware: eUICC Form Factors</h2>
        <p className="text-white/45 mb-8 leading-relaxed text-sm">
          Select an SGP.32-compliant eUICC (v1.2+) from vendors like STMicroelectronics (ST4SIM-200),
          Infineon (OPTIGA Connect IoT), or NXP (SN100). Form factor drives your integration path.
        </p>

        <div className="rounded-xl border border-[#3A3C46]/40 overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[550px]">
            <thead>
              <tr className="bg-[#0a0e1a] border-b border-[#3A3C46]/40">
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Form Factor</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Dimensions</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Integration</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Typical Application</th>
              </tr>
            </thead>
            <tbody className="bg-[#030710]">
              {formFactors.map((ff, idx) => (
                <tr key={idx} className="border-b border-[#3A3C46]/15 last:border-0">
                  <td className="px-5 py-3.5 font-mono text-sm text-[#BFFD11]">{ff.name}</td>
                  <td className="px-5 py-3.5 text-white/55 font-mono text-xs">{ff.dimensions}</td>
                  <td className="px-5 py-3.5 text-white/45">{ff.integration}</td>
                  <td className="px-5 py-3.5 text-white/45">{ff.application}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Section 7: IPAd Host Requirements ── */}
      <section className="mb-20">
        <h2 className="text-xl font-semibold mb-2">IPAd Host Processor Requirements</h2>
        <p className="text-white/45 mb-8 leading-relaxed text-sm">
          When using the IPAd variant (IPA on the device processor), your MCU must meet these
          minimum specifications.
        </p>

        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              label: "Storage (Flash)",
              value: "≥ 512 KB",
              detail: "For IPAd software stack and certificate storage",
              color: "#BFFD11",
            },
            {
              label: "Memory (RAM)",
              value: "64–128 KB",
              detail: "For buffering profile segments during download",
              color: "#53F2FA",
            },
            {
              label: "Cryptography",
              value: "HW Accel",
              detail: "ECDSA + SHA-256 for signature verification and DTLS",
              color: "#BFFD11",
            },
          ].map((req) => (
            <div
              key={req.label}
              className="rounded-xl border p-5"
              style={{
                borderColor: `${req.color}20`,
                background: `${req.color}04`,
              }}
            >
              <p className="font-mono text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: req.color }}>
                {req.label}
              </p>
              <p className="text-2xl font-semibold text-white mb-1">{req.value}</p>
              <p className="text-xs text-white/40">{req.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 8: Modem AT Commands ── */}
      <section className="mb-20">
        <h2 className="text-xl font-semibold mb-2">Modem BIP/STK Configuration</h2>
        <p className="text-white/45 mb-8 leading-relaxed text-sm">
          A critical prerequisite for SGP.32 is enabling the modem&apos;s Bearer Independent Protocol
          (BIP) and SIM Toolkit (STK). Without these, the eUICC cannot reach the network to download
          profiles.
        </p>

        <div className="rounded-xl border border-[#3A3C46]/40 overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[550px]">
            <thead>
              <tr className="bg-[#0a0e1a] border-b border-[#3A3C46]/40">
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Manufacturer</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">AT Command</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Purpose</th>
              </tr>
            </thead>
            <tbody className="bg-[#030710]">
              {modemCommands.map((mfr) =>
                mfr.commands.map((cmd, cmdIdx) => (
                  <tr key={`${mfr.manufacturer}-${cmdIdx}`} className="border-b border-[#3A3C46]/15 last:border-0">
                    <td className="px-5 py-3.5 text-white/70 font-medium">
                      {cmdIdx === 0 ? (
                        <>
                          {mfr.manufacturer}
                          {mfr.model && (
                            <span className="text-white/30 text-xs ml-1">({mfr.model})</span>
                          )}
                        </>
                      ) : (
                        ""
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-[#53F2FA]">{cmd}</td>
                    <td className="px-5 py-3.5 text-white/45">{mfr.purpose[cmdIdx]}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <InfoCallout type="tip">
        <strong>IPAe simplifies everything.</strong> If your device uses an IPAe (IPA embedded in the
        eUICC), firmware requirements drop dramatically. You only need to ensure the modem supports
        BIP — the IPA logic runs entirely inside the eUICC, and the host processor remains unaware
        of provisioning operations.
      </InfoCallout>

      {/* ── Section 9: Testing Checklist ── */}
      <section className="mt-16 mb-20">
        <h2 className="text-xl font-semibold mb-2">Device Testing Checklist</h2>
        <p className="text-white/45 mb-4 leading-relaxed text-sm">
          The GSMA SGP.33 suite defines test specifications for eUICC (33-1), IPA (33-2), and eIM
          (33-3). These are the critical device-level functional tests to prioritize.
        </p>
        <p className="text-xs text-white/25 mb-8">Click items to track your progress.</p>

        <div className="space-y-2">
          {testingChecklist.map((test, idx) => {
            const checked = checkedTests.has(idx);
            return (
              <button
                key={idx}
                onClick={() => toggleTest(idx)}
                className={`w-full text-left rounded-xl border p-5 transition-all duration-200 cursor-pointer flex items-start gap-4 ${checked
                  ? "border-[#4ade80]/30 bg-[#4ade80]/4"
                  : "border-[#3A3C46]/40 bg-[#060a14] hover:border-[#3A3C46]/70"
                  }`}
              >
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200 ${checked
                    ? "bg-[#4ade80] border-[#4ade80]"
                    : "border-[#3A3C46] bg-transparent"
                    }`}
                >
                  {checked && <Check size={12} className="text-[#00040F]" strokeWidth={3} />}
                </div>
                <div>
                  <p className={`text-sm font-semibold mb-1 ${checked ? "text-white/50 line-through" : "text-white/80"}`}>
                    {test.label}
                  </p>
                  <p className="text-xs text-white/40">{test.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Section 10: Business Implications ── */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-2">Strategic Impact</h2>
        <p className="text-white/45 mb-8 leading-relaxed">
          SGP.32 transitions SIM management from a logistical cost center to a software-orchestrated
          strategic asset.
        </p>

        <div className="grid sm:grid-cols-2 gap-5">
          {[
            {
              icon: Radio,
              title: "Single Hardware SKU",
              color: "#BFFD11",
              description:
                "Build one hardware variant for global distribution. The final operator profile is provisioned at the destination — eliminating regional inventory management.",
            },
            {
              icon: ShieldCheck,
              title: "Regulatory Resilience",
              color: "#53F2FA",
              description:
                "Automatically localize devices to domestic profiles upon crossing borders, ensuring compliance with data residency rules and anti-permanent-roaming regulations.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-xl border p-6"
                style={{
                  borderColor: `${item.color}20`,
                  background: `${item.color}04`,
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${item.color}12`, border: `1px solid ${item.color}20` }}
                  >
                    <Icon size={16} style={{ color: item.color }} strokeWidth={1.5} />
                  </div>
                  <p className="font-semibold text-white">{item.title}</p>
                </div>
                <p className="text-sm text-white/50 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-5 rounded-xl border border-[#3A3C46]/40 bg-[#060a14] p-6">
          <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-3">
            Looking Ahead
          </p>
          <p className="text-sm text-white/50 leading-relaxed">
            As SGP.32 matures, the focus shifts to <strong className="text-white/70">iSIM</strong> —
            integrating eUICC directly into the modem&apos;s SoC — and
            <strong className="text-white/70"> post-quantum cryptography</strong> to future-proof the
            trust anchors used by the eIM and eUICC against quantum computing threats. Market tipping
            point is expected between 2026 and 2028.
          </p>
        </div>
      </section>

      {/* Navigation */}
      <div className="pt-8 border-t border-[#3A3C46]/30 flex justify-between items-center">
        <Link
          href="/learn/identity/sim-evolution"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          SIM Evolution
        </Link>
        <Link
          href="/learn/security/endpoint"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#BFFD11] hover:gap-3 transition-all duration-200 cursor-pointer"
        >
          Next: Endpoint Security
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
