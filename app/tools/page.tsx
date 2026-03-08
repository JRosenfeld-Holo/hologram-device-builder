import Link from "next/link";
import { ArrowRight, Terminal, GitBranch, MapPin } from "lucide-react";

export const metadata = {
  title: "Developer Tools — Hologram IoT Device Builder",
};

const tools = [
  {
    href: "/tools/at-command-reference",
    icon: Terminal,
    label: "REFERENCE",
    title: "AT Command Reference",
    description:
      "Searchable library of cellular AT commands — network configuration, power management, data transmission, security, and GPS. Expand any command for parameters, examples, and build guide cross-links.",
    tags: ["Search", "Copy-to-Clipboard", "Parameters", "Examples"],
    color: "#BFFD11",
    type: "Reference",
  },
  {
    href: "/tools/protocol-picker",
    icon: GitBranch,
    label: "DECISION TOOL",
    title: "Protocol Picker",
    description:
      "Answer 5 questions about your device\u2019s connectivity, power, and cloud requirements to get an MQTT / CoAP / LwM2M / HTTP recommendation with full rationale and trade-off analysis.",
    tags: ["Interactive Quiz", "MQTT", "CoAP", "LwM2M", "HTTP"],
    color: "#53F2FA",
    type: "Interactive",
  },
  {
    href: "/tools/gps-parser",
    icon: MapPin,
    label: "TOOL",
    title: "GPS Coordinate Parser",
    description:
      "Paste a raw +QGPSLOC response from a Quectel module and instantly parse UTC time, lat/lon, altitude, HDOP, satellites, speed, and course — with a one-click map link and Python reference code.",
    tags: ["Live Parser", "NMEA", "OpenStreetMap", "Python"],
    color: "#BFFD11",
    type: "Interactive",
  },
];

export default function ToolsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
      <div className="mb-12">
        <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-3">
          TOOLS
        </p>
        <h1 className="text-4xl font-semibold mb-5">Developer Tools</h1>
        <p className="text-lg text-white/55 leading-relaxed max-w-2xl">
          Interactive references, decision helpers, and parsing utilities for
          cellular IoT development. Each tool works standalone — no sign-up, no
          backend, everything runs in your browser.
        </p>
      </div>

      <div className="space-y-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="block group rounded-xl border border-[#3A3C46]/40 bg-[#060a14] hover:border-[#3A3C46]/70 transition-all duration-200 p-6 cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: `${tool.color}10`,
                    border: `1px solid ${tool.color}25`,
                  }}
                >
                  <Icon
                    size={18}
                    style={{ color: tool.color }}
                    strokeWidth={1.5}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span
                      className="font-mono text-[9px] font-semibold tracking-widest uppercase"
                      style={{ color: tool.color }}
                    >
                      {tool.label}
                    </span>
                    <span className="text-[10px] text-white/25 font-mono">
                      {tool.type}
                    </span>
                  </div>

                  <p className="text-lg font-semibold text-white mb-2 group-hover:text-white/90 transition-colors">
                    {tool.title}
                  </p>
                  <p className="text-sm text-white/40 leading-relaxed mb-4 max-w-xl">
                    {tool.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {tool.tags.map((tag) => (
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
