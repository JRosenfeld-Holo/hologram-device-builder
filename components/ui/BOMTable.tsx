"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BOMItem {
  category: string;
  part: string;
  alternatives?: string;
  rationale: string;
  detail?: string;
  link?: string;
  unitCost?: string;
}

interface BOMTableProps {
  items: BOMItem[];
  title?: string;
}

export default function BOMTable({ items, title }: BOMTableProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="rounded-xl border border-[#3A3C46]/45 overflow-hidden">
      {title && (
        <div className="px-5 py-3 bg-[#0a0e1a] border-b border-[#3A3C46]/40">
          <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11]">
            {title}
          </p>
        </div>
      )}

      {/* Header */}
      <div className="grid grid-cols-[1fr_1.5fr_2fr_auto] gap-0 bg-[#0a0e1a] border-b border-[#3A3C46]/30">
        {["Category", "Part", "Rationale", ""].map((h) => (
          <div
            key={h}
            className="px-5 py-2.5 text-[11px] font-mono font-semibold tracking-widest uppercase text-white/30"
          >
            {h}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div className="bg-[#030710]">
        {items.map((item, idx) => (
          <div key={idx} className="border-b border-[#3A3C46]/20 last:border-b-0">
            {/* Main row */}
            <div
              className={`grid grid-cols-[1fr_1.5fr_2fr_auto] gap-0 items-center hover:bg-white/[0.015] transition-colors duration-100 ${
                item.detail ? "cursor-pointer" : ""
              }`}
              onClick={() => item.detail && setExpanded(expanded === idx ? null : idx)}
            >
              <div className="px-5 py-3">
                <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11]/70">
                  {item.category}
                </p>
              </div>
              <div className="px-5 py-3">
                <p className="text-sm font-medium text-white/85">{item.part}</p>
                {item.alternatives && (
                  <p className="text-xs text-white/30 mt-0.5">
                    Alt: {item.alternatives}
                  </p>
                )}
              </div>
              <div className="px-5 py-3">
                <p className="text-sm text-white/50 leading-relaxed">{item.rationale}</p>
              </div>
              <div className="px-4 py-3 flex items-center gap-3">
                {item.unitCost && (
                  <span className="text-xs text-white/30 font-mono">{item.unitCost}</span>
                )}
                {item.detail && (
                  <button
                    className="text-white/25 hover:text-[#BFFD11] transition-colors duration-150 cursor-pointer"
                    aria-label={expanded === idx ? "Collapse" : "Expand"}
                  >
                    <motion.div
                      animate={{ rotate: expanded === idx ? 180 : 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <ChevronDown size={14} />
                    </motion.div>
                  </button>
                )}
              </div>
            </div>

            {/* Expanded detail — animated */}
            <AnimatePresence initial={false}>
              {expanded === idx && item.detail && (
                <motion.div
                  key="detail"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-4 bg-[#BFFD11]/3 border-t border-[#BFFD11]/10">
                    <motion.div
                      initial={{ y: -8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -8, opacity: 0 }}
                      transition={{ duration: 0.2, delay: 0.05 }}
                    >
                      <p className="text-sm text-white/55 leading-relaxed pt-3">{item.detail}</p>
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-2 text-xs text-[#BFFD11] hover:underline cursor-pointer"
                        >
                          View datasheet →
                        </a>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
