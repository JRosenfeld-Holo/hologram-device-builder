"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, RotateCcw, ArrowRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import InfoCallout from "@/components/ui/InfoCallout";
import { staggerContainer, staggerItem, scaleIn } from "@/lib/animations";

const questions = [
  {
    id: "bidirectional",
    text: "Does your device need to receive commands from the server?",
    options: [
      { label: "Yes — bidirectional communication required", value: "yes", hint: "Remote control, FOTA, parameter updates" },
      { label: "No — device only sends data upward", value: "no", hint: "Telemetry-only sensors" },
    ],
  },
  {
    id: "frequency",
    text: "How often does your device send data?",
    options: [
      { label: "Every few minutes or more often", value: "frequent", hint: "Fleet tracking, alarm systems" },
      { label: "Every hour or less often", value: "infrequent", hint: "Smart meters, environmental sensors" },
    ],
  },
  {
    id: "battery",
    text: "Is battery life a critical constraint?",
    options: [
      { label: "Yes — 5+ year battery target", value: "critical", hint: "Deep indoor sensors, asset tags" },
      { label: "No — device is plugged in or regularly charged", value: "no", hint: "Gateways, vehicles, industrial" },
    ],
  },
  {
    id: "management",
    text: "Do you need over-the-air firmware updates and device management?",
    options: [
      { label: "Yes — FOTA and remote config are required", value: "yes", hint: "Large deployments, long-lived devices" },
      { label: "No — simple telemetry only", value: "no", hint: "Simple sensors" },
    ],
  },
  {
    id: "cloud",
    text: "What cloud platform are you targeting?",
    options: [
      { label: "AWS IoT Core or Azure IoT Hub", value: "hyperscaler", hint: "Native MQTT support, device shadows" },
      { label: "Custom backend or open platform", value: "custom", hint: "Full protocol flexibility" },
    ],
  },
];

type Protocol = "mqtt" | "coap" | "lwm2m" | "http";

const protocols: Record<Protocol, { name: string; fullName: string; color: string; transport: string; overhead: string; pros: string[]; cons: string[]; bestFor: string; guide?: string }> = {
  mqtt: {
    name: "MQTT",
    fullName: "Message Queuing Telemetry Transport",
    color: "#BFFD11",
    transport: "TCP (persistent connection)",
    overhead: "~2 byte header",
    pros: ["Native AWS/Azure integration", "Pub/sub model for fan-out", "QoS levels 0–2", "Device shadows / state sync"],
    cons: ["TCP overhead — not ideal for NB-IoT", "Always-on connection increases power use"],
    bestFor: "LTE-M devices on AWS IoT / Azure IoT Hub. Bidirectional, frequent messaging.",
    guide: "asset-tracker",
  },
  coap: {
    name: "CoAP",
    fullName: "Constrained Application Protocol",
    color: "#53F2FA",
    transport: "UDP (connectionless)",
    overhead: "~4 byte header",
    pros: ["UDP-based — works over NB-IoT", "Extremely low overhead", "Optional DTLS for encryption", "REST-like semantics"],
    cons: ["No native cloud broker integration", "No built-in QoS for reliable delivery", "No persistent connection"],
    bestFor: "Battery-powered NB-IoT sensors with infrequent reporting. Custom backends.",
    guide: "smart-building",
  },
  lwm2m: {
    name: "LwM2M",
    fullName: "Lightweight M2M",
    color: "#BFFD11",
    transport: "CoAP/UDP + DTLS",
    overhead: "~4 byte header + CoAP",
    pros: ["Built-in device management (FOTA, remote config)", "Standardized object model", "Bootstrap server support", "UDP-based — NB-IoT compatible"],
    cons: ["More complex to implement", "Server infrastructure required", "Limited ecosystem vs MQTT"],
    bestFor: "Managed device deployments needing FOTA + telemetry in one protocol. 10-year lifecycles.",
  },
  http: {
    name: "HTTP/HTTPS",
    fullName: "Hypertext Transfer Protocol",
    color: "#3A3C46",
    transport: "TCP",
    overhead: "~200 bytes+ per request",
    pros: ["Universal compatibility", "Simple to implement", "Works with any REST backend"],
    cons: ["Enormous overhead for IoT scale", "No push — polling only", "Kills battery on constrained devices"],
    bestFor: "Plugged-in devices only. Development/testing. Never for battery-constrained IoT.",
  },
};

function getRecommendation(answers: Record<string, string>): Protocol {
  if (answers.management === "yes" && answers.battery === "critical") return "lwm2m";
  if (answers.management === "yes" && answers.cloud === "hyperscaler") return "mqtt";
  if (answers.management === "yes") return "lwm2m";
  if (answers.cloud === "hyperscaler" && answers.bidirectional === "yes") return "mqtt";
  if (answers.battery === "critical") return "coap";
  if (answers.battery === "no" && answers.frequency === "frequent" && answers.cloud === "hyperscaler") return "mqtt";
  if (answers.battery === "no" && answers.bidirectional === "no") return "http";
  if (answers.cloud === "hyperscaler") return "mqtt";
  return "coap";
}

export default function ProtocolPickerPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQ, setCurrentQ] = useState(0);

  const handleAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    if (currentQ < questions.length - 1) {
      setTimeout(() => setCurrentQ((q) => q + 1), 250);
    }
  };

  const reset = () => { setAnswers({}); setCurrentQ(0); };

  const completed = Object.keys(answers).length === questions.length;
  const recommendation = completed ? getRecommendation(answers) : null;
  const proto = recommendation ? protocols[recommendation] : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
      <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-10" aria-label="Breadcrumb">
        <Link href="/tools" className="hover:text-white/60 transition-colors cursor-pointer">Tools</Link>
        <ChevronRight size={12} />
        <span className="text-[#BFFD11]">Protocol Picker</span>
      </nav>

      <motion.div className="mb-12" variants={staggerContainer} initial="hidden" animate="visible">
        <motion.p variants={staggerItem} className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-3">Decision Tool</motion.p>
        <motion.h1 variants={staggerItem} className="text-4xl font-semibold mb-5">Protocol Picker</motion.h1>
        <motion.p variants={staggerItem} className="text-lg text-white/55 leading-relaxed max-w-2xl">
          MQTT, CoAP, LwM2M, or HTTP? Answer 5 questions about your device and deployment to get a protocol recommendation with rationale.
        </motion.p>
      </motion.div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-10">
        {/* Quiz / Result */}
        <div>
          <AnimatePresence mode="wait">
            {!completed ? (
              <motion.div
                key="quiz"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14]"
              >
                {/* Progress */}
                <div className="flex gap-1 p-4 border-b border-[#3A3C46]/30">
                  {questions.map((_, i) => (
                    <motion.div
                      key={i}
                      className="h-1 rounded-full flex-1"
                      animate={{ background: i < currentQ ? "#BFFD11" : i === currentQ ? "#BFFD1150" : "#3A3C46" }}
                      transition={{ duration: 0.3 }}
                    />
                  ))}
                </div>

                <div className="p-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`q-${currentQ}`}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -24 }}
                      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                      <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/25 mb-2">
                        Question {currentQ + 1} of {questions.length}
                      </p>
                      <p className="text-lg font-semibold text-white mb-6">{questions[currentQ].text}</p>

                      <motion.div
                        className="space-y-3"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                      >
                        {questions[currentQ].options.map((opt) => (
                          <motion.button
                            key={opt.value}
                            variants={staggerItem}
                            onClick={() => handleAnswer(questions[currentQ].id, opt.value)}
                            className="w-full text-left p-4 rounded-xl border border-[#3A3C46]/40 hover:border-[#BFFD11]/30 hover:bg-[#BFFD11]/4 transition-colors duration-150 cursor-pointer group"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <p className="text-sm font-medium text-white/80 group-hover:text-white">{opt.label}</p>
                            <p className="text-xs text-white/30 mt-0.5">{opt.hint}</p>
                          </motion.button>
                        ))}
                      </motion.div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : proto && recommendation ? (
              <motion.div
                key="result"
                variants={scaleIn}
                initial="hidden"
                animate="visible"
              >
                {/* Recommendation card */}
                <div
                  className="rounded-xl border p-7 mb-6"
                  style={{ borderColor: `${proto.color}30`, background: `${proto.color}06` }}
                >
                  <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-3">Recommendation</p>
                  <p className="text-4xl font-semibold mb-1" style={{ color: proto.color }}>{proto.name}</p>
                  <p className="text-sm text-white/40 mb-4">{proto.fullName}</p>
                  <p className="text-sm text-white/65 leading-relaxed">{proto.bestFor}</p>

                  <div className="grid sm:grid-cols-2 gap-4 mt-6">
                    <div>
                      <p className="font-mono text-[10px] tracking-widest uppercase text-white/25 mb-2">Transport</p>
                      <p className="text-sm text-white/65">{proto.transport}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] tracking-widest uppercase text-white/25 mb-2">Header Overhead</p>
                      <p className="text-sm text-white/65">{proto.overhead}</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6 mt-6">
                    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                      <p className="font-mono text-[10px] tracking-widest uppercase text-[#4ade80]/60 mb-2">Pros</p>
                      <ul className="space-y-1.5">
                        {proto.pros.map((p) => (
                          <motion.li key={p} variants={staggerItem} className="flex items-start gap-2 text-sm text-white/55">
                            <Check size={12} className="text-[#4ade80] shrink-0 mt-0.5" />
                            {p}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                      <p className="font-mono text-[10px] tracking-widest uppercase text-white/25 mb-2">Cons</p>
                      <ul className="space-y-1.5">
                        {proto.cons.map((c) => (
                          <motion.li key={c} variants={staggerItem} className="flex items-start gap-2 text-sm text-white/35">
                            <span className="text-white/20 shrink-0 mt-0.5">—</span>
                            {c}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  </div>

                  {proto.guide && (
                    <div className="mt-6">
                      <Link href={`/build/${proto.guide}`} className="inline-flex items-center gap-2 text-sm font-medium text-[#BFFD11] hover:gap-3 transition-all cursor-pointer">
                        See it in the build guide <ArrowRight size={14} />
                      </Link>
                    </div>
                  )}
                </div>

                <motion.button
                  onClick={reset}
                  className="flex items-center gap-2 text-sm text-white/35 hover:text-white transition-colors cursor-pointer"
                  whileHover={{ x: -2 }}
                >
                  <RotateCcw size={14} />
                  Start over
                </motion.button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Protocol sidebar */}
        <div className="space-y-3">
          <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/25 mb-4">All Protocols</p>
          {Object.entries(protocols).map(([key, p]) => (
            <motion.div
              key={key}
              className="rounded-xl border p-4"
              animate={{
                borderColor: recommendation === key ? `${p.color}40` : "rgba(58,60,70,0.3)",
                background: recommendation === key ? `${p.color}08` : "#060a14",
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <p className="font-semibold text-sm" style={{ color: p.color }}>{p.name}</p>
                <AnimatePresence>
                  {recommendation === key && (
                    <motion.span
                      className="text-[10px] font-mono bg-[#BFFD11] text-[#00040F] px-1.5 py-0.5 rounded font-semibold"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      PICK
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-xs text-white/35 leading-relaxed">{p.fullName}</p>
              <p className="text-[11px] font-mono text-white/20 mt-1.5">{p.transport}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-12">
        <InfoCallout type="info">
          <strong>Dual-protocol is common in practice.</strong> Many deployments use LwM2M for
          device management (FOTA, configuration) while using MQTT or CoAP for telemetry. The
          nRF9160 and Quectel BG95 both support multiple simultaneous protocol contexts.
        </InfoCallout>
      </div>
    </div>
  );
}
