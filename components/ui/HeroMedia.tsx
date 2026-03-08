"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Constants ────────────────────────────────────────────────────────────────

const MASK =
  "radial-gradient(ellipse 82% 82% at 50% 50%, black 35%, rgba(0,0,0,0.55) 62%, transparent 82%)";

const INTERVAL = 3500; // ms between auto-advances

const IMAGES = [
  { src: "/asset_tracker_hero.png",     label: "Asset Tracker" },
  { src: "/smart_camera_hero.png",      label: "Smart Camera" },
  { src: "/smart_building_hero.png",    label: "Smart Building" },
  { src: "/smart_agriculture_hero.png", label: "Smart Agriculture" },
  { src: "/micromobility_hero.png",     label: "Micromobility" },
  { src: "/rpm_hero.png",               label: "Remote Patient Monitoring" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function HeroMedia() {
  const [index, setIndex] = useState(0);

  // Auto-advance
  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % IMAGES.length),
      INTERVAL
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-full aspect-square">
      {/* Image crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={IMAGES[index].src}
            alt={IMAGES[index].label}
            className="w-full h-full object-contain"
            style={{ maskImage: MASK, WebkitMaskImage: MASK }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Label */}
      <AnimatePresence mode="wait">
        <motion.span
          key={`label-${index}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[10px] font-semibold tracking-widest uppercase text-white/25 pointer-events-none whitespace-nowrap"
        >
          {IMAGES[index].label}
        </motion.span>
      </AnimatePresence>

      {/* Indicator dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-auto">
        {IMAGES.map((img, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={img.label}
            className="cursor-pointer transition-all duration-300"
            style={{
              width: i === index ? 16 : 6,
              height: 4,
              borderRadius: 2,
              background:
                i === index ? "#BFFD11" : "rgba(255,255,255,0.2)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
