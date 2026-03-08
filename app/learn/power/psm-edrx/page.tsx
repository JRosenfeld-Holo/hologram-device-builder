"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronRight, ArrowLeft, ArrowRight, Battery } from "lucide-react";
import { motion, useInView } from "framer-motion";
import InfoCallout from "@/components/ui/InfoCallout";
import { calcBatteryLife } from "@/lib/calculations";
import { staggerContainer, staggerItem } from "@/lib/animations";

const BATTERY_OPTIONS = [
  { label: "AA Alkaline (2,500 mAh)", capacity: 2500 },
  { label: "18650 Li-Ion (3,400 mAh)", capacity: 3400 },
  { label: "Li-SOCl₂ D-cell (19,000 mAh)", capacity: 19000 },
  { label: "CR2032 Coin (240 mAh)", capacity: 240 },
];

const PRESETS = [
  { label: "10-Year Asset Tracker", desc: "Daily reporting, aggressive PSM", tau: 86400, active: 2, edrx: 0, txPerDay: 1, battery: 19000 },
  { label: "Smart Meter", desc: "Hourly reporting, eDRX enabled", tau: 3600, active: 10, edrx: 20, txPerDay: 24, battery: 19000 },
  { label: "Fleet Tracker", desc: "5-minute reporting", tau: 3600, active: 5, edrx: 20, txPerDay: 288, battery: 3400 },
];

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h`;
  return `${Math.round(seconds / 86400)}d`;
}

// ─── Animated battery counter ──────────────────────────────────────────────────

function useBatteryCounter(target: number) {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = target;
    if (prev === target) return;

    const start = performance.now();
    const duration = 600;
    let raf: number;
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setDisplay(prev + (target - prev) * ease);
      if (t < 1) raf = requestAnimationFrame(step);
      else setDisplay(target);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return display;
}

// ─── Timeline Viz ─────────────────────────────────────────────────────────────

function TimelineViz({ psmPercent, edrxPercent, activePercent, txPercent }: { psmPercent: number; edrxPercent: number; activePercent: number; txPercent: number }) {
  const segments = [
    { label: "PSM Sleep", percent: psmPercent, color: "#3A3C46" },
    { label: "eDRX", percent: edrxPercent, color: "#106468" },
    { label: "Active", percent: activePercent, color: "#4C6810" },
    { label: "TX", percent: txPercent, color: "#BFFD11" },
  ].filter((s) => s.percent > 0);

  return (
    <div>
      <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-3">24-hour state timeline</p>
      <div className="h-8 rounded-lg overflow-hidden flex">
        {segments.map((seg) => (
          <motion.div
            key={seg.label}
            className="h-full"
            animate={{ width: `${Math.max(seg.percent, 0.5)}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ background: seg.color }}
            title={`${seg.label}: ${seg.percent}%`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-4 mt-3">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: seg.color }} />
            <span className="text-xs text-white/45">{seg.label} <span className="text-white/25">({seg.percent}%)</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Current Draw Chart ────────────────────────────────────────────────────────

function CurrentChart({ psmPercent, edrxPercent, activePercent, txPercent }: { psmPercent: number; edrxPercent: number; activePercent: number; txPercent: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const modes = [
    { label: "PSM Sleep", current: 3, percent: psmPercent, color: "#3A3C46", unit: "µA" },
    { label: "eDRX", current: 15, percent: edrxPercent, color: "#106468", unit: "µA" },
    { label: "Active", current: 2000, percent: activePercent, color: "#4C6810", unit: "µA" },
    { label: "Transmit", current: 220000, percent: txPercent, color: "#BFFD11", unit: "µA" },
  ];
  const maxCurrent = 220000;

  return (
    <div ref={ref} className="space-y-3">
      <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-4">Current draw by mode</p>
      {modes.map((mode) => (
        <div key={mode.label}>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-white/55">{mode.label}</span>
            <span className="font-mono text-xs" style={{ color: mode.color }}>
              {mode.current >= 1000 ? `${(mode.current / 1000).toFixed(0)} mA` : `${mode.current} µA`}
            </span>
          </div>
          <div className="h-2 bg-[#0a0e1a] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              animate={{
                width: inView ? `${(Math.log10(mode.current + 1) / Math.log10(maxCurrent + 1)) * 100}%` : 0,
                opacity: mode.percent > 0 ? 1 : 0.25,
              }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              style={{ background: mode.color }}
            />
          </div>
        </div>
      ))}
      <p className="text-[10px] text-white/20 mt-2">Log scale. Grayed = 0% time in that state.</p>
    </div>
  );
}

// ─── Slider ───────────────────────────────────────────────────────────────────

function Slider({ label, value, min, max, step, unit, format, onChange }: { label: string; value: number; min: number; max: number; step: number; unit?: string; format?: (v: number) => string; onChange: (v: number) => void }) {
  const displayVal = format ? format(value) : `${value}${unit || ""}`;
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm text-white/65">{label}</label>
        <span className="font-mono text-sm text-[#BFFD11]">{displayVal}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, #BFFD11 ${pct}%, #3A3C46 ${pct}%)` }}
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PSMSimulatorPage() {
  const [tau, setTau] = useState(86400);
  const [active, setActive] = useState(2);
  const [edrx, setEdrx] = useState(0);
  const [txPerDay, setTxPerDay] = useState(1);
  const [batteryCapacity, setBatteryCapacity] = useState(19000);

  const result = useMemo(
    () => calcBatteryLife({ batteryCapacityMAh: batteryCapacity, tauSeconds: tau, activeSeconds: active, edrxCycleSeconds: edrx, txPerDay }),
    [tau, active, edrx, txPerDay, batteryCapacity]
  );

  const applyPreset = (preset: (typeof PRESETS)[0]) => {
    setTau(preset.tau);
    setActive(preset.active);
    setEdrx(preset.edrx);
    setTxPerDay(preset.txPerDay);
    setBatteryCapacity(preset.battery);
  };

  const batteryColor = result.yearsEstimate >= 5 ? "#BFFD11" : result.yearsEstimate >= 2 ? "#f59e0b" : "#ef4444";
  const animatedYears = useBatteryCounter(result.yearsEstimate);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
      <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-10" aria-label="Breadcrumb">
        <Link href="/learn" className="hover:text-white/60 transition-colors cursor-pointer">Learn</Link>
        <ChevronRight size={12} />
        <span className="text-white/50">Power</span>
        <ChevronRight size={12} />
        <span className="text-[#BFFD11]">PSM / eDRX Simulator</span>
      </nav>

      <motion.div className="mb-12" variants={staggerContainer} initial="hidden" animate="visible">
        <motion.p variants={staggerItem} className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-3">Power · Interactive Simulator</motion.p>
        <motion.h1 variants={staggerItem} className="text-4xl font-semibold mb-5 leading-tight">PSM / eDRX Power Simulator</motion.h1>
        <motion.p variants={staggerItem} className="text-lg text-white/55 leading-relaxed max-w-2xl">
          Configure Power Saving Mode (PSM) and extended Discontinuous Reception (eDRX) timers.
          Watch how each parameter change affects battery life in real time.
        </motion.p>
      </motion.div>

      {/* Presets */}
      <div className="mb-10">
        <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-3">Quick presets</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <motion.button
              key={preset.label}
              onClick={() => applyPreset(preset)}
              className="px-4 py-2 rounded-lg border border-[#3A3C46]/40 text-sm text-white/55 hover:border-[#BFFD11]/30 hover:text-white transition-colors duration-200 cursor-pointer"
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.02 }}
            >
              <span className="font-medium text-white/75">{preset.label}</span>
              <span className="text-white/30 ml-1.5 text-xs">— {preset.desc}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        {/* ── Controls ── */}
        <div className="space-y-6">
          <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] p-6">
            <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-6">PSM Parameters</p>
            <div className="space-y-7">
              <Slider label="T3412 — TAU Timer (how long to sleep in PSM)" value={tau} min={3600} max={172800} step={3600} format={formatDuration} onChange={setTau} />
              <Slider label="T3324 — Active Time (how long to stay awake after waking)" value={active} min={2} max={30} step={1} unit="s" onChange={setActive} />
            </div>
          </div>

          <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] p-6">
            <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#53F2FA] mb-6">eDRX Parameters</p>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-white/65">eDRX Cycle Length</label>
                <span className="font-mono text-sm text-[#53F2FA]">{edrx === 0 ? "Disabled" : formatDuration(edrx)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={3600}
                step={20}
                value={edrx}
                onChange={(e) => setEdrx(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, #53F2FA ${(edrx / 3600) * 100}%, #3A3C46 ${(edrx / 3600) * 100}%)` }}
              />
              <p className="text-xs text-white/25 mt-1.5">0 = PSM only (deepest sleep)</p>
            </div>
          </div>

          <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] p-6">
            <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-white/40 mb-6">Usage Pattern</p>
            <div className="space-y-7">
              <Slider label="Transmissions per day" value={txPerDay} min={1} max={288} step={1}
                format={(v) => { if (v === 1) return "1×/day"; if (v < 24) return `${v}×/day`; if (v === 24) return "1×/hour"; if (v === 288) return "1×/5min"; return `${v}×/day`; }}
                onChange={setTxPerDay}
              />
              <div>
                <label className="text-sm text-white/65 block mb-2">Battery</label>
                <select
                  value={batteryCapacity}
                  onChange={(e) => setBatteryCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0e1a] border border-[#3A3C46]/40 text-sm text-white/75 cursor-pointer focus:border-[#BFFD11]/40 focus:outline-none"
                >
                  {BATTERY_OPTIONS.map((opt) => (
                    <option key={opt.capacity} value={opt.capacity}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── Results ── */}
        <div className="space-y-5">
          {/* Battery life card */}
          <motion.div
            className="rounded-xl border p-7 text-center"
            animate={{
              borderColor: `${batteryColor}30`,
              background: `${batteryColor}06`,
            }}
            transition={{ duration: 0.4 }}
          >
            <Battery size={28} style={{ color: batteryColor }} className="mx-auto mb-3" strokeWidth={1.5} />
            <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-2">Estimated Battery Life</p>
            <motion.p
              className="text-5xl font-semibold mb-1"
              animate={{ color: batteryColor }}
              transition={{ duration: 0.4 }}
            >
              {animatedYears.toFixed(animatedYears < 10 ? 1 : 0)}
            </motion.p>
            <p className="text-lg text-white/50">years</p>
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-xs text-white/25">
                Avg. current:{" "}
                <span className="font-mono" style={{ color: batteryColor }}>
                  {result.averageCurrentUA < 1000 ? `${result.averageCurrentUA} µA` : `${(result.averageCurrentUA / 1000).toFixed(2)} mA`}
                </span>
              </p>
            </div>
          </motion.div>

          {/* AT command */}
          <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] p-5">
            <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-3">AT Command</p>
            <div className="rounded-lg bg-[#030710] px-4 py-3 font-mono text-xs">
              <span className="text-[#53F2FA]">AT+CPSMS</span>
              <span className="text-white/40">=</span>
              <span className="text-[#BFFD11]">1,,,&quot;00111000&quot;,&quot;00000001&quot;</span>
            </div>
            <p className="text-[11px] text-white/30 mt-2.5 leading-relaxed">
              T3412 binary value encodes the TAU timer multiplier and unit. T3324 encodes the active time. See 3GPP TS 24.008 Table 10.5.163a.
            </p>
          </div>

          {/* Timeline */}
          <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] p-5">
            <TimelineViz {...result.timeBreakdown} />
          </div>

          {/* Current chart */}
          <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] p-5">
            <CurrentChart {...result.timeBreakdown} />
          </div>

          <InfoCallout type="tip">
            <strong>Release Assistance Indicator (RAI):</strong> Set RAI flag when your last
            packet is sent. This signals the network to release the radio connection immediately
            instead of waiting for the RRC inactivity timer. Can save up to{" "}
            <strong>40% energy</strong> per transmission cycle.
          </InfoCallout>
        </div>
      </div>

      <div className="mt-16 pt-8 border-t border-[#3A3C46]/30 flex justify-between items-center">
        <Link href="/learn/foundations/lpwa-technologies" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors cursor-pointer">
          <ArrowLeft size={16} />
          LTE-M vs NB-IoT
        </Link>
        <Link href="/learn/identity/sgp32" className="inline-flex items-center gap-2 text-sm font-medium text-[#BFFD11] hover:gap-3 transition-all duration-200 cursor-pointer">
          Next: SGP.32 eSIM
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
