import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const roobert = localFont({
  src: [
    {
      path: './fonts/Roobert-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Roobert-Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/Roobert-SemiBold.otf',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/Roobert-Bold.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-roobert',
});

const messinaMono = localFont({
  src: [
    {
      path: './fonts/MessinaSansMono-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/MessinaSansMono-SemiBold.otf',
      weight: '600',
      style: 'normal',
    },
  ],
  variable: '--font-messina-mono',
});

export const metadata: Metadata = {
  title: "Hologram IoT Device Builder",
  description:
    "An interactive learning platform that teaches engineers how to build cellular-connected devices. From selecting the right network technology to deploying securely at scale.",
  openGraph: {
    title: "Hologram IoT Device Builder",
    description: "Build Connected Devices That Just Work",
    type: "website",
  },
  icons: {
    icon: "/hologram-mark.svg",
    shortcut: "/hologram-mark.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${roobert.variable} ${messinaMono.variable}`}>
      <body className="bg-transparent text-white antialiased font-sans">
        {/* Ambient animated background */}
        <div className="ambient-bg" aria-hidden="true">
          <div className="ambient-orb ambient-orb--1" />
          <div className="ambient-orb ambient-orb--2" />
          <div className="ambient-orb ambient-orb--3" />
          <div className="ambient-orb ambient-orb--4" />
        </div>

        {/* Content layer */}
        <div className="relative z-[1]">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-[#BFFD11] focus:text-[#00040F] focus:font-semibold focus:rounded-lg focus:text-sm focus:shadow-lg"
          >
            Skip to content
          </a>
          <Navbar />
          <main id="main-content" className="min-h-screen">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
