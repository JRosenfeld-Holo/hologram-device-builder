"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, ChevronRight, Check, Activity, RefreshCw, Package, Trash2, AlertTriangle, Brain, HardDrive, Lock } from "lucide-react";
import InfoCallout from "@/components/ui/InfoCallout";

/* ── Monitoring KPIs ── */
const monitoringKPIs = [
  { category: "Connectivity", kpis: "RSSI, Packet Loss Rate, Reconnection Frequency", value: "Identifying dead spots or interference", color: "#BFFD11" },
  { category: "Hardware Health", kpis: "CPU Usage, Memory Drift, Internal Temperature", value: "Detecting firmware bugs or component degradation", color: "#53F2FA" },
  { category: "Data Quality", kpis: "Timestamp Precision, Deduplication Rate, Schema Drift", value: "Ensuring integrity for downstream analytics", color: "#BFFD11" },
  { category: "Power Status", kpis: "Battery SOC, Discharge Rate per Transmission", value: "Predicting maintenance requirements", color: "#53F2FA" },
  { category: "Security", kpis: "Auth Success Rate, Unrecognized Topic Access", value: "Detecting intrusion attempts or credential leakage", color: "#BFFD11" },
];

/* ── PdM Approaches ── */
const pdmApproaches = [
  {
    id: "regression",
    label: "Regression Models",
    icon: Activity,
    description: "Linear or support vector regression to model continuous health degradation based on historical sensor data.",
    useCase: "Best for: Smooth, predictable degradation patterns (e.g., bearing wear, battery aging).",
    color: "#BFFD11",
  },
  {
    id: "classification",
    label: "Classification Algorithms",
    icon: Brain,
    description: "Random forests or SVM to map input signals to discrete health states (e.g., Normal → Warning → Critical).",
    useCase: "Best for: State-based monitoring with clear health thresholds (e.g., vibration levels, pressure ranges).",
    color: "#53F2FA",
  },
  {
    id: "deeplearning",
    label: "Deep Learning (LSTM / CNN)",
    icon: Brain,
    description: "LSTMs and CNNs process complex spatio-temporal interdependencies across sensor networks for Remaining Useful Life (RUL) prediction.",
    useCase: "Best for: Complex, multi-sensor systems where failure patterns aren't linear (e.g., motor assemblies, turbines).",
    color: "#BFFD11",
  },
];

/* ── Delta vs Full Update ── */
const fotaComparison = [
  { metric: "File Size", full: "~410 KB", delta: "~20 KB", impact: "~95% Reduction" },
  { metric: "Transfer Time", full: "~4.9 Hours", delta: "~36 Minutes", impact: "~80% Reduction" },
  { metric: "Install Time", full: "Baseline", delta: "~78% Faster", impact: "Dramatic Improvement" },
  { metric: "On-Device Memory", full: "Low", delta: "High (+77%)", impact: "Requires Temp Buffer" },
];

/* ── Decommissioning Checklist ── */
const decommissionChecklist = [
  { step: "Data Sanitization", detail: "Cryptographic erasure — irrevocably delete encryption keys (most efficient for flash-based IoT). NIST distinguishes between \"Clearing\" (simple recovery protection) and \"Purging\" (lab-grade protection).", icon: Trash2, color: "#BFFD11" },
  { step: "Certificate Revocation", detail: "Revoke device certificates via CRL (batch list — reliable but delayed) or OCSP (real-time — immediate but CA sees every connection attempt).", icon: Lock, color: "#53F2FA" },
  { step: "Hardware Disposal", detail: "Work with ITAD partners holding R2v3 or NAID AAA certifications. Document disposal of every device by serial number for environmental audits.", icon: Package, color: "#BFFD11" },
  { step: "WEEE Compliance", detail: "Manufacturers must provide collection and recycling systems for products at end-of-life. IoT devices frequently contain hazardous materials (lead, mercury).", icon: AlertTriangle, color: "#53F2FA" },
];

/* ── Obsolescence Strategies ── */
const obsolescenceStrategies = [
  { title: "Multi-Source Design", detail: "Prioritize components with drop-in replacements from multiple vendors — reduces single-vendor dependency risk." },
  { title: "PCN/PDN Workflows", detail: "Establish internal processes for evaluating Product Discontinuance Notifications and triggering \"Last Time Buy\" opportunities for critical parts." },
  { title: "Alternate Qualification", detail: "Maintain a pre-approved list of alternate parts validated for \"form, fit, and function\" compatibility — avoids costly product redesigns." },
];

export default function LifecyclePage() {
  const [activePdm, setActivePdm] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-10" aria-label="Breadcrumb">
        <Link href="/deploy" className="hover:text-white/60 transition-colors cursor-pointer">Deploy</Link>
        <ChevronRight size={12} />
        <span className="text-[#BFFD11]">Lifecycle Management</span>
      </nav>

      {/* Header */}
      <div className="mb-12">
        <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-3">
          Deploy · 15 min
        </p>
        <h1 className="text-4xl font-semibold mb-5 leading-tight">
          Fleet Lifecycle Management
        </h1>
        <p className="text-lg text-white/55 leading-relaxed max-w-2xl">
          The longest phase of the IoT lifecycle begins after deployment. Move beyond
          &quot;up/down&quot; status checks to deep observability, intelligent FOTA, supply chain
          resilience, and responsible end-of-life decommissioning.
        </p>
      </div>

      {/* ── Section 1: Operational Monitoring ── */}
      <section className="mb-20">
        <h2 className="text-2xl font-semibold mb-2">Operational Monitoring & Observability</h2>
        <p className="text-white/45 mb-8 leading-relaxed">
          Enterprise-grade operations require continuous collection and analysis of metrics,
          traces, and structured logs across the device, gateway, and cloud layers.
          Digital twins reflect each device&apos;s status in real time — enabling remote
          troubleshooting without disrupting the physical device.
        </p>

        <div className="space-y-2 mb-8">
          {monitoringKPIs.map((kpi) => (
            <div
              key={kpi.category}
              className="rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5"
              style={{ borderColor: `${kpi.color}15`, background: `${kpi.color}03` }}
            >
              <div className="w-28 shrink-0">
                <p className="font-mono text-[10px] font-semibold tracking-widest uppercase" style={{ color: kpi.color }}>
                  {kpi.category}
                </p>
              </div>
              <div className="w-px h-6 bg-[#3A3C46]/30 shrink-0 hidden sm:block" />
              <p className="text-sm text-white/55 flex-1">{kpi.kpis}</p>
              <div className="w-px h-6 bg-[#3A3C46]/30 shrink-0 hidden sm:block" />
              <p className="text-xs text-white/35 sm:text-right shrink-0 max-w-xs">{kpi.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 2: Predictive Maintenance ── */}
      <section className="mb-20">
        <h2 className="text-xl font-semibold mb-2">Predictive Maintenance & ML</h2>
        <p className="text-white/45 mb-4 leading-relaxed text-sm">
          Move from fixed-schedule maintenance to proactive, just-in-time predictions.
          The primary metric is <strong className="text-white/70">Remaining Useful Life (RUL)</strong> — the
          time between the current operating state and predicted failure.
        </p>
        <p className="text-xs text-white/25 mb-8">Click any approach to expand details.</p>

        <div className="space-y-2">
          {pdmApproaches.map((approach) => {
            const isActive = activePdm === approach.id;
            const Icon = approach.icon;
            return (
              <div
                key={approach.id}
                className={`rounded-xl border transition-all duration-200 cursor-pointer ${isActive
                  ? "border-[#BFFD11]/40 bg-[#BFFD11]/4"
                  : "border-[#3A3C46]/40 bg-[#060a14] hover:border-[#3A3C46]/70"
                  }`}
                onClick={() => setActivePdm(isActive ? null : approach.id)}
              >
                <div className="flex items-center gap-4 p-5">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${approach.color}12`, border: `1px solid ${approach.color}25` }}
                  >
                    <Icon size={16} style={{ color: approach.color }} strokeWidth={1.5} />
                  </div>
                  <p className="flex-1 text-sm font-semibold text-white">{approach.label}</p>
                  <div
                    className="w-5 h-5 flex items-center justify-center transition-transform duration-200 shrink-0"
                    style={{ transform: isActive ? "rotate(90deg)" : "rotate(0deg)" }}
                  >
                    <ChevronRight size={14} className="text-white/30" />
                  </div>
                </div>

                {isActive && (
                  <div className="px-5 pb-5 border-t border-[#BFFD11]/10 pt-4 space-y-3">
                    <p className="text-sm text-white/60 leading-relaxed">{approach.description}</p>
                    <p className="text-xs text-white/40 italic">{approach.useCase}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <InfoCallout type="tip">
        <strong>Digital twins + predictive maintenance</strong> form the backbone of
        proactive fleet management. By reflecting device state in real time and feeding
        sensor data into ML models, organizations can anticipate failures and reduce
        unplanned downtime by up to 50%.
      </InfoCallout>

      {/* ── Section 3: FOTA Updates ── */}
      <section className="mt-16 mb-20">
        <h2 className="text-2xl font-semibold mb-2">Fleet Evolution via FOTA</h2>
        <p className="text-white/45 mb-8 leading-relaxed">
          Firmware-Over-The-Air updates are indispensable for maintaining security,
          performance, and competitiveness across a deployed fleet. The challenge is
          scaling reliably across thousands of devices in diverse network conditions.
        </p>

        <div className="grid sm:grid-cols-2 gap-5 mb-8">
          <div className="rounded-xl border border-[#BFFD11]/20 bg-[#BFFD11]/4 p-6">
            <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-3">
              A/B Partitioning
            </p>
            <p className="text-sm text-white/55 leading-relaxed mb-4">
              The fundamental safety mechanism. Device storage is divided into two
              slots: active and inactive. Updates download to the inactive slot.
            </p>
            <ul className="space-y-2 text-sm text-white/55">
              {[
                "Download to inactive slot — active remains untouched",
                "Verify digital signature before reboot",
                "Post-update connectivity check",
                "Auto-rollback if cloud unreachable within timeout",
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
              Delta vs Full Image
            </p>
            <p className="text-sm text-white/55 leading-relaxed mb-4">
              For bandwidth-constrained NB-IoT or mesh networks, delta DFU transmits only
              the binary difference between firmware versions.
            </p>
            <ul className="space-y-2 text-sm text-white/55">
              {[
                "~95% reduction in file size (410 KB → 20 KB)",
                "~80% reduction in transfer time",
                "Requires server to know exact current version",
                "Rollback protection prevents forced downgrades",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check size={13} className="text-[#53F2FA] shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <h3 className="text-base font-semibold mb-4 text-white/70">Full Image vs Delta Update Comparison</h3>
        <p className="text-xs text-white/25 mb-4">Scroll horizontally on mobile to see all columns.</p>

        <div className="rounded-xl border border-[#3A3C46]/40 overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-[#0a0e1a] border-b border-[#3A3C46]/40">
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Metric</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Full Image</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-[#BFFD11]">Delta Update</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Impact</th>
              </tr>
            </thead>
            <tbody className="bg-[#030710]">
              {fotaComparison.map((row, idx) => (
                <tr key={idx} className="border-b border-[#3A3C46]/15 last:border-0">
                  <td className="px-5 py-3.5 text-white/70 font-medium">{row.metric}</td>
                  <td className="px-5 py-3.5 text-white/40 font-mono text-xs">{row.full}</td>
                  <td className="px-5 py-3.5 text-[#BFFD11]/80 font-mono text-xs">{row.delta}</td>
                  <td className="px-5 py-3.5 text-white/45 text-xs">{row.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Section 4: Supply Chain Resilience ── */}
      <section className="mb-20">
        <h2 className="text-xl font-semibold mb-2">Supply Chain & Obsolescence Management</h2>
        <p className="text-white/45 mb-8 leading-relaxed text-sm">
          IoT products require 10–20 year lifespans, but nearly 30% of semiconductor
          EOL events occur without a formal Product Change Notice. Proactive planning
          is essential for business continuity.
        </p>

        <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] p-6 space-y-4">
          {obsolescenceStrategies.map((item) => (
            <div key={item.title} className="border-b border-[#3A3C46]/20 last:border-0 pb-4 last:pb-0">
              <p className="text-sm font-semibold text-white/75 mb-1">{item.title}</p>
              <p className="text-sm text-white/45 leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <InfoCallout type="warning">
        <strong>Zombie device risk.</strong> A poorly managed sunset phase leaves
        billions of unmonitored devices — an expanding attack surface for hackers
        and a contributor to the global e-waste crisis.
      </InfoCallout>

      {/* ── Section 5: Secure Decommissioning ── */}
      <section className="mt-16 mb-16">
        <h2 className="text-2xl font-semibold mb-2">Secure Sunset & Decommissioning</h2>
        <p className="text-white/45 mb-8 leading-relaxed">
          The final lifecycle stage requires safe removal from the ecosystem — protecting organizational
          data and meeting environmental responsibilities.
        </p>

        <div className="space-y-3">
          {decommissionChecklist.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="rounded-xl border p-5 flex items-start gap-4"
                style={{ borderColor: `${item.color}20`, background: `${item.color}04` }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${item.color}12`, border: `1px solid ${item.color}20` }}
                >
                  <Icon size={16} style={{ color: item.color }} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm mb-1">{item.step}</p>
                  <p className="text-sm text-white/45 leading-relaxed">{item.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Strategic Summary ── */}
      <section className="mb-16">
        <div className="rounded-xl border border-[#BFFD11]/20 bg-[#BFFD11]/4 p-6">
          <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-3">
            Strategic Summary
          </p>
          <ul className="space-y-2.5 text-sm text-white/55">
            {[
              "Establish a hardware Root of Trust during the design phase",
              "Automate enrollment through zero-touch provisioning",
              "Validate operational MSUs to escape pilot purgatory",
              "Sustain with granular observability and optimized FOTA",
              "Plan supply chain resilience for 10–20 year device lifespans",
              "Execute a secure sunset to protect data and meet environmental obligations",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <Check size={13} className="text-[#BFFD11] shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Navigation */}
      <div className="pt-8 border-t border-[#3A3C46]/30 flex justify-between items-center">
        <Link
          href="/deploy/pilot-playbook"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Pilot Playbook
        </Link>
        <a
          href="https://store.hologram.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#BFFD11] hover:gap-3 transition-all duration-200 cursor-pointer"
        >
          Ready to start building?
          <ArrowRight size={16} />
        </a>
      </div>
    </div>
  );
}
