"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronRight, ArrowRight, ArrowLeft, Check, Camera, Shield } from "lucide-react";
import InfoCallout from "@/components/ui/InfoCallout";
import ComparisonTable from "@/components/ui/ComparisonTable";
import InteractiveToggle from "@/components/ui/InteractiveToggle";
import FreePilotCTA from "@/components/ui/FreePilotCTA";
import BuildGuideShell, { SectionHeader, MarkCompleteButton } from "@/components/ui/BuildGuideShell";

/* ── Steps ── */
const steps = [
  { id: "architecture", label: "Architecture Decision" },
  { id: "network", label: "Network Selection" },
  { id: "bandwidth", label: "Bandwidth Planning" },
  { id: "hardware-security", label: "Hardware & Security" },
];

/* ── Architecture Data ── */
const archColumns = [
  { key: "edge", label: "Edge Processing", recommended: true },
  { key: "cloud", label: "Cloud Processing" },
];

const archRows = [
  { metric: "Data uploaded", edge: "Event clips only", cloud: "Full raw stream" },
  { metric: "Monthly data (20 events/day)", edge: "~200 MB", cloud: "~500 GB" },
  { metric: "Latency to action", edge: "<100 ms (on-device)", cloud: "500 ms–2 s" },
  { metric: "Privacy", edge: "Data stays on device", cloud: "Raw video to cloud" },
  { metric: "Cost", edge: "Higher BOM (~$20 more)", cloud: "Higher data + cloud compute" },
  { metric: "Power consumption", edge: "Higher (ML inference)", cloud: "Lower (dumb capture)" },
  { metric: "Connectivity requirement", edge: "LTE-M / LTE Cat 1", cloud: "5G NR / LTE Cat 4+" },
  { metric: "FOTA complexity", edge: "High (ML model updates)", cloud: "Low (camera firmware only)" },
];

/* ── Security Checklist ── */
const securityChecklist = [
  { label: "TLS 1.2/1.3 for all cloud comms (no plaintext HTTP)", cmd: "Use port 443 exclusively" },
  { label: "On-device model encryption at rest", cmd: "AES-256 encrypted model blobs" },
  { label: "FOTA image signing with ECDSA", cmd: "Verify signature before flashing" },
  { label: "Video stream encryption (SRTP or TLS tunnel)", cmd: "No unencrypted video over cellular" },
  { label: "Tamper detection (light sensor / accelerometer)", cmd: "Alert on enclosure breach" },
  { label: "eSIM MFF2 soldered — no removable SIM slot", cmd: "Eliminate physical SIM theft vector" },
  { label: "Privacy: no raw video stored on device", cmd: "Process & discard — transmit metadata only" },
];

/* ── Bandwidth Calculator ── */
function BandwidthCalculator() {
  const [resolution, setResolution] = useState<"720p" | "1080p" | "4K">("1080p");
  const [fps, setFps] = useState(15);
  const [compression, setCompression] = useState<"H.264" | "H.265" | "AV1">("H.265");
  const [hoursPerDay, setHoursPerDay] = useState(8);
  const [mode, setMode] = useState<"continuous" | "event">("event");
  const [eventsPerDay, setEventsPerDay] = useState(20);
  const [eventDurationSec, setEventDurationSec] = useState(10);

  const bitrates: Record<string, Record<string, number>> = {
    "720p": { "H.264": 2.5, "H.265": 1.5, "AV1": 1.0 },
    "1080p": { "H.264": 6.0, "H.265": 3.5, "AV1": 2.2 },
    "4K": { "H.264": 25.0, "H.265": 12.0, "AV1": 8.0 },
  };

  const baseBitrateMbps = bitrates[resolution][compression] * (fps / 30);

  let dailyGB: number;
  let monthlyGB: number;

  if (mode === "continuous") {
    const dailySeconds = hoursPerDay * 3600;
    const dailyMB = (baseBitrateMbps / 8) * dailySeconds * 1000;
    dailyGB = dailyMB / 1024;
    monthlyGB = dailyGB * 30;
  } else {
    const totalEventSec = eventsPerDay * eventDurationSec;
    const dailyMB = (baseBitrateMbps / 8) * totalEventSec * 1000;
    dailyGB = dailyMB / 1024;
    monthlyGB = dailyGB * 30;
  }

  const networkLabel =
    monthlyGB > 50 ? "5G NR required" :
      monthlyGB > 10 ? "LTE Cat 4+ recommended" :
        "LTE Cat 1 / LTE-M sufficient";

  const networkColor =
    monthlyGB > 50 ? "#ef4444" :
      monthlyGB > 10 ? "#f59e0b" :
        "#BFFD11";

  return (
    <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#3A3C46]/30 bg-[#0a0e1a]">
        <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11]">
          Bandwidth Calculator
        </p>
      </div>

      <div className="p-6 grid sm:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="text-sm text-white/55 block mb-2">Streaming mode</label>
            <div className="flex gap-2">
              {(["continuous", "event"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer capitalize ${mode === m ? "bg-[#BFFD11] text-[#00040F]" : "border border-[#3A3C46]/40 text-white/45 hover:text-white/70"
                    }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-white/55 block mb-2">Resolution</label>
            <div className="flex gap-2">
              {(["720p", "1080p", "4K"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setResolution(r)}
                  className={`flex-1 py-2 rounded-lg text-sm font-mono font-medium transition-all duration-150 cursor-pointer ${resolution === r ? "bg-[#BFFD11] text-[#00040F]" : "border border-[#3A3C46]/40 text-white/45 hover:text-white/70"
                    }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-white/55 block mb-2">Codec</label>
            <div className="flex gap-2">
              {(["H.264", "H.265", "AV1"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCompression(c)}
                  className={`flex-1 py-2 rounded-lg text-xs font-mono font-medium transition-all duration-150 cursor-pointer ${compression === c ? "bg-[#BFFD11] text-[#00040F]" : "border border-[#3A3C46]/40 text-white/45 hover:text-white/70"
                    }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-white/55">Frame rate</label>
              <span className="font-mono text-sm text-[#BFFD11]">{fps} fps</span>
            </div>
            <input
              type="range" min={1} max={30} step={1} value={fps}
              onChange={(e) => setFps(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, #BFFD11 ${(fps / 30) * 100}%, #3A3C46 ${(fps / 30) * 100}%)` }}
            />
          </div>
          {mode === "continuous" ? (
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-white/55">Hours streaming per day</label>
                <span className="font-mono text-sm text-[#BFFD11]">{hoursPerDay}h</span>
              </div>
              <input
                type="range" min={1} max={24} step={1} value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, #BFFD11 ${(hoursPerDay / 24) * 100}%, #3A3C46 ${(hoursPerDay / 24) * 100}%)` }}
              />
            </div>
          ) : (
            <>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-white/55">Events per day</label>
                  <span className="font-mono text-sm text-[#BFFD11]">{eventsPerDay}</span>
                </div>
                <input
                  type="range" min={1} max={200} step={1} value={eventsPerDay}
                  onChange={(e) => setEventsPerDay(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, #BFFD11 ${(eventsPerDay / 200) * 100}%, #3A3C46 ${(eventsPerDay / 200) * 100}%)` }}
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-white/55">Clip duration</label>
                  <span className="font-mono text-sm text-[#BFFD11]">{eventDurationSec}s</span>
                </div>
                <input
                  type="range" min={2} max={120} step={1} value={eventDurationSec}
                  onChange={(e) => setEventDurationSec(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, #BFFD11 ${(eventDurationSec / 120) * 100}%, #3A3C46 ${(eventDurationSec / 120) * 100}%)` }}
                />
              </div>
            </>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="rounded-xl border border-[#3A3C46]/30 bg-[#030710] p-5">
            <p className="font-mono text-[10px] tracking-widest uppercase text-white/25 mb-4">Results</p>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-white/40 mb-1">Base bitrate</p>
                <p className="text-2xl font-semibold text-white">{baseBitrateMbps.toFixed(1)} <span className="text-base text-white/40">Mbps</span></p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Daily data usage</p>
                <p className="text-2xl font-semibold text-[#BFFD11]">
                  {dailyGB < 1 ? `${(dailyGB * 1024).toFixed(0)} MB` : `${dailyGB.toFixed(1)} GB`}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Monthly data usage</p>
                <p className="text-2xl font-semibold text-white">{monthlyGB.toFixed(1)} <span className="text-base text-white/40">GB/mo</span></p>
              </div>
              <div className="pt-3 border-t border-[#3A3C46]/20">
                <p className="text-xs text-white/30 mb-1.5">Network recommendation</p>
                <p className="text-base font-semibold" style={{ color: networkColor }}>
                  {networkLabel}
                </p>
              </div>
            </div>
          </div>

          <InfoCallout type="tip">
            Event-based upload typically uses <strong>10–50×</strong> less data than continuous
            streaming. Use on-device AI inference to trigger uploads only on motion or anomaly
            detection.
          </InfoCallout>
        </div>
      </div>
    </div>
  );
}

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

/* ── Page ── */
export default function SmartCameraPage() {
  const [checkedSecurity, setCheckedSecurity] = useState<Set<number>>(new Set());

  const toggleSecurity = (idx: number) => {
    setCheckedSecurity((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const securityScore = Math.round((checkedSecurity.size / securityChecklist.length) * 100);
  const displayedScore = useAnimatedScore(securityScore);

  return (
    <>
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-10" aria-label="Breadcrumb">
          <Link href="/build" className="hover:text-white/60 transition-colors cursor-pointer">Build</Link>
          <ChevronRight size={12} aria-hidden="true" />
          <span className="text-[#BFFD11]">Smart Camera</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-[8px] flex items-center justify-center"
                style={{ background: "rgba(83,242,250,0.1)", border: "1px solid rgba(83,242,250,0.2)" }}
              >
                <Camera size={18} color="#53F2FA" strokeWidth={1.75} />
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-[#BFFD11]">
                  Build Guide
                </span>
                <span className="text-[10px] font-mono font-semibold tracking-wider uppercase px-2 py-0.5 rounded text-[#ef4444] bg-[#ef4444]/10">
                  Advanced
                </span>
                <span className="text-[11px] text-white/30 font-mono">25 min</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-5 leading-tight">Smart Camera</h1>
            <p className="text-lg text-white/55 leading-relaxed max-w-2xl">
              IoT-enabled cameras demand the right combination of connectivity, architecture, and
              bandwidth strategy. The critical design decision: process on-device or stream to cloud?
            </p>
          </div>
          <div className="hidden lg:flex justify-center items-center">
            <img
              src="/smart_camera_hero.png"
              alt="Smart Camera Illustration"
              className="w-full scale-110"
              style={{
                maskImage: "radial-gradient(ellipse 80% 75% at 50% 50%, black 40%, transparent 72%)",
                WebkitMaskImage: "radial-gradient(ellipse 80% 75% at 50% 50%, black 40%, transparent 72%)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Docs layout */}
      <BuildGuideShell steps={steps}>

        {/* STEP 1: Architecture Decision */}
        <section id="architecture" className="scroll-mt-24 pb-16 border-b border-[#3A3C46]/20">
          <SectionHeader label="Core Architecture Decision" stepNumber={1} />

          <p className="text-white/55 leading-relaxed mb-8 max-w-2xl">
            This choice drives your connectivity spec, BOM cost, and monthly data bill. There is no
            universally correct answer — it depends on privacy requirements, latency needs, and scale.
          </p>

          <InteractiveToggle
            label="View data flow"
            tabs={[
              { key: "edge", label: "Edge Processing" },
              { key: "cloud", label: "Cloud Processing" },
            ]}
            defaultTab="edge"
          >
            {{
              edge: (
                <div className="rounded-xl border border-[#BFFD11]/20 bg-[#060a14] p-6 mb-6">
                  <p className="font-mono text-[10px] tracking-widest uppercase text-[#BFFD11] mb-4">Edge — Data flow</p>
                  <div className="flex items-center gap-2 flex-wrap text-sm">
                    {["Camera sensor", "→", "On-device AI inference", "→", "Event detected?", "→", "Upload clip only", "→", "Cloud storage"].map((s, i) => (
                      <span
                        key={i}
                        className={s === "→" ? "text-white/20" : i === 4 ? "text-[#f59e0b]" : i === 2 ? "text-[#BFFD11] font-medium" : "text-white/65"}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 grid sm:grid-cols-3 gap-3 text-xs">
                    {[
                      ["Network used", "~200 MB/month", "#BFFD11"],
                      ["Connectivity", "LTE-M sufficient", "#BFFD11"],
                      ["Privacy", "Raw video never leaves device", "#4ade80"],
                    ].map(([k, v, c]) => (
                      <div key={k} className="rounded-lg bg-[#030710] px-3 py-2.5">
                        <p className="text-white/30 mb-1">{k}</p>
                        <p className="font-medium" style={{ color: c }}>{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ),
              cloud: (
                <div className="rounded-xl border border-[#53F2FA]/15 bg-[#060a14] p-6 mb-6">
                  <p className="font-mono text-[10px] tracking-widest uppercase text-[#53F2FA] mb-4">Cloud — Data flow</p>
                  <div className="flex items-center gap-2 flex-wrap text-sm">
                    {["Camera sensor", "→", "Raw stream upload", "→", "5G NR required", "→", "Cloud ML inference", "→", "Event flagged"].map((s, i) => (
                      <span
                        key={i}
                        className={s === "→" ? "text-white/20" : i === 4 ? "text-[#ef4444]" : i === 2 ? "text-[#53F2FA] font-medium" : "text-white/65"}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 grid sm:grid-cols-3 gap-3 text-xs">
                    {[
                      ["Network used", "~500 GB/month", "#ef4444"],
                      ["Connectivity", "5G NR / LTE Cat 4+ required", "#f59e0b"],
                      ["Privacy", "Raw video in cloud", "#f97316"],
                    ].map(([k, v, c]) => (
                      <div key={k} className="rounded-lg bg-[#030710] px-3 py-2.5">
                        <p className="text-white/30 mb-1">{k}</p>
                        <p className="font-medium" style={{ color: c }}>{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ),
            }}
          </InteractiveToggle>

          <ComparisonTable
            columns={archColumns}
            rows={archRows}
            caption="Edge vs Cloud architecture — full comparison"
          />

          <MarkCompleteButton stepId="architecture" />
        </section>

        {/* STEP 2: Network Selection */}
        <section id="network" className="scroll-mt-24 pb-16 border-b border-[#3A3C46]/20">
          <SectionHeader label="Network Selection" stepNumber={2} />

          <p className="text-white/55 leading-relaxed mb-8 max-w-2xl">
            The right cellular standard depends entirely on your streaming mode and data volume.
          </p>

          <div className="grid sm:grid-cols-2 gap-5 mb-8">
            <div className="rounded-xl border border-[#BFFD11]/20 bg-[#BFFD11]/4 p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-[#BFFD11]" />
                <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11]">LTE Cat 1 / LTE-M</p>
              </div>
              <p className="text-sm text-white/60 leading-relaxed mb-4">
                For event-based cameras uploading short clips. Monthly data stays under 1–5 GB. Widely available, lower cost modules, good enough for 720p at low FPS.
              </p>
              <ul className="space-y-1.5 text-xs text-white/50">
                <li className="flex gap-2"><Check size={11} className="text-[#BFFD11] shrink-0 mt-0.5" />Motion-triggered clip upload</li>
                <li className="flex gap-2"><Check size={11} className="text-[#BFFD11] shrink-0 mt-0.5" />Periodic snapshot (time-lapse, construction)</li>
                <li className="flex gap-2"><Check size={11} className="text-[#BFFD11] shrink-0 mt-0.5" />License plate / face detection snapshots</li>
              </ul>
            </div>

            <div className="rounded-xl border border-[#53F2FA]/15 bg-[#53F2FA]/3 p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-[#53F2FA]" />
                <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#53F2FA]">5G NR / LTE Cat 4+</p>
              </div>
              <p className="text-sm text-white/60 leading-relaxed mb-4">
                Required for continuous 1080p+ streaming or live monitoring. 4×4 MIMO antennas essential for achieving sustained throughput. Higher module and data costs.
              </p>
              <ul className="space-y-1.5 text-xs text-white/50">
                <li className="flex gap-2"><Check size={11} className="text-[#53F2FA] shrink-0 mt-0.5" />Live remote monitoring / security patrol</li>
                <li className="flex gap-2"><Check size={11} className="text-[#53F2FA] shrink-0 mt-0.5" />Real-time body-worn camera streaming</li>
                <li className="flex gap-2"><Check size={11} className="text-[#53F2FA] shrink-0 mt-0.5" />Cloud-processed video analytics at scale</li>
              </ul>
            </div>
          </div>

          <InfoCallout type="info">
            <strong>LTE Cat 1</strong> offers 10 Mbps downlink / 5 Mbps uplink — enough for 720p event clips.
            For sustained 1080p streaming, you need <strong>LTE Cat 4</strong> (150 Mbps down / 50 Mbps up)
            or <strong>5G NR</strong> for 4K.
          </InfoCallout>

          <MarkCompleteButton stepId="network" />
        </section>

        {/* STEP 3: Bandwidth Planning */}
        <section id="bandwidth" className="scroll-mt-24 pb-16 border-b border-[#3A3C46]/20">
          <SectionHeader label="Bandwidth Planning" stepNumber={3} />

          <p className="text-white/55 leading-relaxed mb-8 max-w-2xl">
            Estimate your monthly data usage and get a network recommendation based on your streaming profile.
          </p>

          <BandwidthCalculator />

          <MarkCompleteButton stepId="bandwidth" />
        </section>

        {/* STEP 4: Hardware & Security */}
        <section id="hardware-security" className="scroll-mt-24 pb-16">
          <SectionHeader label="Hardware & Security" stepNumber={4} />

          <p className="text-white/55 leading-relaxed mb-8 max-w-2xl">
            Key hardware considerations and a security hardening checklist for your camera deployment.
          </p>

          {/* Hardware Notes */}
          <div className="space-y-4 mb-12">
            <InfoCallout type="info">
              <strong>4×4 MIMO antennas</strong> are critical for 5G NR throughput. Use separate
              antenna elements for each spatial stream — stacking all antennas on one connector
              destroys throughput. Keep antenna isolation &gt;15 dB between elements.
            </InfoCallout>
            <InfoCallout type="tip">
              <strong>H.265 (HEVC)</strong> cuts bandwidth by ~40% vs H.264 at equivalent quality.
              AV1 cuts it further (~50%) but requires more encode compute. For battery-powered edge
              devices, H.265 is the best tradeoff. AV1 suits cloud-side transcoding.
            </InfoCallout>
            <InfoCallout type="warning">
              Sustained high-throughput 5G transmission generates significant heat. Size your thermal
              dissipation for sustained Tx — not just peak burst. Most cellular modules derate above
              60°C.
            </InfoCallout>
          </div>

          {/* Security Checklist */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield size={18} className="text-[#BFFD11]" />
                Security Hardening Checklist
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-[#3A3C46]/40 flex items-center justify-center relative">
                  <svg className="absolute inset-0" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="#3A3C46" strokeWidth="2" opacity="0.2" />
                    <circle
                      cx="24" cy="24" r="20" fill="none" stroke="#BFFD11" strokeWidth="2"
                      strokeDasharray={`${(securityScore / 100) * 125.6} 125.6`}
                      strokeLinecap="round"
                      transform="rotate(-90 24 24)"
                      className="transition-all duration-500"
                    />
                  </svg>
                  <span className="text-xs font-mono font-semibold text-[#BFFD11]">{displayedScore}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {securityChecklist.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleSecurity(idx)}
                  className={`w-full text-left flex items-start gap-4 px-4 py-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${checkedSecurity.has(idx)
                    ? "border-[#BFFD11]/25 bg-[#BFFD11]/4"
                    : "border-[#3A3C46]/25 bg-[#060a14] hover:border-[#3A3C46]/50"
                    }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${checkedSecurity.has(idx) ? "border-[#BFFD11] bg-[#BFFD11]" : "border-[#3A3C46]"}`}>
                    {checkedSecurity.has(idx) && <Check size={12} className="text-[#00040F]" />}
                  </div>
                  <div>
                    <p className={`text-sm font-medium transition-colors ${checkedSecurity.has(idx) ? "text-white" : "text-white/65"}`}>
                      {item.label}
                    </p>
                    <p className="text-xs text-white/30 mt-0.5 font-mono">{item.cmd}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <MarkCompleteButton stepId="hardware-security" />
        </section>

      </BuildGuideShell>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-[#3A3C46]/30 flex justify-between items-center mb-16 mt-4">
        <Link
          href="/build"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          All Build Guides
        </Link>
        <Link
          href="/build/smart-building"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#BFFD11] hover:gap-3 transition-all duration-200 cursor-pointer"
        >
          Next: Smart Building
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="max-w-7xl mx-auto">
        <FreePilotCTA />
      </div>
    </>
  );
}
