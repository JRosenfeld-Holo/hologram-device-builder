import Link from "next/link";
import { ArrowRight, Rocket, RefreshCw, ChevronRight } from "lucide-react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deploy — Hologram IoT Device Builder",
  description: "Pilot playbook and device lifecycle management guides for cellular IoT deployments at scale.",
};

const deployLessons = [
  {
    href: "/deploy/pilot-playbook",
    icon: Rocket,
    label: "PILOT",
    title: "From POC to Production",
    description: "Strategic scoping, hardware & connectivity selection, security architecture, zero-touch provisioning, validation phases, and regulatory certification.",
    tags: ["Scoping", "Security", "ZTP", "EVT/DVT/PVT", "Certifications"],
    color: "#BFFD11",
    readTime: "18 min",
  },
  {
    href: "/deploy/lifecycle",
    icon: RefreshCw,
    label: "LIFECYCLE",
    title: "Fleet Lifecycle Management",
    description: "Operational monitoring, predictive maintenance, FOTA updates, supply chain resilience, and secure end-of-life decommissioning.",
    tags: ["Monitoring", "Predictive Maintenance", "FOTA", "Decommissioning"],
    color: "#53F2FA",
    readTime: "15 min",
  },
];

export default function DeployPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
      <div className="mb-12">
        <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-3">
          DEPLOY
        </p>
        <h1 className="text-4xl font-semibold mb-5">Deploy</h1>
        <p className="text-lg text-white/55 leading-relaxed max-w-2xl">
          From pilot to production — a structured methodology for escaping &quot;pilot purgatory&quot;
          and managing IoT fleets across 10–20 year lifespans. Covers provisioning, monitoring,
          FOTA, compliance, and secure sunset.
        </p>
      </div>

      <div className="space-y-4">
        {deployLessons.map((lesson) => {
          const Icon = lesson.icon;
          return (
            <Link
              key={lesson.href}
              href={lesson.href}
              className="block group rounded-xl border border-[#3A3C46]/40 bg-[#060a14] hover:border-[#3A3C46]/70 transition-all duration-200 p-6 cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: `${lesson.color}10`,
                    border: `1px solid ${lesson.color}25`,
                  }}
                >
                  <Icon size={18} style={{ color: lesson.color }} strokeWidth={1.5} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span
                      className="font-mono text-[9px] font-semibold tracking-widest uppercase"
                      style={{ color: lesson.color }}
                    >
                      {lesson.label}
                    </span>
                    <span className="text-[10px] text-white/25 font-mono">{lesson.readTime}</span>
                  </div>

                  <p className="text-lg font-semibold text-white mb-2 group-hover:text-white/90 transition-colors">
                    {lesson.title}
                  </p>
                  <p className="text-sm text-white/40 leading-relaxed mb-4 max-w-xl">
                    {lesson.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {lesson.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#3A3C46]/20 text-white/30 border border-[#3A3C46]/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <ArrowRight
                  size={16}
                  className="text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all duration-200 shrink-0 mt-1"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
