"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem, inView } from "@/lib/animations";

interface Column {
  key: string;
  label: string;
  recommended?: boolean;
}

interface Row {
  metric: string;
  description?: string;
  [key: string]: string | undefined;
}

interface ComparisonTableProps {
  columns: Column[];
  rows: Row[];
  caption?: string;
}

export default function ComparisonTable({ columns, rows, caption }: ComparisonTableProps) {
  return (
    <motion.div
      className="overflow-x-auto rounded-xl border border-[#3A3C46]/45"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={staggerContainer}
    >
      <table className="w-full min-w-[480px] border-collapse text-sm">
        {caption && (
          <caption className="text-left px-5 py-3 text-xs text-white/35 font-mono tracking-wider uppercase border-b border-[#3A3C46]/30">
            {caption}
          </caption>
        )}
        {/* Header */}
        <thead>
          <tr className="bg-[#0a0e1a]">
            <th className="text-left px-5 py-3 text-[11px] font-mono font-semibold tracking-widest uppercase text-white/40 border-b border-[#3A3C46]/40 w-48">
              Spec
            </th>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-left px-5 py-3 text-[11px] font-mono font-semibold tracking-widest uppercase border-b border-[#3A3C46]/40 ${
                  col.recommended
                    ? "text-[#BFFD11] bg-[#BFFD11]/5"
                    : "text-white/40"
                }`}
              >
                {col.label}
                {col.recommended && (
                  <motion.span
                    className="ml-2 px-1.5 py-0.5 rounded text-[9px] bg-[#BFFD11]/15 text-[#BFFD11]"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    REC
                  </motion.span>
                )}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="bg-[#030710]">
          {rows.map((row, idx) => (
            <motion.tr
              key={idx}
              variants={staggerItem}
              className="border-b border-[#3A3C46]/20 hover:bg-white/[0.02] transition-colors duration-150"
            >
              <td className="px-5 py-3">
                <p className="text-sm font-medium text-white/80">{row.metric}</p>
                {row.description && (
                  <p className="text-[11px] text-white/30 mt-0.5">{row.description}</p>
                )}
              </td>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-5 py-3 text-sm ${
                    col.recommended ? "text-white/90" : "text-white/55"
                  }`}
                >
                  {row[col.key] ?? "—"}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}
