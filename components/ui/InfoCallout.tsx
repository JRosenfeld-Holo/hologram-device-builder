"use client";

import { Info, Lightbulb, AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { inView } from "@/lib/animations";

type CalloutType = "info" | "tip" | "warning" | "success";

interface InfoCalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

const calloutConfig: Record<
  CalloutType,
  { icon: typeof Info; color: string; bg: string; border: string; label: string }
> = {
  info: {
    icon: Info,
    color: "#53F2FA",
    bg: "rgba(83,242,250,0.04)",
    border: "#106468",
    label: "NOTE",
  },
  tip: {
    icon: Lightbulb,
    color: "#BFFD11",
    bg: "rgba(191,253,17,0.04)",
    border: "#4C6810",
    label: "TIP",
  },
  warning: {
    icon: AlertTriangle,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.04)",
    border: "#78350f",
    label: "WARNING",
  },
  success: {
    icon: CheckCircle,
    color: "#4ade80",
    bg: "rgba(74,222,128,0.04)",
    border: "#166534",
    label: "SUCCESS",
  },
};

const standardFade = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

export default function InfoCallout({ type = "info", title, children }: InfoCalloutProps) {
  const config = calloutConfig[type];
  const Icon = config.icon;
  const isWarning = type === "warning";

  return (
    <motion.div
      {...(isWarning
        ? {
            initial: { opacity: 0 },
            whileInView: { opacity: 1, x: [0, -4, 4, -4, 4, 0] },
            viewport: { once: true },
            transition: { duration: 0.5 },
          }
        : { variants: standardFade, ...inView })}
      className="rounded-xl p-5 flex gap-4"
      style={{
        background: config.bg,
        borderLeft: `3px solid ${config.border}`,
        borderTop: `1px solid ${config.border}40`,
        borderRight: `1px solid ${config.border}20`,
        borderBottom: `1px solid ${config.border}20`,
      }}
      role={type === "warning" ? "alert" : "note"}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 350, damping: 20, delay: 0.1 }}
        className="shrink-0 mt-0.5"
      >
        <Icon size={16} style={{ color: config.color }} strokeWidth={1.75} />
      </motion.div>
      <div>
        <p
          className="font-mono text-[10px] font-semibold tracking-widest uppercase mb-1.5"
          style={{ color: config.color }}
        >
          {title || config.label}
        </p>
        <div className="text-sm text-white/60 leading-relaxed">{children}</div>
      </div>
    </motion.div>
  );
}
