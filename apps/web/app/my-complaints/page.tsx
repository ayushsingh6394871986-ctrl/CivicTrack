'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  Filter,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Building2,
  ThumbsUp,
  PlusCircle,
  Camera,
  Navigation,
  ShieldAlert,
  ShieldCheck,
  Wrench,
  Sparkles,
  LogIn,
  Lock,
  ExternalLink,
  Trash2,
  ArrowLeft,
  Award,
  Loader2,
  XCircle,
  ShieldX,
  Target
} from 'lucide-react';
import { getStoredIssues, upvoteIssue, saveStoredIssues, getUserFiledComplaints, getUserUpvotedIssues } from '@/lib/store';
import { fetchIssues } from '@/lib/db';
import { CivicIssue } from '@/lib/types';
import { useAuth } from '@/lib/authContext';
import LoginModal from '@/components/LoginModal';
import EvidenceModal from '@/components/EvidenceModal';

export default function MyComplaintsPage() {
  const [mounted, setMounted] = useState(false);
  const [rawIssues, setRawIssues] = useState<CivicIssue[]>(() => {
    if (typeof window !== 'undefined') {
      const local = getStoredIssues();
      const upvotedIds = new Set(getUserUpvotedIssues());
      return local.map(i => ({ ...i, has_upvoted: upvotedIds.has(i.id) || !!i.has_upvoted }));
    }
    return [];
  });
  const [isLoadingIssues, setIsLoadingIssues] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'rejected'>('active');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIssueForEvidence, setSelectedIssueForEvidence] = useState<CivicIssue | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  const { user, loading, signInWithGoogle } = useAuth();

  const loadIssues = async () => {
    // 1. INSTANT ZERO-LATENCY LOAD: Load local/cached issues immediately
    const localIssues = getStoredIssues();
    const upvotedIds = new Set(getUserUpvotedIssues());
    const decorate = (list: typeof localIssues) =>
      list.map(i => ({ ...i, has_upvoted: upvotedIds.has(i.id) || !!i.has_upvoted }));

    const decoratedLocal = decorate(localIssues);
    setRawIssues(decoratedLocal);
    if (decoratedLocal.length > 0) {
      setIsLoadingIssues(false);
    }

    // 2. BACKGROUND SYNC: Silently refresh from Firebase DB in background without blocking UI
    try {
      const dbIssues = await fetchIssues();
      if (dbIssues && dbIssues.length > 0) {
        const dbNumbers = new Set(dbIssues.map(i => i.complaint_number));
        const localOnly = localIssues.filter(i => !dbNumbers.has(i.complaint_number));
        const merged = decorate([...dbIssues, ...localOnly]);
        saveStoredIssues(merged);
        setRawIssues(merged);
      }
    } catch {} finally {
      setIsLoadingIssues(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadIssues();

    const handleStoreUpdate = () => {
      loadIssues();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('civictrack_store_updated', handleStoreUpdate);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('civictrack_store_updated', handleStoreUpdate);
      }
    };
  }, []);

  if (!mounted || loading) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center space-y-4 animate-in fade-in">
        <Loader2 className="w-8 h-8 text-[#1A56A4] animate-spin mx-auto" />
        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
          Verifying municipal session & loading reports...
        </p>
      </div>
    );
  }

  // If user is NOT logged in, show auth prompt to view their reports
  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1A56A4] to-[#176B3A] text-white flex items-center justify-center mx-auto shadow-xl">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Sign In to View Your Reports
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            Please log in with Google to view and track all municipal grievances filed from your verified account.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={signInWithGoogle}
            className="inline-flex items-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Continue with Google</span>
          </button>
        </div>
        <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
      </div>
    );
  }

  // Filter issues registered ONLY by the current logged-in user
  const filedNumbers = new Set(getUserFiledComplaints());
  const userUid = user.id || (user as any)?.uid || '';
  const userEmail = (user.email || '').toLowerCase();
  const userName = (user.displayName || '').toLowerCase();

  const myIssues = rawIssues.filter((issue) => {
    // 1. Complaint number filed in this local browser session
    if (filedNumbers.has(issue.complaint_number)) return true;

    // 2. Reporter ID matches current logged-in user UID
    if (userUid && issue.reporter_id === userUid) return true;

    // 3. Reporter Email matches current user's email
    if (userEmail && issue.reporter_email && issue.reporter_email.toLowerCase() === userEmail) return true;

    // 4. Fallback: reporter_name exactly matches user email or displayName
    const repName = (issue.reporter_name || '').toLowerCase();
    if (userEmail && repName === userEmail) return true;
    if (userName && repName === userName) return true;

    return false;
  });

  const activeIssues = myIssues.filter((i) => i.status !== 'rejected');
  const rejectedIssues = myIssues.filter((i) => i.status === 'rejected');

  const currentTabIssues = activeTab === 'active' ? activeIssues : rejectedIssues;

  const filtered = currentTabIssues.filter((issue) => {
    if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        issue.complaint_number.toLowerCase().includes(q) ||
        issue.title.toLowerCase().includes(q) ||
        issue.zone_name.toLowerCase().includes(q) ||
        issue.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700';
      case 'in_progress':
        return 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700';
      case 'verified':
        return 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700';
      case 'rejected':
        return 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700';
      default:
        return 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700';
    }
  };

  const handleClearLocalCache = () => {
    if (confirm('Clear local browser test cache? This removes all temporary test cards and re-syncs fresh from Firebase.')) {
      localStorage.setItem('civictrack_issues', '[]');
      localStorage.setItem('civic_user_filed_complaints', '[]');
      localStorage.setItem('civictrack_status_history', '[]');
      localStorage.setItem('civictrack_evidence', '[]');
      localStorage.setItem('civic_user_upvoted_ids', '[]');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-black text-slate-700 dark:text-slate-200 hover:text-[#1A56A4] dark:hover:text-blue-400 bg-white dark:bg-[#151C2C] px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs transition-all hover:-translate-x-0.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#1A56A4] dark:text-blue-400" />
          <span>← Back to Home</span>
        </Link>

        <div className="flex items-center space-x-2">
          <Link
            href="/civic-score"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-2 rounded-2xl border border-amber-300 dark:border-amber-700 shadow-xs transition-all hover:scale-105"
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Civic Score & Honours</span>
          </Link>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-[#1A56A4]/10 text-[#1A56A4] dark:text-blue-400 border border-[#1A56A4]/30">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2328] dark:text-white tracking-tight">
              My Reports & Grievances
            </h1>
          </div>
          <p className="text-xs text-[#6B6860] dark:text-slate-400 mt-1">
            Tracking grievances filed by <strong className="text-slate-900 dark:text-white">{user.displayName || user.email}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={handleClearLocalCache}
            title="Clean out test records stored in browser cache"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/40 text-slate-600 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Test Cache</span>
          </button>

          <Link
            href="/report"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs shadow-md shadow-red-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>File New Grievance</span>
          </Link>
        </div>
      </div>

      {/* Tabs: Active Grievances vs Rejected Reports */}
      <div className="flex items-center space-x-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'active'
              ? 'bg-[#1A56A4] text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Active Grievances</span>
          <span className="font-mono-data bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px]">
            {activeIssues.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rejected')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'rejected'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <ShieldX className="w-4 h-4" />
          <span>Rejected Reports (AI)</span>
          <span className="font-mono-data bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px]">
            {rejectedIssues.length}
          </span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by docket #, keyword, ward..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#151C2C] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-[#1A56A4]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2.5 px-3 bg-white dark:bg-[#151C2C] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold outline-none cursor-pointer"
          >
            <option value="all">All ({currentTabIssues.length})</option>
            {activeTab === 'active' ? (
              <>
                <option value="pending">Pending Verification</option>
                <option value="in_progress">In Progress</option>
                <option value="verified">Field Verified</option>
                <option value="resolved">Resolved</option>
              </>
            ) : (
              <option value="rejected">AI Rejected</option>
            )}
          </select>
        </div>
      </div>

      {/* Issue Cards */}
      {isLoadingIssues && rawIssues.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#151C2C] rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3 shadow-sm">
          <Loader2 className="w-8 h-8 text-[#1A56A4] animate-spin mx-auto" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
            Synchronizing your municipal grievances...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#151C2C] rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4 shadow-sm">
          {activeTab === 'rejected' ? (
            <>
              <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  No Rejected Reports
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  All your uploaded photo grievances have passed AI infrastructure verification with valid defect classification.
                </p>
              </div>
            </>
          ) : (
            <>
              <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  No Registered Grievances Found
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  You haven't filed any active complaints yet. Capture photo evidence of any local defect to create an official municipal docket.
                </p>
              </div>
              <Link
                href="/report"
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report an Issue Now</span>
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((issue) => {
            const deadline = new Date(issue.deadline_at);
            const diffDays = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            const isResolved = issue.status === 'resolved';
            const isRejected = issue.status === 'rejected';
            const isAnalyzing = issue.ai_analysis_status === 'analyzing' || (issue.status === 'pending' && issue.ai_severity === undefined);
            const isPothole = issue.category === 'pothole';
            const potholeCount = isPothole && !isAnalyzing && !isRejected && issue.ai_count && issue.ai_count > 0 ? issue.ai_count : undefined;

            return (
              <div
                key={issue.id}
                className={`rounded-3xl border p-5 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between ${
                  isRejected
                    ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                    : 'bg-white dark:bg-[#151C2C] border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-mono text-xs font-black text-[#1A56A4] dark:text-blue-400">
                      {issue.complaint_number}
                    </span>
                    <div className="flex items-center space-x-2">
                      {isAnalyzing ? (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md border bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-300 flex items-center space-x-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>AI Analyzing...</span>
                        </span>
                      ) : (
                        <span
                          className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-md border ${getStatusBadge(
                            issue.status
                          )}`}
                        >
                          {issue.status.replace('_', ' ')}
                        </span>
                      )}

                      {/* Pothole count badge - ONLY for potholes */}
                      {potholeCount && (
                        <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center space-x-1">
                          <Target className="w-3 h-3 text-emerald-600" />
                          <span>
                            {potholeCount} Pothole{potholeCount > 1 ? 's' : ''}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={issue.photo_url}
                        alt={issue.title}
                        className="w-full h-full object-cover"
                      />
                      {isRejected && (
                        <div className="absolute inset-0 bg-red-900/60 flex items-center justify-center text-white">
                          <XCircle className="w-6 h-6 text-red-300" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
                        {issue.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{issue.zone_name || 'Local Ward'}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Logged: {new Date(issue.reported_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Rejected Reason Banner */}
                  {isRejected && (
                    <div className="p-3 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 rounded-2xl text-xs text-rose-900 dark:text-rose-200 space-y-1">
                      <div className="flex items-center space-x-1.5 font-extrabold text-rose-800 dark:text-rose-300 text-[11px]">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                        <span>AI Rejection Verdict:</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        {issue.rejection_reason || issue.ai_description || 'No valid municipal defect detected. (e.g. human face, indoor room, or clean road)'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400">
                    {isRejected ? (
                      <span className="text-rose-600 dark:text-rose-400 font-semibold text-[11px]">
                        Not listed in public municipal dockets
                      </span>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>
                          {isResolved ? 'Resolved' : `${diffDays} days SLA remaining`}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {isRejected ? (
                      <Link
                        href="/report"
                        className="inline-flex items-center space-x-1 text-rose-600 dark:text-rose-400 hover:underline font-bold"
                      >
                        <span>Re-file Photo</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <Link
                        href={`/track/${issue.complaint_number}`}
                        className="inline-flex items-center space-x-1 text-[#1A56A4] dark:text-blue-400 hover:underline font-bold"
                      >
                        <span>View Docket</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedIssueForEvidence && (
        <EvidenceModal
          issue={selectedIssueForEvidence}
          isOpen={!!selectedIssueForEvidence}
          onClose={() => setSelectedIssueForEvidence(null)}
          onSubmitted={() => {
            loadIssues();
            setSelectedIssueForEvidence(null);
          }}
        />
      )}
    </div>
  );
}
