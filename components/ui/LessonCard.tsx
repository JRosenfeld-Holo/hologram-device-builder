"use client";

import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp, inView } from "@/lib/animations";

type Difficulty = "Beginner" | "Intermediate" | "Advanced";

interface LessonCardProps {
  title: string;
  description?: string;
  href: string;
  duration?: string;
  difficulty: Difficulty;
  progress?: number; // 0–100
  label?: string;
}

const difficultyConfig: Record<Difficulty, { color: string; bg: string }> = {
  Beginner: { color: "#4ade80", bg: "rgba(74,222,128,0.08)" },
  Intermediate: { color: "#BFFD11", bg: "rgba(191,253,17,0.08)" },
  Advanced: { color: "#53F2FA", bg: "rgba(83,242,250,0.08)" },
};

export default function LessonCard({
  title,
  description,
  href,
  duration,
  difficulty,
  progress = 0,
  label,
}: LessonCardProps) {
  const dc = difficultyConfig[difficulty];

  return (
    <motion.div
      variants={fadeUp}
      {...inView}
      whileHover={{ scale: 1.025, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <Link
        href={href}
        className="group block p-5 rounded-xl border border-[#3A3C46]/45 bg-[#060a14] hover:border-[#BFFD11]/25 transition-all duration-200 cursor-pointer h-full"
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            {label && (
              <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-1.5">
                {label}
              </p>
            )}
            <h3 className="text-sm font-semibold text-white group-hover:text-[#BFFD11] transition-colors duration-300 leading-snug">
              {title}
            </h3>
          </div>
          <ArrowRight
            size={14}
            className="text-white/30 group-hover:text-[#BFFD11] group-hover:translate-x-1 transition-all duration-200 shrink-0 mt-0.5"
          />
        </div>

        {description && (
          <p className="text-xs text-white/40 leading-relaxed mb-4">{description}</p>
        )}

        {/* Footer row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Difficulty badge */}
            <span
              className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold tracking-wider uppercase"
              style={{ color: dc.color, backgroundColor: dc.bg }}
            >
              {difficulty}
            </span>

            {/* Duration */}
            {duration && (
              <span className="inline-flex items-center gap-1 text-[11px] text-white/35">
                <Clock size={11} />
                {duration}
              </span>
            )}
          </div>

          {/* Progress bar */}
          {progress > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-16 h-1 rounded-full bg-[#3A3C46]/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#BFFD11] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] text-white/30">{progress}%</span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
