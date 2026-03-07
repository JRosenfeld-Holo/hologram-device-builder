// Brand color tokens
export const COLORS = {
  lime: "#BFFD11",
  deepSpace: "#00040F",
  white: "#FFFFFF",
  olive: "#4C6810",
  teal: "#106468",
  gray: "#3A3C46",
  cyan: "#53F2FA",
} as const;

// LTE-M vs NB-IoT specs
export const LPWA_SPECS = {
  ltem: {
    label: "LTE-M",
    bandwidth: "1.4 MHz",
    downlink: "~1 Mbps",
    uplink: "~1 Mbps",
    latency: "50–300 ms",
    mobility: "Yes (handover support)",
    voice: "Yes (VoLTE)",
    coverage: "Good",
    useCases: "Asset trackers, wearables, alarms",
    powerClass: "20 dBm",
  },
  nbiot: {
    label: "NB-IoT",
    bandwidth: "200 kHz",
    downlink: "~170 Kbps",
    uplink: "~60 Kbps",
    latency: "1.6–10 s",
    mobility: "No (static only)",
    voice: "No",
    coverage: "Excellent (Coverage Extension mode)",
    useCases: "Smart meters, static sensors",
    powerClass: "23 dBm",
  },
} as const;

// Battery presets for PSM simulator
export const BATTERY_PRESETS = [
  { label: "AA Alkaline", capacity: 2500, voltage: 1.5 },
  { label: "18650 Li-Ion", capacity: 3400, voltage: 3.7 },
  { label: "Li-SOCl₂ D-cell", capacity: 19000, voltage: 3.6 },
  { label: "CR2032 Coin", capacity: 240, voltage: 3.0 },
] as const;

// PSM configuration presets
export const PSM_PRESETS = [
  {
    label: "10-Year Asset Tracker",
    tau: 86400,      // 24h TAU
    active: 2,       // 2s active
    edrxCycle: 0,    // PSM only
    txFrequency: 1,  // once per day
  },
  {
    label: "Smart Meter",
    tau: 3600,
    active: 10,
    edrxCycle: 20,
    txFrequency: 24,
  },
  {
    label: "Fleet Tracker",
    tau: 3600,
    active: 5,
    edrxCycle: 20,
    txFrequency: 288,  // every 5 min
  },
] as const;

// Current draw values (µA) for different modes
export const CURRENT_DRAW = {
  psm: 3,       // µA — deep sleep / PSM
  edrx: 15,     // µA — eDRX listening window
  idle: 2000,   // µA — registered, radio on
  active: 5000, // µA — active data session
  tx: 220000,   // µA — transmitting (220 mA)
} as const;
