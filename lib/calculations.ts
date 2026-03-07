import { CURRENT_DRAW } from "./constants";

// Battery life calculation
// Returns estimated battery life in years
export function calcBatteryLife({
  batteryCapacityMAh,
  tauSeconds,      // T3412 timer — how long device sleeps in PSM
  activeSeconds,   // T3324 timer — active window after waking
  edrxCycleSeconds, // eDRX cycle length (0 = disabled)
  txPerDay,        // how many transmissions per day
  txDurationMs = 500, // average transmission duration in ms
}: {
  batteryCapacityMAh: number;
  tauSeconds: number;
  activeSeconds: number;
  edrxCycleSeconds: number;
  txPerDay: number;
  txDurationMs?: number;
}): {
  yearsEstimate: number;
  averageCurrentUA: number;
  timeBreakdown: {
    psmPercent: number;
    edrxPercent: number;
    activePercent: number;
    txPercent: number;
  };
} {
  const daySeconds = 86400;

  // Time spent transmitting (seconds/day)
  const txSecondsPerDay = (txPerDay * txDurationMs) / 1000;

  // Time per TAU cycle
  const cycleSeconds = tauSeconds;
  const wakeSecondsPerCycle = activeSeconds + txSecondsPerDay / (daySeconds / cycleSeconds);
  const sleepSecondsPerCycle = cycleSeconds - wakeSecondsPerCycle;

  // eDRX windows if enabled
  let edrxSecondsPerDay = 0;
  if (edrxCycleSeconds > 0) {
    const edrxWindowMs = 100; // ~100ms listening window
    const edrxWindowsPerDay = daySeconds / edrxCycleSeconds;
    edrxSecondsPerDay = (edrxWindowsPerDay * edrxWindowMs) / 1000;
  }

  // Calculate time fractions per day
  const txSec = txSecondsPerDay;
  const activeSec = txPerDay * activeSeconds;
  const edrxSec = edrxSecondsPerDay;
  const psmSec = Math.max(0, daySeconds - txSec - activeSec - edrxSec);

  const totalSec = txSec + activeSec + edrxSec + psmSec;

  // Average current (µA)
  const avgCurrent =
    ((psmSec * CURRENT_DRAW.psm) +
      (edrxSec * CURRENT_DRAW.edrx) +
      (activeSec * CURRENT_DRAW.idle) +
      (txSec * (CURRENT_DRAW.tx / 1000))) / // tx in mA → µA
    totalSec;

  // Battery capacity in µAh
  const capacityUAh = batteryCapacityMAh * 1000;

  // Life in hours → years
  const lifeHours = capacityUAh / avgCurrent;
  const lifeYears = lifeHours / 8760;

  return {
    yearsEstimate: Math.round(lifeYears * 10) / 10,
    averageCurrentUA: Math.round(avgCurrent),
    timeBreakdown: {
      psmPercent: Math.round((psmSec / totalSec) * 100),
      edrxPercent: Math.round((edrxSec / totalSec) * 100),
      activePercent: Math.round((activeSec / totalSec) * 100),
      txPercent: Math.round((txSec / totalSec) * 100),
    },
  };
}

// GNSS coordinate conversion: DDMM.MMMM → decimal degrees
export function ddmmToDecimal(ddmm: string, direction: string): number {
  const value = parseFloat(ddmm);
  if (isNaN(value)) return 0;

  const degrees = Math.floor(value / 100);
  const minutes = value - degrees * 100;
  let decimal = degrees + minutes / 60;

  if (direction === "S" || direction === "W") {
    decimal = -decimal;
  }

  return Math.round(decimal * 1000000) / 1000000;
}

// Parse QGPSLOC response
// Format: +QGPSLOC: <UTC>,<lat>,<lon>,<HDOP>,<alt>,<fix>,<COG>,<spkm>,<spkn>,<date>,<nsat>
export function parseQGPSLOC(response: string): {
  utc: string;
  latitude: number;
  longitude: number;
  latRaw: string;
  lonRaw: string;
  latDir: string;
  lonDir: string;
  hdop: number;
  altitude: number;
  fixType: number;
  cogDegrees: number;
  speedKmh: number;
  speedKnots: number;
  date: string;
  satellites: number;
} | null {
  const match = response.match(
    /\+QGPSLOC:\s*(\d{6}\.\d+),([\d.]+)([NS]),([\d.]+)([EW]),([\d.]+),([\d.-]+),(\d+),([\d.]+),([\d.]+),(\d{6}),(\d+)/
  );

  if (!match) return null;

  const [, utc, latRaw, latDir, lonRaw, lonDir, hdop, alt, fix, cog, spkm, date, nsat] = match;

  return {
    utc,
    latitude: ddmmToDecimal(latRaw, latDir),
    longitude: ddmmToDecimal(lonRaw, lonDir),
    latRaw,
    lonRaw,
    latDir,
    lonDir,
    hdop: parseFloat(hdop),
    altitude: parseFloat(alt),
    fixType: parseInt(fix),
    cogDegrees: parseFloat(cog),
    speedKmh: parseFloat(spkm),
    speedKnots: parseFloat(spkm) * 0.539957,
    date,
    satellites: parseInt(nsat),
  };
}
