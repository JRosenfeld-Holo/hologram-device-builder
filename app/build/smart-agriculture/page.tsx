"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ChevronRight, Check, Circle, ArrowRight, Leaf, Droplets, Sun, Thermometer, Wind, Radio, Shield, Cpu, Battery, Zap } from "lucide-react";
import { motion } from "framer-motion";
import CodeBlock from "@/components/ui/CodeBlock";
import InfoCallout from "@/components/ui/InfoCallout";
import BOMTable from "@/components/ui/BOMTable";
import InteractiveToggle from "@/components/ui/InteractiveToggle";
import FreePilotCTA from "@/components/ui/FreePilotCTA";

const steps = [
    { id: "sensors", label: "Select Sensors" },
    { id: "connectivity", label: "Choose Connectivity" },
    { id: "hardware", label: "Design Hardware" },
    { id: "power", label: "Solar & Power" },
    { id: "firmware", label: "Write Firmware" },
    { id: "lifecycle", label: "Deploy & Maintain" },
];

/* ── Sensor Categories ── */
const sensorCategories = [
    {
        icon: Droplets,
        name: "Soil Moisture & Temperature",
        interface: "SDI-12 / RS-485",
        kpi: "Volumetric Water Content (VWC)",
        detail: "Foundational for irrigation optimization. Install probes at multiple depths (15 cm and 45 cm) to monitor the full root zone.",
        color: "#53F2FA",
    },
    {
        icon: Leaf,
        name: "NPK (Nitrogen, Phosphorus, Potassium)",
        interface: "Analog / RS-485",
        kpi: "Nutrient Concentration (mg/kg)",
        detail: "Utilize Time Domain Reflectometry (TDR) or colorimetric analysis to estimate nutrient levels. Accuracy varies significantly between vendors — validate against lab tests.",
        color: "#BFFD11",
    },
    {
        icon: Wind,
        name: "Weather & Environmental",
        interface: "Pulse / SDI-12",
        kpi: "Evapotranspiration (ET) Rate",
        detail: "Includes precipitation (tipping bucket), wind speed/direction, solar radiation, and leaf wetness. Critical for disease prediction models.",
        color: "#53F2FA",
    },
    {
        icon: Radio,
        name: "Livestock Tracker",
        interface: "BLE / I2C",
        kpi: "Vitals (Heart Rate, Temp), Activity",
        detail: "BLE collar or ear-tag for continuous vitals monitoring. Aggregated via gateway nodes placed at watering stations or feedlots.",
        color: "#BFFD11",
    },
];

/* ── BOM ── */
const bomItems = [
    {
        category: "Cellular Module",
        part: "Quectel BG95-M3",
        alternatives: "Nordic nRF9160 SiP",
        rationale: "LTE-M + NB-IoT dual-mode with GNSS. Ideal for global rural coverage with carrier fallback.",
        unitCost: "~$10",
        detail:
            "The BG95-M3 supports Cat-M1, Cat-NB2, and integrated GNSS in a single module. Its dual-mode capability lets field nodes fall back to NB-IoT when LTE-M towers are out of range — critical for remote agricultural regions.",
    },
    {
        category: "MCU",
        part: "STM32L4 (Cortex-M4)",
        alternatives: "ESP32 (if WiFi gateway needed)",
        rationale: "Ultra-low 2µA sleep. Handles SDI-12, RS-485, and analog sensor interfaces simultaneously.",
        unitCost: "~$3",
        detail:
            "STM32L4 provides hardware UART, ADC, and I2C peripherals needed for multi-sensor nodes. Its stop-mode current of 2µA contributes negligibly to the power budget between wake-ups.",
    },
    {
        category: "SIM",
        part: "eSIM (MFF2) or iSIM",
        alternatives: "Standard SIM (not recommended)",
        rationale: "Solderable — eliminates corrosion and vibration failures common in agricultural enclosures.",
        unitCost: "~$2",
        detail:
            "MFF2 eSIM solders directly to the PCB, removing the SIM slot (a primary failure point in high-vibration tractor-mounted or livestock environments). iSIM, integrated into the SoC, eliminates the footprint entirely and offers maximum moisture resistance.",
    },
    {
        category: "Solar Panel",
        part: "2W Monocrystalline Panel",
        alternatives: "Polycrystalline (lower cost, lower efficiency)",
        rationale: "Sufficient for LTE-M nodes reporting every 15–60 minutes with MPPT harvesting.",
        unitCost: "~$6",
        detail:
            "2W panels provide adequate energy even in overcast regions when paired with an MPPT controller. Size for worst-case winter irradiance at your deployment latitude.",
    },
    {
        category: "Battery",
        part: "LiFePO4 3.2V 6000 mAh",
        alternatives: "Li-SOCl₂ (non-rechargeable, 10 yr shelf life)",
        rationale: "2,000+ charge cycle life. Thermally stable from -20°C to +60°C. Ideal for solar-rechargeable systems.",
        unitCost: "~$8",
        detail:
            "Lithium Iron Phosphate chemistry is the safest rechargeable option for agricultural environments — no thermal runaway risk. Its flat discharge curve provides stable voltage throughout the cycle, simplifying firmware power management.",
    },
    {
        category: "Enclosure",
        part: "IP67 UV-Stabilized Polycarbonate",
        alternatives: "IP68 316L Stainless Steel (corrosive environments)",
        rationale: "Dust-tight and immersion-proof. UV-stabilized for 10–20 year outdoor lifespan.",
        unitCost: "~$12",
        detail:
            "UV-stabilized polycarbonate or ASA plastics resist structural degradation from sunlight. For livestock or fertilizer-heavy environments, upgrade to 316L stainless steel. Always use EPDM gaskets rated for agricultural chemical exposure.",
    },
];

/* ── AT Command Setup ── */
const atCommandSteps = [
    { code: 'AT+CGDCONT=1,"IP","hologram"', comment: "Set APN (Hologram example)", highlight: true },
    { code: "AT+QIACT=1", comment: "Activate PDP context" },
    { code: "AT+CGPADDR", comment: "Verify IP assignment" },
    { code: "" },
    { code: 'AT+QCFG="nwscanmode",0', comment: "Auto: LTE-M primary, NB-IoT fallback" },
    { code: 'AT+QCFG="servicedomain",1', comment: "Packet-switched only" },
    { code: "" },
    { code: 'AT+CPSMS=1,,,"01000111","00000100"', comment: "PSM: T3412=12h, T3324=8s", highlight: true },
    { code: 'AT+CEDRXS=1,5,"0010"', comment: "eDRX: 20.48s paging cycle" },
];

/* ── Firmware: MicroPython ── */
const micropythonFirmware = `import time
import json
from machine import UART, Pin, ADC

# Initialize UART to modem, ADC for analog NPK
uart = UART(1, baudrate=115200, tx=Pin(4), rx=Pin(5))
adc_npk = ADC(Pin(36))

def send_at(cmd, timeout=3000):
    """Send AT command, return response."""
    uart.write(cmd + "\\\\r\\\\n")
    time.sleep_ms(100)
    deadline = time.ticks_ms() + timeout
    resp = b""
    while time.ticks_ms() < deadline:
        if uart.any():
            resp += uart.read()
    return resp.decode("utf-8", "ignore")

def read_sdi12(address="0"):
    """Read SDI-12 sensor (soil moisture)."""
    # Send measure command: aM!
    uart.write(f"{address}M!\\\\r\\\\n")
    time.sleep(2)  # Wait for measurement
    uart.write(f"{address}D0!\\\\r\\\\n")
    time.sleep_ms(500)
    resp = uart.read()
    if resp:
        fields = resp.decode().strip().split("+")
        return {
            "vwc": float(fields[1]) if len(fields) > 1 else None,
            "temp_c": float(fields[2]) if len(fields) > 2 else None,
        }
    return None

def read_npk():
    """Read analog NPK sensor (0-4095 → mg/kg)."""
    raw = adc_npk.read()
    # Calibration: map ADC range to mg/kg (vendor-specific)
    return round(raw * 0.488, 1)  # Example linear cal

def setup_modem():
    send_at('AT+CGDCONT=1,"IP","hologram"')
    send_at('AT+QCFG="nwscanmode",0')       # LTE-M + NB-IoT auto
    send_at('AT+QCFG="servicedomain",1')     # PS-only
    send_at('AT+CPSMS=1,,,"01000111","00000100"')  # PSM 12h
    send_at("AT+QIACT=1")

# Main loop
setup_modem()
while True:
    soil = read_sdi12("0")
    npk = read_npk()
    payload = json.dumps({
        "vwc": soil["vwc"] if soil else None,
        "temp": soil["temp_c"] if soil else None,
        "npk": npk,
        "ts": time.time(),
    })
    send_at(f'AT+QISENDEX=0,"{payload}"')
    time.sleep(3600)  # Report every hour`;

/* ── Firmware: C++ ── */
const cppFirmware = `#include <Arduino.h>
#include <HardwareSerial.h>

HardwareSerial modem(1);
const int NPK_PIN = 36;

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

struct SoilReading {
  float vwc;
  float tempC;
  bool valid;
};

SoilReading readSDI12(char addr = '0') {
  SoilReading r = {0, 0, false};
  // Send SDI-12 measure command
  modem.printf("%cM!\\r\\n", addr);
  delay(2000);
  modem.printf("%cD0!\\r\\n", addr);
  delay(500);
  if (modem.available()) {
    String resp = modem.readStringUntil('\\n');
    // Parse +VWC+TEMP from response
    r.valid = true;
  }
  return r;
}

float readNPK() {
  int raw = analogRead(NPK_PIN);
  return raw * 0.488f;  // Linear calibration
}

void setupModem() {
  sendAT("AT+CGDCONT=1,\\\\"IP\\\\",\\\\"hologram\\\\"");
  sendAT("AT+QCFG=\\\\"nwscanmode\\\\",0");
  sendAT("AT+QCFG=\\\\"servicedomain\\\\",1");
  sendAT("AT+CPSMS=1,,,\\\\"01000111\\\\",\\\\"00000100\\\\"");
  sendAT("AT+QIACT=1");
  Serial.println("Modem initialized for agriculture node.");
}

void setup() {
  Serial.begin(115200);
  modem.begin(115200, SERIAL_8N1, 16, 17);
  setupModem();
}

void loop() {
  SoilReading soil = readSDI12();
  float npk = readNPK();
  String payload = "{\\\\"vwc\\\\":" + String(soil.vwc, 2)
    + ",\\\\"temp\\\\":" + String(soil.tempC, 1)
    + ",\\\\"npk\\\\":" + String(npk, 1) + "}";
  Serial.println("Sending: " + payload);
  // Transmit via AT+QISENDEX
  delay(3600000); // 1 hour
}`;

/* ── Security Checklist ── */
const securityChecklist = [
    { label: "eSIM or iSIM — no physical SIM slot", cmd: "Eliminate corrosion / tamper vector" },
    { label: "Private APN configured", cmd: `AT+CGDCONT=1,"IP","your.apn"` },
    { label: "Packet Switched only (no voice/SMS)", cmd: `AT+QCFG="servicedomain",1` },
    { label: "PSM enabled (minimizes RF window)", cmd: `AT+CPSMS=1,,,"01000111","00000100"` },
    { label: "DTLS encryption on all sockets", cmd: "Configure via AT+QSSLCFG" },
    { label: "Antenna extended above soil level", cmd: "≥1m clearance from ground (avoid 40 dB loss)" },
];

export default function SmartAgriculturePage() {
    const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
    const [activeStep, setActiveStep] = useState("sensors");
    const [checkedSecurity, setCheckedSecurity] = useState<Set<number>>(new Set());
    const [expandedSensor, setExpandedSensor] = useState<number | null>(null);
    const stepRef = useRef<HTMLDivElement>(null);

    const markComplete = (stepId: string) => {
        setCompletedSteps((prev) => {
            const next = new Set(prev);
            next.add(stepId);
            return next;
        });
        const idx = steps.findIndex((s) => s.id === stepId);
        if (idx < steps.length - 1) {
            setActiveStep(steps[idx + 1].id);
            stepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-10" aria-label="Breadcrumb">
                <Link href="/build" className="hover:text-white/60 transition-colors cursor-pointer">Build</Link>
                <ChevronRight size={12} aria-hidden="true" />
                <span className="text-[#BFFD11]">Smart Agriculture</span>
            </nav>

            {/* Header */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div
                            className="w-10 h-10 rounded-[8px] flex items-center justify-center"
                            style={{ background: "rgba(191,253,17,0.1)", border: "1px solid rgba(191,253,17,0.2)" }}
                        >
                            <Leaf size={18} color="#BFFD11" strokeWidth={1.75} />
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-[#BFFD11]">
                                Build Guide
                            </span>
                            <span className="text-[10px] font-mono font-semibold tracking-wider uppercase px-2 py-0.5 rounded text-[#BFFD11] bg-[#BFFD11]/10">
                                Intermediate
                            </span>
                            <span className="text-[11px] text-white/30 font-mono">30 min</span>
                        </div>
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-5 leading-tight">
                        Smart Agriculture Sensor Node
                    </h1>
                    <p className="text-lg text-white/55 leading-relaxed max-w-2xl">
                        Build a ruggedized, solar-powered sensor node for precision agriculture &mdash; soil moisture,
                        NPK nutrients, and weather monitoring with cellular connectivity for remote fields.
                    </p>
                </div>
                <div className="hidden lg:flex justify-center items-center">
                    <img
                        src="/smart_agriculture_hero.png"
                        alt="Smart Agriculture Illustration"
                        className="w-full scale-110"
                        style={{
                            maskImage: "radial-gradient(ellipse 80% 75% at 50% 50%, black 40%, transparent 72%)",
                            WebkitMaskImage: "radial-gradient(ellipse 80% 75% at 50% 50%, black 40%, transparent 72%)",
                        }}
                    />
                </div>
            </div>

            {/* Step Progress Bar */}
            <div ref={stepRef} className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] p-4 mb-12">
                <div className="flex gap-1 overflow-x-auto pb-1">
                    {steps.map((step, idx) => {
                        const isComplete = completedSteps.has(step.id);
                        const isActive = activeStep === step.id;
                        return (
                            <button
                                key={step.id}
                                onClick={() => { setActiveStep(step.id); stepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
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
            <div className="space-y-16">

                {/* ── STEP 1: Sensor Selection ── */}
                {activeStep === "sensors" && (
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] bg-[#BFFD11]/10 px-2 py-1 rounded">Step 1</span>
                            <h2 className="text-2xl font-semibold">Select Your Sensors</h2>
                        </div>

                        <p className="text-white/55 leading-relaxed mb-8 max-w-2xl">
                            The foundation of precision agriculture is accurate data from the root zone and
                            microclimate. Your sensor selection dictates the interface requirements (SDI-12,
                            RS-485, Analog, or BLE) of the entire node design.
                        </p>

                        <div className="space-y-3 mb-8">
                            {sensorCategories.map((sensor, idx) => {
                                const Icon = sensor.icon;
                                const isExpanded = expandedSensor === idx;
                                return (
                                    <div
                                        key={sensor.name}
                                        className={`rounded-xl border transition-all duration-200 cursor-pointer ${isExpanded
                                            ? "border-[#BFFD11]/30 bg-[#BFFD11]/4"
                                            : "border-[#3A3C46]/40 bg-[#060a14] hover:border-[#3A3C46]/70"
                                            }`}
                                        onClick={() => setExpandedSensor(isExpanded ? null : idx)}
                                    >
                                        <div className="flex items-center gap-4 p-5">
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                                style={{ background: `${sensor.color}12`, border: `1px solid ${sensor.color}25` }}
                                            >
                                                <Icon size={18} style={{ color: sensor.color }} strokeWidth={1.5} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-white">{sensor.name}</p>
                                                <p className="text-xs text-white/35 mt-0.5">
                                                    Interface: <span className="font-mono text-white/45">{sensor.interface}</span>
                                                    {" · "}KPI: <span className="font-mono" style={{ color: `${sensor.color}99` }}>{sensor.kpi}</span>
                                                </p>
                                            </div>
                                            <ChevronRight
                                                size={14}
                                                className={`text-white/20 transition-transform duration-200 shrink-0 ${isExpanded ? "rotate-90" : ""}`}
                                            />
                                        </div>
                                        {isExpanded && (
                                            <div className="px-5 pb-5 border-t border-[#BFFD11]/10 pt-4">
                                                <p className="text-sm text-white/55 leading-relaxed">{sensor.detail}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <InfoCallout type="tip">
                            <strong>Multi-depth soil probes</strong> installed at 15 cm and 45 cm provide a
                            complete picture of the root zone — surface moisture for germination monitoring
                            and deep moisture for irrigation scheduling.
                        </InfoCallout>

                        <button
                            onClick={() => markComplete("sensors")}
                            className="mt-8 px-5 py-2.5 rounded-xl bg-[#BFFD11] text-[#00040F] text-sm font-semibold hover:bg-[#BFFD11] transition-colors cursor-pointer"
                        >
                            Sensors Selected — Next Step →
                        </button>
                    </section>
                )}

                {/* ── STEP 2: Connectivity ── */}
                {activeStep === "connectivity" && (
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] bg-[#BFFD11]/10 px-2 py-1 rounded">Step 2</span>
                            <h2 className="text-2xl font-semibold">Choose Your Connectivity</h2>
                        </div>

                        <p className="text-white/55 leading-relaxed mb-8 max-w-2xl">
                            For rural agricultural fields, the choice between NB-IoT and LTE-M is critical
                            for balancing RF penetration, power consumption, and data needs.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-5 mb-8">
                            <div className="rounded-xl border border-[#53F2FA]/25 bg-[#53F2FA]/4 p-5">
                                <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-[#53F2FA] mb-3">NB-IoT · Static Sensors</p>
                                <ul className="space-y-2 text-sm text-white/65">
                                    <li className="flex items-start gap-2"><Check size={13} className="text-[#53F2FA] shrink-0 mt-0.5" />Deepest penetration: MCL of 164 dB</li>
                                    <li className="flex items-start gap-2"><Check size={13} className="text-[#53F2FA] shrink-0 mt-0.5" />Ideal for soil probes in &quot;bottom-land&quot; valleys</li>
                                    <li className="flex items-start gap-2"><Check size={13} className="text-[#53F2FA] shrink-0 mt-0.5" />Lowest power for small, infrequent packets</li>
                                    <li className="flex items-start gap-2"><Check size={13} className="text-[#53F2FA] shrink-0 mt-0.5" />~40% lower module cost than LTE-M</li>
                                </ul>
                            </div>
                            <div className="rounded-xl border border-[#BFFD11]/25 bg-[#BFFD11]/4 p-5">
                                <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-3">LTE-M · Mobile Assets & FOTA</p>
                                <ul className="space-y-2 text-sm text-white/65">
                                    <li className="flex items-start gap-2"><Check size={13} className="text-[#BFFD11] shrink-0 mt-0.5" />Seamless tower handoff for livestock tracking</li>
                                    <li className="flex items-start gap-2"><Check size={13} className="text-[#BFFD11] shrink-0 mt-0.5" />Higher throughput for large FOTA payloads</li>
                                    <li className="flex items-start gap-2"><Check size={13} className="text-[#BFFD11] shrink-0 mt-0.5" />Better for high-frequency weather stations</li>
                                    <li className="flex items-start gap-2"><Check size={13} className="text-[#BFFD11] shrink-0 mt-0.5" />Voice/SMS fallback capability</li>
                                </ul>
                            </div>
                        </div>

                        <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] p-6 mb-6">
                            <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-3">
                                Ruggedizing Identity with eSIM and iSIM
                            </p>
                            <p className="text-sm text-white/55 leading-relaxed mb-4">
                                In remote fields, physical SIM cards are a liability due to corrosion and vibration.
                            </p>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="border-l-2 border-[#BFFD11]/30 pl-4">
                                    <p className="text-sm font-semibold text-white/70 mb-1">eSIM (MFF2)</p>
                                    <p className="text-xs text-white/40">Solderable chips enabling remote carrier switching without site visits.</p>
                                </div>
                                <div className="border-l-2 border-[#53F2FA]/30 pl-4">
                                    <p className="text-sm font-semibold text-white/70 mb-1">iSIM (Integrated SIM)</p>
                                    <p className="text-xs text-white/40">Embedded in SoC — eliminates footprint, reduces BOM, highest vibration and moisture resistance.</p>
                                </div>
                            </div>
                        </div>

                        <InfoCallout type="info">
                            Use a <strong>dual-mode module</strong> (LTE-M + NB-IoT). Configure with{" "}
                            <code className="font-mono bg-white/5 px-1 rounded text-xs">AT+QCFG=&quot;nwscanmode&quot;,0</code> for
                            automatic selection. NB-IoT for static soil nodes, LTE-M for livestock and weather stations — one SKU, two use cases.
                        </InfoCallout>

                        <button
                            onClick={() => markComplete("connectivity")}
                            className="mt-8 px-5 py-2.5 rounded-xl bg-[#BFFD11] text-[#00040F] text-sm font-semibold hover:bg-[#BFFD11] transition-colors cursor-pointer"
                        >
                            Connectivity Chosen — Next Step →
                        </button>
                    </section>
                )}

                {/* ── STEP 3: Hardware Design ── */}
                {activeStep === "hardware" && (
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] bg-[#BFFD11]/10 px-2 py-1 rounded">Step 3</span>
                            <h2 className="text-2xl font-semibold">Design Your Hardware</h2>
                        </div>

                        <p className="text-white/55 leading-relaxed mb-4 max-w-2xl">
                            Agricultural sensors face 24/7 exposure to UV radiation, extreme temperature
                            cycles, and chemical fertilizers. Click any row to expand details.
                        </p>

                        <BOMTable items={bomItems} title="Smart Agriculture BOM" />

                        <div className="mt-8 space-y-4">
                            <h3 className="text-base font-semibold text-white/70 mb-3">Enclosure Engineering</h3>
                            <div className="grid sm:grid-cols-3 gap-4">
                                {[
                                    { icon: Shield, title: "IP67 Minimum", detail: "Dust-tight and immersion-proof. Use EPDM gaskets rated for agricultural chemicals.", color: "#BFFD11" },
                                    { icon: Sun, title: "UV-Stabilized Materials", detail: "Polycarbonate or ASA plastics resist UV degradation for 10–20 years. 316L stainless for livestock.", color: "#53F2FA" },
                                    { icon: Radio, title: "Antenna Clearance", detail: "Soil absorbs RF up to 40 dB. Extend antenna 1–2 m above ground for buried nodes.", color: "#BFFD11" },
                                ].map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={item.title} className="rounded-xl border p-5" style={{ borderColor: `${item.color}20`, background: `${item.color}04` }}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Icon size={15} style={{ color: item.color }} strokeWidth={1.5} />
                                                <p className="font-semibold text-white text-sm">{item.title}</p>
                                            </div>
                                            <p className="text-xs text-white/45 leading-relaxed">{item.detail}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <button
                            onClick={() => markComplete("hardware")}
                            className="mt-8 px-5 py-2.5 rounded-xl bg-[#BFFD11] text-[#00040F] text-sm font-semibold hover:bg-[#BFFD11] transition-colors cursor-pointer"
                        >
                            Hardware Designed — Next Step →
                        </button>
                    </section>
                )}

                {/* ── STEP 4: Solar & Power ── */}
                {activeStep === "power" && (
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] bg-[#BFFD11]/10 px-2 py-1 rounded">Step 4</span>
                            <h2 className="text-2xl font-semibold">Solar Harvesting & Power Management</h2>
                        </div>

                        <p className="text-white/55 leading-relaxed mb-8 max-w-2xl">
                            Combine LiFePO4 batteries with MPPT solar harvesting and aggressive PSM/eDRX
                            power modes for indefinite field operation.
                        </p>

                        <div className="grid sm:grid-cols-3 gap-5 mb-8">
                            <div className="rounded-xl border border-[#BFFD11]/20 bg-[#BFFD11]/4 p-5">
                                <Battery size={18} className="text-[#BFFD11] mb-3" strokeWidth={1.5} />
                                <p className="text-sm font-semibold text-white/75 mb-1">LiFePO4 Battery</p>
                                <p className="text-xs text-white/45 leading-relaxed">
                                    2,000+ charge cycles. Thermally stable from -20°C to +60°C. No thermal runaway risk.
                                </p>
                            </div>
                            <div className="rounded-xl border border-[#53F2FA]/15 bg-[#53F2FA]/3 p-5">
                                <Sun size={18} className="text-[#53F2FA] mb-3" strokeWidth={1.5} />
                                <p className="text-sm font-semibold text-white/75 mb-1">MPPT Controller</p>
                                <p className="text-xs text-white/45 leading-relaxed">
                                    Maximum Power Point Tracking extracts up to 30% more energy from solar panels during cloudy periods vs PWM.
                                </p>
                            </div>
                            <div className="rounded-xl border border-[#BFFD11]/20 bg-[#BFFD11]/4 p-5">
                                <Zap size={18} className="text-[#BFFD11] mb-3" strokeWidth={1.5} />
                                <p className="text-sm font-semibold text-white/75 mb-1">PSM + eDRX</p>
                                <p className="text-xs text-white/45 leading-relaxed">
                                    PSM enables deep hibernation. eDRX extends paging cycles. Together, battery life reaches 10+ years.
                                </p>
                            </div>
                        </div>

                        <CodeBlock
                            language="at"
                            title="Power configuration"
                            code={[
                                { code: `AT+CPSMS=1,,,"01000111","00000100"`, comment: "PSM: T3412=12h, T3324=8s", highlight: true },
                                { code: `AT+CEDRXS=1,5,"0010"`, comment: "eDRX: 20.48s paging cycle" },
                                { code: "" },
                                { code: "// PSM binary: T3412 01000111 = 12 hours TAU" },
                                { code: "// T3324 00000100 = 8 seconds Active Timer" },
                                { code: "// eDRX 0010 = 20.48 second paging window" },
                            ]}
                        />

                        <div className="mt-6 p-5 rounded-xl border border-[#3A3C46]/40 bg-[#060a14]">
                            <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-2">
                                Estimated power autonomy
                            </p>
                            <p className="text-3xl font-semibold text-[#BFFD11]">Indefinite</p>
                            <p className="text-sm text-white/35 mt-1">
                                LiFePO4 6000 mAh + 2W solar panel · 1×/hr reporting · MPPT + PSM
                            </p>
                            <Link href="/learn/power/psm-edrx" className="inline-flex items-center gap-1.5 mt-3 text-xs text-[#BFFD11] hover:underline cursor-pointer">
                                Run the PSM simulator for exact calculations <ArrowRight size={11} />
                            </Link>
                        </div>

                        <button
                            onClick={() => markComplete("power")}
                            className="mt-8 px-5 py-2.5 rounded-xl bg-[#BFFD11] text-[#00040F] text-sm font-semibold hover:bg-[#BFFD11] transition-colors cursor-pointer"
                        >
                            Power Configured — Next Step →
                        </button>
                    </section>
                )}

                {/* ── STEP 5: Firmware ── */}
                {activeStep === "firmware" && (
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] bg-[#BFFD11]/10 px-2 py-1 rounded">Step 5</span>
                            <h2 className="text-2xl font-semibold">Write Your Firmware</h2>
                        </div>

                        <p className="text-white/55 leading-relaxed mb-4 max-w-2xl">
                            Both implementations read SDI-12 soil moisture, analog NPK sensors, and transmit
                            JSON payloads over cellular. Choose your language:
                        </p>

                        <CodeBlock
                            language="at"
                            title="AT command initialization sequence"
                            code={atCommandSteps}
                        />

                        <div className="mt-8">
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
                                            filename="firmware/agriculture_node.py"
                                            code={micropythonFirmware}
                                        />
                                    ),
                                    cpp: (
                                        <CodeBlock
                                            language="cpp"
                                            filename="src/agriculture_node.cpp"
                                            code={cppFirmware}
                                        />
                                    ),
                                }}
                            </InteractiveToggle>
                        </div>

                        <div className="mt-6">
                            <InfoCallout type="warning">
                                <strong>NPK sensor calibration is vendor-specific.</strong> Always validate
                                analog readings against laboratory soil analysis before relying on sensor data
                                for fertilizer decisions. TDR-based sensors are generally more accurate than
                                simple conductivity probes.
                            </InfoCallout>
                        </div>

                        {/* Security checklist */}
                        <div className="mt-10">
                            <h3 className="text-lg font-semibold mb-4">Security Hardening</h3>
                            <p className="text-white/45 leading-relaxed mb-6 text-sm max-w-2xl">
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
                                        <span className="font-mono text-xs text-white/35">{securityScore}%</span>
                                    </div>
                                </div>
                                <div className="divide-y divide-[#3A3C46]/15">
                                    {securityChecklist.map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-4 px-5 py-4 hover:bg-white/[0.015] transition-colors">
                                            <button
                                                onClick={() => toggleSecurity(idx)}
                                                className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all duration-150 cursor-pointer ${checkedSecurity.has(idx) ? "bg-[#BFFD11] border-[#BFFD11]" : "border border-[#3A3C46]/60"
                                                    }`}
                                                aria-label={checkedSecurity.has(idx) ? "Uncheck" : "Check"}
                                            >
                                                {checkedSecurity.has(idx) && <Check size={11} className="text-[#00040F]" strokeWidth={3} />}
                                            </button>
                                            <div className="flex-1">
                                                <p className={`text-sm font-medium transition-colors ${checkedSecurity.has(idx) ? "text-white/40 line-through" : "text-white/80"}`}>
                                                    {item.label}
                                                </p>
                                                <code className="text-[11px] font-mono text-[#BFFD11]/50 mt-0.5 block">{item.cmd}</code>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => markComplete("firmware")}
                            className="mt-4 px-5 py-2.5 rounded-xl bg-[#BFFD11] text-[#00040F] text-sm font-semibold hover:bg-[#BFFD11] transition-colors cursor-pointer"
                        >
                            Firmware & Security Done — Final Step →
                        </button>
                    </section>
                )}

                {/* ── STEP 6: Deploy & Lifecycle ── */}
                {activeStep === "lifecycle" && (
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] bg-[#BFFD11]/10 px-2 py-1 rounded">Step 6</span>
                            <h2 className="text-2xl font-semibold">Deploy & Maintain</h2>
                        </div>

                        <p className="text-white/55 leading-relaxed mb-8 max-w-2xl">
                            Your agriculture node is ready. Scale from pilot to thousands of acres with
                            Zero-Touch Provisioning and delta FOTA updates.
                        </p>

                        <div className="space-y-4 mb-8">
                            {[
                                { title: "Zero-Touch Provisioning (ZTP)", detail: "Each sensor automatically connects to the cloud and downloads its declarative configuration — reporting frequency, alert thresholds, sensor calibration profiles — the moment it is powered on in the field.", color: "#BFFD11" },
                                { title: "Delta FOTA Updates", detail: "For NB-IoT nodes in remote fields, delta updates transmit only the binary difference between firmware versions — reducing payload by 90% and install time by 78%. Critical for preserving battery on low-bandwidth networks.", color: "#53F2FA" },
                                { title: "Secure Sunset & Circular Economy", detail: "Decommissioning requires cryptographic erasure of on-device credentials. Design modular nodes so individual sensors or batteries can be replaced or recycled (WEEE compliance) without scrapping the entire unit.", color: "#BFFD11" },
                            ].map((item) => (
                                <div key={item.title} className="rounded-xl border p-5" style={{ borderColor: `${item.color}20`, background: `${item.color}04` }}>
                                    <p className="text-sm font-semibold text-white/80 mb-2">{item.title}</p>
                                    <p className="text-sm text-white/45 leading-relaxed">{item.detail}</p>
                                </div>
                            ))}
                        </div>

                        {/* Configuration Summary */}
                        <div className="rounded-xl border border-[#BFFD11]/20 bg-[#BFFD11]/4 p-6 mb-8">
                            <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-4">
                                Configuration Summary
                            </p>
                            <div className="grid sm:grid-cols-2 gap-4 text-sm">
                                {[
                                    ["Sensors", "Soil VWC, NPK, Weather"],
                                    ["Connectivity", "NB-IoT + LTE-M dual-mode"],
                                    ["Module", "Quectel BG95-M3"],
                                    ["SIM", "eSIM MFF2 or iSIM"],
                                    ["Battery", "LiFePO4 6000 mAh"],
                                    ["Solar", "2W Mono + MPPT controller"],
                                    ["Enclosure", "IP67 UV-stabilized polycarb"],
                                    ["Power Mode", "PSM 12h + eDRX 20.48s"],
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
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#BFFD11] text-[#00040F] text-sm font-semibold hover:bg-[#BFFD11] transition-colors cursor-pointer"
                            >
                                View Pilot Playbook <ArrowRight size={14} />
                            </Link>
                            <Link
                                href="/learn/power/psm-edrx"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#3A3C46] text-white/70 text-sm font-semibold hover:border-white/30 transition-colors cursor-pointer"
                            >
                                PSM Power Simulator
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
                                onClick={() => markComplete("lifecycle")}
                                className="mt-8 px-5 py-2.5 rounded-xl bg-[#BFFD11] text-[#00040F] text-sm font-semibold hover:bg-[#BFFD11] transition-colors cursor-pointer"
                            >
                                ✓ Mark Build Complete
                            </button>
                        )}

                        {completedSteps.size === steps.length && (
                            <div className="mt-8 rounded-xl border border-[#BFFD11]/30 bg-[#BFFD11]/5 p-6 text-center">
                                <p className="text-lg font-semibold text-[#BFFD11] mb-2">🎉 Build Complete!</p>
                                <p className="text-sm text-white/50 mb-5">You&apos;ve completed all steps for the Smart Agriculture Sensor Node.</p>
                                <Link
                                    href="/build"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#BFFD11] text-[#00040F] text-sm font-semibold hover:bg-[#BFFD11] transition-colors cursor-pointer"
                                >
                                    ← Back to Build Guides
                                </Link>
                            </div>
                        )}
                    </section>
                )}
            </div>

            {/* All Steps Summary Nav */}
            {activeStep !== steps[0].id && (
                <div className="mt-16 pt-8 border-t border-[#3A3C46]/30">
                    <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/25 mb-4">All Steps</p>
                    <div className="grid sm:grid-cols-2 gap-2">
                        {steps.map((step, idx) => (
                            <button
                                key={step.id}
                                onClick={() => setActiveStep(step.id)}
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
                                    <Circle size={13} className="text-[#3A3C46] shrink-0" />
                                )}
                                <span className="font-mono text-xs text-white/25 mr-1">{idx + 1}.</span>
                                {step.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
