"use client";

import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer, staggerItem, inView } from "@/lib/animations";

const STORE_URL = "https://store.hologram.io/";
const PROMO_CODE = "FREEPILOTSIM";

const benefits = [
  "Free SIM card shipped to you",
  "Test data included — no credit card needed",
  "Full access to the Hologram Dashboard",
  "REST API + webhooks from day one",
];

function PromoCodeCopy() {
  return (
    <div className="inline-flex items-center gap-0 rounded-xl overflow-hidden border border-[#BFFD11]/30">
      <div className="px-4 py-2.5 bg-[#BFFD11]/8 border-r border-[#BFFD11]/20">
        <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-[#BFFD11]/60 mb-0.5">
          Promo Code
        </p>
        <p className="font-mono text-lg font-semibold tracking-widest text-[#BFFD11] leading-none">
          {PROMO_CODE}
        </p>
      </div>
      <a
        href={STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-3 text-xs text-[#BFFD11]/50 hover:text-[#BFFD11] hover:bg-[#BFFD11]/5 transition-all duration-150 cursor-pointer"
        aria-label="Visit Hologram store"
      >
        <ArrowRight size={14} />
      </a>
    </div>
  );
}

export default function FreePilotCTA() {
  return (
    <motion.section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24"
      variants={fadeUp}
      {...inView}
    >
      {/* Outer card */}
      <div className="relative rounded-3xl overflow-hidden border border-[#BFFD11]/20 bg-[#030810]">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute top-0 left-0 w-[600px] h-[400px] rounded-full blur-[120px]"
            style={{ background: "radial-gradient(ellipse, rgba(191,253,17,0.07) 0%, transparent 70%)" }}
          />
          <div
            className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full blur-[100px]"
            style={{ background: "radial-gradient(ellipse, rgba(83,242,250,0.05) 0%, transparent 70%)" }}
          />
        </div>

        <div className="relative grid lg:grid-cols-[1fr_420px] gap-0 items-stretch">
          {/* Left: copy */}
          <div className="px-8 sm:px-12 py-12 flex flex-col justify-center">
            {/* Eyebrow */}
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#BFFD11]/25 bg-[#BFFD11]/5 mb-8 w-fit"
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#BFFD11] animate-pulse" aria-hidden="true" />
              <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11]">
                Free Pilot Program
              </span>
            </motion.div>

            {/* Logo */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Image
                src="/hologram-logo.svg"
                alt="Hologram"
                width={160}
                height={42}
                className="h-10 w-auto"
              />
            </motion.div>

            <motion.h2
              className="text-3xl sm:text-4xl font-semibold leading-tight mb-4"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.15 }}
            >
              Start building today.
              <br />
              <span className="text-[#BFFD11]">Free SIM included.</span>
            </motion.h2>

            <motion.p
              className="text-base text-white/55 leading-relaxed mb-8 max-w-lg"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.2 }}
            >
              Sign up for a free Hologram account and claim your free SIM card.
              No credit card required. Includes test data, full Dashboard access,
              and complete API access from the moment you activate.
            </motion.p>

            {/* Benefits list — staggered */}
            <motion.ul
              className="space-y-2.5 mb-10"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {benefits.map((benefit) => (
                <motion.li
                  key={benefit}
                  variants={staggerItem}
                  className="flex items-center gap-3 text-sm text-white/70"
                >
                  <div className="w-5 h-5 rounded-full bg-[#BFFD11]/15 border border-[#BFFD11]/25 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-[#BFFD11]" strokeWidth={2.5} />
                  </div>
                  {benefit}
                </motion.li>
              ))}
            </motion.ul>

            {/* Promo code */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.35 }}
            >
              <PromoCodeCopy />
            </motion.div>

            {/* CTA button */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.42 }}
            >
              <motion.a
                href={STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl bg-[#BFFD11] text-[#00040F] font-semibold text-base transition-colors duration-200 cursor-pointer w-fit"
                whileHover={{ scale: 1.04, backgroundColor: "#BFFD11" }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 350, damping: 22 }}
              >
                Claim Your Free SIM
                <ArrowRight size={18} />
              </motion.a>
            </motion.div>

            <p className="text-xs text-white/25 mt-4">
              Use code <span className="font-mono text-white/40">{PROMO_CODE}</span> at checkout ·{" "}
              <a
                href={STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/50 transition-colors cursor-pointer"
              >
                store.hologram.io
              </a>
            </p>
          </div>

          {/* Right: SIM card visual */}
          <div className="relative hidden lg:flex items-center justify-center bg-[#020609] border-l border-[#BFFD11]/10 p-8">
            {/* Subtle grid */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(rgba(191,253,17,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(191,253,17,0.5) 1px, transparent 1px)`,
                backgroundSize: "40px 40px",
              }}
              aria-hidden="true"
            />

            {/* SIM card image — floating animation */}
            <div className="relative z-10">
              {/* Pulsing glow */}
              <motion.div
                className="absolute -inset-8 rounded-full blur-[60px] bg-[#BFFD11]/10"
                animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden="true"
              />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Image
                  src="/sim-card.png"
                  alt="Hologram SIM card"
                  width={320}
                  height={400}
                  className="relative w-64 h-auto drop-shadow-2xl"
                  style={{ filter: "drop-shadow(0 0 40px rgba(191,253,17,0.18))" }}
                />
              </motion.div>
            </div>

            {/* Floating badge */}
            <div className="absolute bottom-8 left-8 right-8">
              <div className="rounded-xl border border-[#BFFD11]/20 bg-[#BFFD11]/5 px-4 py-3.5 backdrop-blur-sm">
                <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-[#BFFD11]/60 mb-2.5">
                  What&apos;s included
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {[
                    "Free SIM",
                    "Test Data",
                    "API & Dashboard",
                    "190+ Countries",
                    "550+ Carriers",
                    "2G–5G · NB-IoT · CAT-1",
                  ].map((tag) => (
                    <div key={tag} className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded-full bg-[#BFFD11]/15 border border-[#BFFD11]/25 flex items-center justify-center shrink-0">
                        <Check size={8} className="text-[#BFFD11]" strokeWidth={2.5} />
                      </div>
                      <span className="text-[11px] text-white/60 font-mono leading-none">{tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
