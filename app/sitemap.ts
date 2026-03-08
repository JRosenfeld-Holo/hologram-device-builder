import type { MetadataRoute } from "next";

const BASE = "https://iotbuilder.hologram.io";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    // Root
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },

    // Section landings
    { url: `${BASE}/build`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/learn`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/tools`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/deploy`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },

    // Build guides
    { url: `${BASE}/build/asset-tracker`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/build/smart-camera`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/build/smart-building`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/build/smart-agriculture`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/build/micromobility`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/build/remote-patient-monitoring`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },

    // Learn — Foundations
    { url: `${BASE}/learn/foundations/architecture`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/learn/foundations/cellular-networks`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/learn/foundations/lpwa-technologies`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/learn/foundations/5g-redcap`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },

    // Learn — Power
    { url: `${BASE}/learn/power/psm-edrx`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/learn/power/battery-calculator`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },

    // Learn — Identity
    { url: `${BASE}/learn/identity/sim-evolution`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/learn/identity/sgp32`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },

    // Learn — Security
    { url: `${BASE}/learn/security/endpoint`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/learn/security/network`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/learn/security/application`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },

    // Tools
    { url: `${BASE}/tools/at-command-reference`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/tools/gps-parser`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/tools/protocol-picker`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },

    // Deploy
    { url: `${BASE}/deploy/pilot-playbook`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/deploy/lifecycle`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];
}
