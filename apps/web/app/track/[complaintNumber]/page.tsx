'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  ThumbsUp,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  FileText,
  Share2,
  Building2,
  Sparkles,
  ArrowLeft,
  Eye,
  CheckSquare,
  Users,
  ShieldAlert,
  Loader2,
  Image as ImageIcon,
  Wrench,
  Camera,
  Target,
  XCircle,
  ShieldX
} from 'lucide-react';
import { getIssueByIdOrNumber, getStoredHistory, getStoredEvidence, upvoteIssue } from '@/lib/store';
import { fetchIssueByNumber, fetchHistory, fetchEvidence } from '@/lib/db';
import { CivicIssue, IssueStatusHistory, ResolutionEvidence } from '@/lib/types';
import StatusTimeline from '@/components/StatusTimeline';
import ReceiptCard from '@/components/ReceiptCard';
import CitizenVerifyModal from '@/components/CitizenVerifyModal';
import EvidenceModal from '@/components/EvidenceModal';
import EscalationGraphicModal from '@/components/EscalationGraphicModal';

export default function TrackComplaintPage() {
  const [mounted, setMounted] = useState(false);
  const params = useParams();
  const searchParams = useSearchParams();
  const complaintNumber = params.complaintNumber as string;
  const justCreated = searchParams.get('justCreated') === 'true';
  const justUpvoted = searchParams.get('justUpvoted') === 'true';

  const [issue, setIssue] = useState<CivicIssue | null>(null);
  const [history, setHistory] = useState<IssueStatusHistory[]>([]);
  const [evidence, setEvidence] = useState<ResolutionEvidence | null>(null);

  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [isEscalationModalOpen, setIsEscalationModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [upvoteBanner, setUpvoteBanner] = useState<string | null>(
    justUpvoted ? '🗳️ Photo evidence attached & complaint upvoted successfully!' : null
  );

  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!complaintNumber) return;
    setLoading(true);

    try {
      // 1. Primary: Fetch from live Firebase Firestore database
      const dbIssue = await fetchIssueByNumber(complaintNumber);
      if (dbIssue) {
        setIssue(dbIssue);
        const [dbHistory, dbEvidenceList] = await Promise.all([
          fetchHistory(dbIssue.id),
          fetchEvidence(dbIssue.id)
        ]);
        setHistory(dbHistory);
        setEvidence(dbEvidenceList.length > 0 ? dbEvidenceList[0] : null);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('[Track] Firebase Firestore fetch fallback to local store:', err);
    }

    // 2. Fallback: Check local store
    const localFound = getIssueByIdOrNumber(complaintNumber);
    setIssue(localFound || null);

    if (localFound) {
      const allHist = getStoredHistory();
      setHistory(allHist.filter(h => h.issue_id === localFound.id));

      const allEv = getStoredEvidence();
      const ev = allEv.find(e => e.issue_id === localFound.id);
      setEvidence(ev || null);
    }
    setLoading(false);
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
  }, [complaintNumber]);

  if (!mounted || loading) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-[#1A56A4] animate-spin mx-auto" />
        <h2 className="text-base font-bold text-slate-800">Loading Municipal Grievance Docket...</h2>
        <p className="text-xs text-slate-500 font-mono">Docket: {complaintNumber}</p>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <FileText className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Complaint Ticket Not Found</h2>
        <p className="text-xs text-slate-500">
          No civic record was found matching <span className="font-mono font-semibold">{complaintNumber}</span>.
        </p>
        <Link
          href="/map"
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Civic Map</span>
        </Link>
      </div>
    );
  }

  const handleUpvoteClick = () => {
    const result = upvoteIssue(issue.id);
    if (result.success && result.issue) {
      setIssue(result.issue);
      if (result.unvoted) {
        setUpvoteBanner('🗳️ Upvote removed.');
        setTimeout(() => setUpvoteBanner(null), 2500);
      } else if (result.compressed) {
        setUpvoteBanner('⚡ 500 UPVOTES REACHED! Resolution target compressed to 5 days under CivicTrack Accountability Rule.');
      } else {
        setUpvoteBanner('🗳️ 1 Vote Recorded: You upvoted this civic docket.');
        setTimeout(() => setUpvoteBanner(null), 3000);
      }
    }
  };

  const deadlineDate = new Date(issue.deadline_at);
  const diffDays = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isResolved = issue.status === 'resolved';
  const isOverdue = !isResolved && diffDays <= 0;

  const getSeverityBadgeClass = (severity: number) => {
    if (severity < 30) return 'bg-emerald-950 text-emerald-300 border-emerald-700';
    if (severity <= 60) return 'bg-amber-950 text-amber-300 border-amber-700';
    return 'bg-rose-950 text-rose-300 border-rose-700';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Link
            href="/my-complaints"
            className="inline-flex items-center space-x-2 text-xs font-black text-slate-200 hover:text-amber-400 bg-slate-900/90 hover:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-700 shadow-sm transition-all hover:-translate-x-0.5"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>← Back to My Reports</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-900/60 px-3.5 py-2 rounded-2xl border border-slate-800 transition-colors"
          >
            <span>Home</span>
          </Link>
        </div>

        {justCreated && (
          <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/90 px-3.5 py-1.5 rounded-full border border-emerald-700 shadow-md">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Docket Logged in Municipal Registry</span>
          </span>
        )}
      </div>

      {/* Background AI Analysis Info Banner */}
      {issue.ai_analysis_status === 'analyzing' && issue.status !== 'rejected' && (
        <div className="p-4 bg-blue-950/60 border border-blue-500/50 rounded-2xl text-xs text-blue-200 flex items-start space-x-3 shadow-lg">
          <Loader2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5 animate-spin" />
          <div className="space-y-0.5">
            <h4 className="font-extrabold text-blue-300 text-xs uppercase tracking-wider">
              AI Verification Running in Background
            </h4>
            <p className="text-blue-200/90 leading-relaxed text-[11px]">
              We are analyzing the image. If verified as a genuine defect, it will be prioritized and assigned to field crews; otherwise you can view details under <strong className="text-white">Rejected Reports</strong> in My Reports.
            </p>
          </div>
        </div>
      )}

      {/* Rejected Grievance Banner */}
      {issue.status === 'rejected' && (
        <div className="p-4 bg-rose-950/60 border-2 border-rose-600 rounded-2xl text-xs text-rose-200 space-y-2 shadow-xl">
          <div className="flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <h4 className="font-black text-rose-300 text-xs uppercase tracking-wider">
              Grievance Rejected by AI Computer Vision Inspection
            </h4>
          </div>
          <p className="text-rose-200/90 leading-relaxed text-xs">
            {issue.rejection_reason || issue.ai_description || 'The vision model scanned this photo and determined NO valid public municipal defect is present.'}
          </p>
          <div className="pt-1">
            <Link
              href="/report"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              <span>File New Grievance with Clear Defect Photo →</span>
            </Link>
          </div>
        </div>
      )}

      {upvoteBanner && (
        <div className="p-3 bg-cyan-950/80 border border-cyan-500/40 text-xs font-semibold text-cyan-200 rounded-2xl flex items-center justify-between shadow-lg">
          <span>{upvoteBanner}</span>
          <button onClick={() => setUpvoteBanner(null)} className="text-cyan-400 hover:text-white font-bold ml-2">✕</button>
        </div>
      )}

      {issue.escalation_email_sent_at && (
        <div className="p-4 bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 space-y-2 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <h4 className="font-extrabold text-amber-300 text-xs uppercase tracking-wider">
              Critical 45-Day SLA Violation — Department Head Escalation Dispatched
            </h4>
          </div>
          <p className="text-amber-200/90 leading-relaxed text-xs">
            This defect remained unresolved past 45 statutory days. An official municipal escalation payload was dispatched to <span className="font-bold font-mono-data text-amber-400">{issue.department_email || 'department.head@jaipurmc.org'}</span> on {new Date(issue.escalation_email_sent_at).toLocaleString()}.
          </p>
        </div>
      )}

      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono-data font-bold text-xs text-amber-400 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg">
                {issue.complaint_number}
              </span>

              {issue.status === 'rejected' ? (
                <span className="bg-rose-950 text-rose-300 border border-rose-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-rose-400" /> AI Rejected (Non-Civic)
                </span>
              ) : isResolved ? (
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Resolved & Confirmed
                </span>
              ) : isOverdue ? (
                <span className="bg-amber-950 text-amber-300 border border-amber-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Overdue
                </span>
              ) : issue.ai_analysis_status === 'analyzing' ? (
                <span className="text-xs font-semibold text-purple-300 bg-purple-950 border border-purple-700 px-3 py-1 rounded-full flex items-center space-x-1.5 shadow-sm">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                  <span>Calculating Defect Count & Severity...</span>
                </span>
              ) : (
                <span className="bg-cyan-950 text-cyan-300 border border-cyan-700 text-xs font-bold px-3 py-1 rounded-full capitalize">
                  {issue.status.replace('_', ' ')}
                </span>
              )}

              {/* Pothole count badge - STRICTLY FOR POTHOLES ONLY WHEN ANALYSIS IS COMPLETED */}
              {issue.category === 'pothole' && issue.status !== 'rejected' && issue.ai_analysis_status !== 'analyzing' && issue.ai_count && issue.ai_count > 0 ? (
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 text-xs font-mono-data font-bold px-3 py-1 rounded-full flex items-center space-x-1.5 shadow-sm">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {issue.ai_count} Pothole{issue.ai_count > 1 ? 's' : ''} Detected
                  </span>
                </span>
              ) : null}

              {issue.status !== 'rejected' && issue.ai_analysis_status !== 'analyzing' && issue.ai_severity !== undefined ? (
                <span className={`text-xs font-mono-data font-bold px-3 py-1 rounded-full border flex items-center space-x-1 ${getSeverityBadgeClass(issue.ai_severity)}`}>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Severity: {issue.ai_severity}/100</span>
                </span>
              ) : null}

              {issue.status !== 'rejected' && issue.ai_analysis_status !== 'analyzing' && issue.ai_confidence ? (
                <span className="text-xs font-mono-data font-bold text-emerald-400 bg-emerald-950 border border-emerald-700/80 px-2.5 py-0.5 rounded-full">
                  {(issue.ai_confidence * 100).toFixed(1)}% AI Confirmed
                </span>
              ) : null}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight">{issue.title}</h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl font-medium">{issue.description}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400 pt-1">
              <span className="flex items-center space-x-1.5 font-semibold text-amber-400">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{issue.zone_name}</span>
              </span>
              <span className="flex items-center space-x-1.5 font-semibold text-cyan-400">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{issue.department}</span>
              </span>
              <span>•</span>
              <span className="font-mono-data text-slate-400">Logged: {new Date(issue.reported_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl sm:w-64 shrink-0 space-y-3 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              SLA Compliance Countdown
            </span>

            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-900"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={isOverdue ? 'text-amber-400' : isResolved ? 'text-emerald-400' : 'text-cyan-400'}
                  strokeDasharray={`${Math.max(0, Math.min(100, (diffDays / 15) * 100))}, 100`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-xl font-extrabold text-white block leading-none font-mono-data">
                  {isResolved ? 'FIXED' : isOverdue ? `${Math.abs(diffDays)}d` : `${diffDays}d`}
                </span>
                <span className="text-[9px] text-slate-400 font-bold uppercase block mt-0.5">
                  {isResolved ? 'CLOSED' : isOverdue ? 'OVERDUE' : 'REMAINING'}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-mono-data">
              Target SLA: {deadlineDate.toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Primary Citizen Uploaded Defect Photo */}
        {issue.photo_url && (
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase text-amber-400 tracking-wider flex items-center space-x-1.5">
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>Uploaded Citizen Defect Photographic Evidence</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Verified On-Site Camera Capture
              </span>
            </div>

            <div className="relative aspect-video sm:aspect-[21/9] max-h-96 rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-900 shadow-2xl group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={issue.photo_url}
                alt={issue.title}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-[11px] font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{issue.ai_detected_class || issue.category.toUpperCase()}</span>
                {issue.ai_confidence && (
                  <span className="text-emerald-400 font-mono">
                    ({(issue.ai_confidence * 100).toFixed(0)}% AI Confirmed)
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleUpvoteClick}
              className={`px-4 py-2 font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5 active:scale-95 cursor-pointer ${
                issue.has_upvoted
                  ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 shadow-md'
                  : 'bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-400/40'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${issue.has_upvoted ? 'fill-current' : ''}`} />
              <span>{issue.has_upvoted ? 'Upvoted' : 'Upvote Ticket'} ({issue.upvote_count})</span>
            </button>

            {!isResolved && (
              <button
                onClick={() => setIsEvidenceModalOpen(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-xs rounded-xl transition-colors flex items-center space-x-1.5"
              >
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>Upload Resolution Evidence</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsVerifyModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Citizen Verification Guardrail</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official Contractor Resolution Evidence Banner */}
      {(evidence || isResolved) && (
        <div className="bg-white dark:bg-[#151C2C] border-2 border-emerald-500/80 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-700">
                Repair Completed & Field Verified
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                Resolved By: <span className="text-emerald-600 dark:text-emerald-400">{evidence?.contractor_name || evidence?.submitted_by || issue.contractor_name || 'Municipal Engineering Crew'}</span>
              </h3>
            </div>
            {evidence?.submitted_at && (
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Sealed: {new Date(evidence.submitted_at).toLocaleString()}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400">
                Original Defect (Before)
              </span>
              <div className="aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={evidence?.before_photo_url || issue.photo_url}
                  alt="Defect Before"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">
                Repaired Defect (After Photo)
              </span>
              <div className="aspect-video rounded-2xl overflow-hidden border-2 border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/30 shadow-inner">
                {evidence?.after_photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={evidence.after_photo_url}
                    alt="Defect Repaired After"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                    Awaiting after photo upload
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* GEMINI AI RESOLUTION AUDIT (YES / NO) */}
          {evidence?.after_photo_url && (
            <div className={`p-4 rounded-2xl border text-xs space-y-1.5 transition-all ${
              evidence.ai_verdict === 'NO'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-300'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-300'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="uppercase tracking-wider text-[11px] font-black">
                    Gemini AI Resolution Verification
                  </span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase border ${
                  evidence.ai_verdict === 'NO'
                    ? 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 border-rose-300'
                    : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border-emerald-300'
                }`}>
                  SOLVED: {evidence.ai_verdict || 'YES'}
                </span>
              </div>
              {evidence.ai_reason && (
                <p className="text-xs leading-relaxed font-medium pl-6">
                  {evidence.ai_reason}
                </p>
              )}
            </div>
          )}

          {evidence?.description && (
            <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white">Field Work Log:</strong> {evidence.description}
            </p>
          )}
        </div>
      )}

      {/* Grid: Timeline & Official PDF Receipt */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono">
        <StatusTimeline
          currentStatus={issue.status}
          history={history}
          reportedAt={issue.reported_at}
          deadlineAt={issue.deadline_at}
        />

        <ReceiptCard issue={issue} />
      </div>

      {/* Modals */}
      <CitizenVerifyModal
        issue={issue}
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        onVerified={loadData}
      />

      <EvidenceModal
        issue={issue}
        existingEvidence={evidence || undefined}
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        onSubmitted={loadData}
      />

      <EscalationGraphicModal
        issue={issue}
        isOpen={isEscalationModalOpen}
        onClose={() => setIsEscalationModalOpen(false)}
      />
    </div>
  );
}
