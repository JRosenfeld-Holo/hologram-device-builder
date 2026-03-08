"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Building2, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FreePilotCTA from "@/components/ui/FreePilotCTA";
import InfoCallout from "@/components/ui/InfoCallout";
import ComparisonTable from "@/components/ui/ComparisonTable";
import CodeBlock from "@/components/ui/CodeBlock";
import InteractiveToggle from "@/components/ui/InteractiveToggle";

/* ── Steps ── */
const buildingSteps = [
  { id: "why-nbiot", label: "Why NB-IoT" },
  { id: "coverage-protocol", label: "Coverage & Protocol" },
  { id: "payload", label: "Payload Optimization" },
  { id: "deployment", label: "Deployment Planning" },
  { id: "power-hardware", label: "Power & Hardware" },
  { id: "security", label: "Security & Deploy" },
];

/* ── Security Checklist ── */
const buildingSecurityChecklist = [
  { label: "Use DTLS with PSK", cmd: "DTLS 1.2/1.3 with Pre-Shared Keys — avoid cert-based TLS on constrained devices" },
  { label: "Unique PSK per device", cmd: "Never reuse keys — compromised key should not affect fleet" },
  { label: "Validate server certificate", cmd: "Pin CoAP server URI, DTLS handles replay prevention" },
  { label: "Protect SIM credentials", cmd: "Hologram eUICC (SGP.32) stores credentials in hardware" },
  { label: "Firmware signature verification", cmd: "ECDSA-signed FOTA images — reject unsigned updates" },
  { label: "eSIM MFF2 soldered — no removable SIM", cmd: "Eliminate physical tampering vector" },
];

/* ── Animated Score Hook ── */
function useAnimatedScore(target: number) {
  const [val, setVal] = useState(0);
  const ref = useRef(0);
  useEffect(() => {
    const start = ref.current;
    const diff = target - start;
    if (diff === 0) return;
    const startTime = performance.now();
    const duration = 400;
    const raf = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      setVal(current);
      ref.current = current;
      if (progress < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [target]);
  return val;
}

// ─── Coverage Extension Visualizer ───────────────────────────────────────────

function CoverageVisualizer() {
  const [ceMode, setCeMode] = useState<"none" | "ce0" | "ce1">("none");

  const modes = [
    {
      id: "none",
      label: "No CE",
      mcl: "144 dB",
      range: "~0.5 km",
      penetration: "Outdoor only",
      repetitions: "1×",
      batteryImpact: "1×",
      color: "#53F2FA",
    },
    {
      id: "ce0",
      label: "CE Mode A",
      mcl: "154 dB",
      range: "~2 km",
      penetration: "Indoor (shallow)",
      repetitions: "2–4×",
      batteryImpact: "2–4×",
      color: "#BFFD11",
    },
    {
      id: "ce1",
      label: "CE Mode B",
      mcl: "164 dB",
      range: "~10 km",
      penetration: "Deep indoor / basement",
      repetitions: "32–128×",
      batteryImpact: "10–40×",
      color: "#f97316",
    },
  ] as const;

  const current = modes.find((m) => m.id === ceMode)!;

  const buildings = [
    { label: "Rooftop", depth: 5, accessible: true },
    { label: "Floor 3", depth: 25, accessible: ceMode !== "none" },
    { label: "Floor 1", depth: 45, accessible: ceMode !== "none" },
    { label: "Basement", depth: 70, accessible: ceMode === "ce1" },
    { label: "Sub-basement", depth: 90, accessible: ceMode === "ce1" },
  ];

  return (
    <div className="rounded-2xl border border-[#3A3C46]/40 bg-[#060a14] overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-[#3A3C46]/30">
        <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-1">
          Interactive
        </p>
        <h3 className="text-lg font-semibold text-white">Coverage Extension Mode</h3>
        <p className="text-sm text-white/45 mt-1">
          NB-IoT's CE modes allow signals to penetrate deep indoor environments by repeating transmissions.
        </p>
      </div>

      <div className="p-6">
        {/* Mode selector */}
        <div className="flex gap-2 mb-6">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setCeMode(m.id)}
              className="flex-1 py-2.5 px-3 rounded-xl text-xs font-mono font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer border"
              style={{
                background: ceMode === m.id ? `${m.color}15` : "transparent",
                borderColor: ceMode === m.id ? `${m.color}50` : "#3A3C46",
                color: ceMode === m.id ? m.color : "rgba(255,255,255,0.4)",
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Building diagram */}
          <div className="relative rounded-xl bg-[#030810] border border-[#3A3C46]/30 p-4 overflow-hidden">
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/30 mb-3">
              Signal penetration
            </p>
            <div className="space-y-1.5">
              {buildings.map((b) => (
                <div key={b.label} className="flex items-center gap-3">
                  <span className="text-xs text-white/40 w-24 shrink-0 font-mono">{b.label}</span>
                  <div className="flex-1 h-7 rounded bg-[#060a14] border border-[#3A3C46]/20 relative overflow-hidden flex items-center px-2">
                    {b.accessible && (
                      <div
                        className="absolute inset-0 transition-all duration-700"
                        style={{
                          background: `${current.color}12`,
                          borderLeft: `2px solid ${current.color}40`,
                        }}
                      />
                    )}
                    <span
                      className="relative text-xs font-mono transition-colors duration-300"
                      style={{ color: b.accessible ? current.color : "rgba(255,255,255,0.15)" }}
                    >
                      {b.accessible ? "Signal OK" : "No signal"}
                    </span>
                    {b.accessible && (
                      <Check
                        size={11}
                        className="absolute right-2"
                        style={{ color: current.color }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Specs panel */}
          <div className="space-y-3">
            {[
              { label: "Max Coupling Loss", value: current.mcl },
              { label: "Typical Range", value: current.range },
              { label: "Indoor Reach", value: current.penetration },
              { label: "TX Repetitions", value: current.repetitions },
              { label: "Battery Impact", value: current.batteryImpact },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#030810] border border-[#3A3C46]/20"
              >
                <span className="text-xs text-white/40 font-mono">{label}</span>
                <span
                  className="text-sm font-semibold font-mono transition-colors duration-300"
                  style={{ color: current.color }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 p-4 rounded-xl bg-[#BFFD11]/5 border border-[#BFFD11]/15">
          <p className="text-xs text-white/50 leading-relaxed">
            <span className="text-[#BFFD11] font-semibold">Design tip:</span> CE Mode B is ideal for
            sensors installed in basements, elevator shafts, or concrete utility rooms. The battery
            penalty is real — size your battery accordingly and keep reporting intervals long (≥15 min).
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Payload Builder ──────────────────────────────────────────────────────────

type SensorField = {
  key: string;
  label: string;
  unit: string;
  jsonBytes: number;
  cborBytes: number;
  enabled: boolean;
  sampleValue: string | number;
};

function PayloadBuilder() {
  const [fields, setFields] = useState<SensorField[]>([
    { key: "temp", label: "Temperature", unit: "°C", jsonBytes: 12, cborBytes: 4, enabled: true, sampleValue: 22.4 },
    { key: "hum", label: "Humidity", unit: "%RH", jsonBytes: 10, cborBytes: 3, enabled: true, sampleValue: 58 },
    { key: "co2", label: "CO₂", unit: "ppm", jsonBytes: 13, cborBytes: 4, enabled: true, sampleValue: 850 },
    { key: "voc", label: "VOC Index", unit: "", jsonBytes: 11, cborBytes: 3, enabled: false, sampleValue: 100 },
    { key: "pm25", label: "PM2.5", unit: "µg/m³", jsonBytes: 13, cborBytes: 4, enabled: false, sampleValue: 12 },
    { key: "lux", label: "Illuminance", unit: "lux", jsonBytes: 11, cborBytes: 3, enabled: false, sampleValue: 450 },
    { key: "pir", label: "Occupancy", unit: "bool", jsonBytes: 13, cborBytes: 2, enabled: false, sampleValue: 1 },
    { key: "seq", label: "Sequence No.", unit: "", jsonBytes: 10, cborBytes: 2, enabled: true, sampleValue: 1042 },
  ]);

  const toggle = (key: string) =>
    setFields((prev) =>
      prev.map((f) => (f.key === key ? { ...f, enabled: !f.enabled } : f))
    );

  const activeFields = fields.filter((f) => f.enabled);

  const jsonPayload = useMemo(() => {
    const obj: Record<string, string | number> = {};
    activeFields.forEach((f) => (obj[f.key] = f.sampleValue));
    return JSON.stringify(obj, null, 2);
  }, [activeFields]);

  const jsonBytes =
    activeFields.reduce((s, f) => s + f.jsonBytes, 0) + 2; // {} overhead
  const cborBytes =
    activeFields.reduce((s, f) => s + f.cborBytes, 0) + 1 + activeFields.length; // map header + key bytes

  const saving = Math.round((1 - cborBytes / jsonBytes) * 100);

  return (
    <div className="rounded-2xl border border-[#3A3C46]/40 bg-[#060a14] overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-[#3A3C46]/30">
        <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-1">
          Interactive
        </p>
        <h3 className="text-lg font-semibold text-white">Payload Builder</h3>
        <p className="text-sm text-white/45 mt-1">
          Toggle sensor fields to compare JSON vs CBOR payload size. Every byte counts on NB-IoT.
        </p>
      </div>

      <div className="p-6 grid lg:grid-cols-[1fr_1fr] gap-6">
        {/* Field toggles */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/30 mb-3">
            Sensor fields
          </p>
          <div className="space-y-1.5">
            {fields.map((f) => (
              <button
                key={f.key}
                onClick={() => toggle(f.key)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-150 cursor-pointer text-left"
                style={{
                  background: f.enabled ? "rgba(191,253,17,0.05)" : "transparent",
                  borderColor: f.enabled ? "rgba(191,253,17,0.25)" : "rgba(58,60,70,0.4)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all duration-150"
                    style={{
                      background: f.enabled ? "#BFFD11" : "transparent",
                      border: f.enabled ? "none" : "1px solid rgba(58,60,70,0.8)",
                    }}
                  >
                    {f.enabled && <Check size={10} className="text-[#00040F]" strokeWidth={3} />}
                  </div>
                  <span className="text-sm text-white/80">{f.label}</span>
                  {f.unit && (
                    <span className="text-xs text-white/30 font-mono">{f.unit}</span>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs text-white/30 font-mono">
                    {f.jsonBytes}B / {f.cborBytes}B
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Output */}
        <div className="space-y-4">
          {/* Size comparison */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#030810] border border-[#3A3C46]/30 p-4 text-center">
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/30 mb-1">
                JSON
              </p>
              <p className="text-2xl font-semibold text-white font-mono">{jsonBytes}B</p>
              <p className="text-xs text-white/30 mt-1">baseline</p>
            </div>
            <div className="rounded-xl bg-[#030810] border border-[#BFFD11]/20 p-4 text-center">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#BFFD11]/60 mb-1">
                CBOR
              </p>
              <p className="text-2xl font-semibold text-[#BFFD11] font-mono">{cborBytes}B</p>
              <p className="text-xs text-[#BFFD11]/40 mt-1">−{saving}% smaller</p>
            </div>
          </div>

          {/* JSON preview */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/30 mb-2">
              JSON preview
            </p>
            <div className="rounded-xl bg-[#030810] border border-[#3A3C46]/30 p-3 font-mono text-xs text-white/50 leading-relaxed overflow-auto max-h-36">
              <pre>{jsonPayload}</pre>
            </div>
          </div>

          {/* Impact note */}
          <div className="rounded-xl bg-[#53F2FA]/5 border border-[#53F2FA]/15 p-3">
            <p className="text-xs text-white/50 leading-relaxed">
              <span className="text-[#53F2FA] font-semibold">NB-IoT context:</span> Smaller payloads
              mean faster transmissions, lower battery use, and lower data costs. At 12 reports/day
              for 10 years, saving {saving}% per payload compounds to significant battery life gains.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Protocol Decision ────────────────────────────────────────────────────────

function ProtocolSelector() {
  const [selected, setSelected] = useState<"coap" | "mqtt-sn" | "lwm2m">("coap");

  const protocols = [
    {
      id: "coap",
      name: "CoAP",
      tagline: "UDP-based REST for constrained devices",
      bestFor: "Simple telemetry, fire-and-forget sensors",
      overhead: "~12B header",
      transport: "UDP",
      bidirectional: false,
      ota: false,
      provisioning: false,
      pros: ["Tiny overhead", "RESTful — easy to integrate", "DTLS for security", "Observe mode for push"],
      cons: ["No built-in OTA", "No device management", "Client must initiate"],
      color: "#BFFD11",
    },
    {
      id: "mqtt-sn",
      name: "MQTT-SN",
      tagline: "MQTT adapted for sensor networks",
      bestFor: "Publish/subscribe sensor data with a broker",
      overhead: "~2B header",
      transport: "UDP",
      bidirectional: true,
      ota: false,
      provisioning: false,
      pros: ["Tiny 2-byte header", "Familiar MQTT model", "QoS 0/1/2 support", "Works over UDP"],
      cons: ["Requires MQTT-SN gateway", "Less common tooling", "No device mgmt"],
      color: "#53F2FA",
    },
    {
      id: "lwm2m",
      name: "LwM2M",
      tagline: "Full device lifecycle management",
      bestFor: "Fleet management, FOTA, remote config",
      overhead: "~8B CoAP header",
      transport: "UDP / CoAP",
      bidirectional: true,
      ota: true,
      provisioning: true,
      pros: ["FOTA built-in", "Bootstrap provisioning", "Object model for sensors", "Standardized (OMA)"],
      cons: ["Complex to implement", "Requires LwM2M server", "Higher code footprint"],
      color: "#BFFD11",
    },
  ] as const;

  const current = protocols.find((p) => p.id === selected)!;

  return (
    <div className="rounded-2xl border border-[#3A3C46]/40 bg-[#060a14] overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-[#3A3C46]/30">
        <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-1">
          Interactive
        </p>
        <h3 className="text-lg font-semibold text-white">Protocol Selector</h3>
        <p className="text-sm text-white/45 mt-1">
          NB-IoT devices typically avoid TCP — compare UDP-based protocols for constrained sensors.
        </p>
      </div>

      <div className="p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {protocols.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id as typeof selected)}
              className="flex-1 py-2.5 px-2 rounded-xl text-xs font-mono font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer border"
              style={{
                background: selected === p.id ? `${p.color}12` : "transparent",
                borderColor: selected === p.id ? `${p.color}40` : "#3A3C46",
                color: selected === p.id ? p.color : "rgba(255,255,255,0.35)",
              }}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Left: details */}
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-white mb-0.5">{current.name}</p>
              <p className="text-xs text-white/40">{current.tagline}</p>
            </div>

            <div className="space-y-2">
              {[
                { label: "Best for", value: current.bestFor },
                { label: "Transport", value: current.transport },
                { label: "Header overhead", value: current.overhead },
                { label: "Bidirectional", value: current.bidirectional ? "Yes" : "No" },
                { label: "Built-in FOTA", value: current.ota ? "Yes" : "No" },
                { label: "Provisioning", value: current.provisioning ? "Yes" : "No" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#030810] border border-[#3A3C46]/20"
                >
                  <span className="text-xs text-white/35 font-mono">{label}</span>
                  <span
                    className="text-xs font-semibold font-mono"
                    style={{
                      color:
                        value === "Yes"
                          ? "#4ade80"
                          : value === "No"
                            ? "rgba(255,255,255,0.25)"
                            : "rgba(255,255,255,0.6)",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: pros/cons */}
          <div className="space-y-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/30 mb-2">
                Pros
              </p>
              <ul className="space-y-1.5">
                {current.pros.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-xs text-white/55">
                    <Check size={11} className="text-[#4ade80] mt-0.5 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/30 mb-2">
                Cons
              </p>
              <ul className="space-y-1.5">
                {current.cons.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-xs text-white/55">
                    <span className="text-[#f97316] mt-0.5 shrink-0 text-[10px] font-bold">×</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Deployment Density Planner ───────────────────────────────────────────────

function DeploymentPlanner() {
  const [floors, setFloors] = useState(10);
  const [sensorsPerFloor, setSensorsPerFloor] = useState(4);
  const [reportingInterval, setReportingInterval] = useState(15); // minutes
  const [batteryMah, setBatteryMah] = useState(3600);

  const totalSensors = floors * sensorsPerFloor;
  const reportsPerDayPerSensor = Math.floor((60 / reportingInterval) * 24);
  const totalReportsPerDay = totalSensors * reportsPerDayPerSensor;

  // Rough battery life: ~100µA avg draw in CE Mode A with 15-min reporting
  const avgCurrentUa = 50 + (60 / reportingInterval) * 150;
  const batteryLifeYears = (batteryMah * 1000) / (avgCurrentUa * 24 * 365) / 1000;

  return (
    <div className="rounded-2xl border border-[#3A3C46]/40 bg-[#060a14] overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-[#3A3C46]/30">
        <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-1">
          Interactive
        </p>
        <h3 className="text-lg font-semibold text-white">Deployment Density Planner</h3>
        <p className="text-sm text-white/45 mt-1">
          Estimate fleet size, reporting load, and battery life for your building deployment.
        </p>
      </div>

      <div className="p-6 grid sm:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-5">
          {[
            {
              label: "Building floors",
              value: floors,
              min: 1,
              max: 50,
              step: 1,
              unit: "floors",
              set: setFloors,
            },
            {
              label: "Sensors per floor",
              value: sensorsPerFloor,
              min: 1,
              max: 20,
              step: 1,
              unit: "sensors",
              set: setSensorsPerFloor,
            },
            {
              label: "Reporting interval",
              value: reportingInterval,
              min: 5,
              max: 60,
              step: 5,
              unit: "min",
              set: setReportingInterval,
            },
            {
              label: "Battery capacity",
              value: batteryMah,
              min: 1000,
              max: 10000,
              step: 500,
              unit: "mAh",
              set: setBatteryMah,
            },
          ].map(({ label, value, min, max, step, unit, set }) => (
            <div key={label}>
              <div className="flex justify-between mb-2">
                <span className="text-xs text-white/50 font-mono">{label}</span>
                <span className="text-xs font-semibold font-mono text-[#BFFD11]">
                  {value.toLocaleString()} {unit}
                </span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => set(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #BFFD11 ${((value - min) / (max - min)) * 100}%, rgba(58,60,70,0.5) ${((value - min) / (max - min)) * 100}%)`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Results */}
        <div className="space-y-3">
          {[
            { label: "Total sensors", value: totalSensors.toLocaleString(), unit: "devices", color: "#BFFD11" },
            { label: "Reports per day", value: totalReportsPerDay.toLocaleString(), unit: "messages", color: "#53F2FA" },
            {
              label: "Avg current draw",
              value: `~${avgCurrentUa.toFixed(0)}`,
              unit: "µA per device",
              color: "rgba(255,255,255,0.6)",
            },
            {
              label: "Est. battery life",
              value: batteryLifeYears >= 1 ? batteryLifeYears.toFixed(1) : `${(batteryLifeYears * 12).toFixed(0)} mo`,
              unit: batteryLifeYears >= 1 ? "years" : "",
              color: batteryLifeYears >= 5 ? "#4ade80" : batteryLifeYears >= 2 ? "#BFFD11" : "#f97316",
            },
          ].map(({ label, value, unit, color }) => (
            <div
              key={label}
              className="flex items-center justify-between px-4 py-3.5 rounded-xl bg-[#030810] border border-[#3A3C46]/20"
            >
              <span className="text-xs text-white/35 font-mono">{label}</span>
              <div className="text-right">
                <span className="text-base font-semibold font-mono" style={{ color }}>
                  {value}
                </span>
                {unit && (
                  <span className="text-xs text-white/25 font-mono ml-1">{unit}</span>
                )}
              </div>
            </div>
          ))}

          <div className="rounded-xl bg-[#BFFD11]/5 border border-[#BFFD11]/15 p-3 mt-2">
            <p className="text-xs text-white/45 leading-relaxed">
              Estimates assume NB-IoT CE Mode A, 50-byte CBOR payload, and no PSM (sensor wakes on
              interval). Enable PSM to extend battery life by 2–5×.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BuildSmartBuildingPage() {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [activeStep, setActiveStep] = useState("why-nbiot");
  const [direction, setDirection] = useState(1);
  const [checkedSecurity, setCheckedSecurity] = useState<Set<number>>(new Set());

  const goToStep = (stepId: string) => {
    const fromIdx = buildingSteps.findIndex((s) => s.id === activeStep);
    const toIdx = buildingSteps.findIndex((s) => s.id === stepId);
    setDirection(toIdx >= fromIdx ? 1 : -1);
    setActiveStep(stepId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const markComplete = (stepId: string) => {
    setCompletedSteps((prev) => { const next = new Set(prev); next.add(stepId); return next; });
    const idx = buildingSteps.findIndex((s) => s.id === stepId);
    if (idx < buildingSteps.length - 1) { setDirection(1); setActiveStep(buildingSteps[idx + 1].id); window.scrollTo({ top: 0, behavior: "smooth" }); }
  };

  const toggleSecurity = (idx: number) => {
    setCheckedSecurity((prev) => { const next = new Set(prev); if (next.has(idx)) next.delete(idx); else next.add(idx); return next; });
  };

  const securityScore = Math.round((checkedSecurity.size / buildingSecurityChecklist.length) * 100);
  const displayedScore = useAnimatedScore(securityScore);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-10" aria-label="Breadcrumb">
        <Link href="/build" className="hover:text-white/60 transition-colors cursor-pointer">Build</Link>
        <ChevronRight size={12} />
        <span className="text-[#BFFD11]">Smart Building Sensor</span>
      </nav>

      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center mb-14">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-[8px] flex items-center justify-center" style={{ background: "rgba(191,253,17,0.1)", border: "1px solid rgba(191,253,17,0.2)" }}>
              <Building2 size={18} color="#BFFD11" strokeWidth={1.75} />
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-[#BFFD11]">Build Guide</span>
              <span className="text-[10px] font-mono font-semibold tracking-wider uppercase px-2 py-0.5 rounded text-[#f59e0b] bg-[#f59e0b]/10">Intermediate</span>
              <span className="text-[11px] text-white/30 font-mono">30 min</span>
            </div>
          </div>
          <h1 className="text-4xl font-semibold mb-5">Smart Building Sensor</h1>
          <p className="text-lg text-white/55 leading-relaxed max-w-2xl">
            NB-IoT sensors for air quality, occupancy, metering, and lighting. Deep indoor coverage via Coverage Extension mode, UDP-based protocols, and CBOR payload optimization for 10-year battery life.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-6">
            {["Coverage Extension (CE) mode setup", "JSON vs CBOR payload comparison", "CoAP / MQTT-SN protocol guide", "Deployment density planning", "10-year battery via PSM"].map((h) => (
              <span key={h} className="flex items-center gap-1.5 text-xs text-white/35">
                <Check size={11} color="#BFFD11" className="shrink-0" />{h}
              </span>
            ))}
          </div>
        </div>
        <div className="hidden lg:flex justify-center items-center">
          <img src="/smart_building_hero.png" alt="Smart Building Sensor Illustration" className="w-full scale-110" style={{ maskImage: "radial-gradient(ellipse 80% 75% at 50% 50%, black 40%, transparent 72%)", WebkitMaskImage: "radial-gradient(ellipse 80% 75% at 50% 50%, black 40%, transparent 72%)" }} />
        </div>
      </div>

      {/* Step Progress Bar */}
      <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] p-4 mb-12">
        <div className="flex items-center gap-3 sm:hidden mb-3">
          <button onClick={() => { const idx = buildingSteps.findIndex((s) => s.id === activeStep); if (idx > 0) goToStep(buildingSteps[idx - 1].id); }} disabled={buildingSteps.findIndex((s) => s.id === activeStep) === 0} className="p-2 rounded-lg border border-[#3A3C46]/40 text-white/50 hover:text-white hover:border-white/20 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer" aria-label="Previous step"><ChevronLeft size={16} /></button>
          <div className="flex-1 text-center">
            <p className="text-[10px] font-mono font-semibold tracking-widest uppercase text-[#BFFD11]">Step {buildingSteps.findIndex((s) => s.id === activeStep) + 1} of {buildingSteps.length}</p>
            <p className="text-sm font-medium text-white mt-0.5">{buildingSteps.find((s) => s.id === activeStep)?.label}</p>
          </div>
          <button onClick={() => { const idx = buildingSteps.findIndex((s) => s.id === activeStep); if (idx < buildingSteps.length - 1) goToStep(buildingSteps[idx + 1].id); }} disabled={buildingSteps.findIndex((s) => s.id === activeStep) === buildingSteps.length - 1} className="p-2 rounded-lg border border-[#3A3C46]/40 text-white/50 hover:text-white hover:border-white/20 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer" aria-label="Next step"><ChevronRight size={16} /></button>
        </div>
        <div className="hidden sm:flex gap-1 overflow-x-auto pb-1">
          {buildingSteps.map((step, idx) => {
            const isComplete = completedSteps.has(step.id);
            const isActive = activeStep === step.id;
            return (
              <button key={step.id} onClick={() => goToStep(step.id)} className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap text-xs font-medium transition-all duration-200 cursor-pointer shrink-0 ${isActive ? "bg-[#BFFD11] text-[#00040F]" : isComplete ? "text-[#BFFD11]/70 bg-[#BFFD11]/8" : "text-white/35 hover:text-white/60"}`}>
                {isComplete ? <Check size={11} className="shrink-0" /> : <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">{idx + 1}</span>}
                {step.label}
              </button>
            );
          })}
        </div>
        <div className="mt-3 h-1 bg-[#3A3C46]/30 rounded-full overflow-hidden">
          <div className="h-full bg-[#BFFD11] rounded-full transition-all duration-500" style={{ width: `${(completedSteps.size / buildingSteps.length) * 100}%` }} />
        </div>
        <p className="text-xs text-white/25 mt-2">{completedSteps.size}/{buildingSteps.length} steps complete</p>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div key={activeStep} custom={direction} initial={{ opacity: 0, x: direction * 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: direction * -40 }} transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}>

          {/* STEP 1: Why NB-IoT */}
          {activeStep === "why-nbiot" && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] bg-[#BFFD11]/10 px-2 py-1 rounded">Step 1</span>
                <h2 className="text-2xl font-semibold">Why NB-IoT for Buildings?</h2>
              </div>
              <p className="text-sm text-white/45 mb-6 leading-relaxed">
                Buildings are RF hostile environments — concrete walls, elevator shafts, and sub-basements
                block most wireless signals. NB-IoT&apos;s Coverage Extension (CE) mode solves this by
                repeating transmissions up to 128 times, achieving 20 dB better link budget than LTE-M.
              </p>
              <ComparisonTable
                columns={[
                  { key: "nbiot", label: "NB-IoT", recommended: true },
                  { key: "ltem", label: "LTE-M" },
                  { key: "lora", label: "LoRaWAN" },
                ]}
                rows={[
                  { metric: "Max Coupling Loss (MCL)", nbiot: "164 dB (CE Mode B)", ltem: "156 dB", lora: "157 dB (SF12)" },
                  { metric: "Licensed spectrum", nbiot: "✓ — SLA guaranteed", ltem: "✓", lora: "✗ — ISM band, shared" },
                  { metric: "Throughput", nbiot: "~250 kbps DL / 20 kbps UL", ltem: "~1 Mbps / 1 Mbps", lora: "~50 kbps / 50 kbps" },
                  { metric: "Firmware (FOTA)", nbiot: "Yes (CoAP/LwM2M block transfer)", ltem: "Yes (HTTP/MQTT)", lora: "Limited (~10 KB fragmented)" },
                  { metric: "Battery life (250B q15min)", nbiot: "10+ years (PSM)", ltem: "5–8 years (PSM/eDRX)", lora: "5–10 years (Class A)" },
                  { metric: "Ideal for", nbiot: "Indoor sensors, metering, building IoT", ltem: "Asset tracking, wearables, voice", lora: "Campus/rural low-density" },
                ]}
                caption="NB-IoT vs LTE-M vs LoRaWAN for building sensor deployments"
              />
              <div className="mt-6">
                <InfoCallout type="tip">
                  NB-IoT operates in a 180 kHz narrowband channel — the same as a single LTE resource
                  block. It can be deployed in-band within an LTE carrier, in a guard band, or standalone
                  on 200 kHz GSM spectrum. Check your carrier&apos;s NB-IoT band support before choosing
                  a module (Bands 3, 8, 20, and 28 are most common globally).
                </InfoCallout>
              </div>
              <button onClick={() => markComplete("why-nbiot")} className="mt-8 px-5 py-2.5 rounded-xl bg-[#BFFD11] text-[#00040F] text-sm font-semibold hover:bg-[#d4ff3d] transition-colors cursor-pointer">Complete Step → Coverage & Protocol</button>
            </section>
          )}

          {/* STEP 2: Coverage & Protocol */}
          {activeStep === "coverage-protocol" && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] bg-[#BFFD11]/10 px-2 py-1 rounded">Step 2</span>
                <h2 className="text-2xl font-semibold">Coverage & Protocol</h2>
              </div>
              <p className="text-sm text-white/45 mb-6 leading-relaxed">
                Coverage Extension (CE) uses HARQ retransmissions to punch through thick concrete. There
                are two CE modes: CE Mode A (up to 32 repetitions, ~154 dB MCL) and CE Mode B (up to 128
                repetitions, ~164 dB MCL). The trade-off is battery life — more repetitions means longer TX time.
              </p>
              <CoverageVisualizer />
              <div className="mt-6">
                <CodeBlock
                  language="at"
                  title="Configure CE Mode in firmware"
                  code={[
                    { code: "AT+CEREG=2", comment: "Enable extended registration status" },
                    { code: "AT+NPTWEDRXP=1,5,0010,0011", comment: "eDRX + PTW timing for NB-IoT" },
                    { code: 'AT+NCONFIG="AUTOCONNECT","TRUE"', comment: "Auto-attach on power-up" },
                    { code: 'AT+NCONFIG="CR_0354_0338_SCRAMBLING","TRUE"', comment: "Enable CE scrambling" },
                    { code: "AT+NBAND=20", comment: "Lock to Band 20 (EU 800 MHz)" },
                    { code: "AT+CFUN=1", comment: "Full functionality, triggers registration" },
                    { code: "AT+CEREG?", comment: "Check: +CEREG: 2,1,<tac>,<ci>,<act>,..." },
                  ]}
                />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2 mt-12">Protocol Selection</h3>
              <p className="text-sm text-white/45 mb-6 leading-relaxed">
                NB-IoT devices avoid TCP due to its per-packet overhead and connection overhead on
                constrained radios. The standard stack is UDP-based — CoAP for simple telemetry, MQTT-SN
                when you need a broker model, or LwM2M when you need full device lifecycle management
                including FOTA.
              </p>
              <ProtocolSelector />
              <div className="mt-6">
                <InteractiveToggle
                  label="Protocol stack comparison"
                  tabs={[
                    { key: "coap", label: "CoAP stack" },
                    { key: "lwm2m", label: "LwM2M stack" },
                  ]}
                >
                  {{
                    coap: (
                      <div className="space-y-2 py-2">
                        {[
                          { layer: "Application", detail: "Sensor data object (JSON / CBOR)", color: "#BFFD11" },
                          { layer: "CoAP", detail: "GET/PUT/POST/Observe, 4-byte header, tokens", color: "#BFFD11" },
                          { layer: "DTLS (optional)", detail: "TLS 1.3-equivalent security over UDP", color: "#53F2FA" },
                          { layer: "UDP", detail: "Unreliable datagram, no connection overhead", color: "#53F2FA" },
                          { layer: "IP (IPv6 / IPv4)", detail: "NIDD or IP bearer on NB-IoT", color: "#3A3C46" },
                          { layer: "NB-IoT Radio", detail: "180 kHz narrowband, CE modes A/B", color: "#3A3C46" },
                        ].map((l) => (
                          <div key={l.layer} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-[#030810] border border-[#3A3C46]/25">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: l.color }} />
                            <span className="text-sm font-semibold text-white w-32 shrink-0">{l.layer}</span>
                            <span className="text-xs text-white/40">{l.detail}</span>
                          </div>
                        ))}
                      </div>
                    ),
                    lwm2m: (
                      <div className="space-y-2 py-2">
                        {[
                          { layer: "LwM2M Objects", detail: "Device /3, Connectivity /4, Custom sensors", color: "#BFFD11" },
                          { layer: "LwM2M Client", detail: "Bootstrap, registration, FOTA object /5", color: "#BFFD11" },
                          { layer: "CoAP", detail: "Underlying transport for LwM2M messages", color: "#53F2FA" },
                          { layer: "DTLS", detail: "PSK or certificate-based security (mandatory)", color: "#53F2FA" },
                          { layer: "UDP", detail: "Non-IP or standard IP bearer", color: "#3A3C46" },
                          { layer: "NB-IoT Radio", detail: "Same radio layer as CoAP stack", color: "#3A3C46" },
                        ].map((l) => (
                          <div key={l.layer} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-[#030810] border border-[#3A3C46]/25">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: l.color }} />
                            <span className="text-sm font-semibold text-white w-32 shrink-0">{l.layer}</span>
                            <span className="text-xs text-white/40">{l.detail}</span>
                          </div>
                        ))}
                      </div>
                    ),
                  }}
                </InteractiveToggle>
              </div>
              <button onClick={() => markComplete("coverage-protocol")} className="mt-8 px-5 py-2.5 rounded-xl bg-[#BFFD11] text-[#00040F] text-sm font-semibold hover:bg-[#d4ff3d] transition-colors cursor-pointer">Complete Step → Payload Optimization</button>
            </section>
          )}

          {/* STEP 3: Payload Optimization */}
          {activeStep === "payload" && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] bg-[#BFFD11]/10 px-2 py-1 rounded">Step 3</span>
                <h2 className="text-2xl font-semibold">Payload Optimization</h2>
              </div>
              <p className="text-sm text-white/45 mb-6 leading-relaxed">
                On NB-IoT, every byte costs battery and time. CBOR (Concise Binary Object Representation)
                encodes the same data as JSON in roughly half the bytes by using integer keys instead of
                string keys and binary encoding for numbers. RFC 7049 / 8949 defines the format; IANA
                maintains a registry of standard integer keys.
              </p>
              <PayloadBuilder />
              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                <CodeBlock
                  language="python"
                  title="CBOR encoding (MicroPython)"
                  code={[
                    { code: "import cbor2" },
                    { code: "" },
                    { code: "# Integer keys save ~10B vs string keys", highlight: true },
                    { code: "payload = {" },
                    { code: "    1: 22.4,   # temperature" },
                    { code: "    2: 58,     # humidity" },
                    { code: "    3: 850,    # co2_ppm" },
                    { code: "    99: seq_no # sequence" },
                    { code: "}" },
                    { code: "encoded = cbor2.dumps(payload)" },
                    { code: "# len(encoded) ~= 16 bytes vs ~50B JSON" },
                  ]}
                />
                <CodeBlock
                  language="at"
                  title="CoAP send via AT commands"
                  code={[
                    { code: 'AT+QICSGP=1,1,"hologram","","",1', comment: "Configure PDP context" },
                    { code: 'AT+QIOPEN=1,0,"UDP SERVICE","0.0.0.0",0,5683,0', comment: "Open UDP socket on CoAP port" },
                    { code: 'AT+QISEND=0,16,"<coap-server-ip>",5683', comment: "Send 16-byte CBOR payload" },
                    { code: "> [binary CBOR data]", comment: "Ctrl+Z to send" },
                    { code: "AT+QICLOSE=0", comment: "Close socket after send" },
                  ]}
                />
              </div>
              <button onClick={() => markComplete("payload")} className="mt-8 px-5 py-2.5 rounded-xl bg-[#BFFD11] text-[#00040F] text-sm font-semibold hover:bg-[#d4ff3d] transition-colors cursor-pointer">Complete Step → Deployment Planning</button>
            </section>
          )}

          {/* STEP 4: Deployment Planning */}
          {activeStep === "deployment" && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] bg-[#BFFD11]/10 px-2 py-1 rounded">Step 4</span>
                <h2 className="text-2xl font-semibold">Deployment Planning</h2>
              </div>
              <p className="text-sm text-white/45 mb-6 leading-relaxed">
                Plan your sensor fleet before deployment. Key variables: number of floors, sensor density
                per zone, reporting interval (drives battery), and battery size. More frequent reporting
                dramatically reduces battery life — find the minimum interval your application can tolerate.
              </p>
              <DeploymentPlanner />
              <div className="mt-6 grid sm:grid-cols-3 gap-4">
                {[
                  { label: "Air Quality", color: "#BFFD11", desc: "CO₂, TVOC, PM2.5 — 1 sensor per 50–100 m² per floor. 15-min reporting typically sufficient. CE Mode A for most office deployments." },
                  { label: "Metering", color: "#53F2FA", desc: "Energy, water, gas — 1 pulse-counter per meter. 15–60 min intervals. Often in basement utility rooms: CE Mode B recommended. Very long battery life (5–10 years)." },
                  { label: "Occupancy", color: "#4ade80", desc: "PIR or people-counting — event-driven reporting rather than polling. Send only on state change. Pairs well with CoAP Observe mode to reduce unnecessary transmissions." },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-[#3A3C46]/30 bg-[#060a14] p-5">
                    <p className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: item.color }}>{item.label}</p>
                    <p className="text-xs text-white/60 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => markComplete("deployment")} className="mt-8 px-5 py-2.5 rounded-xl bg-[#BFFD11] text-[#00040F] text-sm font-semibold hover:bg-[#d4ff3d] transition-colors cursor-pointer">Complete Step → Power & Hardware</button>
            </section>
          )}

          {/* STEP 5: Power & Hardware */}
          {activeStep === "power-hardware" && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] bg-[#BFFD11]/10 px-2 py-1 rounded">Step 5</span>
                <h2 className="text-2xl font-semibold">Power & Hardware</h2>
              </div>
              <p className="text-sm text-white/45 mb-6 leading-relaxed">
                Power Saving Mode (PSM) is the key to decade-long battery life. The device negotiates a
                sleep interval with the network (T3412 timer) and an active window after waking (T3324
                timer). During PSM, current draw drops to 3–5 µA — comparable to a coin cell in storage.
              </p>
              <CodeBlock
                language="at"
                title="PSM configuration for 15-minute reporting interval"
                code={[
                  { code: 'AT+CPSMS=1,"","","00100011","00000001"', comment: "Enable PSM: T3412=15min periodic TAU, T3324=2s active window", highlight: true },
                  { code: "AT+CEREG=2", comment: "Verify registration + CE level" },
                  { code: "AT+CPSMS?", comment: '+CPSMS: 1,,,"00100011","00000001" — confirm values negotiated' },
                  { code: "", comment: "" },
                  { code: "# Timer encoding (T3412): bits 5-7 = unit, bits 0-4 = value" },
                  { code: "# 001 xxxxx = 2-minute unit" },
                  { code: "# 00100011 = 2min × 3 = 6min (rounded up to 15min by network)" },
                  { code: "", comment: "" },
                  { code: "# T3324 (active window) encoding:" },
                  { code: "# 00000001 = 2-second unit × 1 = 2 seconds" },
                ]}
              />
              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                <InfoCallout type="info">
                  The network may not grant exactly the requested PSM timers — it allocates the nearest
                  supported value. Always read back <code className="font-mono">AT+CPSMS?</code> after
                  registration to confirm the granted timers.
                </InfoCallout>
                <InfoCallout type="tip">
                  With T3412 = 15 min and T3324 = 2 s, average current draw is approximately:
                  (3µA × 897s + 2000µA × 3s) / 900s ≈ <strong>9.7 µA</strong>. A 3600 mAh battery
                  lasts ~42 years — real-world degradation brings this to 10–15 years.
                </InfoCallout>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2 mt-12">Hardware Selection</h3>
              <p className="text-sm text-white/45 mb-6 leading-relaxed">
                Smart building sensors share a common hardware pattern: MCU + NB-IoT module + sensors +
                battery. The NB-IoT module choice matters most — it dictates CE mode support, band
                availability, and PSM behavior.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {[
                  { category: "NB-IoT Module", recommendation: "Quectel BC660K-GL or Nordic nRF9161", rationale: "Global multi-band support (Bands 1/2/3/4/5/8/12/13/17/18/19/20/25/28/66/71), CE Mode A/B, PSM, eDRX. BC660K adds hardware crypto.", color: "#BFFD11" },
                  { category: "MCU", recommendation: "Nordic nRF9161 SiP or STM32L4", rationale: "nRF9161 integrates Cortex-M33 + NB-IoT/LTE-M modem in one SiP. STM32L4 pairs with external modem via UART for 1.7µA deep sleep.", color: "#53F2FA" },
                  { category: "Air Quality Sensors", recommendation: "Sensirion SCD41 (CO₂) + SEN55 (PM2.5/VOC)", rationale: "SCD41 uses photoacoustic NDIR — no warm-up time, 3.3V, I²C, 0.4g. SEN55 is a combo PM/VOC/humidity module with auto-cleaning.", color: "#BFFD11" },
                  { category: "Battery", recommendation: "3.6V Lithium Thionyl Chloride (ER34615)", rationale: "Li-SOCl₂ cells maintain stable voltage over 10+ years, operate at −40°C to +85°C, and have very low self-discharge (~1%/year). Essential for 10-year target.", color: "#4ade80" },
                ].map((h) => (
                  <div key={h.category} className="rounded-xl border border-[#3A3C46]/30 bg-[#060a14] p-5">
                    <p className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: h.color }}>{h.category}</p>
                    <p className="text-sm font-semibold text-white mb-2">{h.recommendation}</p>
                    <p className="text-xs text-white/40 leading-relaxed">{h.rationale}</p>
                  </div>
                ))}
              </div>
              <InfoCallout type="warning">
                NB-IoT modules can draw 300–500 mA peak during transmission bursts. If using a Li-SOCl₂
                primary cell, add a 100–470 µF tantalum or hybrid capacitor in parallel to handle peak
                current — these cells have relatively high internal resistance and voltage may sag during
                TX without a local reservoir.
              </InfoCallout>
              <button onClick={() => markComplete("power-hardware")} className="mt-8 px-5 py-2.5 rounded-xl bg-[#BFFD11] text-[#00040F] text-sm font-semibold hover:bg-[#d4ff3d] transition-colors cursor-pointer">Complete Step → Security & Deploy</button>
            </section>
          )}

          {/* STEP 6: Security & Deploy */}
          {activeStep === "security" && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] bg-[#BFFD11]/10 px-2 py-1 rounded">Step 6</span>
                <h2 className="text-2xl font-semibold">Security & Deploy</h2>
              </div>
              <p className="text-sm text-white/45 mb-6 leading-relaxed">
                Building sensors handle occupancy data, utility metering, and air quality — all sensitive
                in commercial contexts. Complete this security checklist before deployment.
              </p>
              <div className="mb-8">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Shield size={18} className="text-[#BFFD11]" />
                    Security Hardening Checklist
                  </h3>
                  <div className="w-12 h-12 rounded-full border-2 border-[#3A3C46]/40 flex items-center justify-center relative">
                    <svg className="absolute inset-0" viewBox="0 0 48 48">
                      <circle cx="24" cy="24" r="20" fill="none" stroke="#3A3C46" strokeWidth="2" opacity="0.2" />
                      <circle cx="24" cy="24" r="20" fill="none" stroke="#BFFD11" strokeWidth="2" strokeDasharray={`${(securityScore / 100) * 125.6} 125.6`} strokeLinecap="round" transform="rotate(-90 24 24)" className="transition-all duration-500" />
                    </svg>
                    <span className="text-xs font-mono font-semibold text-[#BFFD11]">{displayedScore}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {buildingSecurityChecklist.map((item, idx) => (
                    <button key={idx} onClick={() => toggleSecurity(idx)}
                      className={`w-full text-left flex items-start gap-4 px-4 py-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${checkedSecurity.has(idx) ? "border-[#BFFD11]/25 bg-[#BFFD11]/4" : "border-[#3A3C46]/25 bg-[#060a14] hover:border-[#3A3C46]/50"}`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${checkedSecurity.has(idx) ? "border-[#BFFD11] bg-[#BFFD11]" : "border-[#3A3C46]"}`}>
                        {checkedSecurity.has(idx) && <Check size={12} className="text-[#00040F]" />}
                      </div>
                      <div>
                        <p className={`text-sm font-medium transition-colors ${checkedSecurity.has(idx) ? "text-white" : "text-white/65"}`}>{item.label}</p>
                        <p className="text-xs text-white/30 mt-0.5 font-mono">{item.cmd}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => markComplete("security")} className="mt-4 px-5 py-2.5 rounded-xl bg-[#BFFD11] text-[#00040F] text-sm font-semibold hover:bg-[#d4ff3d] transition-colors cursor-pointer">
                {completedSteps.size === buildingSteps.length - 1 ? "🎉 Complete Guide" : "Mark Complete"}
              </button>
            </section>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-[#3A3C46]/30 mb-16 mt-16">
        <Link href="/build/smart-camera" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors cursor-pointer">
          <ArrowLeft size={16} /> Prev: Smart Camera
        </Link>
        <Link href="/build/smart-agriculture" className="inline-flex items-center gap-2 text-sm font-medium text-[#BFFD11] hover:gap-3 transition-all duration-200 cursor-pointer">
          Next: Smart Agriculture <ArrowRight size={16} />
        </Link>
      </div>

      <div className="-mx-4 sm:-mx-6 lg:-mx-8">
        <FreePilotCTA />
      </div>
    </div>
  );
}
