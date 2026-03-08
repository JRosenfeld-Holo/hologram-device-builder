"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Wrench,
  Zap,
  ArrowRight,
  Terminal,
  Radio,
  ShieldCheck,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import FreePilotCTA from "@/components/ui/FreePilotCTA";
import { staggerContainer, staggerItem, fadeUp } from "@/lib/animations";

// ─── Animated counter hook ─────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf: number;
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // easeOutExpo
      const ease = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setCount(Math.floor(ease * target));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);

  return { count, ref };
}

// ─── Network Illustration ─────────────────────────────────────────────────────

function NetworkIllustration() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, delay: 0.3 }}
    >
      {/* viewBox tightened to crop dead whitespace — nodes scaled 36→52px */}
      <svg
        viewBox="50 15 500 340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full opacity-90"
        aria-hidden="true"
      >
        {/* Background grid */}
        {[0, 60, 120, 180, 240, 300, 360, 420, 480, 540, 600].map((x) => (
          <line key={`vg-${x}`} x1={x} y1="0" x2={x} y2="400" stroke="#BFFD11" strokeWidth="0.4" strokeOpacity="0.07" />
        ))}
        {[0, 50, 100, 150, 200, 250, 300, 350, 400].map((y) => (
          <line key={`hg-${y}`} x1="0" y1={y} x2="600" y2={y} stroke="#BFFD11" strokeWidth="0.4" strokeOpacity="0.07" />
        ))}

        {/* Connection lines */}
        <line x1="300" y1="200" x2="120" y2="102" stroke="#BFFD11" strokeWidth="1.2" strokeOpacity="0.3" strokeDasharray="4 6" />
        <line x1="300" y1="200" x2="480" y2="102" stroke="#BFFD11" strokeWidth="1.2" strokeOpacity="0.3" strokeDasharray="4 6" />
        <line x1="300" y1="200" x2="100" y2="302" stroke="#BFFD11" strokeWidth="1.2" strokeOpacity="0.2" strokeDasharray="4 6" />
        <line x1="300" y1="200" x2="500" y2="292" stroke="#BFFD11" strokeWidth="1.2" strokeOpacity="0.2" strokeDasharray="4 6" />
        <line x1="300" y1="200" x2="300" y2="60" stroke="#53F2FA" strokeWidth="2" strokeOpacity="0.5" />
        <line x1="120" y1="102" x2="480" y2="102" stroke="#BFFD11" strokeWidth="0.6" strokeOpacity="0.12" strokeDasharray="4 8" />
        <line x1="100" y1="302" x2="500" y2="292" stroke="#BFFD11" strokeWidth="0.6" strokeOpacity="0.12" strokeDasharray="4 8" />

        {/* Signal waves */}
        <circle cx="300" cy="200" r="30" stroke="#BFFD11" strokeWidth="1.2" fill="none">
          <animate attributeName="r" values="30;68;30" dur="3s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.25;0;0.25" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="300" cy="200" r="30" stroke="#BFFD11" strokeWidth="0.9" fill="none">
          <animate attributeName="r" values="30;105;30" dur="3s" begin="0.6s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.15;0;0.15" dur="3s" begin="0.6s" repeatCount="indefinite" />
        </circle>

        {/* Central gateway — 52×52, centered at (300, 200) */}
        <rect x="274" y="176" width="52" height="52" rx="8" fill="#00040F" stroke="#BFFD11" strokeWidth="1.8" />
        <rect x="286" y="185" width="28" height="18" rx="3" fill="none" stroke="#BFFD11" strokeWidth="1.2" strokeOpacity="0.7" />
        <line x1="300" y1="203" x2="300" y2="212" stroke="#BFFD11" strokeWidth="1.2" strokeOpacity="0.7" />
        <line x1="294" y1="212" x2="306" y2="212" stroke="#BFFD11" strokeWidth="1.2" strokeOpacity="0.7" />

        {/* Cloud node — 64×44, centered at (300, 60) */}
        <rect x="268" y="38" width="64" height="44" rx="8" fill="#00040F" stroke="#53F2FA" strokeWidth="1.8" />
        <path d="M289 65c-3.5 0-7-3-7-6.5s2.5-6 6-6.5c.6-3.5 3.5-6 7-6 3 0 5.5 1.8 6.5 4 3 .6 4.5 3 4.5 5.5 0 3-2.5 5.5-5.5 5.5z" stroke="#53F2FA" strokeWidth="1.2" fill="none" strokeOpacity="0.8" />
        <line x1="294" y1="59" x2="294" y2="66" stroke="#53F2FA" strokeWidth="1" strokeOpacity="0.6" />
        <line x1="300" y1="61" x2="300" y2="69" stroke="#53F2FA" strokeWidth="1" strokeOpacity="0.6" />
        <line x1="306" y1="59" x2="306" y2="66" stroke="#53F2FA" strokeWidth="1" strokeOpacity="0.6" />

        {/* Top-left tracker — 52×52, centered at (120, 102) */}
        <rect x="94" y="76" width="52" height="52" rx="8" fill="#00040F" stroke="#BFFD11" strokeWidth="1.5" strokeOpacity="0.7" />
        <circle cx="120" cy="98" r="8" stroke="#BFFD11" strokeWidth="1.2" fill="none" strokeOpacity="0.8" />
        <circle cx="120" cy="98" r="3" fill="#BFFD11" fillOpacity="0.5" />
        <line x1="120" y1="90" x2="120" y2="82" stroke="#BFFD11" strokeWidth="1.2" strokeOpacity="0.7" />
        <rect x="106" y="113" width="28" height="9" rx="2" fill="none" stroke="#BFFD11" strokeWidth="0.9" strokeOpacity="0.5" />

        {/* Top-right camera — 52×52, centered at (480, 102) */}
        <rect x="454" y="76" width="52" height="52" rx="8" fill="#00040F" stroke="#BFFD11" strokeWidth="1.5" strokeOpacity="0.7" />
        <circle cx="480" cy="102" r="12" stroke="#BFFD11" strokeWidth="1.2" fill="none" strokeOpacity="0.8" />
        <circle cx="480" cy="102" r="5" stroke="#BFFD11" strokeWidth="1.2" fill="none" strokeOpacity="0.5" />

        {/* Bottom-left sensor — 52×52, centered at (100, 302) */}
        <rect x="74" y="276" width="52" height="52" rx="8" fill="#00040F" stroke="#BFFD11" strokeWidth="1.5" strokeOpacity="0.6" />
        <line x1="84" y1="292" x2="116" y2="292" stroke="#BFFD11" strokeWidth="1" strokeOpacity="0.7" />
        <line x1="84" y1="300" x2="116" y2="300" stroke="#BFFD11" strokeWidth="1" strokeOpacity="0.5" />
        <line x1="84" y1="308" x2="102" y2="308" stroke="#BFFD11" strokeWidth="1" strokeOpacity="0.35" />

        {/* Bottom-right meter — 52×52, centered at (500, 292) */}
        <rect x="474" y="266" width="52" height="52" rx="8" fill="#00040F" stroke="#BFFD11" strokeWidth="1.5" strokeOpacity="0.6" />
        <path d="M484 294 a16 16 0 0 1 32 0" stroke="#BFFD11" strokeWidth="1.2" fill="none" strokeOpacity="0.8" />
        <line x1="500" y1="294" x2="508" y2="283" stroke="#BFFD11" strokeWidth="1.2" strokeOpacity="0.8" />

        {/* Animated data packets */}
        <circle r="3.5" fill="#BFFD11" opacity="0.9">
          <animateMotion dur="2.5s" repeatCount="indefinite" path="M300 200 L300 60" />
        </circle>
        <circle r="2.5" fill="#53F2FA" opacity="0.8">
          <animateMotion dur="3.5s" repeatCount="indefinite" begin="1s" path="M300 200 L120 102" />
        </circle>
        <circle r="2.5" fill="#53F2FA" opacity="0.8">
          <animateMotion dur="3s" repeatCount="indefinite" begin="0.5s" path="M300 200 L480 102" />
        </circle>
        <circle r="2" fill="#BFFD11" opacity="0.6">
          <animateMotion dur="4s" repeatCount="indefinite" begin="1.5s" path="M300 200 L100 302" />
        </circle>
        <circle r="2" fill="#BFFD11" opacity="0.6">
          <animateMotion dur="3.8s" repeatCount="indefinite" begin="2s" path="M300 200 L500 292" />
        </circle>

        {/* Labels */}
        <text x="300" y="27" textAnchor="middle" fill="#53F2FA" fontSize="9" fontFamily="monospace" opacity="0.75">CLOUD</text>
        <text x="120" y="68" textAnchor="middle" fill="#BFFD11" fontSize="9" fontFamily="monospace" opacity="0.65">TRACKER</text>
        <text x="480" y="68" textAnchor="middle" fill="#BFFD11" fontSize="9" fontFamily="monospace" opacity="0.65">CAMERA</text>
        <text x="100" y="340" textAnchor="middle" fill="#BFFD11" fontSize="9" fontFamily="monospace" opacity="0.55">SENSOR</text>
        <text x="500" y="330" textAnchor="middle" fill="#BFFD11" fontSize="9" fontFamily="monospace" opacity="0.55">METER</text>
        <text x="300" y="242" textAnchor="middle" fill="#BFFD11" fontSize="9" fontFamily="monospace" opacity="0.65">GATEWAY</text>
        <text x="313" y="124" fill="#53F2FA" fontSize="8" fontFamily="monospace" opacity="0.55">MQTT</text>
        <text x="120" y="147" textAnchor="middle" fill="#53F2FA" fontSize="8" fontFamily="monospace" opacity="0.6">NB-IoT</text>
        <text x="480" y="147" textAnchor="middle" fill="#53F2FA" fontSize="8" fontFamily="monospace" opacity="0.6">5G</text>
      </svg>
    </motion.div>
  );
}

// ─── Animated stat ─────────────────────────────────────────────────────────────

function AnimatedStat({ value, label }: { value: string; label: string }) {
  // Parse numeric prefix for animation
  const numMatch = value.match(/^(\d+)/);
  const numericPart = numMatch ? parseInt(numMatch[1]) : null;
  const suffix = numMatch ? value.slice(numMatch[1].length) : value;

  const { count, ref } = useCountUp(numericPart ?? 0, 1000);

  return (
    <motion.div
      ref={ref}
      variants={staggerItem}
    >
      <p className="text-2xl font-semibold text-[#BFFD11] whitespace-nowrap leading-snug">
        {numericPart !== null ? `${count}${suffix}` : value}
      </p>
      <p className="text-xs text-white/35 mt-1">{label}</p>
    </motion.div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: BookOpen,
    label: "LEARN",
    title: "Foundations & Theory",
    description:
      "Master cellular IoT fundamentals — protocol stacks, LTE-M vs NB-IoT, power management, eSIM evolution, and security architecture.",
    href: "/learn/foundations/architecture",
    cta: "Start Learning",
    accentColor: "#BFFD11",
  },
  {
    icon: Wrench,
    label: "BUILD",
    title: "Hands-On Device Guides",
    description:
      "Step-by-step guides for real device archetypes: asset trackers, smart cameras, and smart building sensors — with BOM tables, AT commands, and firmware.",
    href: "/build/asset-tracker",
    cta: "Start Building",
    accentColor: "#53F2FA",
  },
  {
    icon: Terminal,
    label: "TOOLS",
    title: "Developer Utilities",
    description:
      "AT command reference library, interactive protocol picker, and a live GPS coordinate parser. Built for real-world use.",
    href: "/tools/at-command-reference",
    cta: "Open Tools",
    accentColor: "#BFFD11",
  },
];

const stats = [
  { value: "3", label: "Device archetypes" },
  { value: "50+", label: "AT commands" },
  { value: "10yr", label: "Battery life targets" },
  { value: "LTE-M + NB-IoT", label: "Connectivity" },
];

const quickLinks = [
  {
    icon: Radio,
    label: "MOST POPULAR",
    title: "Asset Tracker Build Guide",
    href: "/build/asset-tracker",
  },
  {
    icon: Zap,
    label: "INTERACTIVE",
    title: "PSM / eDRX Power Simulator",
    href: "/learn/power/psm-edrx",
  },
  {
    icon: ShieldCheck,
    label: "REFERENCE",
    title: "Security Audit Checklist",
    href: "/learn/security/endpoint",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-16">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-[140px]" style={{ background: "radial-gradient(ellipse, rgba(191,253,17,0.04) 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full blur-[120px]" style={{ background: "radial-gradient(ellipse, rgba(83,242,250,0.05) 0%, transparent 70%)" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-16 items-center">
          {/* Copy — staggered entrance */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Eyebrow badge */}
            <motion.div
              variants={staggerItem}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#BFFD11]/25 bg-[#BFFD11]/5 mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#BFFD11] animate-pulse" aria-hidden="true" />
              <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11]">
                Hologram Device Builder
              </span>
            </motion.div>

            <motion.h1
              variants={staggerItem}
              className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.1] tracking-tight mb-6"
            >
              Build connected<br />
              devices{" "}
              <span className="text-[#BFFD11]">that just work.</span>
            </motion.h1>

            <motion.p
              variants={staggerItem}
              className="text-lg text-white/55 leading-relaxed max-w-lg mb-10"
            >
              An interactive learning platform for engineers and makers. From
              cellular IoT fundamentals to production firmware — everything you
              need to ship devices confidently.
            </motion.p>

            <motion.div variants={staggerItem} className="flex flex-wrap gap-4">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/learn/foundations/architecture"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#BFFD11] text-[#00040F] font-semibold text-sm cursor-pointer"
                >
                  Start Learning
                  <ArrowRight size={16} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/build"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#3A3C46] text-white/75 font-semibold text-sm hover:border-white/35 hover:text-white transition-colors duration-200 cursor-pointer"
                >
                  Jump to Build Guides
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Hero Illustration */}
          <motion.div
            className="hidden lg:flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
            style={{
              maskImage: "radial-gradient(ellipse 80% 75% at 50% 50%, black 40%, transparent 72%)",
              WebkitMaskImage: "radial-gradient(ellipse 80% 75% at 50% 50%, black 40%, transparent 72%)",
            }}
          >
            <img
              src="/hero_compilation.png"
              alt="IoT Device Ecosystem — Asset Tracker, Smart Camera, Building Sensor, Agriculture Drone, Micromobility, RPM"
              className="w-full scale-110"
              style={{
                animation: "hero-spin 60s linear infinite",
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          className="mb-12"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-3">
            Platform Overview
          </p>
          <h2 className="text-3xl font-semibold">Everything you need.</h2>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.label}
              variants={staggerItem}
              whileHover={{ scale: 1.02, y: -3 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
            >
              <Link
                href={feature.href}
                className="group relative p-7 rounded-2xl border border-[#3A3C46]/50 bg-[#060a14] hover:border-[#BFFD11]/25 transition-colors duration-300 cursor-pointer flex flex-col h-full"
              >
                <div
                  className="w-10 h-10 rounded-[6px] flex items-center justify-center mb-5 shrink-0"
                  style={{
                    backgroundColor: `${feature.accentColor}12`,
                    border: `1px solid ${feature.accentColor}25`,
                  }}
                >
                  <feature.icon size={18} style={{ color: feature.accentColor }} strokeWidth={1.75} />
                </div>

                <p
                  className="font-mono text-[11px] font-semibold tracking-widest uppercase mb-2"
                  style={{ color: feature.accentColor }}
                >
                  {feature.label}
                </p>
                <h3 className="text-lg font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed flex-1">{feature.description}</p>

                <div
                  className="inline-flex items-center gap-1.5 mt-6 text-sm font-medium"
                  style={{ color: feature.accentColor }}
                >
                  {feature.cta}
                  <ArrowRight
                    size={13}
                    className="group-hover:translate-x-1 transition-transform duration-200"
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Quick access ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          className="rounded-2xl border border-[#3A3C46]/35 bg-[#030710] p-8 sm:p-10"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
            <div>
              <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#53F2FA] mb-2">
                Quick Access
              </p>
              <h2 className="text-2xl font-semibold">Jump right in.</h2>
            </div>
            <Link
              href="/learn/foundations/architecture"
              className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              View all lessons <ArrowRight size={14} />
            </Link>
          </div>

          <motion.div
            className="grid sm:grid-cols-3 gap-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {quickLinks.map((item) => (
              <motion.div
                key={item.href}
                variants={staggerItem}
                whileHover={{ scale: 1.025, y: -1 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-4 p-4 rounded-xl border border-[#3A3C46]/35 hover:border-[#BFFD11]/20 hover:bg-white/[0.02] transition-colors duration-200 group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-[6px] bg-[#BFFD11]/8 border border-[#BFFD11]/15 flex items-center justify-center shrink-0">
                    <item.icon size={16} className="text-[#BFFD11]" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/25 mb-0.5">
                      {item.label}
                    </p>
                    <p className="text-sm font-medium text-white/70 group-hover:text-white transition-colors duration-200">
                      {item.title}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Free Pilot CTA ── */}
      <FreePilotCTA />
    </>
  );
}
