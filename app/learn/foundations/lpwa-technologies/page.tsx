"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, ArrowLeft, Check } from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import ComparisonTable from "@/components/ui/ComparisonTable";
import InfoCallout from "@/components/ui/InfoCallout";
import { staggerContainer, staggerItem, scaleIn } from "@/lib/animations";

const comparisonColumns = [
  { key: "ltem", label: "LTE-M", recommended: true },
  { key: "nbiot", label: "NB-IoT" },
];

const comparisonRows = [
  { metric: "Bandwidth", description: "Radio channel width", ltem: "1.4 MHz", nbiot: "200 kHz" },
  { metric: "Peak Downlink", description: "Maximum download speed", ltem: "~1 Mbps", nbiot: "~170 Kbps" },
  { metric: "Peak Uplink", description: "Maximum upload speed", ltem: "~1 Mbps", nbiot: "~60 Kbps" },
  { metric: "Latency", description: "Typical round-trip time", ltem: "50–300 ms", nbiot: "1.6–10 s" },
  { metric: "Mobility", description: "Device movement support", ltem: "Yes (CMM handover)", nbiot: "No (static only)" },
  { metric: "Voice", description: "VoLTE voice calls", ltem: "Yes (VoLTE)", nbiot: "No" },
  { metric: "Indoor Coverage", description: "Penetration through walls", ltem: "Good", nbiot: "Excellent (CE Mode)" },
  { metric: "Module Cost", description: "Typical retail modem price", ltem: "~$10–20", nbiot: "~$5–12" },
  { metric: "Power Class", description: "Maximum transmit power", ltem: "20 dBm", nbiot: "23 dBm" },
  { metric: "Typical Use Cases", description: "Best-fit applications", ltem: "Trackers, wearables, alarms", nbiot: "Meters, static sensors" },
];

const barChartMetrics = [
  { label: "Bandwidth", ltem: 100, nbiot: 14 },
  { label: "Downlink Speed", ltem: 100, nbiot: 17 },
  { label: "Indoor Coverage", ltem: 65, nbiot: 100 },
  { label: "Latency (lower=better)", ltem: 100, nbiot: 30 },
];

const quizSteps = [
  {
    id: "mobility",
    question: "Will your device move or change location?",
    options: [
      { label: "Yes — it moves regularly", value: "ltem", desc: "Vehicles, assets, wearables" },
      { label: "No — it's permanently installed", value: "nbiot", desc: "Meters, building sensors" },
    ],
  },
  {
    id: "latency",
    question: "Do you need sub-second response times?",
    options: [
      { label: "Yes — real-time or near real-time", value: "ltem", desc: "Alarms, control commands" },
      { label: "No — periodic reporting is fine", value: "neutral", desc: "Hourly telemetry, daily snapshots" },
    ],
  },
  {
    id: "coverage",
    question: "Will devices be installed in deep indoor or underground locations?",
    options: [
      { label: "Yes — basement meters, tunnels, vaults", value: "nbiot", desc: "Coverage Extension mode adds up to 20 dB gain" },
      { label: "No — outdoor or standard indoor", value: "ltem", desc: "Rooftop, vehicle, surface installation" },
    ],
  },
];

// ─── Animated Bar Chart ────────────────────────────────────────────────────────

function BarChart() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className="space-y-5">
      {barChartMetrics.map((metric, idx) => (
        <div key={metric.label}>
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-white/60">{metric.label}</p>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-[#BFFD11]">LTE-M: {metric.ltem}%</span>
              <span className="text-white/40">NB-IoT: {metric.nbiot}%</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-14 text-[10px] font-mono text-[#BFFD11] uppercase tracking-wider">LTE-M</span>
              <div className="flex-1 h-2.5 bg-[#0a0e1a] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-[#BFFD11]"
                  initial={{ width: 0 }}
                  animate={{ width: inView ? `${metric.ltem}%` : 0 }}
                  transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-14 text-[10px] font-mono text-white/35 uppercase tracking-wider">NB-IoT</span>
              <div className="flex-1 h-2.5 bg-[#0a0e1a] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-[#3A3C46]"
                  initial={{ width: 0 }}
                  animate={{ width: inView ? `${metric.nbiot}%` : 0 }}
                  transition={{ duration: 0.8, delay: idx * 0.1 + 0.05, ease: [0.25, 0.1, 0.25, 1] }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Decision Quiz ─────────────────────────────────────────────────────────────

function DecisionQuiz() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);

  const handleAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    if (currentStep < quizSteps.length - 1) {
      setTimeout(() => setCurrentStep((s) => s + 1), 300);
    }
  };

  const getRecommendation = () => {
    const vals = Object.values(answers);
    const ltemVotes = vals.filter((v) => v === "ltem").length;
    const nbiotVotes = vals.filter((v) => v === "nbiot").length;
    if (ltemVotes > nbiotVotes) return "ltem";
    if (nbiotVotes > ltemVotes) return "nbiot";
    return "ltem";
  };

  const completed = Object.keys(answers).length === quizSteps.length;
  const recommendation = completed ? getRecommendation() : null;

  return (
    <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#3A3C46]/30 bg-[#0a0e1a]">
        <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11]">
          Which should I choose?
        </p>
        <p className="text-xs text-white/35 mt-1">Answer 3 questions to get a recommendation</p>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {!completed ? (
            <motion.div
              key={`question-${currentStep}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {/* Progress */}
              <div className="flex gap-1.5 mb-6">
                {quizSteps.map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-1 rounded-full flex-1"
                    animate={{
                      background: i < currentStep ? "#BFFD11" : i === currentStep ? "#BFFD1150" : "#3A3C46",
                    }}
                    transition={{ duration: 0.3 }}
                  />
                ))}
              </div>

              <p className="text-sm font-mono text-white/30 uppercase tracking-widest mb-2">
                Question {currentStep + 1} of {quizSteps.length}
              </p>
              <p className="text-base font-semibold text-white mb-5">
                {quizSteps[currentStep].question}
              </p>

              <motion.div
                className="space-y-3"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {quizSteps[currentStep].options.map((opt) => (
                  <motion.button
                    key={opt.value}
                    variants={staggerItem}
                    onClick={() => handleAnswer(quizSteps[currentStep].id, opt.value)}
                    className="w-full text-left p-4 rounded-lg border border-[#3A3C46]/40 hover:border-[#BFFD11]/30 hover:bg-[#BFFD11]/4 transition-colors duration-150 cursor-pointer group"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <p className="text-sm font-medium text-white/80 group-hover:text-white">
                      {opt.label}
                    </p>
                    <p className="text-xs text-white/35 mt-0.5">{opt.desc}</p>
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              variants={scaleIn}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                className="rounded-xl p-6 mb-5"
                style={{
                  background: recommendation === "ltem" ? "rgba(191,253,17,0.06)" : "rgba(83,242,250,0.06)",
                  border: `1px solid ${recommendation === "ltem" ? "#BFFD1125" : "#53F2FA25"}`,
                }}
              >
                <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/35 mb-2">
                  Recommendation
                </p>
                <p
                  className="text-2xl font-semibold mb-2"
                  style={{ color: recommendation === "ltem" ? "#BFFD11" : "#53F2FA" }}
                >
                  {recommendation === "ltem" ? "LTE-M" : "NB-IoT"}
                </p>
                <p className="text-sm text-white/55 leading-relaxed">
                  {recommendation === "ltem"
                    ? "Your device profile favors LTE-M: mobile operation, lower latency, and voice capability. Consider a dual-mode module (LTE-M + NB-IoT) for maximum carrier flexibility."
                    : "Your device profile favors NB-IoT: static installation, deep indoor deployment, or extreme battery life requirements. Coverage Extension mode can add up to 20 dB of additional gain for hard-to-reach locations."}
                </p>
              </motion.div>

              <motion.div
                className="space-y-2 mb-5"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {quizSteps.map((step) => (
                  <motion.div
                    key={step.id}
                    variants={staggerItem}
                    className="flex items-center gap-3 text-sm text-white/40"
                  >
                    <Check size={14} className="text-[#BFFD11] shrink-0" />
                    {step.options.find((o) => o.value === answers[step.id])?.label}
                  </motion.div>
                ))}
              </motion.div>

              <button
                onClick={() => { setAnswers({}); setCurrentStep(0); }}
                className="text-sm text-white/35 hover:text-white transition-colors cursor-pointer"
              >
                ← Retake quiz
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LPWAPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
      <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-10" aria-label="Breadcrumb">
        <Link href="/learn" className="hover:text-white/60 transition-colors cursor-pointer">Learn</Link>
        <ChevronRight size={12} />
        <span className="text-white/50">Foundations</span>
        <ChevronRight size={12} />
        <span className="text-[#BFFD11]">LTE-M vs NB-IoT</span>
      </nav>

      <motion.div
        className="mb-12"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.p variants={staggerItem} className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-3">
          Foundations · 10 min
        </motion.p>
        <motion.h1 variants={staggerItem} className="text-4xl font-semibold mb-5 leading-tight">LTE-M vs NB-IoT</motion.h1>
        <motion.p variants={staggerItem} className="text-lg text-white/55 leading-relaxed max-w-2xl">
          Both are 3GPP-standardized LPWA technologies designed for IoT. The right choice depends
          on mobility requirements, bandwidth needs, and deployment environment. Here&apos;s how they
          stack up.
        </motion.p>
      </motion.div>

      {/* Bar chart */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-2">Performance at a Glance</h2>
        <p className="text-white/40 text-sm mb-8">Relative performance across key metrics (higher = better)</p>
        <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] p-6">
          <BarChart />
        </div>
      </section>

      {/* Comparison table */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-6">Full Spec Comparison</h2>
        <ComparisonTable columns={comparisonColumns} rows={comparisonRows} caption="LTE-M vs NB-IoT — complete specifications" />
      </section>

      <InfoCallout type="tip">
        <strong>Dual-mode modules are the pragmatic choice.</strong> Modules like the Quectel BG95-M3
        support both LTE-M and NB-IoT with automatic fallback. Design with a single hardware SKU and
        configure network selection in firmware based on deployment region and carrier support.
      </InfoCallout>

      {/* Decision quiz */}
      <section className="mt-16 mb-16">
        <h2 className="text-xl font-semibold mb-2">Decision Tool</h2>
        <p className="text-white/40 text-sm mb-8">Answer three questions about your device — get a technology recommendation with rationale.</p>
        <DecisionQuiz />
      </section>

      {/* When to use */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-6">When to Use Each</h2>
        <motion.div
          className="grid sm:grid-cols-2 gap-5"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          <motion.div variants={staggerItem} className="rounded-xl border border-[#BFFD11]/20 bg-[#BFFD11]/4 p-6">
            <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-3">Choose LTE-M when...</p>
            <ul className="space-y-2.5 text-sm text-white/65">
              {[
                "Device moves (vehicles, containers, people)",
                "You need voice or SMS fallback",
                "Latency under 1 second matters",
                "Firmware updates need to be fast",
                "You're building for North America (dominant here)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check size={13} className="text-[#BFFD11] shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={staggerItem} className="rounded-xl border border-[#53F2FA]/15 bg-[#53F2FA]/3 p-6">
            <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#53F2FA] mb-3">Choose NB-IoT when...</p>
            <ul className="space-y-2.5 text-sm text-white/65">
              {[
                "Device is permanently installed (meters, sensors)",
                "Location is deep indoor or underground",
                "Targeting 10-year battery life",
                "Reporting once per hour or less",
                "Deploying in Europe/Asia (NB-IoT dominant)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check size={13} className="text-[#53F2FA] shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </section>

      {/* Navigation */}
      <div className="pt-8 border-t border-[#3A3C46]/30 flex justify-between items-center">
        <Link href="/learn/foundations/architecture" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors cursor-pointer">
          <ArrowLeft size={16} />
          IoT Architecture
        </Link>
        <Link href="/learn/power/psm-edrx" className="inline-flex items-center gap-2 text-sm font-medium text-[#BFFD11] hover:gap-3 transition-all duration-200 cursor-pointer">
          Next: PSM / eDRX Simulator
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
