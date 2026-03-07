import type { Variants, Transition } from "framer-motion";

// ─── Spring presets ────────────────────────────────────────────────────────────

export const spring: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 25,
};

export const softSpring: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 30,
};

export const snappy: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 28,
};

// ─── Variants ─────────────────────────────────────────────────────────────────

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export const shake: Variants = {
  hidden: { x: 0 },
  visible: {
    x: [0, -5, 5, -5, 5, 0],
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// ─── Viewport helper ──────────────────────────────────────────────────────────

export const inView = {
  initial: "hidden" as const,
  whileInView: "visible" as const,
  viewport: { once: true, margin: "-60px" },
};
