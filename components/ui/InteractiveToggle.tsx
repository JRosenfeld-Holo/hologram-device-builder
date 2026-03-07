"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Tab {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

interface InteractiveToggleProps {
  tabs: Tab[];
  children: Record<string, React.ReactNode>;
  defaultTab?: string;
  label?: string;
}

export default function InteractiveToggle({
  tabs,
  children,
  defaultTab,
  label,
}: InteractiveToggleProps) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.key);

  return (
    <div>
      {label && (
        <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-3">
          {label}
        </p>
      )}
      {/* Tab bar */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0a0e1a] border border-[#3A3C46]/40 w-fit mb-4 relative">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className="relative flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 cursor-pointer z-10"
            style={{
              color: active === tab.key ? "#00040F" : "rgba(255,255,255,0.45)",
            }}
          >
            {/* Active background pill */}
            {active === tab.key && (
              <motion.div
                layoutId="tab-pill"
                className="absolute inset-0 rounded-md bg-[#BFFD11]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                style={{ zIndex: -1 }}
              />
            )}
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content panel with animated transitions */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {active && children[active]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
