'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  HardHat,
  Trash2,
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  Camera,
  Search,
  Filter,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Play,
  Award,
  Zap,
  TrendingUp,
  RefreshCw,
  Eye,
  ExternalLink,
  Flame,
  CheckSquare,
  Activity,
  Layers
} from 'lucide-react';
import { getStoredIssues, updateIssueStatus, saveStoredIssues } from '@/lib/store';
import { fetchIssues } from '@/lib/db';
import { CivicIssue } from '@/lib/types';
import { useUserLocation } from '@/lib/useUserLocation';
import { sortIssuesByNearest, SortedCivicIssue } from '@/lib/geoDistance';
import EvidenceModal from '@/components/EvidenceModal';
import { useAuth } from '@/lib/authContext';

export default function WorkerDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [rawIssues, setRawIssues] = useState<CivicIssue[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'cleanliness' | 'drains' | 'roads' | 'completed'>('cleanliness');
  const [search, setSearch] = useState<string>('');
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [selectedIssueForResolution, setSelectedIssueForResolution] = useState<CivicIssue | null>(null);
  const [inProgressMap, setInProgressMap] = useState<Record<string, boolean>>({});

  const userLocation = useUserLocation();
  const { user } = useAuth();

  const loadIssues = async () => {
    const localIssues = getStoredIssues();
    try {
      const dbIssues = await fetchIssues();
      if (dbIssues && dbIssues.length > 0) {
        const dbNumbers = new Set(dbIssues.map((i: any) => i.complaint_number));
        const localOnly = localIssues.filter((i: any) => !dbNumbers.has(i.complaint_number));
        const merged = [...dbIssues, ...localOnly];
        saveStoredIssues(merged);
        setRawIssues(merged);
        return;
      }
    } catch {}
    setRawIssues(localIssues);
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

  if (!mounted) return null;

  // Sort issues nearest to farthest relative to user's live GPS coordinates
  const sortedIssues: SortedCivicIssue[] = sortIssuesByNearest(
    userLocation.latitude,
    userLocation.longitude,
    rawIssues
  );

  // Filter issues based on active worker tab
  const filtered = sortedIssues.filter((issue) => {
    // Tab filters
    if (activeTab === 'completed') {
      if (issue.status !== 'resolved') return false;
    } else {
      if (issue.status === 'resolved') return false;

      if (activeTab === 'cleanliness') {
        // Cleanliness & Solid Waste focus
        const isCleanliness =
          issue.category === 'garbage' ||
          issue.category === 'dead_animal' ||
          issue.category === 'overgrown_bushes' ||
          issue.department?.toLowerCase().includes('sanitation') ||
          issue.department?.toLowerCase().includes('waste');
        if (!isCleanliness) return false;
      } else if (activeTab === 'drains') {
        const isDrain =
          issue.category === 'water_logging' ||
          issue.category === 'manhole' ||
          issue.category === 'water_leakage' ||
          issue.department?.toLowerCase().includes('drain') ||
          issue.department?.toLowerCase().includes('water');
        if (!isDrain) return false;
      } else if (activeTab === 'roads') {
        const isRoad =
          issue.category === 'pothole' ||
          issue.category === 'road_damage' ||
          issue.category === 'broken_footpath' ||
          issue.category === 'fallen_tree' ||
          issue.department?.toLowerCase().includes('road') ||
          issue.department?.toLowerCase().includes('public works');
        if (!isRoad) return false;
      }
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        issue.complaint_number.toLowerCase().includes(q) ||
        issue.title.toLowerCase().includes(q) ||
        issue.zone_name.toLowerCase().includes(q) ||
        issue.category.toLowerCase().includes(q) ||
        issue.description.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const handleStartTask = (issueId: string) => {
    setInProgressMap((prev) => ({ ...prev, [issueId]: true }));
    updateIssueStatus(
      issueId,
      'in_progress',
      `Field worker ${user?.displayName || 'Worker'} marked this task as In-Progress / En Route.`,
      user?.displayName || 'Field Worker'
    );
    loadIssues();
  };

  // Metrics for Worker
  const totalAssigned = rawIssues.filter((i) => i.status !== 'resolved').length;
  const cleanlinessCount = rawIssues.filter(
    (i) =>
      i.status !== 'resolved' &&
      (i.category === 'garbage' ||
        i.category === 'dead_animal' ||
        i.category === 'overgrown_bushes' ||
        i.department?.toLowerCase().includes('sanitation'))
  ).length;
  const inProgressCount = rawIssues.filter((i) => i.status === 'in_progress').length;
  const completedToday = rawIssues.filter((i) => i.status === 'resolved').length;
  const estimatedIncentive = completedToday * 120; // 120 INR / points per verified resolved task

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'garbage':
        return '🗑️';
      case 'dead_animal':
        return '🐾';
      case 'pothole':
      case 'road_damage':
        return '🕳️';
      case 'water_logging':
        return '🌊';
      case 'water_leakage':
        return '💧';
      case 'manhole':
        return '⚠️';
      case 'overgrown_bushes':
        return '🌿';
      case 'fallen_tree':
        return '🌳';
      case 'exposed_wires':
        return '⚡';
      case 'permanent_broken_streetlight':
      case 'streetlight':
        return '💡';
      default:
        return '🛠️';
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-black text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white dark:bg-[#151C2C] px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs transition-all hover:-translate-x-0.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-600" />
          <span>← Back to Home</span>
        </Link>

        <div className="flex items-center space-x-2">
          <Link
            href="/department"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 bg-white dark:bg-[#151C2C] px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs transition-all"
          >
            <span>Department Resolver</span>
          </Link>
          <Link
            href="/map"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 bg-white dark:bg-[#151C2C] px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs transition-all"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
            <span>GIS Map</span>
          </Link>
        </div>
      </div>

      {/* Worker Header Banner with Shift Status Toggle */}
      <div className="bg-gradient-to-br from-emerald-700 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Background decorative graphics */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-end pr-8">
          <HardHat className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md text-emerald-300 border border-white/20">
                <HardHat className="w-6 h-6" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Sanitation & Field Worker Hub
              </h1>
              <span className="text-[10px] font-black uppercase bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-emerald-300" />
                <span>Swachhata Task Force</span>
              </span>
            </div>

            {/* Official Worker ID Badge */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center space-x-1.5 text-xs font-black bg-emerald-950/70 border border-emerald-400/50 text-emerald-300 px-3 py-1 rounded-xl shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>
                  {user?.role === 'worker' || user?.workerBadgeId
                    ? `Verified Lead: ${user.displayName || 'Ramesh Kumar'} [Badge: ${user.workerBadgeId || 'MC-SWM-2026-882'}]`
                    : 'Municipal Field Force Mode [Badge: MC-SWM-2026-882]'}
                </span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
              Real-time proximity task dispatcher for on-ground sanitation crews, garbage disposal units, and municipal field repair teams.
            </p>
          </div>

          {/* On-Duty / Live Location Status Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
            <div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsOnDuty(!isOnDuty)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-hidden cursor-pointer ${
                    isOnDuty ? 'bg-emerald-400' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-slate-900 transition-transform ${
                      isOnDuty ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-xs font-black uppercase tracking-wider">
                  {isOnDuty ? '🟢 On Active Duty' : '⚪ Off Duty'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/90 mt-1 font-mono flex items-center gap-1">
                <Navigation className="w-3 h-3 animate-pulse text-emerald-300" />
                <span>
                  {userLocation.city ? userLocation.city.toUpperCase() : 'GPS'}: {userLocation.latitude.toFixed(4)}°N, {userLocation.longitude.toFixed(4)}°E
                </span>
              </p>
            </div>

            <div className="text-right sm:border-l sm:border-white/20 sm:pl-4">
              <span className="text-[10px] text-emerald-200 uppercase font-black block">Assigned Ward</span>
              <span className="text-xs font-black text-white">{userLocation.wardName || 'Ward 12 (Central)'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Interactive Worker KPI & Cleanliness Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Cleanliness Tasks */}
        <div className="bg-white dark:bg-[#151C2C] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] uppercase font-black tracking-wider text-slate-500 dark:text-slate-400">
              Cleanliness Dockets
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Trash2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
            {cleanlinessCount}
          </div>
          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span>● Garbage & Solid Waste</span>
          </div>
        </div>

        {/* Metric 2: In Progress */}
        <div className="bg-white dark:bg-[#151C2C] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] uppercase font-black tracking-wider text-slate-500 dark:text-slate-400">
              In Progress / En Route
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {inProgressCount}
          </div>
          <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <span>● Active Crew Operations</span>
          </div>
        </div>

        {/* Metric 3: Cleaned Today */}
        <div className="bg-white dark:bg-[#151C2C] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] uppercase font-black tracking-wider text-slate-500 dark:text-slate-400">
              Cleaned & Resolved Today
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 font-mono">
            {completedToday}
          </div>
          <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <span>● AI & Photo Verified</span>
          </div>
        </div>

        {/* Metric 4: Daily Incentive Points */}
        <div className="bg-white dark:bg-[#151C2C] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] uppercase font-black tracking-wider text-slate-500 dark:text-slate-400">
              Daily Bonus Incentive
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 font-mono">
            +₹{estimatedIncentive}
          </div>
          <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
            <span>● Swachhata Quality Tier 1</span>
          </div>
        </div>
      </div>

      {/* Task Filters & Search Bar */}
      <div className="bg-white dark:bg-[#151C2C] p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Quick Filter Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setActiveTab('cleanliness')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-2xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                activeTab === 'cleanliness'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>🧹 Cleanliness & Waste ({cleanlinessCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-2xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Active ({totalAssigned})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('drains')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-2xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                activeTab === 'drains'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>🌊 Drains & Leaks</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('roads')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-2xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                activeTab === 'roads'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>🕳️ Roads & Hazards</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('completed')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-2xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                activeTab === 'completed'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Resolved Logs ({completedToday})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search docket, address, keyword..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* Task Cards Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#151C2C] rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No Pending Tasks in this Category!
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            All assigned cleanliness and maintenance tickets in this section are currently cleared. Great work keeping the city clean!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((issue) => {
            const isResolved = issue.status === 'resolved';
            const isInProgress = issue.status === 'in_progress' || inProgressMap[issue.id];
            const categoryEmoji = getCategoryEmoji(issue.category);

            // Google Maps direction link
            const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${issue.latitude},${issue.longitude}`;

            return (
              <div
                key={issue.id}
                className={`bg-white dark:bg-[#151C2C] rounded-3xl border p-5 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between ${
                  isInProgress
                    ? 'border-amber-400/80 dark:border-amber-500/50 bg-amber-50/10 dark:bg-amber-950/10'
                    : isResolved
                    ? 'border-emerald-400/80 dark:border-emerald-500/50'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header: Docket & Distance */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-black text-emerald-700 dark:text-emerald-400">
                        {issue.complaint_number}
                      </span>
                      <span className="inline-flex items-center space-x-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>{issue.distanceFormatted}</span>
                      </span>
                    </div>

                    <span
                      className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-md border ${
                        isResolved
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                          : isInProgress
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 animate-pulse'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {isInProgress ? '⚡ IN PROGRESS' : issue.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Photo & Defect Details */}
                  <div className="flex space-x-3.5">
                    <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={issue.photo_url}
                        alt={issue.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                        {categoryEmoji}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-black text-slate-900 dark:text-white text-sm line-clamp-1">
                        {issue.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold line-clamp-1">
                        🏢 {issue.department}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Navigation className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="line-clamp-1">{issue.zone_name || 'Ward Area'}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Logged: {new Date(issue.reported_at).toLocaleDateString()} • SLA: 15 Days
                      </p>
                    </div>
                  </div>

                  {/* Description Snippet */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    {issue.description}
                  </p>
                </div>

                {/* Worker Actions Bar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  {/* Left: Navigation via GPS */}
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-3 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Navigate</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>

                  {/* Right: Worker Workflow Buttons */}
                  <div className="flex items-center space-x-2">
                    {!isResolved && !isInProgress && (
                      <button
                        type="button"
                        onClick={() => handleStartTask(issue.id)}
                        className="inline-flex items-center space-x-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start Work</span>
                      </button>
                    )}

                    {isResolved ? (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Cleaned & Logged</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedIssueForResolution(issue)}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Upload Cleanliness Proof</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Swachhata / Field Crew Guidelines Card */}
      <div className="bg-white dark:bg-[#151C2C] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
            Swachhata Safety & Field Protocol Checklist
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>🧤</span> Safety Equipment
            </span>
            <p className="text-[11px]">Always wear heavy-duty gloves, fluorescent reflective vest, and protective mask on site.</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>📷</span> Live Camera Proof
            </span>
            <p className="text-[11px]">Take a clear after-cleanup photo at the same angle to pass instant Gemini AI verification.</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>🏆</span> Daily Incentive Credit
            </span>
            <p className="text-[11px]">Verified closures automatically add +₹120 / 120 points to your municipal work log.</p>
          </div>
        </div>
      </div>

      {/* RESOLUTION EVIDENCE MODAL (Live camera + AI verification) */}
      {selectedIssueForResolution && (
        <EvidenceModal
          issue={selectedIssueForResolution}
          isOpen={!!selectedIssueForResolution}
          onClose={() => setSelectedIssueForResolution(null)}
          onSubmitted={() => {
            loadIssues();
            setSelectedIssueForResolution(null);
          }}
        />
      )}
    </div>
  );
}
