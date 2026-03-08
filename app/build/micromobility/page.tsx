"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Check, ArrowLeft, ArrowRight, Bike, Cpu, Battery, Radio, MapPin, Wifi, Zap, Settings } from "lucide-react";
import CodeBlock from "@/components/ui/CodeBlock";
import InfoCallout from "@/components/ui/InfoCallout";
import BOMTable from "@/components/ui/BOMTable";
import InteractiveToggle from "@/components/ui/InteractiveToggle";
import FreePilotCTA from "@/components/ui/FreePilotCTA";
import BuildGuideShell, { SectionHeader, MarkCompleteButton } from "@/components/ui/BuildGuideShell";

const steps = [
    { id: "architecture", label: "System Architecture" },
    { id: "connectivity", label: "Cellular & SIM" },
    { id: "hardware", label: "Select Hardware" },
    { id: "positioning", label: "GNSS & Positioning" },
    { id: "firmware", label: "Firmware & Protocols" },
    { id: "security", label: "Security & Certification" },
    { id: "deploy", label: "Deploy" },
];

/* ── Motor Control Comparison ── */
const motorControlComparison = [
    { feature: "Current Waveform", trapezoidal: "Non-sinusoidal pulses", foc: "Pure sine wave" },
    { feature: "Efficiency", trapezoidal: "85–90%", foc: "95–98%" },
    { feature: "Torque Ripple", trapezoidal: "High (causes vibration)", foc: "Extremely low" },
    { feature: "Acoustic Noise", trapezoidal: 'Distinct "hum"', foc: "Near silent" },
    { feature: "Complexity", trapezoidal: "Low; simple logic", foc: "High; requires DSP" },
    { feature: "Feedback Needs", trapezoidal: "6-step commutation", foc: "High-res encoder/Hall" },
];

/* ── Network Standard Comparison ── */
const networkComparison = [
    { standard: "NB-IoT", bandwidth: "~250 kbps", latency: "High (sec)", mobility: "None", power: "Ultra-High" },
    { standard: "LTE-M (Cat-M1)", bandwidth: "~1 Mbps", latency: "Low (ms)", mobility: "Full Handover", power: "High" },
    { standard: "LTE Cat 1bis", bandwidth: "10 Mbps", latency: "Low (ms)", mobility: "Full Handover", power: "Moderate" },
    { standard: "LTE Cat 4", bandwidth: "150 Mbps", latency: "Very Low", mobility: "Full Handover", power: "Low" },
];

/* ── BOM ── */
const bomItems = [
    {
        category: "IoT SoC / Modem",
        part: "Nordic nRF9160 SiP",
        alternatives: "nRF9151, Quectel BG95-M3",
        rationale: "Unified application MCU (Cortex-M33 + TrustZone) + LTE-M/NB-IoT modem + GNSS in a single 10×16 mm package.",
        unitCost: "~$12",
        detail:
            "System-in-Package integrating application processor, modem, and GNSS. ARM TrustZone hardware isolation for cryptographic operations. PSM + eDRX for deep sleep while remaining network-registered. Ideal for compact placement in handlebars or neck of scooter.",
    },
    {
        category: "Motor Controller",
        part: "ARM Cortex-M4 MCU (STM32F4)",
        alternatives: "STM32G4, TI TMS320",
        rationale: "Hardware DSP instructions for real-time FOC calculations. Dedicated motor control timers and ADCs.",
        unitCost: "~$5",
        detail:
            "The MCU executes Clarke and Park transformations at high speed for Field-Oriented Control. Separate from IoT SoC to isolate power electronics from connectivity logic. Communicates with IoT brain over CAN bus or UART.",
    },
    {
        category: "GNSS Module",
        part: "Quectel LC29H (L1+L5)",
        alternatives: "u-blox ZED-F9P (RTK)",
        rationale: "Dual-band reception mitigates urban canyon multipath. Sub-meter accuracy without RTK.",
        unitCost: "~$15",
        detail:
            "Dual-band L1+L5 eliminates multipath errors from building reflections in dense cities. Integrated 6-axis IMU for dead reckoning in GNSS-denied areas (tunnels, alleys). RTK-ready for centimeter-level parking enforcement.",
    },
    {
        category: "SIM",
        part: "eSIM MFF2 (eUICC)",
        alternatives: "iSIM (integrated into SoC)",
        rationale: "Soldered chip — vibration-proof, tamper-resistant. Remote carrier switching OTA for international fleets.",
        unitCost: "~$2",
        detail:
            "MFF2 solders to motherboard, eliminating the SIM slot vulnerable to theft and corrosion. eUICC enables remote SIM provisioning — change carrier profiles OTA without physical access. Critical for fleets operating across multiple countries.",
    },
    {
        category: "Battery Pack",
        part: "36V/48V Li-ion (21700 cells)",
        alternatives: "18650 cells (lower capacity)",
        rationale: "High energy density for 40–60 km range. BMS with per-cell monitoring, balancing, and SOC/SOH reporting.",
        unitCost: "~$80",
        detail:
            "21700 cells provide ~30% more capacity than 18650 in similar volume. BMS performs individual cell voltage monitoring, pack current sensing, multi-point temperature tracking, Coulomb counting for SOC, and capacity degradation tracking for SOH.",
    },
    {
        category: "Cellular Antenna",
        part: "Taoglas FXP73 Flex Antenna",
        alternatives: "Embedded PCB antenna",
        rationale: "LTE-M + NB-IoT broadband coverage 698–2690 MHz. Adhesive mount fits inside handlebars.",
        unitCost: "~$3",
        detail:
            "Flexible PCB antenna with adhesive backing fits inside the narrow scooter neck or handlebar tube. For Cat 1bis deployments requiring higher throughput, a single external antenna is sufficient (no MIMO needed for single-antenna Cat 1bis).",
    },
];

/* ── Protocol Comparison ── */
const protocolComparison = [
    { feature: "Application Logic", mqtt: "Custom JSON payloads", lwm2m: "Standardized Objects (IPSO)" },
    { feature: "Transport", mqtt: "TCP (session overhead)", lwm2m: "UDP (stateless, efficient)" },
    { feature: "Radio Wake-up", mqtt: "Longer (TCP handshake)", lwm2m: "Shorter (stateless)" },
    { feature: "Device Management", mqtt: "Vendor-specific", lwm2m: "Native (OMA Standard)" },
    { feature: "FOTA", mqtt: "Proprietary implementation", lwm2m: "Built-in specification" },
    { feature: "Security", mqtt: "TLS (higher overhead)", lwm2m: "DTLS (optimized for IoT)" },
];

/* ── AT Command Setup ── */
const atCommandSteps = [
    { code: 'AT+CGDCONT=1,"IP","hologram"', comment: "Set APN (Hologram)", highlight: true },
    { code: "AT+QIACT=1", comment: "Activate PDP context" },
    { code: "AT+CGPADDR", comment: "Verify IP assignment" },
    { code: "" },
    { code: 'AT+QCFG="nwscanmode",3', comment: "LTE-M only (mobility required)" },
    { code: 'AT+QCFG="servicedomain",1', comment: "Packet-switched only" },
    { code: "" },
    { code: 'AT+CPSMS=1,,,"00100001","00000010"', comment: "PSM: T3412=1h, T3324=4s", highlight: true },
    { code: 'AT+CEDRXS=1,5,"0010"', comment: "eDRX: 20.48s paging cycle" },
    { code: "" },
    { code: "AT+QGPS=1", comment: "Enable GNSS receiver" },
];

/* ── Firmware Snippets ── */
const zephyrFirmware = `#include <zephyr/kernel.h>
#include <zephyr/device.h>
#include <zephyr/drivers/uart.h>
#include <zephyr/net/mqtt.h>
#include <modem/lte_lc.h>
#include <modem/nrf_modem_lib.h>
#include <nrf_modem_gnss.h>

LOG_MODULE_REGISTER(micromobility, LOG_LEVEL_INF);

/* Device shadow state */
static struct {
    bool locked;
    float speed_limit;   /* km/h — set by geofence */
    float battery_soc;
    double lat, lon;
} vehicle_state = {
    .locked = true,
    .speed_limit = 25.0f,
};

/* LTE-M initialization */
static int modem_init(void) {
    int err = nrf_modem_lib_init();
    if (err) {
        LOG_ERR("Modem init failed: %d", err);
        return err;
    }

    /* Configure PSM: T3412=1h, T3324=4s */
    err = lte_lc_psm_req(true);
    if (err) {
        LOG_WRN("PSM request failed: %d", err);
    }

    /* Connect LTE-M only (mobility support) */
    err = lte_lc_connect();
    if (err) {
        LOG_ERR("LTE connect failed: %d", err);
        return err;
    }

    LOG_INF("LTE-M connected");
    return 0;
}

/* GNSS position callback */
static void gnss_event_handler(int event) {
    if (event == NRF_MODEM_GNSS_EVT_PVT) {
        struct nrf_modem_gnss_pvt_data_frame pvt;
        nrf_modem_gnss_read(&pvt, sizeof(pvt),
                           NRF_MODEM_GNSS_DATA_PVT);
        if (pvt.flags & NRF_MODEM_GNSS_PVT_FLAG_FIX_VALID) {
            vehicle_state.lat = pvt.latitude;
            vehicle_state.lon = pvt.longitude;
            LOG_INF("Fix: %.6f, %.6f", pvt.latitude, pvt.longitude);
        }
    }
}

void main(void) {
    LOG_INF("Micromobility IoT Brain starting...");

    /* Initialize modem and GNSS */
    modem_init();
    nrf_modem_gnss_event_handler_set(gnss_event_handler);
    nrf_modem_gnss_start();

    /* Main telemetry loop */
    while (1) {
        /* Read BMS data over CAN/UART */
        // vehicle_state.battery_soc = bms_read_soc();

        /* Publish telemetry */
        // mqtt_publish_telemetry(&vehicle_state);

        /* Check device shadow for unlock commands */
        // mqtt_check_shadow_delta(&vehicle_state);

        k_sleep(K_SECONDS(10));
    }
}`;

const canBusFirmware = `/* CAN Bus communication between MCU and IoT Brain */
#include <zephyr/drivers/can.h>

#define BMS_SOC_ID     0x100
#define BMS_VOLTAGE_ID 0x101
#define BMS_TEMP_ID    0x102
#define MCU_SPEED_ID   0x200
#define MCU_UNLOCK_ID  0x201

struct can_frame tx_frame, rx_frame;
const struct device *can_dev;

/* Read BMS State of Charge from CAN */
float bms_read_soc(void) {
    struct can_frame frame;
    can_send(can_dev, &(struct can_frame){
        .id = BMS_SOC_ID,
        .dlc = 0,
        .flags = CAN_FRAME_RTR,  /* Remote request */
    }, K_MSEC(100), NULL, NULL);

    if (can_receive(can_dev, &frame, K_MSEC(500)) == 0) {
        /* BMS responds with SOC as uint8 percentage */
        return frame.data[0] / 100.0f;
    }
    return -1.0f;
}

/* Send unlock command to Motor Controller */
void mcu_send_unlock(float speed_limit_kmh) {
    struct can_frame frame = {
        .id = MCU_UNLOCK_ID,
        .dlc = 4,
    };
    /* Pack speed limit as float32 */
    memcpy(frame.data, &speed_limit_kmh, sizeof(float));
    can_send(can_dev, &frame, K_MSEC(100), NULL, NULL);
}

/* Geofence speed override */
void apply_geofence_speed(double lat, double lon) {
    /* Check if position is in slow zone */
    // float limit = geofence_lookup(lat, lon);
    // mcu_send_unlock(limit);
}`;

/* ── Security Checklist ── */
const securityChecklist = [
    { label: "eSIM MFF2 soldered (no removable SIM slot)", cmd: "Eliminates theft / tampering vector" },
    { label: "mTLS with unique device certificate", cmd: "Per-device cert signed by manufacturer Root CA" },
    { label: "Secure Boot chain (RoT → MCUboot → App)", cmd: "Hardware Root of Trust + signed firmware" },
    { label: "Private APN configured", cmd: `AT+CGDCONT=1,"IP","your.private.apn"` },
    { label: "Packet-Switched only mode", cmd: `AT+QCFG="servicedomain",1` },
    { label: "DTLS encryption on all sockets", cmd: "Configure via AT+QSSLCFG" },
    { label: "Anti-tamper circuitry (light sensor / continuity loop)", cmd: "Triggers alarm + brick on enclosure breach" },
    { label: "Security Torx screws on enclosure", cmd: "Physical tamper deterrent" },
];

/* ── Certification Steps ── */
const certificationSteps = [
    { title: "PTCRB Certification (North America)", detail: "Select a PTCRB-approved Primary Lab. Tests include Radiated Spurious Emissions (RSE), Over-the-Air (OTA) TRP/TIS measurements, and SIM electrical testing. Using a pre-certified module reduces scope and cost from $500K+ to $10K–$50K.", color: "#BFFD11" },
    { title: "FCC & IC Compliance", detail: "Intentional radiator testing for all cellular and GNSS frequencies. Pre-certified modules inherit most compliance, leaving only unintentional emissions testing for your specific hardware design.", color: "#53F2FA" },
    { title: "Local Ordinance Compliance", detail: "Firmware must support remote configuration of speed limits, geofence boundaries, and parking zones to comply with varying municipal regulations (e.g., 6 mph sidewalk limit in some cities, Class 1/2/3 e-bike classifications).", color: "#BFFD11" },
];

export default function MicromobilityPage() {
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

    return (
        <>
            {/* Hero */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
                <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-10" aria-label="Breadcrumb">
                    <Link href="/build" className="hover:text-white/60 transition-colors cursor-pointer">Build</Link>
                    <ChevronRight size={12} aria-hidden="true" />
                    <span className="text-[#BFFD11]">Micromobility</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className="w-10 h-10 rounded-[8px] flex items-center justify-center"
                                style={{ background: "rgba(83,242,250,0.1)", border: "1px solid rgba(83,242,250,0.2)" }}
                            >
                                <Bike size={18} color="#53F2FA" strokeWidth={1.75} />
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-[#BFFD11]">
                                    Build Guide
                                </span>
                                <span className="text-[10px] font-mono font-semibold tracking-wider uppercase px-2 py-0.5 rounded text-[#ef4444] bg-[#ef4444]/10">
                                    Advanced
                                </span>
                                <span className="text-[11px] text-white/30 font-mono">40 min</span>
                            </div>
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-5 leading-tight">
                            Connected Micromobility Vehicle
                        </h1>
                        <p className="text-lg text-white/55 leading-relaxed max-w-2xl">
                            Build a cellular IoT-enabled electric scooter or e-bike from motor control and BMS
                            through global connectivity, centimeter-level positioning, and fleet-scale cloud
                            management.
                        </p>
                    </div>
                    <div className="hidden lg:flex justify-center items-center">
                        <img
                            src="/micromobility_hero.png"
                            alt="Micromobility Illustration"
                            className="w-full scale-110"
                            style={{
                                maskImage: "radial-gradient(ellipse 80% 75% at 50% 50%, black 40%, transparent 72%)",
                                WebkitMaskImage: "radial-gradient(ellipse 80% 75% at 50% 50%, black 40%, transparent 72%)",
                            }}
                        />
                    </div>
                </div>
            </div>

            <BuildGuideShell steps={steps}>

                {/* ── STEP 1: System Architecture ── */}
                <section id="architecture" className="scroll-mt-24 pb-16 border-b border-[#3A3C46]/20">
                    <SectionHeader label="System Architecture" stepNumber={1} />

                    <p className="text-white/55 leading-relaxed mb-8 max-w-2xl">
                        A micromobility vehicle is a tripartite hardware system: the Motor Control Unit (MCU),
                        Battery Management System (BMS), and IoT Controller (&quot;Brain&quot;). These communicate
                        over CAN bus or UART for real-time responsiveness.
                    </p>

                    <div className="grid sm:grid-cols-3 gap-5 mb-8">
                        {[
                            { icon: Zap, title: "Motor Control (MCU)", detail: "Field-Oriented Control (FOC) with Clarke & Park transforms. 95–98% efficiency vs 85–90% for trapezoidal. ARM Cortex-M4 with DSP.", color: "#BFFD11" },
                            { icon: Battery, title: "Battery Management (BMS)", detail: "Per-cell voltage monitoring, SOC via Coulomb counting + OCV, SOH tracking, cell balancing, and thermal protection for 36V/48V packs.", color: "#53F2FA" },
                            { icon: Wifi, title: 'IoT Controller ("Brain")', detail: "Bridges vehicle to cloud. LTE-M connectivity, GNSS positioning, device shadow sync, geofence enforcement, and FOTA updates.", color: "#BFFD11" },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.title} className="rounded-xl border p-5" style={{ borderColor: `${item.color}20`, background: `${item.color}04` }}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Icon size={16} style={{ color: item.color }} strokeWidth={1.5} />
                                        <p className="font-semibold text-white text-sm">{item.title}</p>
                                    </div>
                                    <p className="text-xs text-white/45 leading-relaxed">{item.detail}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Motor Control Comparison Table */}
                    <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] overflow-hidden mb-6">
                        <div className="px-5 py-3.5 border-b border-[#3A3C46]/30 bg-[#0a0e1a]">
                            <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/40">
                                Motor Control: FOC vs Trapezoidal
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[#3A3C46]/20">
                                        <th className="text-left px-5 py-3 text-xs text-white/30 font-mono font-semibold">Feature</th>
                                        <th className="text-left px-5 py-3 text-xs text-white/30 font-mono font-semibold">Trapezoidal</th>
                                        <th className="text-left px-5 py-3 text-xs font-mono font-semibold text-[#BFFD11]/60">FOC (Recommended)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {motorControlComparison.map((row) => (
                                        <tr key={row.feature} className="border-b border-[#3A3C46]/10 last:border-0">
                                            <td className="px-5 py-3 text-white/60 font-medium">{row.feature}</td>
                                            <td className="px-5 py-3 text-white/35">{row.trapezoidal}</td>
                                            <td className="px-5 py-3 text-white/55">{row.foc}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <InfoCallout type="tip">
                        Separate the power electronics (MCU board) from the IoT logic. The motor controller handles
                        high-current MOSFETs and generates EMI — isolating the IoT SoC on a separate board or shielded
                        section prevents RF interference with the cellular and GNSS radios.
                    </InfoCallout>

                    <MarkCompleteButton stepId="architecture" />
                </section>

                {/* ── STEP 2: Cellular & SIM ── */}
                <section id="connectivity" className="scroll-mt-24 pb-16 border-b border-[#3A3C46]/20">
                    <SectionHeader label="Cellular Connectivity & SIM" stepNumber={2} />

                    <p className="text-white/55 leading-relaxed mb-8 max-w-2xl">
                        Micromobility <strong className="text-white/70">requires LTE-M</strong> for seamless tower handoffs
                        during movement. NB-IoT lacks mobility support and is unsuitable for scooters.
                        For higher throughput, Cat 1bis provides 10 Mbps on a single antenna.
                    </p>

                    {/* Network Comparison Table */}
                    <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] overflow-hidden mb-8">
                        <div className="px-5 py-3.5 border-b border-[#3A3C46]/30 bg-[#0a0e1a]">
                            <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/40">
                                Cellular Standard Comparison
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[#3A3C46]/20">
                                        <th className="text-left px-5 py-3 text-xs text-white/30 font-mono font-semibold">Standard</th>
                                        <th className="text-left px-5 py-3 text-xs text-white/30 font-mono font-semibold">Bandwidth</th>
                                        <th className="text-left px-5 py-3 text-xs text-white/30 font-mono font-semibold">Latency</th>
                                        <th className="text-left px-5 py-3 text-xs text-white/30 font-mono font-semibold">Mobility</th>
                                        <th className="text-left px-5 py-3 text-xs text-white/30 font-mono font-semibold">Power</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {networkComparison.map((row) => (
                                        <tr key={row.standard} className={`border-b border-[#3A3C46]/10 last:border-0 ${row.standard === "LTE-M (Cat-M1)" ? "bg-[#BFFD11]/4" : ""}`}>
                                            <td className={`px-5 py-3 font-medium ${row.standard === "LTE-M (Cat-M1)" ? "text-[#BFFD11]" : "text-white/60"}`}>{row.standard}</td>
                                            <td className="px-5 py-3 text-white/45 font-mono text-xs">{row.bandwidth}</td>
                                            <td className="px-5 py-3 text-white/45">{row.latency}</td>
                                            <td className={`px-5 py-3 ${row.mobility === "Full Handover" ? "text-[#BFFD11]/70" : "text-white/30"}`}>{row.mobility}</td>
                                            <td className="px-5 py-3 text-white/45">{row.power}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* SIM Architecture */}
                    <h3 className="text-base font-semibold text-white/70 mb-4">SIM Architecture: From Plastic to iSIM</h3>
                    <p className="text-sm text-white/45 leading-relaxed mb-4 max-w-2xl">
                        Physical SIM cards are a liability in high-vibration scooters — prone to corrosion, failure,
                        and theft (can be removed and used in other devices).
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                        <div className="rounded-xl border border-[#BFFD11]/20 bg-[#BFFD11]/4 p-5">
                            <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-2">eSIM (MFF2) — Recommended</p>
                            <p className="text-sm text-white/55 leading-relaxed">
                                Soldered to motherboard. Superior physical durability and tamper resistance.
                                eUICC standard enables remote carrier switching OTA — critical for international fleets
                                to avoid permanent roaming restrictions and optimize data pricing.
                            </p>
                        </div>
                        <div className="rounded-xl border border-[#53F2FA]/15 bg-[#53F2FA]/3 p-5">
                            <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-[#53F2FA] mb-2">iSIM (Integrated SIM) — Future</p>
                            <p className="text-sm text-white/55 leading-relaxed">
                                SIM functionality embedded in the modem SoC silicon. Eliminates all external SIM hardware.
                                Leverages processor&apos;s Trusted Execution Environment (TEE) for hardware-rooted identity
                                that is virtually impossible to clone.
                            </p>
                        </div>
                    </div>

                    <InfoCallout type="warning">
                        <strong>NB-IoT cannot be used for scooters.</strong> It lacks connected mode mobility — when moving
                        between cell towers, the connection drops and must be re-established, causing latency spikes
                        and increased power drain. LTE-M supports full handover.
                    </InfoCallout>

                    <MarkCompleteButton stepId="connectivity" />
                </section>

                {/* ── STEP 3: Hardware BOM ── */}
                <section id="hardware" className="scroll-mt-24 pb-16 border-b border-[#3A3C46]/20">
                    <SectionHeader label="Select Your Hardware" stepNumber={3} />
                    <p className="text-white/55 leading-relaxed mb-4 max-w-2xl">
                        Click any row to expand full details, alternatives, and design rationale.
                    </p>
                    <BOMTable items={bomItems} title="Micromobility BOM" />

                    <div className="mt-6">
                        <CodeBlock
                            language="at"
                            title="Modem initialization sequence"
                            code={atCommandSteps}
                        />
                    </div>

                    <MarkCompleteButton stepId="hardware" />
                </section>

                {/* ── STEP 4: GNSS & Positioning ── */}
                <section id="positioning" className="scroll-mt-24 pb-16 border-b border-[#3A3C46]/20">
                    <SectionHeader label="GNSS & Positioning" stepNumber={4} />

                    <p className="text-white/55 leading-relaxed mb-8 max-w-2xl">
                        Reliable positioning is the most critical feature for shared mobility — it enables
                        geofenced no-ride zones, parking enforcement, and sidewalk detection.
                        Standard GNSS (3–5 m) is insufficient; dual-band + RTK achieves centimeter accuracy.
                    </p>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[
                            { icon: MapPin, title: "Dual-Band GNSS", detail: "L1+L5 concurrent reception. Faster lock-on in dense cities, eliminates multipath errors.", color: "#BFFD11" },
                            { icon: Radio, title: "RTK Correction", detail: "RTCM stream via cellular. Centimeter-level precision for parking corral enforcement.", color: "#53F2FA" },
                            { icon: Settings, title: "6-Axis IMU (DR)", detail: "Accelerometer + gyroscope for dead reckoning when GNSS is unavailable (tunnels, alleys).", color: "#BFFD11" },
                            { icon: Cpu, title: "Sensor Fusion", detail: "GNSS data continuously recalibrates IMU drift. Seamless position tracking across all environments.", color: "#53F2FA" },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.title} className="rounded-xl border p-5" style={{ borderColor: `${item.color}20`, background: `${item.color}04` }}>
                                    <Icon size={16} style={{ color: item.color }} strokeWidth={1.5} className="mb-3" />
                                    <p className="font-semibold text-white text-sm mb-2">{item.title}</p>
                                    <p className="text-xs text-white/45 leading-relaxed">{item.detail}</p>
                                </div>
                            );
                        })}
                    </div>

                    <InfoCallout type="info">
                        <strong>Urban canyon problem:</strong> Standard GNSS cannot determine if a scooter is
                        parked on a sidewalk or in a designated corral (3–5 m accuracy). Dual-band L1+L5 + RTK
                        correction achieves centimeter-level positioning, enabling precise parking zone enforcement
                        and sidewalk riding detection.
                    </InfoCallout>

                    <div className="mt-6">
                        <Link
                            href="/tools/gps-parser"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#BFFD11]/25 text-[#BFFD11] text-sm font-medium hover:bg-[#BFFD11]/5 transition-colors cursor-pointer"
                        >
                            Try the interactive GPS Parser tool <ArrowRight size={14} />
                        </Link>
                    </div>

                    <MarkCompleteButton stepId="positioning" />
                </section>

                {/* ── STEP 5: Firmware & Protocols ── */}
                <section id="firmware" className="scroll-mt-24 pb-16 border-b border-[#3A3C46]/20">
                    <SectionHeader label="Firmware & Protocols" stepNumber={5} />

                    <p className="text-white/55 leading-relaxed mb-4 max-w-2xl">
                        Zephyr RTOS is the dominant OS for micromobility — modular networking stack, MCUboot
                        secure bootloader for FOTA, and first-class support for nRF9160. Choose LwM2M over
                        MQTT for built-in device management and FOTA.
                    </p>

                    {/* Protocol Comparison Table */}
                    <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] overflow-hidden mb-8">
                        <div className="px-5 py-3.5 border-b border-[#3A3C46]/30 bg-[#0a0e1a]">
                            <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/40">
                                MQTT vs LwM2M for Fleet Communication
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[#3A3C46]/20">
                                        <th className="text-left px-5 py-3 text-xs text-white/30 font-mono font-semibold">Feature</th>
                                        <th className="text-left px-5 py-3 text-xs text-white/30 font-mono font-semibold">MQTT (TCP)</th>
                                        <th className="text-left px-5 py-3 text-xs font-mono font-semibold text-[#BFFD11]/60">LwM2M (UDP)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {protocolComparison.map((row) => (
                                        <tr key={row.feature} className="border-b border-[#3A3C46]/10 last:border-0">
                                            <td className="px-5 py-3 text-white/60 font-medium">{row.feature}</td>
                                            <td className="px-5 py-3 text-white/35">{row.mqtt}</td>
                                            <td className="px-5 py-3 text-white/55">{row.lwm2m}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <InteractiveToggle
                        tabs={[
                            { key: "zephyr", label: "Zephyr RTOS (nRF9160)" },
                            { key: "can", label: "CAN Bus Interface" },
                        ]}
                        defaultTab="zephyr"
                    >
                        {{
                            zephyr: (
                                <CodeBlock
                                    language="cpp"
                                    filename="src/main.c"
                                    code={zephyrFirmware}
                                />
                            ),
                            can: (
                                <CodeBlock
                                    language="cpp"
                                    filename="src/can_interface.c"
                                    code={canBusFirmware}
                                />
                            ),
                        }}
                    </InteractiveToggle>

                    <div className="mt-6">
                        <InfoCallout type="tip">
                            <strong>Device Shadows</strong> decouple the cloud from the scooter&apos;s sleep schedule.
                            When a user taps &quot;unlock,&quot; the cloud updates the shadow&apos;s &quot;desired&quot; state.
                            The scooter checks the shadow delta on wake-up and executes the unlock — no need
                            for the device to be online at the exact moment of the request.
                        </InfoCallout>
                    </div>

                    <div className="mt-4">
                        <Link
                            href="/tools/protocol-picker"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#BFFD11]/25 text-[#BFFD11] text-sm font-medium hover:bg-[#BFFD11]/5 transition-colors cursor-pointer"
                        >
                            Run the Protocol Picker quiz <ArrowRight size={14} />
                        </Link>
                    </div>

                    <MarkCompleteButton stepId="firmware" />
                </section>

                {/* ── STEP 6: Security & Certification ── */}
                <section id="security" className="scroll-mt-24 pb-16 border-b border-[#3A3C46]/20">
                    <SectionHeader label="Security & Certification" stepNumber={6} />

                    <p className="text-white/55 leading-relaxed mb-8 max-w-2xl">
                        Scooters operate in public spaces and are vulnerable to &quot;jailbreaking&quot; —
                        disabling cellular tracking to use as personal vehicles. Security must be
                        hardware-rooted, not just software.
                    </p>

                    {/* Security Checklist */}
                    <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] overflow-hidden mb-8">
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#3A3C46]/30 bg-[#0a0e1a]">
                            <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/40">Security Checklist</p>
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

                    {/* Certification */}
                    <h3 className="text-base font-semibold text-white/70 mb-4">Regulatory Certification</h3>
                    <div className="space-y-3 mb-6">
                        {certificationSteps.map((item) => (
                            <div key={item.title} className="rounded-xl border p-5" style={{ borderColor: `${item.color}20`, background: `${item.color}04` }}>
                                <p className="text-sm font-semibold text-white/80 mb-2">{item.title}</p>
                                <p className="text-sm text-white/45 leading-relaxed">{item.detail}</p>
                            </div>
                        ))}
                    </div>

                    <InfoCallout type="info">
                        Using a <strong>pre-certified cellular module</strong> (e.g., nRF9160) significantly reduces
                        PTCRB testing scope. Your &quot;integrated device&quot; inherits the module&apos;s certification,
                        reducing cost from $500K+ to $10K–$50K.
                    </InfoCallout>

                    <MarkCompleteButton stepId="security" />
                </section>

                {/* ── STEP 7: Deploy ── */}
                <section id="deploy" className="scroll-mt-24 pb-16">
                    <SectionHeader label="Deploy" stepNumber={7} />

                    <p className="text-white/55 leading-relaxed mb-8 max-w-2xl">
                        Your connected vehicle is ready. Scale from prototype to fleet with Just-in-Time
                        Provisioning and resilient cloud architecture.
                    </p>

                    <div className="space-y-4 mb-8">
                        {[
                            { title: "Just-in-Time Provisioning (JITP)", detail: "Each scooter is provisioned in the factory with a unique certificate signed by your Device CA. When it first connects to AWS IoT Core, it\u2019s automatically registered — no manual IMEI registration needed at scale.", color: "#BFFD11" },
                            { title: "Device Shadows (AWS IoT Core)", detail: "The cloud maintains persistent vehicle state. Unlock commands update the \u201cdesired\u201d state; the scooter syncs on wake-up. This asynchronous model works perfectly with PSM sleep cycles.", color: "#53F2FA" },
                            { title: "Offline BLE Fallback", detail: "If cellular connectivity is down, users can still unlock via local Bluetooth Low Energy from the mobile app. An independent watchdog timer reboots the IoT module if the cellular stack hangs.", color: "#BFFD11" },
                            { title: "5G RedCap & Satellite IoT (Future)", detail: "Next-gen deployments will leverage 5G RedCap for higher density with LTE-M power profile. Non-Terrestrial Network (NTN) support enables satellite connectivity for rural or low-coverage areas.", color: "#53F2FA" },
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
                                ["IoT SoC", "Nordic nRF9160 SiP"],
                                ["Connectivity", "LTE-M (full mobility)"],
                                ["SIM", "eSIM MFF2 (eUICC)"],
                                ["Motor Control", "FOC (ARM Cortex-M4)"],
                                ["GNSS", "Dual-band L1+L5 + RTK"],
                                ["Battery", "36V/48V Li-ion + BMS"],
                                ["Protocol", "LwM2M over CoAP/DTLS"],
                                ["Security", "mTLS + Secure Boot + Anti-tamper"],
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
                        <a
                            href="https://store.hologram.io/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#3A3C46] text-white/70 text-sm font-semibold hover:border-white/30 transition-colors cursor-pointer"
                        >
                            Ready to start building?
                        </a>
                    </div>

                    <MarkCompleteButton stepId="deploy" />
                </section>

            </BuildGuideShell>

            {/* Navigation + CTA */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between pt-6 border-t border-[#3A3C46]/30 mb-16 mt-8">
                    <Link href="/build/smart-agriculture" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors cursor-pointer">
                        <ArrowLeft size={16} /> Prev: Smart Agriculture
                    </Link>
                    <Link href="/build/remote-patient-monitoring" className="inline-flex items-center gap-2 text-sm font-medium text-[#BFFD11] hover:gap-3 transition-all duration-200 cursor-pointer">
                        Next: Remote Patient Monitoring <ArrowRight size={16} />
                    </Link>
                </div>
                <FreePilotCTA />
            </div>
        </>
    );
}
