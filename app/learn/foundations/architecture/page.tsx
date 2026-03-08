"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import InfoCallout from "@/components/ui/InfoCallout";
import { staggerContainer, staggerItem } from "@/lib/animations";

// 4-Layer IoT Stack
const iotLayers = [
  {
    id: "device",
    label: "LAYER 1",
    name: "Device Layer",
    color: "#BFFD11",
    description:
      "Physical hardware capturing real-world data: sensors, actuators, and microcontrollers. This is where analog meets digital.",
    technologies: ["Temperature sensors", "GPS modules", "Accelerometers", "Cameras", "MCU (ARM Cortex-M)", "Power management ICs"],
    detail:
      "Device layer hardware must balance measurement accuracy with power consumption. A typical IoT endpoint runs on 3.3V or 5V, with sleep currents measured in microamps (µA). The MCU orchestrates sensor readings, buffers data, and coordinates modem wake cycles.",
  },
  {
    id: "connectivity",
    label: "LAYER 2",
    name: "Connectivity Layer",
    color: "#53F2FA",
    description:
      "The cellular radio stack that carries data from device to cloud. Includes the modem, SIM, antenna, and network registration process.",
    technologies: ["LTE-M", "NB-IoT", "5G RedCap", "eUICC / eSIM", "AT command interface", "EPC (Core Network)"],
    detail:
      "Cellular connectivity is managed by a modem SiP (System-in-Package) like the Nordic nRF9160 or Quectel BG95. The modem handles the entire LTE stack — PHY, MAC, RLC, PDCP, RRC — and exposes a simple AT command interface to your MCU over UART or SPI.",
  },
  {
    id: "data",
    label: "LAYER 3",
    name: "Data Analytics Layer",
    color: "#BFFD11",
    description:
      "Processing, storage, and analysis of device data — either on the device edge or in the cloud.",
    technologies: ["AWS IoT Core", "Azure IoT Hub", "InfluxDB (time-series)", "Edge ML inference", "FOTA", "Device Shadow"],
    detail:
      "For low-bandwidth sensors sending telemetry every hour, cloud processing is ideal. For high-frequency signals or latency-sensitive decisions, edge inference on the device or a local gateway is required. Modern SoCs like the nRF9160 include enough compute for lightweight ML inference.",
  },
  {
    id: "application",
    label: "LAYER 4",
    name: "Application Layer",
    color: "#53F2FA",
    description:
      "Business-facing dashboards, alerts, APIs, and integrations that turn raw telemetry into actionable intelligence.",
    technologies: ["REST APIs", "WebSocket dashboards", "Grafana / Kibana", "Alerting pipelines", "ERP/CRM integrations", "Webhook triggers"],
    detail:
      "The application layer is where IoT ROI is realized. Fleet management systems track vehicle locations; cold chain dashboards trigger alerts on temperature excursions; smart building platforms optimize HVAC. This layer consumes the structured data produced by the analytics layer.",
  },
];

// 5-Layer Protocol Stack
const protocolLayers = [
  {
    name: "Application",
    function: "Data formatting & messaging",
    technologies: ["HTTP/HTTPS", "MQTT", "CoAP", "LwM2M", "AMQP"],
    color: "#BFFD11",
  },
  {
    name: "Transport",
    function: "Flow control & error handling",
    technologies: ["TCP", "UDP", "DTLS"],
    color: "#53F2FA",
  },
  {
    name: "Network",
    function: "Addressing & routing",
    technologies: ["IPv4", "IPv6", "6LoWPAN"],
    color: "#BFFD11",
  },
  {
    name: "Link / Physical",
    function: "Radio access & hardware",
    technologies: ["LTE-M", "NB-IoT", "5G NR", "2G/GPRS"],
    color: "#53F2FA",
  },
  {
    name: "Data Format",
    function: "Payload encoding",
    technologies: ["Binary", "JSON", "CBOR", "Protobuf"],
    color: "#BFFD11",
  },
];

export default function ArchitecturePage() {
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const [activeProtocol, setActiveProtocol] = useState<number | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-10" aria-label="Breadcrumb">
        <Link href="/learn" className="hover:text-white/60 transition-colors cursor-pointer">Learn</Link>
        <ChevronRight size={12} />
        <span className="text-white/50">Foundations</span>
        <ChevronRight size={12} />
        <span className="text-[#BFFD11]">Architecture</span>
      </nav>

      {/* Header */}
      <motion.div className="mb-12" variants={staggerContainer} initial="hidden" animate="visible">
        <motion.p variants={staggerItem} className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-3">
          Foundations · 12 min
        </motion.p>
        <motion.h1 variants={staggerItem} className="text-4xl font-semibold mb-5 leading-tight">
          IoT Architecture &amp; Protocol Stack
        </motion.h1>
        <motion.p variants={staggerItem} className="text-lg text-white/55 leading-relaxed max-w-2xl">
          Every cellular IoT system follows the same fundamental architecture. Understanding the
          4-layer IoT stack and 5-layer protocol stack tells you exactly where your device sits —
          and how data flows from silicon to dashboard.
        </motion.p>
      </motion.div>

      {/* ── 4-Layer Stack ── */}
      <section className="mb-20">
        <h2 className="text-2xl font-semibold mb-2">The 4-Layer IoT Architecture</h2>
        <p className="text-white/45 mb-8 leading-relaxed">
          Click any layer to expand its role, technologies, and design considerations.
        </p>

        <div className="space-y-2">
          {iotLayers.map((layer, idx) => {
            const isActive = activeLayer === layer.id;
            return (
              <div
                key={layer.id}
                className={`rounded-xl border transition-all duration-200 cursor-pointer ${isActive
                    ? "border-[#BFFD11]/40 bg-[#BFFD11]/4"
                    : "border-[#3A3C46]/40 bg-[#060a14] hover:border-[#3A3C46]/70"
                  }`}
                onClick={() => setActiveLayer(isActive ? null : layer.id)}
              >
                {/* Collapsed header */}
                <div className="flex items-center gap-4 p-5">
                  {/* Layer number */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-mono text-xs font-semibold"
                    style={{
                      background: `${layer.color}15`,
                      color: layer.color,
                      border: `1px solid ${layer.color}25`,
                    }}
                  >
                    {idx + 1}
                  </div>

                  {/* Name + description */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-mono text-[10px] font-semibold tracking-widest uppercase" style={{ color: layer.color }}>
                        {layer.label}
                      </p>
                    </div>
                    <p className="text-base font-semibold text-white">{layer.name}</p>
                  </div>

                  <p className="hidden sm:block text-sm text-white/40 max-w-xs text-right flex-1">
                    {layer.description}
                  </p>

                  <div
                    className="w-5 h-5 flex items-center justify-center transition-transform duration-200 shrink-0"
                    style={{ transform: isActive ? "rotate(90deg)" : "rotate(0deg)" }}
                  >
                    <ChevronRight size={14} className="text-white/30" />
                  </div>
                </div>

                {/* Mobile description */}
                <p className="sm:hidden px-5 pb-3 text-sm text-white/40">{layer.description}</p>

                {/* Expanded */}
                {isActive && (
                  <div className="px-5 pb-6 border-t border-[#BFFD11]/10 pt-5">
                    <p className="text-sm text-white/65 leading-relaxed mb-5">{layer.detail}</p>

                    <div>
                      <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-3">
                        Technologies
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {layer.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-2.5 py-1 rounded-lg text-xs font-mono"
                            style={{
                              background: `${layer.color}08`,
                              color: `${layer.color}CC`,
                              border: `1px solid ${layer.color}15`,
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Protocol Stack ── */}
      <section className="mb-20">
        <h2 className="text-2xl font-semibold mb-2">The 5-Layer Protocol Stack</h2>
        <p className="text-white/45 mb-8 leading-relaxed">
          Every IoT packet travels through five protocol layers. Click any layer to see which
          technologies operate at that level.
        </p>

        <div className="rounded-xl border border-[#3A3C46]/40 overflow-hidden">
          {/* Visual stack */}
          <div className="p-5 bg-[#060a14] grid grid-cols-5 gap-2 mb-0">
            {protocolLayers.map((layer, idx) => (
              <button
                key={idx}
                onClick={() => setActiveProtocol(activeProtocol === idx ? null : idx)}
                className="flex flex-col items-center gap-1 p-3 rounded-lg transition-all duration-200 cursor-pointer text-center"
                style={{
                  background:
                    activeProtocol === idx ? `${layer.color}10` : "rgba(255,255,255,0.02)",
                  border: `1px solid ${activeProtocol === idx ? layer.color + "30" : "#3A3C4620"}`,
                }}
              >
                <span
                  className="text-[10px] font-mono font-semibold tracking-wider uppercase"
                  style={{ color: layer.color }}
                >
                  {layer.name}
                </span>
              </button>
            ))}
          </div>

          {/* Detail panel */}
          {activeProtocol !== null && (
            <div
              className="px-6 py-5 border-t"
              style={{ borderColor: `${protocolLayers[activeProtocol].color}20` }}
            >
              <div className="flex flex-wrap items-start gap-8">
                <div>
                  <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-1">
                    Function
                  </p>
                  <p className="text-sm text-white/75">
                    {protocolLayers[activeProtocol].function}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-2">
                    Technologies
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {protocolLayers[activeProtocol].technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 rounded text-xs font-mono"
                        style={{
                          background: `${protocolLayers[activeProtocol].color}08`,
                          color: `${protocolLayers[activeProtocol].color}CC`,
                          border: `1px solid ${protocolLayers[activeProtocol].color}15`,
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Full table */}
      <section className="mb-20">
        <h2 className="text-xl font-semibold mb-6">Protocol Stack Reference</h2>
        <div className="rounded-xl border border-[#3A3C46]/40 overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#0a0e1a] border-b border-[#3A3C46]/40">
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Layer</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Function</th>
                <th className="text-left px-5 py-3 font-mono text-[11px] tracking-widest uppercase text-white/35">Technologies</th>
              </tr>
            </thead>
            <tbody className="bg-[#030710]">
              {protocolLayers.map((layer, idx) => (
                <tr key={idx} className="border-b border-[#3A3C46]/15 last:border-0">
                  <td className="px-5 py-3.5 font-mono text-sm" style={{ color: layer.color }}>{layer.name}</td>
                  <td className="px-5 py-3.5 text-white/55">{layer.function}</td>
                  <td className="px-5 py-3.5 text-white/45 font-mono text-xs">{layer.technologies.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <InfoCallout type="tip">
        <strong>Design principle:</strong> Always keep your application layer protocol (MQTT/CoAP)
        separate from your transport choice (TCP/UDP). This lets you swap one without rewriting the
        other — critical for long-lived deployments where carrier support may change.
      </InfoCallout>

      {/* Next lesson nav */}
      <div className="mt-16 pt-8 border-t border-[#3A3C46]/30 flex justify-between items-center">
        <div />
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
