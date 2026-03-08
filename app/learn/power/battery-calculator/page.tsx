"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";

export default function LearnPowerBatteryCalculatorPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
      <motion.div className="mb-12" variants={staggerContainer} initial="hidden" animate="visible">
        <motion.p variants={staggerItem} className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-3">
          POWER
        </motion.p>
        <motion.h1 variants={staggerItem} className="text-4xl font-semibold mb-5">Battery Life Calculator</motion.h1>
        <motion.p variants={staggerItem} className="text-lg text-white/55 leading-relaxed max-w-2xl">
          Estimate battery life for any device profile. Adjust consumption, reporting frequency, and battery capacity.
        </motion.p>
      </motion.div>

      <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] p-8 text-center">
        <p className="text-white/30 text-sm mb-6">This lesson is coming soon.</p>
        <Link
          href="/learn/power/psm-edrx"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#BFFD11] text-[#00040F] text-sm font-semibold hover:bg-[#d4ff3d] transition-colors cursor-pointer"
        >
          PSM / eDRX Simulator <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
