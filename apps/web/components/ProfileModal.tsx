'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  X,
  User,
  Shield,
  ShieldAlert,
  Mail,
  FileText,
  ThumbsUp,
  LogOut,
  Sparkles,
  ExternalLink,
  CheckCircle,
  Clock,
  Award,
  Trophy,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../lib/authContext';
import { getStoredIssues, getUserFiledComplaints } from '../lib/store';
import { getCitizenCivicProfile } from '../lib/civicScore';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [mounted, setMounted] = useState(false);
  const { user, isAdmin, role, signOut } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !user || !mounted) return null;

  const profile = getCitizenCivicProfile(user);
  const issues = getStoredIssues();
  const userFiled = new Set(getUserFiledComplaints());
  const userUid = user.id || (user as any).uid;
  const userEmail = (user.email || '').toLowerCase();

  const myReports = issues.filter(i => {
    if (userFiled.has(i.complaint_number)) return true;
    if (userUid && i.reporter_id === userUid) return true;
    if (userEmail && i.reporter_email && i.reporter_email.toLowerCase() === userEmail) return true;
    const rName = (i.reporter_name || '').toLowerCase();
    if (userEmail && rName === userEmail) return true;
    return false;
  });

  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      {/* Modal Dialog */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative my-auto w-full max-w-md bg-white dark:bg-[#151C2C] text-slate-900 dark:text-white rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 font-sans"
      >
        
        {/* Header Ribbon */}
        <div className="h-2 bg-gradient-to-r from-blue-600 via-emerald-600 to-amber-500" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">

          {/* USER AVATAR & IDENTITY */}
          <div className="flex items-center space-x-4">
            <div className="relative shrink-0">
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-16 h-16 rounded-2xl border-2 border-blue-500 object-cover shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
                  {user.displayName?.charAt(0).toUpperCase() || 'C'}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full text-white ring-2 ring-white dark:ring-slate-900">
                <CheckCircle className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="space-y-1 min-w-0">
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">
                {user.displayName || 'Verified Citizen'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono truncate">
                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{user.email}</span>
              </p>
              <div className="pt-0.5">
                <span
                  className={`inline-flex items-center space-x-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md ${
                    isAdmin
                      ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                  }`}
                >
                  <Shield className="w-3 h-3" />
                  <span>ROLE: {role.toUpperCase()}</span>
                </span>
              </div>
            </div>
          </div>

          {/* CIVIC SCORE & ACTIVITY METRICS */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Civic Sense Rating</span>
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono-data">
                {profile.civicScore}
              </span>
              <span className="text-[10px] text-slate-500 block font-semibold">{profile.civicTier}</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">My Filed Reports</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono-data">
                {myReports.length}
              </span>
              <span className="text-[10px] text-slate-500 block font-semibold">{profile.quarterlyPoints} Qtr Pts</span>
            </div>
          </div>

          {/* QUICK ACCESS LINKS */}
          <div className="space-y-2 text-xs font-bold">
            <Link
              href="/civic-score"
              onClick={onClose}
              className="flex items-center justify-between p-3.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-2xl border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 transition-all group"
            >
              <div className="flex items-center space-x-2.5">
                <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Civic Score & Govt Honours</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/my-complaints"
              onClick={onClose}
              className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 transition-all group"
            >
              <div className="flex items-center space-x-2.5">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>My Registered Grievances</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200" />
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                onClick={onClose}
                className="flex items-center justify-between p-3.5 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 rounded-2xl border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 transition-all group"
              >
                <div className="flex items-center space-x-2.5">
                  <ShieldAlert className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Executive Admin Command</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
              </Link>
            )}
          </div>

          {/* SIGN OUT BUTTON */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                signOut();
                onClose();
              }}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-2xl border border-rose-200 dark:border-rose-800 transition-all active:scale-95 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of CivicTrack</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
