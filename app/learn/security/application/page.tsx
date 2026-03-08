import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Application-Layer Security — Hologram IoT Device Builder",
};

export default function LearnSecurityApplicationPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
      <div className="mb-12">
        <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11] mb-3">
          SECURITY
        </p>
        <h1 className="text-4xl font-semibold mb-5">Application-Layer Security</h1>
        <p className="text-lg text-white/55 leading-relaxed max-w-2xl">
          TLS/DTLS encryption, certificate pinning, mutual TLS authentication, and payload-level encryption for IoT applications.
        </p>
      </div>

      <div className="rounded-xl border border-[#3A3C46]/40 bg-[#060a14] p-8 text-center">
        <p className="text-white/30 text-sm mb-6">This lesson is coming soon.</p>
        <Link
          href="/learn/security/network"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#BFFD11] text-[#00040F] text-sm font-semibold hover:bg-[#d4ff3d] transition-colors cursor-pointer"
        >
          Network Security <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
