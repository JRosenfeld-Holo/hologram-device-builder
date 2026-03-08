"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import CodeBlock from "@/components/ui/CodeBlock";
import { parseQGPSLOC } from "@/lib/calculations";
import { staggerContainer, staggerItem } from "@/lib/animations";

const SAMPLE_INPUT = "+QGPSLOC: 092204.0,3150.7820N,11711.9310E,0.6,121.1,2,0.0,0.0,0.0,250326,04";

const FIX_TYPES: Record<number, string> = {
  1: "No fix",
  2: "2D fix",
  3: "3D fix",
};

const PARSER_CODE = `import re

def parse_gps(response: str) -> dict | None:
    """Parse +QGPSLOC response to structured object."""
    pattern = (
        r"\\+QGPSLOC:\\s*"
        r"([\\d.]+),"       # UTC time
        r"([\\d.]+)([NS])," # latitude + direction
        r"([\\d.]+)([EW])," # longitude + direction
        r"([\\d.]+),"       # HDOP
        r"([\\d.-]+),"      # altitude
        r"(\\d+),"          # fix type (1=none, 2=2D, 3=3D)
        r"([\\d.]+),"       # COG (course over ground)
        r"([\\d.]+),"       # speed km/h
        r"([\\d.]+),"       # speed knots
        r"(\\d{6}),"        # date (DDMMYY)
        r"(\\d+)"           # satellites
    )
    m = re.search(pattern, response)
    if not m:
        return None
    return {
        "utc":       m.group(1),
        "lat":       to_decimal(m.group(2), m.group(3)),
        "lon":       to_decimal(m.group(4), m.group(5)),
        "hdop":      float(m.group(6)),
        "altitude":  float(m.group(7)),
        "fix_type":  int(m.group(8)),
        "cog":       float(m.group(9)),
        "speed_kmh": float(m.group(10)),
        "speed_kn":  float(m.group(11)),
        "date":      m.group(12),
        "nsat":      int(m.group(13)),
    }

def to_decimal(ddmm: str, direction: str) -> float:
    """DDMM.MMMM + direction → signed decimal degrees."""
    val = float(ddmm)
    deg = int(val / 100)
    mins = val - deg * 100
    decimal = deg + mins / 60.0
    if direction in ("S", "W"):
        decimal = -decimal
    return round(decimal, 6)`;

export default function GPSParserPage() {
  const [input, setInput] = useState(SAMPLE_INPUT);

  const parsed = useMemo(() => {
    if (!input.trim()) return null;
    return parseQGPSLOC(input);
  }, [input]);

  const mapsUrl = parsed
    ? `https://www.openstreetmap.org/?mlat=${parsed.latitude}&mlon=${parsed.longitude}#map=14/${parsed.latitude}/${parsed.longitude}`
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
      <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-10" aria-label="Breadcrumb">
        <Link href="/tools" className="hover:text-white/60 transition-colors cursor-pointer">Tools</Link>
        <ChevronRight size={12} />
        <span className="text-[#BFFD11]">GPS Parser</span>
      </nav>

      <motion.div className="mb-12" variants={staggerContainer} initial="hidden" animate="visible">
        <motion.p variants={staggerItem} className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-3">
          Tool
        </motion.p>
        <motion.h1 variants={staggerItem} className="text-4xl font-semibold mb-5">GPS Coordinate Parser</motion.h1>
        <motion.p variants={staggerItem} className="text-lg text-white/55 leading-relaxed max-w-2xl">
          Paste a raw <code className="font-mono bg-white/5 px-1 rounded text-base">+QGPSLOC</code> response from a
          Quectel module. Parsed fields update instantly.
        </motion.p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Input */}
        <div>
          <label className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/30 block mb-3">
            Raw GNSS Output
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-[#060a14] border border-[#3A3C46]/45 text-white/80 font-mono text-sm focus:border-[#BFFD11]/40 focus:outline-none transition-colors resize-none"
            placeholder="+QGPSLOC: ..."
            spellCheck={false}
          />
          <button
            onClick={() => setInput(SAMPLE_INPUT)}
            className="mt-2 text-xs text-white/30 hover:text-white/60 transition-colors cursor-pointer"
          >
            ← Reset to sample
          </button>
        </div>

        {/* Output */}
        <div>
          <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-3">
            Parsed Fields
          </p>
          {parsed ? (
            <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] overflow-hidden">
              <div className="divide-y divide-[#3A3C46]/15">
                {[
                  ["UTC Time", parsed.utc],
                  ["Latitude", `${parsed.latitude}° (${parsed.latRaw}${parsed.latDir})`],
                  ["Longitude", `${parsed.longitude}° (${parsed.lonRaw}${parsed.lonDir})`],
                  ["HDOP", `${parsed.hdop} (lower = better accuracy)`],
                  ["Altitude", `${parsed.altitude} m`],
                  ["Fix Type", `${parsed.fixType} — ${FIX_TYPES[parsed.fixType] || "Unknown"}`],
                  ["Speed", `${parsed.speedKmh.toFixed(1)} km/h (${parsed.speedKnots.toFixed(1)} kn)`],
                  ["Course (COG)", `${parsed.cogDegrees}°`],
                  ["Date", parsed.date ? `${parsed.date.slice(0, 2)}/${parsed.date.slice(2, 4)}/20${parsed.date.slice(4)}` : "—"],
                  ["Satellites", `${parsed.satellites} visible`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-start gap-4 px-4 py-2.5 text-sm">
                    <span className="text-white/35 shrink-0 w-28">{k}</span>
                    <span className="text-white/80 text-right font-mono text-xs">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-[#3A3C46]/30 bg-[#060a14] p-8 text-center text-white/25 text-sm">
              Enter a valid +QGPSLOC response to see parsed fields.
            </div>
          )}
        </div>
      </div>

      {/* Map link */}
      {parsed && mapsUrl && (
        <div className="mb-12 rounded-xl border border-[#3A3C46]/40 bg-[#060a14] p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <MapPin size={18} className="text-[#BFFD11] shrink-0" strokeWidth={1.75} />
            <div>
              <p className="text-sm font-medium text-white/80">
                {parsed.latitude}°, {parsed.longitude}°
              </p>
              <p className="text-xs text-white/35 mt-0.5">
                HDOP: {parsed.hdop} · Alt: {parsed.altitude}m · {parsed.satellites} satellites
              </p>
            </div>
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-[#BFFD11] text-[#00040F] text-sm font-semibold hover:bg-[#BFFD11] transition-colors cursor-pointer shrink-0"
          >
            Open in Maps ↗
          </a>
        </div>
      )}

      {/* Code reference */}
      <div>
        <h2 className="text-xl font-semibold mb-6">Python Parser Reference</h2>
        <CodeBlock
          language="python"
          filename="lib/gps.py"
          code={PARSER_CODE}
        />
      </div>
    </div>
  );
}
