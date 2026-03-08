"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ChevronRight, Check, Circle, ArrowRight, HeartPulse, Shield, Cpu, Battery, Zap, Activity, Radio, Lock, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import CodeBlock from "@/components/ui/CodeBlock";
import InfoCallout from "@/components/ui/InfoCallout";
import BOMTable from "@/components/ui/BOMTable";
import InteractiveToggle from "@/components/ui/InteractiveToggle";
import FreePilotCTA from "@/components/ui/FreePilotCTA";

const steps = [
    { id: "architecture", label: "System Architecture" },
    { id: "hardware", label: "Hardware & Sensing" },
    { id: "firmware", label: "Firmware" },
    { id: "connectivity", label: "Connectivity & Security" },
    { id: "cloud", label: "Cloud Integration" },
    { id: "compliance", label: "Compliance & Deploy" },
];

/* ── BOM ── */
const bomItems = [
    {
        category: "SoC / Modem",
        part: "Nordic nRF9160 SiP",
        alternatives: "Quectel BG95-M3",
        rationale: "Integrated LTE-M/NB-IoT, ARM Cortex-M33 with TrustZone, and GPS. Pre-certified for global use.",
        unitCost: "~$12",
        detail: "The nRF9160 combines a cellular modem, application processor, and GPS in a single System-in-Package. ARM TrustZone provides hardware isolation for storing X.509 certificates — critical for HIPAA-compliant mTLS connections.",
    },
    {
        category: "Pressure Sensor",
        part: "NXP MP3V5050GP",
        alternatives: "Honeywell ABPDANT005PGAA5",
        rationale: "High-precision (0–50 kPa) integrated piezoresistive sensor. Output proportional to pressure.",
        unitCost: "~$8",
        detail: "Outputs an analog voltage proportional to cuff pressure. The oscillations we need (heartbeat pulses) are often less than 1% of the total DC signal — requiring a dedicated analog front-end with amplification.",
    },
    {
        category: "Op-Amp (AFE)",
        part: "Microchip MCP6002",
        alternatives: "TI OPA2376",
        rationale: "Low-power, rail-to-rail I/O. Ideal for heartbeat pulse amplification and filtering.",
        unitCost: "~$0.50",
        detail: "Used in a non-inverting configuration to amplify the AC-coupled heartbeat pulses by 100–200×. Combined with an active low-pass filter (5–10 Hz cutoff) to reject motor noise and muscle artifacts.",
    },
    {
        category: "Motor Driver",
        part: "Alpha & Omega AO3400A",
        alternatives: "Infineon BSS138",
        rationale: "Logic-level N-Channel MOSFET to handle ~500mA current of the air pump motor.",
        unitCost: "~$0.30",
        detail: "Drives both the air pump and solenoid valve via PWM. Always include a 1N5819 Schottky flyback diode in parallel with inductive loads to prevent high-voltage spikes that damage the MOSFET.",
    },
    {
        category: "Power Management",
        part: "TI TPS63060",
        alternatives: "Analog Devices LTC3119",
        rationale: "Buck-Boost converter ensures stable 3.3V/5V even as Li-Po voltage drops during high-current events.",
        unitCost: "~$3",
        detail: "The air pump draws 300–500 mA and the cellular modem peaks at 500 mA during TX. A buck-boost converter maintains stable voltage rails. Add 100–220 µF bulk capacitors near both the nRF9160 and pump connector.",
    },
    {
        category: "Security Element",
        part: "Microchip ATECC608B",
        alternatives: "Infineon OPTIGA Trust M",
        rationale: "Hardware-based secure storage for mTLS certificates — adds a layer beyond TrustZone.",
        unitCost: "~$1",
        detail: "Optional but recommended for FDA submissions. Provides tamper-resistant key storage, hardware-accelerated ECDSA signing, and secure boot attestation. Communicates via I2C.",
    },
    {
        category: "Connectivity",
        part: "Hologram MFF2 Embedded SIM",
        alternatives: "Standard nano-SIM (not recommended)",
        rationale: "Solderable SIM for high reliability. Prevents patient tampering in a medical environment.",
        unitCost: "~$2",
        detail: "MFF2 form factor solders directly to the PCB, eliminating the SIM slot. SGP.32 eSIM enables remote carrier switching without physical access — critical for devices deployed in patients' homes.",
    },
];

/* ── AT Command Setup ── */
const atCommandSteps = [
    { code: 'AT+CGDCONT=1,"IP","hologram"', comment: "Set APN (Hologram)", highlight: true },
    { code: "AT+QIACT=1", comment: "Activate PDP context" },
    { code: "AT+CGPADDR", comment: "Verify IP assignment" },
    { code: "" },
    { code: 'AT+QCFG="servicedomain",1', comment: "Packet-switched only (no voice/SMS)" },
    { code: "" },
    { code: 'AT+CPSMS=1,,,"01000111","00000001"', comment: "PSM: T3412=12h, T3324=2s", highlight: true },
    { code: 'AT+CEDRXS=2,4,"0101"', comment: "eDRX: 81.92s paging (for server commands)" },
];

/* ── Firmware: C++ (nRF9160 Zephyr) ── */
const cppFirmware = `#include <zephyr/kernel.h>
#include <zephyr/net/mqtt.h>
#include <zephyr/net/socket.h>
#include <modem/lte_lc.h>

#define MQTT_BROKER  "your-iot-endpoint.amazonaws.com"
#define MQTT_PORT    8883
#define MQTT_TOPIC   "devices/bp_monitor_01/data"

struct bp_reading {
    uint16_t systolic;
    uint16_t diastolic;
    uint16_t pulse;
};

static struct mqtt_client client;
static uint8_t rx_buf[256], tx_buf[256];

void init_modem(void) {
    lte_lc_init_and_connect();
    // Wait for LTE registration...
}

int publish_reading(struct bp_reading data) {
    char payload[100];
    snprintf(payload, sizeof(payload),
             "{\\"sys\\": %d, \\"dia\\": %d, \\"pulse\\": %d}",
             data.systolic, data.diastolic, data.pulse);

    struct mqtt_publish_param param = {
        .message.topic.qos = MQTT_QOS_1_AT_LEAST_ONCE,
        .message.topic.topic.utf8 = MQTT_TOPIC,
        .message.topic.topic.size = strlen(MQTT_TOPIC),
        .message.payload.data = payload,
        .message.payload.len = strlen(payload),
        .message_id = k_uptime_get_32(),
    };
    return mqtt_publish(&client, &param);
}`;

/* ── Firmware: Python (Signal Processing) ── */
const pythonFirmware = `import numpy as np
from scipy.signal import find_peaks, butter, filtfilt

def process_bp_data(raw_pressure, sample_rate=100):
    """
    Oscillometric algorithm for blood pressure extraction.
    raw_pressure: Array of ADC values (0-300 mmHg)
    """
    # 1. Bandpass Filter (0.5–5.0 Hz) to isolate heart pulses
    b, a = butter(2, [0.5, 5.0], btype='bandpass', fs=sample_rate)
    pulses = filtfilt(b, a, raw_pressure)

    # 2. Find Peaks (individual heartbeats)
    peaks, _ = find_peaks(pulses, distance=sample_rate * 0.6)

    # 3. Build Envelope
    peak_amplitudes = pulses[peaks]
    cuff_pressures = raw_pressure[peaks]

    # 4. Identify MAP (Maximum Amplitude)
    max_idx = np.argmax(peak_amplitudes)
    map_val = cuff_pressures[max_idx]
    max_amp = peak_amplitudes[max_idx]

    # 5. Systolic & Diastolic via characteristic ratios
    sys_threshold = 0.55 * max_amp
    dia_threshold = 0.85 * max_amp

    sys_idx = np.where(peak_amplitudes[:max_idx] >= sys_threshold)[0][0]
    systolic = cuff_pressures[sys_idx]

    dia_idx = np.where(peak_amplitudes[max_idx:] <= dia_threshold)[0][0] + max_idx
    diastolic = cuff_pressures[dia_idx]

    return int(systolic), int(diastolic), int(map_val)

# Usage: sys, dia, map_p = process_bp_data(get_adc_buffer())`;

/* ── Security Checklist ── */
const securityChecklist = [
    { label: "X.509 certificates for mutual TLS (mTLS)", cmd: "Stored in nRF9160 Secure Tag" },
    { label: "TLS 1.2/1.3 — no plaintext MQTT (port 1883)", cmd: "Port 8883 only" },
    { label: "Firmware signed with ECDSA/RSA (MCUboot)", cmd: "FOTA integrity" },
    { label: "ARM TrustZone partition for crypto keys", cmd: "Secure Partition Manager" },
    { label: "PS-only mode — disable voice/SMS", cmd: 'AT+QCFG="servicedomain",1' },
    { label: "Hardware watchdog for modem hang recovery", cmd: "nRF9160 internal WDT" },
    { label: "Software Bill of Materials (SBOM) documented", cmd: "FDA Section 524B" },
    { label: "Coordinated Vulnerability Disclosure plan", cmd: "MDCG 2019-16" },
];

/* ── Power Budget ── */
const powerBudget = [
    { operation: "Deep Sleep (PSM)", current: "7 µA", duration: "23.9 hrs", energy: "0.6 mA·s", note: "Modem in Power Saving Mode" },
    { operation: "Pneumatic Inflation", current: "450 mA", duration: "25 sec", energy: "11,250 mA·s", note: "Motor + MCU processing" },
    { operation: "Deflation / Sensing", current: "80 mA", duration: "35 sec", energy: "2,800 mA·s", note: "Valve control + ADC sampling" },
    { operation: "LTE-M Attach", current: "120 mA", duration: "10 sec", energy: "1,200 mA·s", note: "Initial network handshake" },
    { operation: "MQTT TLS Publish", current: "150 mA", duration: "3 sec", energy: "450 mA·s", note: "Encrypted payload TX" },
    { operation: "UI / Overhead", current: "20 mA", duration: "60 sec", energy: "1,200 mA·s", note: "Screen, LED, idle" },
];

/* ── Risk Matrix (FMEA) ── */
const riskMatrix = [
    { mode: "LTE Signal Loss", effect: "Reading never reaches clinician", severity: 4, probability: 3, mitigation: "Store-and-Forward: persist in Flash with 'Sync Pending' flag, retry on next handshake." },
    { mode: "Man-in-the-Middle", effect: "Patient data intercepted/spoofed", severity: 5, probability: 1, mitigation: "Mutual TLS (mTLS) with X.509 certificates on both device and server." },
    { mode: "Clock Drift", effect: "Invalid timestamps on readings", severity: 3, probability: 2, mitigation: "Sync RTC with network time (NITZ) on every modem attach." },
    { mode: "Modem Hang", effect: "Device unresponsive, battery drain", severity: 2, probability: 2, mitigation: "Hardware watchdog hard-resets modem if ping fails for >1 hour." },
    { mode: "SIM Failure", effect: "Physical SIM dislodges", severity: 3, probability: 1, mitigation: "Use eSIM (MFF2) — industrial-grade soldered SIM." },
    { mode: "Over-inflation", effect: "Patient discomfort/safety risk", severity: 5, probability: 1, mitigation: "Mechanical relief valve + hardware pressure switch cuts power at 300 mmHg." },
];

export default function RemotePatientMonitoringPage() {
    const [activeStep, setActiveStep] = useState("architecture");
    const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
    const [expandedBom, setExpandedBom] = useState<number | null>(null);
    const [checkedSecurity, setCheckedSecurity] = useState<Set<number>>(new Set());
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
                <ChevronRight size={12} />
                <span className="text-[#BFFD11]">Remote Patient Monitoring</span>
            </nav>

            {/* Hero */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div
                            className="w-10 h-10 rounded-[8px] flex items-center justify-center"
                            style={{ background: "rgba(191,253,17,0.1)", border: "1px solid rgba(191,253,17,0.2)" }}
                        >
                            <HeartPulse size={18} color="#BFFD11" strokeWidth={1.75} />
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-[#BFFD11]">
                                Build Guide
                            </span>
                            <span className="text-[10px] font-mono font-semibold tracking-wider uppercase px-2 py-0.5 rounded text-[#53F2FA] bg-[#53F2FA]/10">
                                Advanced
                            </span>
                            <span className="text-[11px] text-white/30 font-mono">35 min</span>
                        </div>
                    </div>
                    <h1 className="text-4xl font-semibold mb-5 leading-tight">
                        Remote Patient Monitoring
                    </h1>
                    <p className="text-lg text-white/55 leading-relaxed max-w-2xl">
                        Build a cellular-connected blood pressure monitor for remote patient monitoring &mdash; oscillometric sensing,
                        HIPAA-compliant MQTT over mTLS, store-and-forward reliability, and FDA Class II design controls.
                    </p>
                </div>
                <div className="hidden lg:flex justify-center items-center">
                    <img
                        src="/rpm_hero.png"
                        alt="Remote Patient Monitoring Illustration"
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

            {/* Step Content */}
            <div className="space-y-16">

                {/* ── STEP 1: System Architecture ── */}
                {activeStep === "architecture" && (
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] bg-[#BFFD11]/10 px-2 py-1 rounded">Step 1</span>
                            <h2 className="text-2xl font-semibold">System Architecture</h2>
                        </div>

                        <p className="text-white/55 leading-relaxed mb-8 max-w-2xl">
                            A robust RPM device requires a &ldquo;sensor-to-cloud&rdquo; pipeline that prioritizes data integrity,
                            power efficiency, and HIPAA/GDPR compliance. Cellular IoT (LTE-M) ensures patients &mdash;
                            particularly the elderly &mdash; don&apos;t need to manage Wi-Fi credentials or smartphone pairing.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4 mb-8">
                            {[
                                { icon: Cpu, title: "MCU / Radio", value: "Nordic nRF9160 SiP", detail: "Integrated LTE-M/NB-IoT modem + ARM Cortex-M33 with TrustZone.", color: "#BFFD11" },
                                { icon: Activity, title: "Sensor Interface", value: "Oscillometric Pressure", detail: "Standard for non-invasive blood pressure (NIBP) measurement.", color: "#53F2FA" },
                                { icon: Radio, title: "Connectivity", value: "LTE-M (Cat-M1)", detail: "Supports mobility and higher throughput for FOTA updates.", color: "#BFFD11" },
                                { icon: Lock, title: "Protocol", value: "MQTT over TLS 1.2/1.3", detail: "Lightweight pub/sub model with robust encryption for HIPAA.", color: "#53F2FA" },
                            ].map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.title} className="rounded-xl border p-5" style={{ borderColor: `${item.color}20`, background: `${item.color}04` }}>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${item.color}12`, border: `1px solid ${item.color}25` }}>
                                                <Icon size={15} style={{ color: item.color }} strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-mono uppercase tracking-widest text-white/30">{item.title}</p>
                                                <p className="text-sm font-semibold" style={{ color: item.color }}>{item.value}</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-white/45 leading-relaxed">{item.detail}</p>
                                    </div>
                                );
                            })}
                        </div>

                        <InfoCallout type="info">
                            <strong>Why cellular over Wi-Fi?</strong> RPM devices serve elderly patients who may not have reliable Wi-Fi.
                            Cellular connectivity is &ldquo;zero-config&rdquo; &mdash; power on and it works. No SSID, no passwords, no IT support calls.
                        </InfoCallout>

                        <button
                            onClick={() => markComplete("architecture")}
                            className="mt-8 px-5 py-2.5 rounded-xl bg-[#BFFD11] text-[#00040F] text-sm font-semibold hover:bg-[#BFFD11] transition-colors cursor-pointer"
                        >
                            Architecture Reviewed — Next Step →
                        </button>
                    </section>
                )}

                {/* ── STEP 2: Hardware & Sensing ── */}
                {activeStep === "hardware" && (
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] bg-[#BFFD11]/10 px-2 py-1 rounded">Step 2</span>
                            <h2 className="text-2xl font-semibold">Hardware Design &amp; Sensing</h2>
                        </div>

                        <p className="text-white/55 leading-relaxed mb-4 max-w-2xl">
                            The core sensing mechanism involves an integrated pressure transducer and an air pump
                            control circuit. The MCU controls two pneumatic components: a DC Motor Pump (inflate) and a Solenoid Valve (deflate).
                        </p>

                        <BOMTable items={bomItems} title="RPM Blood Pressure Monitor BOM" />

                        <div className="mt-8 space-y-4">
                            <h3 className="text-base font-semibold text-white/70 mb-3">Signal Chain &amp; Analog Front-End</h3>
                            <div className="grid sm:grid-cols-3 gap-4">
                                {[
                                    { title: "DC Pressure Path", detail: "Connect sensor output directly to ADC. Measures absolute cuff pressure (0–300 mmHg). Use voltage divider if sensor is 5V and MCU is 3.3V.", color: "#BFFD11" },
                                    { title: "AC Pulse Path", detail: "High-pass filter strips DC, Op-Amp amplifies pulses 100–200×, active low-pass filter (5–10 Hz) rejects motor noise. This is where the algorithm 'sees' heartbeats.", color: "#53F2FA" },
                                    { title: "PWM Pump Control", detail: "Drive pump MOSFET with PWM for 'soft start' — reduces initial current surge and noise. Solenoid valve controls 2–3 mmHg/sec deflation rate.", color: "#BFFD11" },
                                ].map((item) => (
                                    <div key={item.title} className="rounded-xl border p-5" style={{ borderColor: `${item.color}20`, background: `${item.color}04` }}>
                                        <p className="text-sm font-semibold text-white/80 mb-2">{item.title}</p>
                                        <p className="text-xs text-white/45 leading-relaxed">{item.detail}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <InfoCallout type="warning">
                            <strong>Safety Fail-Safe:</strong> For FDA compliance, include a mechanical or secondary electronic pressure switch
                            that cuts power to the pump if pressure exceeds 300 mmHg — independent of the MCU software.
                        </InfoCallout>

                        <button
                            onClick={() => markComplete("hardware")}
                            className="mt-8 px-5 py-2.5 rounded-xl bg-[#BFFD11] text-[#00040F] text-sm font-semibold hover:bg-[#BFFD11] transition-colors cursor-pointer"
                        >
                            Hardware Designed — Next Step →
                        </button>
                    </section>
                )}

                {/* ── STEP 3: Firmware ── */}
                {activeStep === "firmware" && (
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] bg-[#BFFD11]/10 px-2 py-1 rounded">Step 3</span>
                            <h2 className="text-2xl font-semibold">Firmware Development</h2>
                        </div>

                        <p className="text-white/55 leading-relaxed mb-6 max-w-2xl">
                            The firmware manages three concurrent states: Sensing (inflate/deflate/sample),
                            Processing (oscillometric algorithm), and Transmission (MQTT over TLS).
                        </p>

                        <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] p-5 mb-6">
                            <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-4">Measurement Logic</p>
                            <div className="space-y-3">
                                {[
                                    { step: "1", title: "Inflation", detail: "Drive PWM signal to pump until cuff reaches ~180 mmHg." },
                                    { step: "2", title: "Deflation", detail: "Open solenoid valve slowly (2–3 mmHg per second)." },
                                    { step: "3", title: "Oscillometric Sampling", detail: "MCU samples pressure sensor at ~100 Hz. Identify the 'envelope' of pulses. Systolic = rapid increase point. Diastolic = rapid diminish point." },
                                    { step: "4", title: "Data Packaging", detail: "Encode Systolic, Diastolic, and Pulse Rate into compact JSON or Protobuf payload (<100 bytes)." },
                                ].map((item) => (
                                    <div key={item.step} className="flex gap-4">
                                        <div className="w-7 h-7 rounded-full bg-[#BFFD11]/10 border border-[#BFFD11]/25 flex items-center justify-center shrink-0">
                                            <span className="text-xs font-mono text-[#BFFD11]">{item.step}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white/75">{item.title}</p>
                                            <p className="text-xs text-white/40 mt-0.5">{item.detail}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <InteractiveToggle
                            tabs={[
                                { key: "cpp", label: "C++ (Zephyr RTOS)" },
                                { key: "python", label: "Python (Signal Processing)" },
                            ]}
                            defaultTab="cpp"
                            label="Firmware Language"
                        >
                            {{
                                cpp: (
                                    <CodeBlock
                                        code={cppFirmware}
                                        language="cpp"
                                        title="nRF9160 MQTT Implementation"
                                    />
                                ),
                                python: (
                                    <CodeBlock
                                        code={pythonFirmware}
                                        language="python"
                                        title="Oscillometric Algorithm (SciPy)"
                                    />
                                ),
                            }}
                        </InteractiveToggle>

                        <div className="mb-6" />

                        <InfoCallout type="tip">
                            <strong>Binary payloads:</strong> While examples use JSON for readability, using Protocol Buffers or CBOR
                            reduces data overhead by up to 60% — significantly extending battery life and reducing monthly cellular costs.
                        </InfoCallout>

                        <button
                            onClick={() => markComplete("firmware")}
                            className="mt-8 px-5 py-2.5 rounded-xl bg-[#BFFD11] text-[#00040F] text-sm font-semibold hover:bg-[#BFFD11] transition-colors cursor-pointer"
                        >
                            Firmware Written — Next Step →
                        </button>
                    </section>
                )}

                {/* ── STEP 4: Connectivity & Security ── */}
                {activeStep === "connectivity" && (
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] bg-[#BFFD11]/10 px-2 py-1 rounded">Step 4</span>
                            <h2 className="text-2xl font-semibold">Connectivity &amp; Security</h2>
                        </div>

                        <p className="text-white/55 leading-relaxed mb-6 max-w-2xl">
                            Cellular IoT devices must never communicate over open internet.
                            Security is paramount for HIPAA/GDPR compliance. Configure PSM and eDRX for power optimization.
                        </p>

                        <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] mb-8 overflow-hidden">
                            <div className="px-5 py-4 border-b border-[#3A3C46]/30">
                                <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-[#BFFD11]">AT Command Setup</p>
                            </div>
                            <div className="p-5 space-y-1.5 font-mono text-sm">
                                {atCommandSteps.map((step, i) =>
                                    step.code === "" ? (
                                        <div key={i} className="h-3" />
                                    ) : (
                                        <div key={i} className={`flex items-start gap-3 ${step.highlight ? "text-[#BFFD11]" : "text-white/55"}`}>
                                            <code className="shrink-0">{step.code}</code>
                                            {step.comment && <span className="text-white/25 text-xs mt-0.5">// {step.comment}</span>}
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Security checklist */}
                        <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] p-6 mb-6">
                            <div className="flex items-center justify-between mb-5">
                                <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-[#BFFD11]">
                                    Security &amp; Compliance Checklist
                                </p>
                                <span className="text-xs font-mono" style={{ color: securityScore === 100 ? "#BFFD11" : "#53F2FA" }}>
                                    {securityScore}%
                                </span>
                            </div>
                            <div className="space-y-2">
                                {securityChecklist.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => toggleSecurity(idx)}
                                        className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors cursor-pointer hover:bg-white/3"
                                    >
                                        <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-colors ${checkedSecurity.has(idx) ? "bg-[#BFFD11] border-[#BFFD11]" : "border-[#3A3C46]"}`}>
                                            {checkedSecurity.has(idx) && <Check size={12} className="text-[#00040F]" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${checkedSecurity.has(idx) ? "text-white/40 line-through" : "text-white/70"}`}>{item.label}</p>
                                            <p className="text-xs text-white/25 font-mono mt-0.5">{item.cmd}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => markComplete("connectivity")}
                            className="mt-8 px-5 py-2.5 rounded-xl bg-[#BFFD11] text-[#00040F] text-sm font-semibold hover:bg-[#BFFD11] transition-colors cursor-pointer"
                        >
                            Security Hardened — Next Step →
                        </button>
                    </section>
                )}

                {/* ── STEP 5: Cloud Integration ── */}
                {activeStep === "cloud" && (
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] bg-[#BFFD11]/10 px-2 py-1 rounded">Step 5</span>
                            <h2 className="text-2xl font-semibold">Cloud Integration &amp; Data Flow</h2>
                        </div>

                        <p className="text-white/55 leading-relaxed mb-8 max-w-2xl">
                            Once the device publishes to an IoT Core (AWS IoT, Azure IoT Hub), the data flows through
                            validation, persistence, and downstream APIs to the clinician&apos;s dashboard.
                        </p>

                        <div className="space-y-3 mb-8">
                            {[
                                { step: "1", title: "Ingestion", detail: "IoT Core validates the X.509 certificate chain and accepts the MQTT message.", color: "#BFFD11" },
                                { step: "2", title: "Rule Engine", detail: "A serverless function (AWS Lambda) triggers upon data arrival for validation and alerting.", color: "#53F2FA" },
                                { step: "3", title: "Persistence", detail: "Store in HIPAA-compliant database (DynamoDB or MongoDB Atlas with encryption at rest).", color: "#BFFD11" },
                                { step: "4", title: "Clinician API", detail: "REST or GraphQL API serves the data to the clinician's dashboard with role-based access control.", color: "#53F2FA" },
                            ].map((item) => (
                                <div key={item.step} className="flex gap-4 rounded-xl border p-5" style={{ borderColor: `${item.color}20`, background: `${item.color}04` }}>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}>
                                        <span className="text-xs font-mono font-bold" style={{ color: item.color }}>{item.step}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white/80">{item.title}</p>
                                        <p className="text-xs text-white/45 mt-1 leading-relaxed">{item.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] p-6 mb-6">
                            <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-4">
                                Store-and-Forward Pattern
                            </p>
                            <p className="text-sm text-white/55 leading-relaxed mb-4">
                                For medical devices, &ldquo;Connectivity is Optional, Measurement is Mandatory.&rdquo;
                            </p>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {[
                                    { title: "Flash Write First", detail: "Data is written to NVS partition immediately after measurement — before any transmission attempt." },
                                    { title: "TX with Retry", detail: "On MQTT PUBACK success, mark record as 'Sent.' On failure, sleep modem and retry in 30 minutes." },
                                    { title: "Buffer Alert", detail: "If internal buffer reaches 90% capacity, display 'Memory Full — Move to Better Signal' on the LCD." },
                                    { title: "Priority Sync", detail: "If battery is critically low, batch-upload all stored readings in a single TLS session to minimize TX time." },
                                ].map((item) => (
                                    <div key={item.title} className="border-l-2 border-[#BFFD11]/30 pl-4">
                                        <p className="text-sm font-semibold text-white/70 mb-1">{item.title}</p>
                                        <p className="text-xs text-white/40">{item.detail}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => markComplete("cloud")}
                            className="mt-8 px-5 py-2.5 rounded-xl bg-[#BFFD11] text-[#00040F] text-sm font-semibold hover:bg-[#BFFD11] transition-colors cursor-pointer"
                        >
                            Cloud Configured — Next Step →
                        </button>
                    </section>
                )}

                {/* ── STEP 6: Compliance & Deploy ── */}
                {activeStep === "compliance" && (
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] bg-[#BFFD11]/10 px-2 py-1 rounded">Step 6</span>
                            <h2 className="text-2xl font-semibold">Compliance &amp; Deployment</h2>
                        </div>

                        <p className="text-white/55 leading-relaxed mb-8 max-w-2xl">
                            Moving from prototype to regulated medical device requires FDA 510(k) / EU MDR documentation,
                            clinical validation, and FMEA risk analysis for the cellular subsystem.
                        </p>

                        {/* Regulatory Testing */}
                        <div className="grid sm:grid-cols-2 gap-4 mb-8">
                            {[
                                { code: "IEC 60601-1", title: "Basic Safety", detail: "General requirements for medical electrical equipment safety and essential performance." },
                                { code: "IEC 60601-1-2", title: "EMC Compatibility", detail: "Ensuring cellular radio doesn't interfere with other medical equipment." },
                                { code: "IEC 80601-2-30", title: "BP Monitor Specific", detail: "Particular requirements for automated non-invasive blood pressure monitors." },
                                { code: "FCC Part 15/24", title: "RF Compliance", detail: "Radio frequency interference and cellular band compliance." },
                            ].map((item) => (
                                <div key={item.code} className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] p-5">
                                    <code className="text-xs font-mono text-[#53F2FA] mb-1 block">{item.code}</code>
                                    <p className="text-sm font-semibold text-white/75 mb-1">{item.title}</p>
                                    <p className="text-xs text-white/40 leading-relaxed">{item.detail}</p>
                                </div>
                            ))}
                        </div>

                        {/* Risk Matrix */}
                        <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] overflow-hidden mb-8">
                            <div className="px-5 py-4 border-b border-[#3A3C46]/30">
                                <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-[#BFFD11]">
                                    FMEA Risk Matrix — Cellular Subsystem
                                </p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-white/30 text-xs font-mono">
                                            <th className="px-5 py-3">Failure Mode</th>
                                            <th className="px-5 py-3">Sev</th>
                                            <th className="px-5 py-3">Prob</th>
                                            <th className="px-5 py-3">Mitigation</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {riskMatrix.map((r) => (
                                            <tr key={r.mode} className="border-t border-[#3A3C46]/20">
                                                <td className="px-5 py-3 text-white/70 font-medium">{r.mode}</td>
                                                <td className="px-5 py-3">
                                                    <span className={`text-xs font-mono font-bold ${r.severity >= 4 ? "text-red-400" : "text-yellow-400"}`}>{r.severity}</span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className="text-xs font-mono text-white/40">{r.probability}</span>
                                                </td>
                                                <td className="px-5 py-3 text-white/45 text-xs leading-relaxed max-w-xs">{r.mitigation}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Power Budget */}
                        <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] overflow-hidden mb-8">
                            <div className="px-5 py-4 border-b border-[#3A3C46]/30">
                                <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-[#BFFD11]">
                                    Power Budget — 3 Measurements/Day
                                </p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-white/30 text-xs font-mono">
                                            <th className="px-5 py-3">Operation</th>
                                            <th className="px-5 py-3">Current</th>
                                            <th className="px-5 py-3">Duration</th>
                                            <th className="px-5 py-3">Energy</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {powerBudget.map((p) => (
                                            <tr key={p.operation} className="border-t border-[#3A3C46]/20">
                                                <td className="px-5 py-3 text-white/70 font-medium">{p.operation}</td>
                                                <td className="px-5 py-3 font-mono text-xs text-[#BFFD11]">{p.current}</td>
                                                <td className="px-5 py-3 text-white/40 text-xs">{p.duration}</td>
                                                <td className="px-5 py-3 text-white/45 text-xs">{p.energy}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-5 py-4 border-t border-[#BFFD11]/15 bg-[#BFFD11]/3">
                                <div className="flex flex-wrap gap-6 text-sm">
                                    <div>
                                        <span className="text-white/40">Daily consumption:</span>{" "}
                                        <span className="font-mono font-semibold text-[#BFFD11]">~14.1 mAh</span>
                                    </div>
                                    <div>
                                        <span className="text-white/40">Battery (2000 mAh):</span>{" "}
                                        <span className="font-mono font-semibold text-[#BFFD11]">~113 days</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Config Summary */}
                        <div className="rounded-xl border border-[#BFFD11]/20 bg-[#BFFD11]/4 p-6 mb-8">
                            <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-4">
                                Configuration Summary
                            </p>
                            <div className="grid sm:grid-cols-2 gap-4 text-sm">
                                {[
                                    ["Classification", "FDA Class II / MDR Class IIa"],
                                    ["Connectivity", "LTE-M (Cat-M1)"],
                                    ["Module", "Nordic nRF9160 SiP"],
                                    ["SIM", "MFF2 Embedded eSIM"],
                                    ["Protocol", "MQTT over TLS 1.2/1.3"],
                                    ["Security", "mTLS + X.509 + TrustZone"],
                                    ["Battery", "2000 mAh Li-Po (~113 days)"],
                                    ["Power Mode", "PSM 12h + eDRX 81.92s"],
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
                                href="/learn/security/endpoint"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#3A3C46] text-white/70 text-sm font-semibold hover:border-white/30 transition-colors cursor-pointer"
                            >
                                Security Audit Checklist
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
                                onClick={() => markComplete("compliance")}
                                className="mt-8 px-5 py-2.5 rounded-xl bg-[#BFFD11] text-[#00040F] text-sm font-semibold hover:bg-[#BFFD11] transition-colors cursor-pointer"
                            >
                                ✓ Mark Build Complete
                            </button>
                        )}

                        {completedSteps.size === steps.length && (
                            <div className="mt-8 rounded-xl border border-[#BFFD11]/30 bg-[#BFFD11]/5 p-6 text-center">
                                <p className="text-lg font-semibold text-[#BFFD11] mb-2">🎉 Build Complete!</p>
                                <p className="text-sm text-white/50 mb-5">You&apos;ve completed all steps for the Remote Patient Monitoring device.</p>
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

            {/* All Steps Nav */}
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
