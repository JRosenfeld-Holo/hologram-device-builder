"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronRight, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import atCommands from "@/content/at-commands.json";
import { staggerContainer, staggerItem } from "@/lib/animations";

const CATEGORIES = ["All", "Network Configuration", "Power Management", "Data Transmission", "Security", "GPS"];

export default function ATCommandReferencePage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return atCommands.filter((cmd) => {
      const matchesCategory = activeCategory === "All" || cmd.category === activeCategory;
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        cmd.command.toLowerCase().includes(q) ||
        cmd.description.toLowerCase().includes(q) ||
        cmd.id.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory]);

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const grouped = useMemo(() => {
    const groups: Record<string, typeof atCommands> = {};
    for (const cmd of filtered) {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    }
    return groups;
  }, [filtered]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
      <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-10" aria-label="Breadcrumb">
        <Link href="/tools" className="hover:text-white/60 transition-colors cursor-pointer">Tools</Link>
        <ChevronRight size={12} />
        <span className="text-[#BFFD11]">AT Command Reference</span>
      </nav>

      <motion.div
        className="mb-12"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.p variants={staggerItem} className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-3">Reference</motion.p>
        <motion.h1 variants={staggerItem} className="text-4xl font-semibold mb-5">AT Command Reference</motion.h1>
        <motion.p variants={staggerItem} className="text-lg text-white/55 leading-relaxed max-w-2xl">
          Searchable library of all AT commands used across the build guides. Click any command to expand parameters, examples, and cross-links.
        </motion.p>
      </motion.div>

      {/* Search bar */}
      <motion.div
        className="relative mb-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" aria-hidden="true" />
        <label htmlFor="cmd-search" className="sr-only">Search AT commands</label>
        <input
          id="cmd-search"
          type="search"
          placeholder="Search commands, descriptions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#060a14] border border-[#3A3C46]/45 text-white placeholder-white/25 text-sm focus:border-[#BFFD11]/40 focus:outline-none transition-colors"
        />
      </motion.div>

      {/* Category filter */}
      <motion.div
        className="flex flex-wrap gap-2 mb-10"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {CATEGORIES.map((cat) => (
          <motion.button
            key={cat}
            variants={staggerItem}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
              activeCategory === cat
                ? "bg-[#BFFD11] text-[#00040F]"
                : "border border-[#3A3C46]/40 text-white/45 hover:text-white/70 hover:border-[#3A3C46]/70"
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {cat}
          </motion.button>
        ))}
      </motion.div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-16 text-white/30"
          >
            <p className="text-lg">No commands match your search.</p>
          </motion.div>
        ) : (
          <motion.div
            key={`${activeCategory}-${query}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {Object.entries(grouped).map(([category, cmds]) => (
              <div key={category}>
                <motion.p
                  className="font-mono text-[10px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-4"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {category}
                </motion.p>
                <motion.div
                  className="space-y-2"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {cmds.map((cmd) => {
                    const isExpanded = expanded === cmd.id;
                    return (
                      <motion.div
                        key={cmd.id}
                        variants={staggerItem}
                        className={`rounded-xl border transition-colors duration-200 ${
                          isExpanded
                            ? "border-[#BFFD11]/25 bg-[#BFFD11]/3"
                            : "border-[#3A3C46]/40 bg-[#060a14] hover:border-[#3A3C46]/70"
                        }`}
                      >
                        <div
                          className="flex items-center gap-4 p-4 cursor-pointer"
                          onClick={() => setExpanded(isExpanded ? null : cmd.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <code className="text-sm font-mono text-[#BFFD11] block truncate">{cmd.command}</code>
                            <p className="text-xs text-white/40 mt-0.5 truncate">{cmd.description}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleCopy(cmd.command, cmd.id); }}
                              className="p-1.5 rounded hover:bg-white/5 text-white/30 hover:text-[#BFFD11] transition-colors cursor-pointer"
                              aria-label="Copy command"
                            >
                              <AnimatePresence mode="wait" initial={false}>
                                {copied === cmd.id ? (
                                  <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 500, damping: 20 }}>
                                    <Check size={13} className="text-[#BFFD11]" />
                                  </motion.div>
                                ) : (
                                  <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                    <Copy size={13} />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </button>
                            <motion.div
                              animate={{ rotate: isExpanded ? 90 : 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                            >
                              <ChevronRight size={14} className="text-white/20" />
                            </motion.div>
                          </div>
                        </div>

                        {/* Animated expand/collapse */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              key="expanded"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                              className="overflow-hidden"
                            >
                              <motion.div
                                className="px-5 pb-5 border-t border-[#BFFD11]/10 pt-5"
                                initial={{ y: -8, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -8, opacity: 0 }}
                                transition={{ duration: 0.2, delay: 0.05 }}
                              >
                                <p className="text-sm text-white/60 leading-relaxed mb-5">{cmd.description}</p>

                                {cmd.parameters.length > 0 && (
                                  <div className="mb-5">
                                    <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-3">Parameters</p>
                                    <motion.div
                                      className="space-y-2"
                                      variants={staggerContainer}
                                      initial="hidden"
                                      animate="visible"
                                    >
                                      {cmd.parameters.map((param) => (
                                        <motion.div key={param.name} variants={staggerItem} className="flex gap-4 text-sm">
                                          <code className="text-[#53F2FA] font-mono shrink-0 w-32">{param.name}</code>
                                          <span className="text-white/45">{param.description}</span>
                                        </motion.div>
                                      ))}
                                    </motion.div>
                                  </div>
                                )}

                                <div>
                                  <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-2">Example</p>
                                  <div className="rounded-lg bg-[#030710] p-4">
                                    <pre className="font-mono text-xs text-white/65 whitespace-pre-wrap">{cmd.example}</pre>
                                  </div>
                                </div>

                                {cmd.guide && (
                                  <div className="mt-4">
                                    <Link href={`/build/${cmd.guide}`} className="inline-flex items-center gap-1.5 text-xs text-[#BFFD11] hover:underline cursor-pointer">
                                      Used in: {cmd.guide.replace(/-/g, " ")} guide <ChevronRight size={11} />
                                    </Link>
                                  </div>
                                )}
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
