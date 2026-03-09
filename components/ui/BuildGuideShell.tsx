"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { Check, ChevronDown } from "lucide-react";

// ─── Context ──────────────────────────────────────────────────────────────────

interface BuildGuideContextValue {
  completedSteps: Set<string>;
  toggleComplete: (id: string) => void;
}

export const BuildGuideContext = createContext<BuildGuideContextValue>({
  completedSteps: new Set(),
  toggleComplete: () => {},
});

export function useBuildGuide() {
  return useContext(BuildGuideContext);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

export function SectionHeader({
  label,
  stepNumber,
}: {
  label: string;
  stepNumber: number;
}) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <span className="w-7 h-7 rounded-full bg-[#BFFD11]/10 border border-[#BFFD11]/20 flex items-center justify-center font-mono text-xs text-[#BFFD11] shrink-0">
        {stepNumber}
      </span>
      <h2 className="text-2xl font-semibold">{label}</h2>
    </div>
  );
}

export function MarkCompleteButton({ stepId }: { stepId: string }) {
  const { completedSteps, toggleComplete } = useBuildGuide();
  const isDone = completedSteps.has(stepId);
  return (
    <button
      onClick={() => toggleComplete(stepId)}
      className={`mt-10 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFFD11] ${
        isDone
          ? "bg-[#BFFD11]/10 border border-[#BFFD11]/30 text-[#BFFD11]"
          : "bg-[#BFFD11] text-[#00040F] hover:opacity-90"
      }`}
      aria-pressed={isDone}
    >
      <Check size={14} aria-hidden="true" />
      {isDone ? "Completed" : "Mark as complete"}
    </button>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  steps,
  completedSteps,
  activeSection,
}: {
  steps: { id: string; label: string }[];
  completedSteps: Set<string>;
  activeSection: string;
}) {
  const done = completedSteps.size;
  const total = steps.length;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav aria-label="Guide sections">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-[#797C86] font-mono mb-1.5">
          <span>Progress</span>
          <span>
            {done}/{total}
          </span>
        </div>
        <div className="h-1 rounded-full bg-[#3A3C46] overflow-hidden">
          <div
            className="h-full bg-[#BFFD11] rounded-full transition-all duration-500"
            style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Step list */}
      <ol className="space-y-0.5">
        {steps.map((step, i) => {
          const isActive = activeSection === step.id;
          const isDone = completedSteps.has(step.id);
          return (
            <li key={step.id}>
              <a
                href={`#${step.id}`}
                onClick={(e) => handleClick(e, step.id)}
                aria-current={isActive ? "location" : undefined}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                  isActive
                    ? "text-white bg-[#1E212E] font-medium"
                    : isDone
                    ? "text-[#BFFD11]/60 hover:text-[#BFFD11]"
                    : "text-[#797C86] hover:text-white/70"
                }`}
              >
                <span
                  className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                    isDone
                      ? "bg-[#BFFD11]/15 border border-[#BFFD11]/30"
                      : isActive
                      ? "bg-white/10 border border-white/20"
                      : "bg-white/5 border border-white/10"
                  }`}
                >
                  {isDone ? (
                    <Check size={10} color="#BFFD11" aria-hidden="true" />
                  ) : (
                    i + 1
                  )}
                </span>
                {step.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ─── Mobile Nav ───────────────────────────────────────────────────────────────

function MobileNav({
  steps,
  completedSteps,
  activeSection,
}: {
  steps: { id: string; label: string }[];
  completedSteps: Set<string>;
  activeSection: string;
}) {
  const [open, setOpen] = useState(false);
  const currentIdx = steps.findIndex((s) => s.id === activeSection);
  const currentLabel = steps[currentIdx]?.label ?? steps[0]?.label ?? "";

  const handleClick = (id: string) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="lg:hidden sticky top-16 z-40 bg-[#00040F]/95 backdrop-blur-sm border-b border-[#3A3C46]/40 px-4 py-2.5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 cursor-pointer"
        aria-expanded={open}
        aria-label="Toggle section navigation"
      >
        <span className="text-xs text-[#797C86] font-mono shrink-0">
          Step {currentIdx + 1} of {steps.length}
        </span>
        <span className="text-sm font-medium text-white truncate">
          {currentLabel}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-[#797C86] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="pt-2 pb-1 space-y-0.5">
          {steps.map((step, i) => {
            const isDone = completedSteps.has(step.id);
            const isActive = activeSection === step.id;
            return (
              <button
                key={step.id}
                onClick={() => handleClick(step.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors cursor-pointer ${
                  isActive
                    ? "text-white bg-[#1E212E] font-medium"
                    : isDone
                    ? "text-[#BFFD11]/60"
                    : "text-[#797C86]"
                }`}
              >
                <span
                  className={`shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono ${
                    isDone
                      ? "bg-[#BFFD11]/15 border border-[#BFFD11]/30"
                      : "bg-white/5 border border-white/10"
                  }`}
                >
                  {isDone ? (
                    <Check size={8} color="#BFFD11" aria-hidden="true" />
                  ) : (
                    i + 1
                  )}
                </span>
                {step.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────

interface BuildGuideShellProps {
  steps: { id: string; label: string }[];
  children: React.ReactNode;
}

export default function BuildGuideShell({
  steps,
  children,
}: BuildGuideShellProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [activeSection, setActiveSection] = useState(steps[0]?.id ?? "");

  const toggleComplete = (id: string) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // IntersectionObserver for active section tracking
  const stepsRef = useRef(steps);
  stepsRef.current = steps;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length === 0) return;
        const topmost = intersecting.sort(
          (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
        )[0];
        if (topmost) setActiveSection(topmost.target.id);
      },
      { rootMargin: "-10% 0% -60% 0%", threshold: 0 }
    );

    stepsRef.current.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <BuildGuideContext.Provider value={{ completedSteps, toggleComplete }}>
      {/* Mobile sticky nav */}
      <MobileNav
        steps={steps}
        completedSteps={completedSteps}
        activeSection={activeSection}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-12 items-start">
          {/* Sticky sidebar (desktop) */}
          <aside
            className="hidden lg:block sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto"
            aria-label="Guide navigation"
          >
            <Sidebar
              steps={steps}
              completedSteps={completedSteps}
              activeSection={activeSection}
            />
          </aside>

          {/* Scrollable content */}
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </BuildGuideContext.Provider>
  );
}
