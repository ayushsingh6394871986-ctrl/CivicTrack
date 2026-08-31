'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  ShieldCheck,
  Sparkles,
  Trophy,
  Medal,
  Crown,
  Clock,
  CheckCircle2,
  TrendingUp,
  FileText,
  UserCheck,
  ThumbsUp,
  ArrowRight,
  Info,
  Calendar,
  Download,
  Printer,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import {
  getCurrentQuarterInfo,
  getCitizenCivicProfile,
  getQuarterlyTop3Leaderboard,
  CitizenCivicProfile,
  QuarterlyCycleInfo,
  GovtCertificateRecord
} from '@/lib/civicScore';
import GovtCertificateModal from '@/components/GovtCertificateModal';

export default function CivicScorePage() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const [profile, setProfile] = useState<CitizenCivicProfile | null>(null);
  const [quarterInfo, setQuarterInfo] = useState<QuarterlyCycleInfo | null>(null);
  const [leaderboard, setLeaderboard] = useState<CitizenCivicProfile[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<GovtCertificateRecord | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const q = getCurrentQuarterInfo();
    setQuarterInfo(q);

    const p = getCitizenCivicProfile(user);
    setProfile(p);

    const top3 = getQuarterlyTop3Leaderboard(p);
    setLeaderboard(top3);
  }, [user]);

  if (!mounted || !profile || !quarterInfo) return null;

  const generateInstantCertForUser = () => {
    const userRank = (profile.quarterRank && profile.quarterRank <= 3) ? profile.quarterRank : 1;
    const cert: GovtCertificateRecord = {
      certificateId: `MC-CIVIC-${quarterInfo.quarterCode}-${Math.floor(1000 + Math.random() * 9000)}`,
      quarterCode: quarterInfo.quarterCode,
      quarterLabel: quarterInfo.quarterLabel,
      rank: userRank as any,
      rankTitle: userRank === 1 ? 'Gold Medal of Civic Excellence' : userRank === 2 ? 'Silver Medal of Civic Honour' : 'Bronze Civic Merit Medal',
      recipientName: profile.displayName,
      recipientEmail: profile.email,
      pointsEarned: profile.quarterlyPoints,
      issuesResolved: profile.reportsResolvedCount,
      issueCity: 'Municipal Corporation Jurisdiction',
      issuedAt: new Date().toISOString(),
      authoritySignature: 'Commissioner of Municipal Governance',
      authorityTitle: 'Director General of Public Infrastructure & Grievances',
    };
    setSelectedCertificate(cert);
    setIsCertModalOpen(true);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs font-mono font-bold text-[#1A56A4] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
              Quarterly Civic Honor System
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Citizen Civic Sense Score & Leadership
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl font-medium">
            Transparent municipal reputation rating, quarterly leaderboard cycles, and official Government Civic Honour certificates.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={generateInstantCertForUser}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-2xl shadow-md transition-all flex items-center space-x-2 active:scale-95 cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>Generate Official Certificate</span>
          </button>
        </div>
      </div>

      {/* QUARTERLY CYCLE BANNER */}
      <div className="bg-gradient-to-r from-[#1A56A4] via-blue-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-2 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-amber-300">
              <Calendar className="w-3.5 h-3.5" />
              <span>Active 3-Month Competition Cycle</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {quarterInfo.quarterLabel}
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-medium">
              Every 3 months, top-ranked citizens earn the official <strong className="text-amber-300">Municipal Civic Honour Award</strong> and signed Government Certificate. Competition points reset quarterly while your permanent Civic Sense Score is preserved.
            </p>
          </div>

          <div className="bg-slate-950/40 backdrop-blur-md border border-white/20 p-5 rounded-2xl md:w-72 shrink-0 space-y-2 text-center">
            <span className="text-[10px] font-extrabold uppercase text-blue-200 tracking-wider block">
              Quarter Countdown
            </span>
            <div className="text-xl font-black text-white">
              {quarterInfo.quarterLabel}
            </div>
            <div className="text-xs font-mono text-amber-300 font-bold bg-amber-400/20 py-1 px-2.5 rounded-lg inline-block">
              ⏳ {quarterInfo.daysRemaining} Days Remaining
            </div>
          </div>
        </div>
      </div>

      {/* TOP 3 QUARTERLY LEADERBOARD */}
      <div className="space-y-6">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Top 3 Citizens</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {leaderboard.slice(0, 3).map((citizen, idx) => {
            const isFirst = idx === 0;
            const isSecond = idx === 1;

            return (
              <div
                key={citizen.userId}
                className={`bg-white dark:bg-[#151C2C] p-6 rounded-3xl border-2 transition-all space-y-4 relative overflow-hidden ${
                  isFirst
                    ? 'border-amber-400/90 dark:border-amber-500/60 shadow-lg shadow-amber-500/10 bg-gradient-to-b from-amber-500/[0.04] to-transparent'
                    : isSecond
                    ? 'border-slate-300 dark:border-slate-700 shadow-sm bg-gradient-to-b from-slate-500/[0.03] to-transparent'
                    : 'border-amber-600/40 dark:border-amber-800/60 shadow-sm bg-gradient-to-b from-amber-600/[0.03] to-transparent'
                }`}
              >
                {/* Rank Badge */}
                <div className="flex items-center justify-between">
                  {isFirst ? (
                    <span className="inline-flex items-center space-x-1.5 text-xs font-black uppercase px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-950/80 dark:to-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-xs">
                      <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Rank #1 • Gold</span>
                    </span>
                  ) : isSecond ? (
                    <span className="inline-flex items-center space-x-1.5 text-xs font-black uppercase px-3 py-1 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700/60 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 shadow-xs">
                      <Medal className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />
                      <span>Rank #2 • Silver</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1.5 text-xs font-black uppercase px-3 py-1 rounded-full bg-gradient-to-r from-amber-100/70 to-orange-100 dark:from-amber-950/50 dark:to-amber-900/30 text-amber-800 dark:text-amber-400 border border-amber-300/80 dark:border-amber-800 shadow-xs">
                      <Award className="w-3.5 h-3.5 text-amber-700 dark:text-amber-500" />
                      <span>Rank #3 • Bronze</span>
                    </span>
                  )}

                  <span className="text-xs font-mono font-black text-amber-600 dark:text-amber-400">
                    {citizen.quarterlyPoints} Pts (Qtr)
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {citizen.displayName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Civic Score: <strong className="text-[#1A56A4] dark:text-blue-400">{citizen.civicScore}</strong> • {citizen.civicTier}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Reports Filed</span>
                    <strong className="text-slate-900 dark:text-white font-mono">{citizen.reportsFiledCount}</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Resolved</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{citizen.reportsResolvedCount}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const c: GovtCertificateRecord = {
                      certificateId: `MC-CIVIC-${quarterInfo.quarterCode}-000${idx + 1}`,
                      quarterCode: quarterInfo.quarterCode,
                      quarterLabel: quarterInfo.quarterLabel,
                      rank: (idx + 1) as any,
                      rankTitle: isFirst ? 'Gold Medal of Civic Excellence' : isSecond ? 'Silver Medal of Civic Honour' : 'Bronze Civic Merit Medal',
                      recipientName: citizen.displayName,
                      recipientEmail: citizen.email,
                      pointsEarned: citizen.lifetimePoints,
                      issuesResolved: citizen.reportsResolvedCount,
                      issueCity: 'Municipal Corporation Jurisdiction',
                      issuedAt: new Date().toISOString(),
                      authoritySignature: 'Commissioner of Municipal Governance',
                      authorityTitle: 'Director General of Public Infrastructure & Grievances',
                    };
                    setSelectedCertificate(c);
                    setIsCertModalOpen(true);
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-amber-50 dark:bg-slate-800 dark:hover:bg-amber-950/40 text-slate-700 hover:text-amber-800 dark:text-slate-300 dark:hover:text-amber-300 text-xs font-extrabold rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Preview Govt Certificate</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Govt Certificate Modal */}
      <GovtCertificateModal
        certificate={selectedCertificate}
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
      />

    </div>
  );
}

