'use client';

import React from 'react';
import { Shield, Info, Camera, Search, CheckCircle2, Wrench, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useUserLocation } from '@/lib/useUserLocation';

export default function Footer() {
  const userLocation = useUserLocation();
  const cityDisplay = userLocation.isLoaded && userLocation.city !== 'Detecting location...' ? userLocation.city : 'Local';

  return (
    <footer className="bg-[#1E2328] text-[#9CA3AF] text-xs border-t-2 border-[#D95F02] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand col */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2.5 text-white font-bold text-base group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icon.png"
                alt="CivicTrack"
                className="w-8 h-8 rounded-xl shadow-sm group-hover:scale-105 transition-transform object-cover"
              />
              <span className="font-extrabold tracking-tight">CivicTrack</span>
            </Link>
            <p className="text-[#9CA3AF] leading-relaxed text-xs">
              Turning civic complaints into traceable digital tickets with computer vision validation, geofenced alerts, and transparent resolution evidence.
            </p>

            {/* Quick platform actions */}
            <div className="pt-1">
              <span className="text-[10px] uppercase font-bold text-[#6B7280] tracking-wider block mb-1.5">
                Quick Platform Actions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <Link href="/report" className="px-2.5 py-1 rounded-md bg-[#D95F02]/20 hover:bg-[#D95F02]/30 border border-[#D95F02]/40 text-[#D95F02] font-bold text-[11px] flex items-center space-x-1 transition-colors">
                  <Camera className="w-3 h-3" /><span>Report</span>
                </Link>
                <Link href="/my-complaints" className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-[#9CA3AF] font-bold text-[11px] flex items-center space-x-1 transition-colors">
                  <Search className="w-3 h-3" /><span>Track</span>
                </Link>
                <Link href="/dashboard" className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-[#9CA3AF] font-bold text-[11px] flex items-center space-x-1 transition-colors">
                  <CheckCircle2 className="w-3 h-3 text-[#176B3A]" /><span>Verify</span>
                </Link>
                <Link href="/department" className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-[#9CA3AF] font-bold text-[11px] flex items-center space-x-1 transition-colors">
                  <Wrench className="w-3 h-3" /><span>Resolve</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <div>
            <h4 className="text-white font-bold mb-3 text-sm">Navigation</h4>
            <ul className="space-y-2.5">
              <li><Link href="/report" className="hover:text-[#D95F02] transition-colors flex items-center space-x-1.5"><ArrowRight className="w-3 h-3 text-[#D95F02]" /><span>Report Issue (Camera + AI)</span></Link></li>
              <li><Link href="/map" className="hover:text-[#D95F02] transition-colors flex items-center space-x-1.5"><ArrowRight className="w-3 h-3 text-[#D95F02]" /><span>Civic Map & Heatmap</span></Link></li>
              <li><Link href="/my-complaints" className="hover:text-[#D95F02] transition-colors flex items-center space-x-1.5"><ArrowRight className="w-3 h-3 text-[#D95F02]" /><span>Track Complaint Status</span></Link></li>
              <li><Link href="/dashboard" className="hover:text-[#D95F02] transition-colors flex items-center space-x-1.5"><ArrowRight className="w-3 h-3 text-[#D95F02]" /><span>Public Accountability Board</span></Link></li>
              <li><Link href="/department" className="hover:text-[#D95F02] transition-colors flex items-center space-x-1.5"><ArrowRight className="w-3 h-3 text-[#D95F02]" /><span>Department Portal</span></Link></li>
            </ul>
          </div>

          {/* Transparency guardrails */}
          <div className="md:col-span-2 space-y-2.5">
            <div className="flex items-center space-x-2 text-[#D95F02] font-bold text-xs">
              <Info className="w-4 h-4" />
              <span>CivicTrack Non-Negotiable Guardrails</span>
            </div>
            <div className="bg-white/5 rounded-xl p-4 space-y-2 text-[11px] text-[#D1D5DB] border border-white/10 leading-relaxed">
              <p><strong className="text-white">Zone-Level Accountability:</strong> CivicTrack measures performance at the municipal zone and department level. We never display personal information or individual employee names.</p>
              <p><strong className="text-white">Resolution Evidence:</strong> Before/After submissions represent field resolution evidence subject to citizen confirmation, not an official government certificate.</p>
              <p><strong className="text-white">15-Day / 500-Upvote SLA:</strong> The 15-day target and 500-upvote timeline compression are CivicTrack&apos;s independent public accountability mechanisms, not official statutory SLAs.</p>
              <p><strong className="text-white">Verified Budget Sources:</strong> All municipal budget figures are linked directly to official municipal audit PDFs with full source citations.</p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#6B7280]">
          <div>&copy; {new Date().getFullYear()} CivicTrack Platform &bull; Built for transparent, accountable civic infrastructure.</div>
          <div className="mt-2 sm:mt-0 flex items-center space-x-4">
              <span className="inline-flex items-center space-x-1.5 text-[#9CA3AF]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#176B3A]" />
              <span suppressHydrationWarning>{cityDisplay} Municipal Grievance Ward Network</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
