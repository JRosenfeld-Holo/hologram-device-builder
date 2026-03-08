"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Check, Shield } from "lucide-react";
import { motion } from "framer-motion";
import InfoCallout from "@/components/ui/InfoCallout";
import CodeBlock from "@/components/ui/CodeBlock";
import { staggerContainer, staggerItem } from "@/lib/animations";

const securityLayers = [
  {
    id: "endpoint",
    label: "LAYER 1",
    title: "Endpoint Security",
    color: "#BFFD11",
    items: [
      {
        label: "Secure Boot enabled",
        detail: "Verify firmware signature before execution. nRF9160 TrustZone enforces this automatically.",
        cmd: null,
      },
      {
        label: "Hardware Root of Trust (TRE) for key storage",
        detail: "Store cryptographic keys in hardware-isolated storage, not plain flash. Use nRF9160 ARM TrustZone or dedicated secure element.",
        cmd: null,
      },
      {
        label: "Soldered SIM (eSIM/iSIM) to prevent extraction",
        detail: "MFF2 form factor solders directly to PCB. Eliminates the SIM slot as a physical attack vector.",
        cmd: null,
      },
      {
        label: "Encrypted firmware storage",
        detail: "Enable flash encryption so firmware cannot be read even with physical access to the device.",
        cmd: null,
      },
    ],
  },
  {
    id: "network",
    label: "LAYER 2",
    title: "Network Isolation",
    color: "#53F2FA",
    items: [
      {
        label: "Private APN configured",
        detail: "Routes device traffic through a carrier-managed private network, isolated from the public internet.",
        cmd: 'AT+CGDCONT=1,"IP","your.private.apn"',
      },
      {
        label: "Packet Switched only — no SMS/voice attack surface",
        detail: "Disabling Circuit Switched prevents SMS-based attacks and reduces modem attack surface.",
        cmd: 'AT+QCFG="servicedomain",1',
      },
      {
        label: "Frequency bands locked to known good bands",
        detail: "Locking bands prevents the modem from connecting to rogue base stations on unsupported frequencies.",
        cmd: 'AT+QCFG="band",0,80000,80000',
      },
      {
        label: "Static IP assignment for firewall rules",
        detail: "Static IPs allow you to implement strict allowlist rules at the network perimeter.",
        cmd: null,
      },
    ],
  },
  {
    id: "application",
    label: "LAYER 3",
    title: "Application Security",
    color: "#BFFD11",
    items: [
      {
        label: "TLS/DTLS encryption on all payloads",
        detail: "DTLS for UDP-based protocols (CoAP, LwM2M). TLS for TCP-based (MQTT, HTTP). Never transmit plaintext.",
        cmd: "AT+QSSLCFG=\"sslversion\",1,4",
      },
      {
        label: "Certificate pinning enabled",
        detail: "Pin the server certificate fingerprint in firmware to prevent man-in-the-middle attacks even if a CA is compromised.",
        cmd: null,
      },
      {
        label: "Mutual TLS or token-based API authentication",
        detail: "Device presents a client certificate (mTLS) or a signed JWT. Server-only auth is insufficient for IoT.",
        cmd: null,
      },
      {
        label: "Rate limiting on inbound connections",
        detail: "Configure your cloud backend to reject excessive inbound requests per device IMEI/ID.",
        cmd: null,
      },
    ],
  },
];

export default function SecurityEndpointPage() {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const totalItems = securityLayers.reduce((acc, l) => acc + l.items.length, 0);
  const score = Math.round((checked.size / totalItems) * 100);

  const scoreColor =
    score === 100 ? "#BFFD11" : score >= 70 ? "#f59e0b" : score >= 40 ? "#f97316" : "#ef4444";
  const scoreLabel =
    score === 100 ? "Fully Hardened" : score >= 70 ? "Good" : score >= 40 ? "Needs Attention" : "At Risk";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
      <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-10" aria-label="Breadcrumb">
        <Link href="/learn" className="hover:text-white/60 transition-colors cursor-pointer">Learn</Link>
        <ChevronRight size={12} />
        <span className="text-white/50">Security</span>
        <ChevronRight size={12} />
        <span className="text-[#BFFD11]">Audit Checklist</span>
      </nav>

      <motion.div className="mb-12" variants={staggerContainer} initial="hidden" animate="visible">
        <motion.p variants={staggerItem} className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-3">
          Security · Interactive Audit
        </motion.p>
        <motion.h1 variants={staggerItem} className="text-4xl font-semibold mb-5 leading-tight">Security Audit Checklist</motion.h1>
        <motion.p variants={staggerItem} className="text-lg text-white/55 leading-relaxed max-w-2xl">
          Three layers of IoT security: endpoint hardening, network isolation, and application-layer
          encryption. Check off items as you implement them.
        </motion.p>
      </motion.div>

      {/* Score gauge */}
      <div
        className="rounded-xl border p-6 mb-10 flex items-center gap-6"
        style={{ borderColor: `${scoreColor}25`, background: `${scoreColor}06` }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
          style={{ border: `2px solid ${scoreColor}40`, background: `${scoreColor}10` }}
        >
          <Shield size={24} style={{ color: scoreColor }} strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <div className="flex items-end gap-3 mb-2">
            <span className="text-4xl font-semibold" style={{ color: scoreColor }}>
              {score}%
            </span>
            <span className="text-sm text-white/40 mb-1">{scoreLabel}</span>
          </div>
          <div className="h-2 bg-[#3A3C46]/30 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${score}%`, background: scoreColor }}
            />
          </div>
          <p className="text-xs text-white/30 mt-2">
            {checked.size} of {totalItems} controls implemented
          </p>
        </div>
      </div>

      {/* Security layers */}
      <div className="space-y-10">
        {securityLayers.map((layer) => {
          const layerChecked = layer.items.filter((_, i) =>
            checked.has(`${layer.id}-${i}`)
          ).length;
          return (
            <div key={layer.id}>
              <div className="flex items-center gap-3 mb-5">
                <span
                  className="font-mono text-[10px] font-semibold tracking-widest uppercase px-2 py-1 rounded"
                  style={{ color: layer.color, background: `${layer.color}12` }}
                >
                  {layer.label}
                </span>
                <h2 className="text-xl font-semibold">{layer.title}</h2>
                <span className="text-xs text-white/25 font-mono ml-auto">
                  {layerChecked}/{layer.items.length}
                </span>
              </div>

              <div className="rounded-xl border border-[#3A3C46]/40 overflow-hidden">
                <div className="divide-y divide-[#3A3C46]/15 bg-[#060a14]">
                  {layer.items.map((item, idx) => {
                    const key = `${layer.id}-${idx}`;
                    const isChecked = checked.has(key);
                    return (
                      <div
                        key={idx}
                        className={`p-5 transition-colors ${isChecked ? "bg-[#BFFD11]/3" : "hover:bg-white/[0.015]"}`}
                      >
                        <div className="flex items-start gap-4">
                          <button
                            onClick={() => toggle(key)}
                            className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all duration-150 cursor-pointer ${isChecked
                                ? "bg-[#BFFD11] border-[#BFFD11]"
                                : "border border-[#3A3C46]/60 hover:border-[#BFFD11]/40"
                              }`}
                            aria-label={isChecked ? "Uncheck" : "Check"}
                          >
                            {isChecked && (
                              <Check size={11} className="text-[#00040F]" strokeWidth={3} />
                            )}
                          </button>
                          <div className="flex-1">
                            <p
                              className={`text-sm font-medium mb-1.5 transition-colors ${isChecked ? "text-white/35 line-through" : "text-white/80"
                                }`}
                            >
                              {item.label}
                            </p>
                            <p className="text-xs text-white/35 leading-relaxed">{item.detail}</p>
                            {item.cmd && (
                              <div className="mt-3 rounded-lg bg-[#030710] px-3 py-2 font-mono text-xs text-[#BFFD11]/70 inline-block">
                                {item.cmd}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12">
        <InfoCallout type="tip">
          <strong>Security in depth:</strong> No single layer is sufficient. A compromised
          application certificate can be mitigated by network isolation. A network breach can be
          contained by endpoint encryption. Implement all three layers for production deployments.
        </InfoCallout>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-6">TLS Configuration Reference</h2>
        <CodeBlock
          language="at"
          title="Quectel DTLS/TLS setup"
          code={[
            { code: 'AT+QSSLCFG="sslversion",1,4', comment: "TLS 1.2 minimum", highlight: true },
            { code: 'AT+QSSLCFG="ciphersuite",1,0xFFFF', comment: "All ciphersuites (narrow in prod)" },
            { code: 'AT+QSSLCFG="cacert",1,"cacert.pem"', comment: "CA certificate for server verification" },
            { code: 'AT+QSSLCFG="clientcert",1,"client.pem"', comment: "Client cert for mTLS" },
            { code: 'AT+QSSLCFG="clientkey",1,"client.key"', comment: "Client private key" },
            { code: 'AT+QSSLCFG="seclevel",1,2', comment: "Mutual authentication (2=mTLS)" },
          ]}
        />
      </div>
    </div>
  );
}
