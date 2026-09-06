'use client';

import React from 'react';
import Link from 'next/link';
import { Leaf } from 'lucide-react';
import AppNavbar from '@/components/AppNavbar';
import HeroInteractiveDemo from '@/components/landing/HeroInteractiveDemo';
import ProblemSection from '@/components/landing/ProblemSection';
import AudienceSplitSection from '@/components/landing/AudienceSplitSection';
import RoiSection from '@/components/landing/RoiSection';
import FinalCtaSection from '@/components/landing/FinalCtaSection';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#131F17] flex flex-col font-sans selection:bg-[#2D6A4F] selection:text-white">
      {/* Top Shared Navigation Bar */}
      <AppNavbar />

      <main className="flex-1">
        {/* 1. Hero: What GreenYatra is + Centerpiece Interactive Demo (Routes, Omitted Modes, Live Hotel Gauge) */}
        <HeroInteractiveDemo />

        {/* 2. What Each Side Gets: B2C vs B2B Platform Architecture */}
        <AudienceSplitSection />

        {/* 3. Why It's Worth It: Hotel Loyalty Program Unit Economics & Net Profit ROI */}
        <RoiSection />

        {/* 4. The Two-Sided Market Failure (Second-last position) */}
        <ProblemSection />

        {/* 5. Clear Next Steps for Each Audience: Dual CTA */}
        <FinalCtaSection />
      </main>

      {/* Semantic Editorial Footer */}
      <footer className="bg-white border-t border-[#E5DED3] py-14 text-xs text-[#5A6B5F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Brand Column (5 cols) */}
            <div className="md:col-span-5 space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#2D6A4F] text-white flex items-center justify-center">
                  <Leaf className="w-4 h-4" aria-hidden="true" />
                </div>
                <span className="font-serif font-bold text-lg text-[#131F17] tracking-tight">
                  GreenYatra
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EAF3ED] text-[#2D6A4F] border border-[#C2DEC9]">
                  ESG Hospitality OS
                </span>
              </div>
              <p className="text-xs text-[#5A6B5F] max-w-sm leading-relaxed">
                India&apos;s two-sided sustainable and accessible travel ecosystem. Connecting
                free-text multi-modal route planning with audited hotel utility telemetry and
                profitable in-stay loyalty rewards.
              </p>
              <div className="text-[11px] font-mono text-[#7A8A7F] space-y-1">
                <p>&bull; Emission calculations conform to the GHG Protocol Corporate Standard.</p>
                <p>&bull; Real-time transit feasibility powered by Mapbox GL &amp; Climatiq API.</p>
              </div>
            </div>

            {/* Traveler Solutions (3 cols) */}
            <div className="md:col-span-3 space-y-3">
              <h3 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#131F17]">
                Traveler Platform
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/traveler" className="hover:text-[#2D6A4F] transition-colors">
                    Multi-Modal Route Planner
                  </Link>
                </li>
                <li>
                  <Link href="/traveler/hotels" className="hover:text-[#2D6A4F] transition-colors">
                    Green Score Hotel Discovery
                  </Link>
                </li>
                <li>
                  <Link href="/traveler/stay" className="hover:text-[#2D6A4F] transition-colors">
                    In-Stay Eco-Points Wallet
                  </Link>
                </li>
                <li>
                  <Link href="/auth/traveler" className="hover:text-[#2D6A4F] transition-colors">
                    Traveler Account Sign In
                  </Link>
                </li>
              </ul>
            </div>

            {/* Hotel Solutions (4 cols) */}
            <div className="md:col-span-4 space-y-3">
              <h3 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#131F17]">
                Hotel Enterprise
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/hotel" className="hover:text-[#2D6A4F] transition-colors">
                    Hotel ESG Management Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/hotel/onboard" className="hover:text-[#2D6A4F] transition-colors">
                    Property Onboarding &amp; Baseline Audit
                  </Link>
                </li>
                <li>
                  <Link href="/auth/hotel" className="hover:text-[#2D6A4F] transition-colors">
                    Hotel Operator Portal Login
                  </Link>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-[#2D6A4F] transition-colors">
                    Green Score Formula Specification
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-[#E5DED3] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#7A8A7F]">
            <p>&copy; {new Date().getFullYear()} GreenYatra Technologies Pvt. Ltd. All rights reserved.</p>
            <div className="flex items-center gap-4 font-mono">
              <span>Climatiq Certified</span>
              <span>&bull;</span>
              <span>Mapbox Vector Contours</span>
              <span>&bull;</span>
              <span>Gemini Intelligence</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
