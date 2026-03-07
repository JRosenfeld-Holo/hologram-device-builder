"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Check, CheckCircle, Circle, ArrowRight, PartyPopper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CodeBlock from "@/components/ui/CodeBlock";
import InfoCallout from "@/components/ui/InfoCallout";
import BOMTable from "@/components/ui/BOMTable";
import InteractiveToggle from "@/components/ui/InteractiveToggle";
import FreePilotCTA from "@/components/ui/FreePilotCTA";
import { staggerContainer, staggerItem } from "@/lib/animations";

const steps = [
  { id: "connectivity", label: "Choose Connectivity" },
  { id: "hardware", label: "Select Hardware" },
  { id: "power", label: "Configure Power" },
  { id: "connectivity-setup", label: "Set Up Connectivity" },
  { id: "firmware", label: "Write Firmware" },
  { id: "gps", label: "Parse GPS Data" },
  { id: "security", label: "Harden Security" },
  { id: "deploy", label: "Deploy" },
];

const bomItems = [
  {
    category: "Cellular Module",
    part: "Nordic nRF9160 SiP",
    alternatives: "Quectel BG95-M3",
    rationale: "LTE-M + NB-IoT + GPS in one SiP. ARM Cortex-M33 with TrustZone.",
    unitCost: "~$12",
    detail:
      "The nRF9160 integrates the LTE modem, GPS receiver, and application MCU into a single 10×16mm package. It supports PSM, eDRX, and FOTA. The BG95-M3 is a pin-compatible alternative with broader band support for global deployments.",
  },
  {
    category: "Processor",
    part: "ARM Cortex-M4 (STM32L4)",
    alternatives: "ESP32 (if WiFi fallback needed)",
    rationale: "Ultra-low 2µA sleep current. 1MB flash for firmware + FOTA.",
    unitCost: "~$3",
    detail:
      "STM32L4 series hits the sweet spot of processing power and ultra-low power. At 2µA stop mode current, it contributes negligibly to battery budget. Its 1MB flash supports over-the-air firmware updates with dual-bank storage.",
  },
  {
    category: "SIM",
    part: "eUICC MFF2 (eSIM)",
    alternatives: "iSIM (integrated into nRF9160)",
    rationale: "Soldered — vibration-resistant, tamper-proof. Remote carrier switching.",
    unitCost: "~$2",
    detail:
      "MFF2 form factor solders directly to the PCB, eliminating the SIM card slot (a common mechanical failure point in high-vibration environments). SGP.32 eSIM enables remote profile switching without physical access.",
  },
  {
    category: "GNSS Antenna",
    part: "Active Patch Antenna (GPS/GLONASS)",
    alternatives: "Helical antenna for enclosures",
    rationale: "4m outdoor accuracy. Built-in LNA improves sensitivity in marginal signal.",
    unitCost: "~$4",
    detail:
      "Active patch antennas include a low-noise amplifier (LNA) to boost weak GNSS signals. This is critical for cold start in urban canyons or under vehicle chassis. Place with clear sky view — at least 70° of unobstructed horizon.",
  },
  {
    category: "Battery",
    part: "Li-SOCl₂ D-cell (19,000 mAh)",
    alternatives: "18650 Li-Ion for rechargeable",
    rationale: "10-year shelf life. -40°C to +85°C operating range.",
    unitCost: "~$8",
    detail:
      "Lithium thionyl chloride (Li-SOCl2) is the gold standard for 10-year IoT deployments. Its extremely low self-discharge rate (1% per year) makes it ideal for devices that wake only once per day. Not rechargeable — plan for field replacement.",
  },
  {
    category: "Cellular Antenna",
    part: "Taoglas FXP73 Flex Antenna",
    alternatives: "SMA external stub antenna",
    rationale: "LTE-M + NB-IoT broadband. Adhesive mount for enclosure integration.",
    unitCost: "~$3",
    detail:
      "Flexible PCB antenna covers 698–2690 MHz, compatible with all LTE-M and NB-IoT bands globally. Adhesive backing allows mounting to inside of enclosure wall. Keep at least 15mm clearance from ground plane.",
  },
];

const atCommandSteps = [
  {
    code: 'AT+CGDCONT=1,"IP","your.private.apn"',
    comment: "Set Private APN",
    highlight: true,
  },
  { code: "AT+QIACT=1", comment: "Activate PDP context" },
  { code: "AT+CGPADDR", comment: "Verify IP assignment" },
  { code: "", comment: "" },
  { code: 'AT+QCFG="servicedomain",1', comment: "Packet-switched only (security)" },
  { code: 'AT+COPS=1,2,"31026"', comment: "Lock to Hologram carrier" },
  { code: "", comment: "" },
  { code: 'AT+CPSMS=1,,,"00111000","00000001"', comment: "Enable PSM (24h TAU, 2s active)" },
  { code: "AT+QGPS=1", comment: "Enable GNSS receiver" },
];

const micropythonFirmware = `import time
import uos
import ubinascii
from machine import UART, Pin

# Initialize UART to modem
uart = UART(1, baudrate=115200, tx=Pin(4), rx=Pin(5))

def send_at(cmd, timeout=3000):
    """Send AT command, return response."""
    uart.write(cmd + "\\r\\n")
    time.sleep_ms(100)
    deadline = time.ticks_ms() + timeout
    resp = b""
    while time.ticks_ms() < deadline:
        if uart.any():
            resp += uart.read()
    return resp.decode("utf-8", "ignore")

def setup_modem():
    # 1. Set Private APN
    send_at('AT+CGDCONT=1,"IP","hologram"')
    # 2. PS-only mode
    send_at('AT+QCFG="servicedomain",1')
    # 3. Enable PSM: 24h sleep, 2s active
    send_at('AT+CPSMS=1,,,"00111000","00000001"')
    # 4. Activate PDP context
    send_at("AT+QIACT=1")
    # 5. Enable GNSS
    send_at("AT+QGPS=1")

def get_location():
    resp = send_at("AT+QGPSLOC?")
    return parse_gps(resp)

def parse_gps(response):
    import re
    pattern = r"\\+QGPSLOC: ([\\d.]+),([\\d.]+)([NS]),([\\d.]+)([EW])"
    m = re.search(pattern, response)
    if not m:
        return None
    return {
        "utc": m.group(1),
        "lat": convert_to_decimal(m.group(2), m.group(3)),
        "lon": convert_to_decimal(m.group(4), m.group(5)),
    }

def convert_to_decimal(ddmm, direction):
    d = float(ddmm)
    deg = int(d / 100)
    mins = d - deg * 100
    decimal = deg + mins / 60
    if direction in ("S", "W"):
        decimal = -decimal
    return round(decimal, 6)

# Main loop
setup_modem()
while True:
    loc = get_location()
    if loc:
        payload = f'{{"lat":{loc["lat"]},"lon":{loc["lon"]}}}'
        send_at(f'AT+QISENDEX=0,"{ubinascii.hexlify(payload.encode()).decode()}"')
    time.sleep(86400)  # Sleep 24 hours`;

const cppFirmware = `#include <Arduino.h>
#include <HardwareSerial.h>

HardwareSerial modem(1);

String sendAT(const String& cmd, unsigned long timeout = 3000) {
  modem.println(cmd);
  delay(100);
  String resp = "";
  unsigned long start = millis();
  while (millis() - start < timeout) {
    while (modem.available()) {
      resp += (char)modem.read();
    }
  }
  return resp;
}

struct Location {
  double lat;
  double lon;
  bool valid;
};

double ddmmToDecimal(const String& ddmm, char dir) {
  double val = ddmm.toDouble();
  int deg = (int)(val / 100);
  double mins = val - deg * 100;
  double decimal = deg + mins / 60.0;
  if (dir == 'S' || dir == 'W') decimal = -decimal;
  return decimal;
}

void setupModem() {
  sendAT("AT+CGDCONT=1,\\"IP\\",\\"hologram\\"");
  sendAT("AT+QCFG=\\"servicedomain\\",1");
  sendAT("AT+CPSMS=1,,,\\"00111000\\",\\"00000001\\"");
  sendAT("AT+QIACT=1");
  sendAT("AT+QGPS=1");
  Serial.println("Modem initialized.");
}

Location getLocation() {
  String resp = sendAT("AT+QGPSLOC?");
  Location loc = {0, 0, false};
  int start = resp.indexOf("+QGPSLOC: ");
  if (start < 0) return loc;
  // Parse fields from response
  // Format: UTC,LAT[NS],LON[EW],HDOP,ALT,FIX,...
  loc.valid = true;
  return loc;
}

void setup() {
  Serial.begin(115200);
  modem.begin(115200, SERIAL_8N1, 16, 17);
  setupModem();
}

void loop() {
  Location loc = getLocation();
  if (loc.valid) {
    String payload = "{\\"lat\\":" + String(loc.lat, 6) +
                     ",\\"lon\\":" + String(loc.lon, 6) + "}";
    Serial.println("Sending: " + payload);
    // Transmit via AT+QISENDEX
  }
  delay(86400000); // 24 hours
}`;

const securityChecklist = [
  { label: "Private APN configured", cmd: `AT+CGDCONT=1,"IP","your.apn"`, done: false },
  { label: "Packet Switched only (no voice/SMS)", cmd: `AT+QCFG="servicedomain",1`, done: false },
  { label: "Frequency bands locked", cmd: `AT+QCFG="band",0,80000,80000`, done: false },
  { label: "DTLS encryption enabled on all sockets", cmd: "— Configure in TLS context AT+QSSLCFG", done: false },
  { label: "PSM enabled (reduces RF exposure time)", cmd: `AT+CPSMS=1,,,"00111000","00000001"`, done: false },
  { label: "Hardware Root of Trust / TRE active", cmd: "— nRF9160 TrustZone by default", done: false },
  { label: "RAI enabled for fast radio release", cmd: `AT+QCFG="rai",1`, done: false },
];

function useAnimatedScore(target: number) {
  const [displayed, setDisplayed] = useState(target);
  const prevRef = useRef(target);
  useEffect(() => {
    const from = prevRef.current;
    prevRef.current = target;
    if (from === target) return;
    const start = performance.now();
    const duration = 500;
    const raf = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(from + (target - from) * eased));
      if (t < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [target]);
  return displayed;
}

export default function AssetTrackerPage() {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [activeStep, setActiveStep] = useState("connectivity");
  const [direction, setDirection] = useState(1);
  const [checkedSecurity, setCheckedSecurity] = useState<Set<number>>(new Set());

  const goToStep = (stepId: string) => {
    const fromIdx = steps.findIndex((s) => s.id === activeStep);
    const toIdx = steps.findIndex((s) => s.id === stepId);
    setDirection(toIdx >= fromIdx ? 1 : -1);
    setActiveStep(stepId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const markComplete = (stepId: string) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(stepId);
      return next;
    });
    const idx = steps.findIndex((s) => s.id === stepId);
    if (idx < steps.length - 1) {
      setDirection(1);
      setActiveStep(steps[idx + 1].id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-10" aria-label="Breadcrumb">
        <Link href="/build" className="hover:text-white/60 transition-colors cursor-pointer">Build</Link>
        <ChevronRight size={12} />
        <span className="text-[#BFFD11]">Asset Tracker</span>
      </nav>

      {/* Header */}
      <motion.div
        className="mb-12"
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
      >
        <motion.p
          variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
          className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-3"
        >
          Build Guide · Flagship
        </motion.p>
        <motion.h1
          variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
          className="text-4xl font-semibold mb-5 leading-tight"
        >
          Global Asset Tracker
        </motion.h1>
        <motion.p
          variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
          className="text-lg text-white/55 leading-relaxed max-w-2xl"
        >
          Build a cellular-connected GPS tracker from scratch. Covers hardware selection, AT command
          configuration, MicroPython and C++ firmware, GPS parsing, and security hardening.
        </motion.p>
      </motion.div>

      {/* Step Progress Bar */}
      <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] p-4 mb-12">
        {/* Mobile step nav */}
        <div className="flex items-center gap-3 sm:hidden mb-3">
          <button
            onClick={() => {
              const idx = steps.findIndex((s) => s.id === activeStep);
              if (idx > 0) goToStep(steps[idx - 1].id);
            }}
            disabled={steps.findIndex((s) => s.id === activeStep) === 0}
            className="p-2 rounded-lg border border-[#3A3C46]/40 text-white/50 hover:text-white hover:border-white/20 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Previous step"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex-1 text-center">
            <p className="text-[10px] font-mono font-semibold tracking-widest uppercase text-[#BFFD11]">
              Step {steps.findIndex((s) => s.id === activeStep) + 1} of {steps.length}
            </p>
            <p className="text-sm font-medium text-white mt-0.5">
              {steps.find((s) => s.id === activeStep)?.label}
            </p>
          </div>
          <button
            onClick={() => {
              const idx = steps.findIndex((s) => s.id === activeStep);
              if (idx < steps.length - 1) goToStep(steps[idx + 1].id);
            }}
            disabled={steps.findIndex((s) => s.id === activeStep) === steps.length - 1}
            className="p-2 rounded-lg border border-[#3A3C46]/40 text-white/50 hover:text-white hover:border-white/20 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Next step"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Desktop step tabs */}
        <div className="hidden sm:flex gap-1 overflow-x-auto pb-1">
          {steps.map((step, idx) => {
            const isComplete = completedSteps.has(step.id);
            const isActive = activeStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => goToStep(step.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap text-xs font-medium transition-all duration-200 cursor-pointer shrink-0 ${isActive
                  ? "bg-[#BFFD11] text-[#00040F]"
                  : isComplete
                    ? "text-[#BFFD11]/70 bg-[#BFFD11]/8"
                    : "text-white/35 hover:text-white/60"
                  }`}
              >
                {isComplete ? (
                  <Check size={11} className="shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                )}
                {step.label}
              </button>
            );
          })}
        </div>
        <div className="mt-3 h-1 bg-[#3A3C46]/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#BFFD11] rounded-full transition-all duration-500"
            style={{ width: `${(completedSteps.size / steps.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-white/25 mt-2">
          {completedSteps.size}/{steps.length} steps complete
        </p>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={activeStep}
          custom={direction}
          initial={{ opacity: 0, x: direction * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -40 }}
          transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
        >

        {/* STEP 1: Connectivity */}
        {activeStep === "connectivity" && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] bg-[#BFFD11]/10 px-2 py-1 rounded">Step 1</span>
              <h2 className="text-2xl font-semibold">Choose Your Connectivity</h2>
            </div>

            <p className="text-white/55 leading-relaxed mb-8 max-w-2xl">
              For a global asset tracker, LTE-M is the clear choice. It supports Connected Mode
              Mobility (CMM) for seamless handover between towers — critical for moving assets.
              Pair with NB-IoT fallback via a dual-mode module for maximum coverage.
            </p>

            <div className="grid sm:grid-cols-2 gap-5 mb-8">
              <div className="rounded-xl border border-[#BFFD11]/25 bg-[#BFFD11]/4 p-5">
                <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-3">Primary: LTE-M</p>
                <ul className="space-y-2 text-sm text-white/65">
                  <li className="flex items-start gap-2"><Check size={13} className="text-[#BFFD11] shrink-0 mt-0.5" />Connected Mode Mobility (no connection drop while moving)</li>
                  <li className="flex items-start gap-2"><Check size={13} className="text-[#BFFD11] shrink-0 mt-0.5" />~1 Mbps — fast GPS position + firmware updates</li>
                  <li className="flex items-start gap-2"><Check size={13} className="text-[#BFFD11] shrink-0 mt-0.5" />PSM + eDRX support for &gt;5 year battery life</li>
                </ul>
              </div>
              <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] p-5">
                <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-[#53F2FA] mb-3">Fallback: NB-IoT</p>
                <ul className="space-y-2 text-sm text-white/45">
                  <li className="flex items-start gap-2"><Circle size={13} className="text-[#3A3C46] shrink-0 mt-0.5" />Coverage Extension for underground/remote locations</li>
                  <li className="flex items-start gap-2"><Circle size={13} className="text-[#3A3C46] shrink-0 mt-0.5" />Lower module cost (~40% cheaper)</li>
                  <li className="flex items-start gap-2"><Circle size={13} className="text-[#3A3C46] shrink-0 mt-0.5" />Static assets only — no handover support</li>
                </ul>
              </div>
            </div>

            <InfoCallout type="tip">
              Use a <strong>dual-mode module</strong> (LTE-M + NB-IoT). Configure LTE-M as primary
              with NB-IoT fallback using <code className="font-mono bg-white/5 px-1 rounded text-xs">AT+QCFG="nwscanmode",0</code> (auto).
              This single SKU works in any market without hardware changes.
            </InfoCallout>

            <button
              onClick={() => markComplete("connectivity")}
              className="mt-8 px-5 py-2.5 rounded-xl bg-[#BFFD11] text-[#00040F] text-sm font-semibold hover:bg-[#d4ff3d] transition-colors cursor-pointer"
            >
              Got it — Next Step →
            </button>
          </section>
        )}

        {/* STEP 2: Hardware BOM */}
        {activeStep === "hardware" && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] bg-[#BFFD11]/10 px-2 py-1 rounded">Step 2</span>
              <h2 className="text-2xl font-semibold">Select Your Hardware</h2>
            </div>
            <p className="text-white/55 leading-relaxed mb-8 max-w-2xl">
              Click any row to expand full details, alternatives, and design rationale.
            </p>
            <BOMTable items={bomItems} title="Asset Tracker BOM" />
            <button
              onClick={() => markComplete("hardware")}
              className="mt-8 px-5 py-2.5 rounded-xl bg-[#BFFD11] text-[#00040F] text-sm font-semibold hover:bg-[#d4ff3d] transition-colors cursor-pointer"
            >
              BOM Reviewed — Next Step →
            </button>
          </section>
        )}

        {/* STEP 3: Power */}
        {activeStep === "power" && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] bg-[#BFFD11]/10 px-2 py-1 rounded">Step 3</span>
              <h2 className="text-2xl font-semibold">Configure Power</h2>
            </div>

            <p className="text-white/55 leading-relaxed mb-8 max-w-2xl">
              For a once-daily reporting tracker with a Li-SOCl₂ D-cell, configure aggressive PSM.
              T3412 (TAU) = 24 hours. T3324 (Active Time) = 2 seconds.
            </p>

            <CodeBlock
              language="at"
              title="PSM configuration"
              code={[
                { code: `AT+CPSMS=1,,,"00111000","00000001"`, comment: "Enable PSM, T3412=24h, T3324=2s", highlight: true },
                { code: "" },
                { code: "// Binary encoding:" },
                { code: "// T3412 00111000 = Timer unit 011 (6 min) × value 01000 = 8 × 6h = 48h" },
                { code: "// T3324 00000001 = Timer unit 000 (2 sec) × value 00001 = 1 × 2s = 2s" },
              ]}
            />

            <div className="mt-6">
              <InfoCallout type="tip">
                Enable Release Assistance Indicator (RAI) to signal the network to release
                the radio connection immediately after your last uplink. Use{" "}
                <code className="font-mono bg-white/5 px-1 rounded text-xs">AT+QCFG=&quot;rai&quot;,1</code> — this
                can save <strong>40% of transmission energy</strong>.
              </InfoCallout>
            </div>

            <div className="mt-6 p-5 rounded-xl border border-[#3A3C46]/40 bg-[#060a14]">
              <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-2">
                Estimated battery life
              </p>
              <p className="text-3xl font-semibold text-[#BFFD11]">~9.2 years</p>
              <p className="text-sm text-white/35 mt-1">
                Li-SOCl₂ 19,000 mAh · 1×/day reporting · 2s active window
              </p>
              <Link href="/learn/power/psm-edrx" className="inline-flex items-center gap-1.5 mt-3 text-xs text-[#BFFD11] hover:underline cursor-pointer">
                Run the PSM simulator for your exact parameters <ArrowRight size={11} />
              </Link>
            </div>

            <button
              onClick={() => markComplete("power")}
              className="mt-8 px-5 py-2.5 rounded-xl bg-[#BFFD11] text-[#00040F] text-sm font-semibold hover:bg-[#d4ff3d] transition-colors cursor-pointer"
            >
              Power Configured — Next Step →
            </button>
          </section>
        )}

        {/* STEP 4: Connectivity Setup */}
        {activeStep === "connectivity-setup" && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] bg-[#BFFD11]/10 px-2 py-1 rounded">Step 4</span>
              <h2 className="text-2xl font-semibold">Set Up Connectivity</h2>
            </div>

            <p className="text-white/55 leading-relaxed mb-8 max-w-2xl">
              Walk through the full AT command initialization sequence. Replace{" "}
              <code className="font-mono bg-white/5 px-1 rounded text-xs">your.private.apn</code> with
              your actual APN. For Hologram, use <code className="font-mono bg-white/5 px-1 rounded text-xs">hologram</code>.
            </p>

            <CodeBlock
              language="at"
              title="Full initialization sequence"
              code={atCommandSteps}
            />

            <div className="mt-6 space-y-4">
              <InfoCallout type="info">
                <strong>What is an APN?</strong> Access Point Name — the gateway identifier that
                routes your device traffic to the right network and applies carrier policy rules
                (IP assignment, firewalling, routing). A private APN isolates your fleet from the
                public internet.
              </InfoCallout>
              <InfoCallout type="warning">
                Always verify IP assignment with{" "}
                <code className="font-mono bg-white/5 px-1 rounded text-xs">AT+CGPADDR</code> before
                attempting to open a socket. If no IP is returned, the PDP context activation failed
                — check your APN string and SIM provisioning.
              </InfoCallout>
            </div>

            <button
              onClick={() => markComplete("connectivity-setup")}
              className="mt-8 px-5 py-2.5 rounded-xl bg-[#BFFD11] text-[#00040F] text-sm font-semibold hover:bg-[#d4ff3d] transition-colors cursor-pointer"
            >
              Connectivity Configured — Next Step →
            </button>
          </section>
        )}

        {/* STEP 5: Firmware */}
        {activeStep === "firmware" && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] bg-[#BFFD11]/10 px-2 py-1 rounded">Step 5</span>
              <h2 className="text-2xl font-semibold">Write Your Firmware</h2>
            </div>

            <p className="text-white/55 leading-relaxed mb-8 max-w-2xl">
              Choose your language. Both implementations follow the same initialization sequence:
              APN → Security mode → PSM → Activate PDP → Enable GNSS → Report loop.
            </p>

            <InteractiveToggle
              tabs={[
                { key: "python", label: "MicroPython" },
                { key: "cpp", label: "C++ / Arduino" },
              ]}
              defaultTab="python"
            >
              {{
                python: (
                  <CodeBlock
                    language="python"
                    filename="firmware/main.py"
                    code={micropythonFirmware}
                  />
                ),
                cpp: (
                  <CodeBlock
                    language="cpp"
                    filename="src/main.cpp"
                    code={cppFirmware}
                  />
                ),
              }}
            </InteractiveToggle>

            <button
              onClick={() => markComplete("firmware")}
              className="mt-8 px-5 py-2.5 rounded-xl bg-[#BFFD11] text-[#00040F] text-sm font-semibold hover:bg-[#d4ff3d] transition-colors cursor-pointer"
            >
              Firmware Written — Next Step →
            </button>
          </section>
        )}

        {/* STEP 6: GPS */}
        {activeStep === "gps" && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] bg-[#BFFD11]/10 px-2 py-1 rounded">Step 6</span>
              <h2 className="text-2xl font-semibold">Parse GPS Data</h2>
            </div>

            <p className="text-white/55 leading-relaxed mb-8 max-w-2xl">
              The Quectel module returns coordinates in DDMM.MMMM format (degrees + decimal minutes).
              You must convert to decimal degrees for most mapping APIs.
            </p>

            <CodeBlock
              language="at"
              title="GNSS AT commands"
              code={[
                { code: "AT+QGPS=1", comment: "Enable GNSS receiver (standalone mode)" },
                { code: "AT+QGPSLOC?", comment: "Query current location", highlight: true },
                { code: "" },
                { code: "+QGPSLOC: 092204.0,3150.7820N,11711.9310E,0.6,121.1,2,0.0,0.0,0.0,250326,04" },
                { code: "OK" },
                { code: "" },
                { code: "// Fields: UTC,LAT[NS],LON[EW],HDOP,ALT,FIX,COG,SpKm,SpKn,DATE,NSAT" },
              ]}
            />

            <div className="mt-6">
              <CodeBlock
                language="python"
                filename="lib/gps.py"
                title="Coordinate converter"
                code={`import re

def parse_gps(response):
    """Parse +QGPSLOC response to decimal degrees."""
    pattern = r"\\+QGPSLOC: ([\\d.]+),([\\d.]+)([NS]),([\\d.]+)([EW]),(.*)"
    m = re.search(pattern, response)
    if not m:
        return None
    fields = m.group(6).split(",")
    return {
        "utc":      m.group(1),
        "lat":      to_decimal(m.group(2), m.group(3)),
        "lon":      to_decimal(m.group(4), m.group(5)),
        "hdop":     float(fields[0]) if fields else None,
        "altitude": float(fields[1]) if len(fields) > 1 else None,
        "nsat":     int(fields[5]) if len(fields) > 5 else None,
    }

def to_decimal(ddmm: str, direction: str) -> float:
    """Convert DDMM.MMMM + direction to signed decimal degrees."""
    val = float(ddmm)
    deg = int(val / 100)
    mins = val - deg * 100
    decimal = deg + mins / 60.0
    if direction in ("S", "W"):
        decimal = -decimal
    return round(decimal, 6)

# Example:
# 3150.7820N → 31 + 50.7820/60 = 31.846367°N
# 11711.9310E → 117 + 11.9310/60 = 117.198850°E`}
              />
            </div>

            <div className="mt-6">
              <Link
                href="/tools/gps-parser"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#BFFD11]/25 text-[#BFFD11] text-sm font-medium hover:bg-[#BFFD11]/5 transition-colors cursor-pointer"
              >
                Try the interactive GPS Parser tool <ArrowRight size={14} />
              </Link>
            </div>

            <button
              onClick={() => markComplete("gps")}
              className="mt-8 px-5 py-2.5 rounded-xl bg-[#BFFD11] text-[#00040F] text-sm font-semibold hover:bg-[#d4ff3d] transition-colors cursor-pointer"
            >
              GPS Parsing Ready — Next Step →
            </button>
          </section>
        )}

        {/* STEP 7: Security */}
        {activeStep === "security" && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] bg-[#BFFD11]/10 px-2 py-1 rounded">Step 7</span>
              <h2 className="text-2xl font-semibold">Security Hardening</h2>
            </div>

            <p className="text-white/55 leading-relaxed mb-8 max-w-2xl">
              Check off each security measure as you implement it. Your security score updates in real time.
            </p>

            <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] overflow-hidden mb-6">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#3A3C46]/30 bg-[#0a0e1a]">
                <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/40">
                  Security Checklist
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-[#3A3C46]/40 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${securityScore}%`,
                        background: securityScore === 100 ? "#BFFD11" : securityScore > 50 ? "#f59e0b" : "#ef4444",
                      }}
                    />
                  </div>
                  <span className="font-mono text-xs text-white/35">{displayedScore}%</span>
                </div>
              </div>

              <motion.div
                className="divide-y divide-[#3A3C46]/15"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {securityChecklist.map((item, idx) => (
                  <motion.div
                    key={idx}
                    variants={staggerItem}
                    className="flex items-start gap-4 px-5 py-4 hover:bg-white/[0.015] transition-colors"
                  >
                    <button
                      onClick={() => toggleSecurity(idx)}
                      className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all duration-150 cursor-pointer ${checkedSecurity.has(idx)
                        ? "bg-[#BFFD11] border-[#BFFD11]"
                        : "border border-[#3A3C46]/60"
                        }`}
                      aria-label={checkedSecurity.has(idx) ? "Uncheck" : "Check"}
                    >
                      {checkedSecurity.has(idx) && (
                        <Check size={11} className="text-[#00040F]" strokeWidth={3} />
                      )}
                    </button>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium transition-colors ${checkedSecurity.has(idx) ? "text-white/40 line-through" : "text-white/80"
                          }`}
                      >
                        {item.label}
                      </p>
                      <code className="text-[11px] font-mono text-[#BFFD11]/50 mt-0.5 block">
                        {item.cmd}
                      </code>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <button
              onClick={() => markComplete("security")}
              className="mt-4 px-5 py-2.5 rounded-xl bg-[#BFFD11] text-[#00040F] text-sm font-semibold hover:bg-[#d4ff3d] transition-colors cursor-pointer"
            >
              Security Hardened — Final Step →
            </button>
          </section>
        )}

        {/* STEP 8: Deploy */}
        {activeStep === "deploy" && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] bg-[#BFFD11]/10 px-2 py-1 rounded">Step 8</span>
              <h2 className="text-2xl font-semibold">Deploy</h2>
            </div>

            <p className="text-white/55 leading-relaxed mb-8 max-w-2xl">
              Your tracker is ready. Before mass deployment, follow the pilot playbook to validate
              signal coverage, battery life, and data ingestion at small scale.
            </p>

            {/* Summary card */}
            <div className="rounded-xl border border-[#BFFD11]/20 bg-[#BFFD11]/4 p-6 mb-8">
              <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-4">
                Configuration Summary
              </p>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {[
                  ["Connectivity", "LTE-M primary, NB-IoT fallback"],
                  ["Module", "Nordic nRF9160 SiP"],
                  ["SIM", "eUICC MFF2 (soldered)"],
                  ["Battery", "Li-SOCl₂ D-cell, ~9 yr life"],
                  ["PSM Timer (T3412)", "24 hours"],
                  ["Active Time (T3324)", "2 seconds"],
                  ["APN", "Private APN configured"],
                  ["Security", "PS-only, band-locked, DTLS"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <span className="text-white/40">{k}</span>
                    <span className="text-white/75 text-right font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/deploy/pilot-playbook"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#BFFD11] text-[#00040F] text-sm font-semibold hover:bg-[#d4ff3d] transition-colors cursor-pointer"
              >
                View Pilot Playbook <ArrowRight size={14} />
              </Link>
              <Link
                href="/learn/security/endpoint"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#3A3C46] text-white/70 text-sm font-semibold hover:border-white/30 transition-colors cursor-pointer"
              >
                Full Security Audit
              </Link>
            </div>

            {completedSteps.size < steps.length - 1 && (
              <div className="mt-6">
                <InfoCallout type="warning">
                  You haven&apos;t completed all previous steps. Go back and mark each step complete
                  before deploying to production.
                </InfoCallout>
              </div>
            )}

            {completedSteps.size === steps.length - 1 && (
              <button
                onClick={() => markComplete("deploy")}
                className="mt-8 px-5 py-2.5 rounded-xl bg-[#BFFD11] text-[#00040F] text-sm font-semibold hover:bg-[#d4ff3d] transition-colors cursor-pointer"
              >
                <CheckCircle size={14} className="shrink-0" aria-hidden="true" />
                Mark Build Complete
              </button>
            )}

            {completedSteps.size === steps.length && (
              <div className="mt-8 rounded-xl border border-[#BFFD11]/30 bg-[#BFFD11]/5 p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <PartyPopper size={18} className="text-[#BFFD11]" aria-hidden="true" />
                  <p className="text-lg font-semibold text-[#BFFD11]">Build Complete!</p>
                </div>
                <p className="text-sm text-white/50 mb-5">You&apos;ve completed all steps for the Global Asset Tracker.</p>
                <Link
                  href="/build"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#BFFD11] text-[#00040F] text-sm font-semibold hover:bg-[#d4ff3d] transition-colors cursor-pointer"
                >
                  ← Back to Build Guides
                </Link>
              </div>
            )}
          </section>
        )}
        </motion.div>
      </AnimatePresence>

      {/* All steps summary nav */}
      {activeStep !== steps[0].id && (
        <div className="mt-16 pt-8 border-t border-[#3A3C46]/30">
          <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/25 mb-4">All Steps</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {steps.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => goToStep(step.id)}
                className={`flex items-center gap-3 p-3 rounded-lg text-sm text-left cursor-pointer transition-colors ${completedSteps.has(step.id)
                  ? "text-[#BFFD11]/60 hover:text-[#BFFD11]"
                  : activeStep === step.id
                    ? "text-white"
                    : "text-white/30 hover:text-white/60"
                  }`}
              >
                {completedSteps.has(step.id) ? (
                  <Check size={13} className="text-[#BFFD11] shrink-0" />
                ) : (
                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                )}
                {step.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-20 -mx-4 sm:-mx-6 lg:-mx-8">
        <FreePilotCTA />
      </div>
    </div>
  );
}
