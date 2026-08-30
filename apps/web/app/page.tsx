'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Camera, MapPin, CheckCircle, AlertTriangle, ArrowRight,
  FileCheck, Clock, ThumbsUp, Search, LocateFixed,
  Wrench, Activity
} from 'lucide-react';
import { getStoredIssues, getDashboardMetrics, upvoteIssue } from '@/lib/store';
import { CivicIssue, DashboardMetrics } from '@/lib/types';
import MapView from '@/components/MapView';
import { useUserLocation } from '@/lib/useUserLocation';
import { sortIssuesByNearest, SortedCivicIssue } from '@/lib/geoDistance';
import EvidenceModal from '@/components/EvidenceModal';


import { INITIAL_ISSUES } from '@/lib/seedData';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [issues, setIssues] = useState<CivicIssue[]>(INITIAL_ISSUES);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [searchComplaint, setSearchComplaint] = useState('');

  const [selectedIssueForEvidence, setSelectedIssueForEvidence] = useState<CivicIssue | null>(null);
  const userLocation = useUserLocation();

  const loadData = () => {
    setIssues(getStoredIssues());
    setMetrics(getDashboardMetrics());
  };

  useEffect(() => {
    setMounted(true);
    loadData();
    const handleStoreUpdate = () => loadData();
    if (typeof window !== 'undefined') {
      window.addEventListener('civictrack_store_updated', handleStoreUpdate);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('civictrack_store_updated', handleStoreUpdate);
      }
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchComplaint.trim()) window.location.href = `/track/${searchComplaint.trim()}`;
  };

  const handleUpvote = (id: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    upvoteIssue(id); loadData();
  };

  if (!mounted) return null;

  const sortedIssues: SortedCivicIssue[] = sortIssuesByNearest(
    userLocation.latitude, userLocation.longitude, issues
  );

  return (
    <div className="space-y-8 pb-12">

      {/* ── Hero Banner ─────────────────────────────────────────────── */}
      <section className="relative rounded-2xl overflow-hidden bg-white border-2 border-[#C9C4BA] shadow-md p-6 sm:p-12">
        {/* Hazard stripe at top edge */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#D95F02]" />
        <div className="relative z-10 max-w-4xl space-y-6">

          <div className="inline-flex items-center space-x-2 bg-[#EEF4FF] border border-[#1A56A4]/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#1A56A4]">
            <Activity className="w-4 h-4 animate-pulse shrink-0" />
            <span suppressHydrationWarning>{userLocation.isLoaded ? `${userLocation.city} Municipal Grievance & SLA Command` : 'Municipal Infrastructure Control System'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1E2328] leading-tight">
            Municipal Infrastructure<br />Defect Docket & Audit System
          </h1>

          <p className="text-sm sm:text-base text-[#6B6860] leading-relaxed max-w-3xl font-medium">
            Edge computer vision validation via YOLOv8, PostGIS ward spatial routing, 15-day SLA compliance countdowns, 500-upvote emergency compression, and citizen-verified photo closure.
          </p>

          {/* Primary Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/report"
              className="flex items-center space-x-3 px-8 py-4 rounded-2xl bg-[#B91C1C] hover:bg-[#991B1B] text-white font-extrabold text-sm tracking-wide shadow-xl animate-pulse hover:animate-none transition-all active:scale-95"
            >
              <AlertTriangle className="w-5 h-5" />
              <span className="uppercase tracking-widest">Report Civic Issue</span>
              <span className="hidden sm:inline-block text-[10px] font-mono-data bg-white/20 px-2 py-0.5 rounded-md">
                Live Scanner
              </span>
            </Link>
            <Link
              href="/map"
              className="px-6 py-4 rounded-2xl bg-[#EEF4FF] hover:bg-[#DBEAFE] text-[#1A56A4] border border-[#1A56A4]/30 font-bold text-xs sm:text-sm transition-all flex items-center space-x-2"
            >
              <MapPin className="w-4 h-4" />
              <span>GIS Map Layer</span>
            </Link>
          </div>



          {/* Ticket Lookup */}
          <form onSubmit={handleSearchSubmit} className="pt-2 max-w-md">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-[#6B6860] absolute left-3.5" />
              <input
                type="text"
                value={searchComplaint}
                onChange={(e) => setSearchComplaint(e.target.value)}
                placeholder="Track ticket docket ID (e.g. CTR-2026-...)"
                className="w-full pl-10 pr-24 py-2.5 bg-white border-2 border-[#C9C4BA] rounded-xl text-xs font-mono-data text-[#1E2328] placeholder-[#9CA3AF] focus:outline-none focus:border-[#1A56A4]"
              />
              <button type="submit" className="absolute right-1.5 px-3 py-1.5 bg-[#D95F02] hover:bg-[#C04F00] text-white text-xs font-bold rounded-lg transition-colors">
                Lookup
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ── KPI Metrics Strip ───────────────────────────────────────── */}
      {metrics && (
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border-2 border-[#C9C4BA] rounded-xl p-5 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs text-[#6B6860] font-semibold">
              <span>Registered Dockets</span><FileCheck className="w-4 h-4" />
            </div>
            <div className="text-3xl font-extrabold text-[#1E2328] font-mono-data">{metrics.total_issues}</div>
            <p className="text-[11px] text-[#6B6860] font-medium">YOLOv8 Edge Validated</p>
          </div>

          <div className="bg-white border-2 border-[#C9C4BA] rounded-xl p-5 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs text-[#176B3A] font-semibold">
              <span>Verified Resolved</span><CheckCircle className="w-4 h-4" />
            </div>
            <div className="text-3xl font-extrabold text-[#176B3A] font-mono-data">{metrics.resolved_issues}</div>
            <p className="text-[11px] text-[#6B6860] font-medium">Citizen Vote Confirmed</p>
          </div>

          <div className="bg-white border-2 border-[#C9C4BA] rounded-xl p-5 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs text-[#1A56A4] font-semibold">
              <span>Active Dispatch</span><Clock className="w-4 h-4" />
            </div>
            <div className="text-3xl font-extrabold text-[#1A56A4] font-mono-data">{metrics.active_issues}</div>
            <p className="text-[11px] text-[#6B6860] font-medium">Within 15-Day Target SLA</p>
          </div>

          <div className="bg-white border-2 border-[#C9C4BA] rounded-xl p-5 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs text-[#D95F02] font-semibold">
              <span>SLA Violations</span><AlertTriangle className="w-4 h-4" />
            </div>
            <div className="text-3xl font-extrabold text-[#D95F02] font-mono-data">{metrics.overdue_issues}</div>
            <p className="text-[11px] text-[#6B6860] font-medium">Public Audit Board</p>
          </div>
        </section>
      )}

      {/* ── GIS Map ─────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#C9C4BA] pb-3">
          <div>
            <h2 className="text-xl font-extrabold text-[#1E2328] tracking-tight">Geospatial Ward Infrastructure Map</h2>
            <p className="text-xs text-[#6B6860] font-medium mt-0.5">
              Live spatial coordinates mapped to <span suppressHydrationWarning>{userLocation.isLoaded ? userLocation.city : 'municipal'}</span> ward boundaries
            </p>
          </div>
          <Link href="/map" className="text-xs font-bold text-[#1A56A4] hover:text-[#1245A8] flex items-center space-x-1">
            <span>Full GIS Map Layer</span><ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="bg-white border-2 border-[#C9C4BA] rounded-xl p-4 shadow-sm">
          <MapView issues={issues} />
        </div>
      </section>

      {/* ── Issue Feed ──────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#C9C4BA] pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="badge-orange font-bold text-xs px-2.5 py-0.5 rounded-full">Proximity Ordered</span>
              <h2 className="text-xl font-extrabold text-[#1E2328] tracking-tight">
                Defect Docket Registry ({sortedIssues.length})
              </h2>
            </div>
            <p className="text-xs text-[#6B6860] font-medium mt-1">
              Live grievances sorted by distance relative to your GPS fix (<span suppressHydrationWarning>{userLocation.city}</span>).
            </p>
          </div>
          <Link href="/my-complaints" className="text-xs font-bold text-[#1A56A4] hover:text-[#1245A8] flex items-center space-x-1">
            <span>View All Dockets ({issues.length})</span><ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedIssues.slice(0, 6).map((issue) => {
            const isResolved = issue.status === 'resolved';
            const deadlineDate = new Date(issue.deadline_at);
            const diffDays = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            const isOverdue = !isResolved && diffDays <= 0;

            return (
              <div
                key={issue.id}
                className="bg-white border-2 border-[#C9C4BA] rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-[#D95F02] hover:shadow-md transition-all"
              >
                <div className="space-y-3">
                  {/* Badge row */}
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="text-xs font-mono-data font-bold text-[#1E2328] bg-[#F0EEE9] border border-[#C9C4BA] px-2 py-0.5 rounded-lg">
                      {issue.complaint_number}
                    </span>
                    <div className="flex items-center space-x-1">
                      <span className="badge-orange text-[10px] font-mono-data font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                        <LocateFixed className="w-3 h-3 shrink-0" />
                        <span>{issue.distanceFormatted}</span>
                      </span>
                      {issue.ai_severity !== undefined && (
                        <span className={`text-[9px] font-mono-data font-bold px-2 py-0.5 rounded-full ${
                          issue.ai_severity < 30 ? 'badge-green' : issue.ai_severity <= 60 ? 'badge-blue' : 'badge-orange'
                        }`}>
                          Sev: {issue.ai_severity}/100
                        </span>
                      )}
                      {issue.escalation_email_sent_at && (
                        <span className="badge-red text-[9px] font-bold px-1.5 py-0.5 rounded-full">45d Escalated</span>
                      )}
                      {isResolved ? (
                        <span className="badge-green text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Resolved
                        </span>
                      ) : isOverdue ? (
                        <span className="badge-red text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Overdue
                        </span>
                      ) : (
                        <span className="badge-blue text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
                          {issue.status.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail */}
                  <div className="flex space-x-3">
                    <div className="w-20 h-20 bg-[#E8E5DF] shrink-0 border border-[#C9C4BA] rounded-xl overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={issue.photo_url} alt={issue.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <Link href={`/track/${issue.complaint_number}`}>
                        <h3 className="text-xs font-extrabold text-[#1E2328] line-clamp-2 leading-snug hover:text-[#D95F02] transition-colors">
                          {issue.title}
                        </h3>
                      </Link>
                      <p className="text-[11px] text-[#6B6860] line-clamp-1">{issue.description}</p>
                      <div className="text-[10px] text-[#6B6860] font-medium flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-[#D95F02] shrink-0" />
                        <span className="truncate">{issue.zone_name}</span>
                      </div>
                    </div>
                  </div>

                  {/* SLA bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-[#6B6860] font-medium">
                      <span>SLA: <strong className="font-mono-data text-[#D95F02]" suppressHydrationWarning>{diffDays > 0 ? `${diffDays} days left` : 'Expired'}</strong></span>
                      <span>{issue.upvote_count >= 500 ? '5-Day Emergency' : '15-Day SLA'}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E8E5DF] rounded-full overflow-hidden border border-[#C9C4BA]">
                      <div
                        className={`h-full ${isOverdue ? 'bg-[#D95F02]' : isResolved ? 'bg-[#176B3A]' : 'bg-[#1A56A4]'}`}
                        style={{ width: `${Math.max(0, Math.min(100, (diffDays / 15) * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-[#C9C4BA] flex items-center justify-between gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedIssueForEvidence(issue)}
                    className="px-3 py-1.5 bg-[#D95F02] hover:bg-[#C04F00] text-white font-extrabold text-xs rounded-xl shadow-sm transition-colors flex items-center space-x-1.5"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Resolve Defect</span>
                  </button>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={(e) => handleUpvote(issue.id, e)}
                      className="flex items-center space-x-1 text-[#6B6860] hover:text-[#D95F02] bg-[#F0EEE9] hover:bg-[#FEF0E7] px-2 py-1 rounded-lg border border-[#C9C4BA] transition-colors"
                    >
                      <ThumbsUp className="w-3 h-3 text-[#D95F02]" />
                      <span className="font-mono-data font-bold text-[11px]">{issue.upvote_count}</span>
                    </button>
                    <Link href={`/track/${issue.complaint_number}`} className="text-[#1A56A4] hover:text-[#1245A8] font-bold text-xs flex items-center">
                      Docket <ArrowRight className="w-3 h-3 ml-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Evidence Modal */}
      {selectedIssueForEvidence && (
        <EvidenceModal
          issue={selectedIssueForEvidence}
          isOpen={!!selectedIssueForEvidence}
          onClose={() => setSelectedIssueForEvidence(null)}
          onSubmitted={loadData}
        />
      )}

      {/* ── Pipeline Architecture ───────────────────────────────────── */}
      <section className="bg-white border-2 border-[#C9C4BA] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="max-w-3xl space-y-1">
          <span className="text-xs font-bold text-[#1A56A4] uppercase tracking-wider">System Architecture & Protocol</span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#1E2328] tracking-tight">Four-Stage Municipal Resolution Pipeline</h3>
          <p className="text-xs text-[#6B6860] font-medium">Cryptographically and spatially-tracked pipeline enforcing zero unverified ticket closures.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          {[
            { step: '01', color: '#D95F02', label: 'YOLOv8 Edge Scanner', desc: 'Live camera capture feeds YOLOv8 edge computer vision model to verify presence of defect class and compute confidence.' },
            { step: '02', color: '#1A56A4', label: 'PostGIS Ward Route', desc: 'Point-in-polygon spatial math binds ticket to specific municipal ward boundary and responsible department head.' },
            { step: '03', color: '#D95F02', label: '500-Upvote Compression', desc: 'Standard 15-day target SLA compresses to 5-day emergency SLA if community upvote threshold crosses 500 votes.' },
            { step: '04', color: '#176B3A', label: 'Citizen Evidence Vote', desc: "Contractor photo upload moves ticket to pending status. Ticket closes to Resolved strictly when citizens vote Yes." },
          ].map(({ step, color, label, desc }) => (
            <div key={step} className="p-4 rounded-xl bg-[#F0EEE9] border border-[#C9C4BA] space-y-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-extrabold text-xs" style={{ backgroundColor: color }}>
                {step}
              </div>
              <h4 className="font-bold text-[#1E2328] text-sm">{label}</h4>
              <p className="text-[#6B6860] text-[11px] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
