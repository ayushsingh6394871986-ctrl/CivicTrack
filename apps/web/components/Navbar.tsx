'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  Map,
  FileText,
  BarChart3,
  Building2,
  Menu,
  X,
  Camera,
  Radio,
  AlertTriangle,
  LogIn,
  LogOut,
  User,
  ShieldAlert,
  Wrench,
  Award,
  HardHat
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';
import { useUserLocation } from '@/lib/useUserLocation';
import { useAuth } from '@/lib/authContext';
import LoginModal from './LoginModal';
import ProfileModal from './ProfileModal';

export default function Navbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const userLocation = useUserLocation();
  const { user, isAdmin, signOut } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: '/my-complaints', label: 'My Reports', icon: FileText },
    { href: '/civic-score', label: 'Civic Score', icon: Award },
    { href: '/worker', label: 'Worker Hub', icon: HardHat },
    { href: '/department', label: 'Resolver', icon: Wrench },
    { href: '/map', label: 'GIS Map', icon: Map },
    { href: '/dashboard', label: 'SLA Board', icon: BarChart3 },
    ...(isAdmin ? [{ href: '/admin', label: 'Admin', icon: ShieldAlert }] : []),
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0B0F19]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">

          {/* Brand */}
          <Link href="/" className="flex items-center space-x-3 group shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon.png"
              alt="CivicTracker"
              className="w-10 h-10 rounded-2xl shadow-md group-hover:scale-105 transition-transform object-cover"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white">CivicTracker</span>
                <span className="text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 text-blue-500 animate-pulse" />
                  <span suppressHydrationWarning>
                    {userLocation.isLoaded ? userLocation.city.toUpperCase() : 'LIVE'}
                  </span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium hidden sm:block truncate max-w-[200px]" suppressHydrationWarning>
                {userLocation.wardName ? `${userLocation.wardName}` : 'Municipal Grievance System'}
              </p>
            </div>
          </Link>

          {/* Desktop Nav - Clean & Spacious */}
          <nav className="hidden lg:flex items-center space-x-1.5 bg-slate-100/70 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white dark:bg-[#1E293B] text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3 shrink-0">
            
            {/* Primary Report CTA */}
            <Link
              href="/report"
              className="hidden sm:flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-xs shadow-md shadow-red-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Report Issue</span>
            </Link>

            <div className="flex items-center space-x-1.5 pl-1 border-l border-slate-200 dark:border-slate-800">
              <ThemeToggle />
              <NotificationBell />
            </div>

            {/* User Profile / Auth */}
            {mounted && user ? (
              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                className="flex items-center space-x-2.5 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 pl-2 pr-3 py-1.5 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-xs active:scale-95"
                title="View Profile & Civic Score"
              >
                <div className="relative shrink-0">
                  {user.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-7 h-7 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      {user.displayName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                </div>
                <div className="flex flex-col items-start leading-none text-left">
                  <span className="text-xs font-black text-slate-900 dark:text-white max-w-[110px] truncate">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[9px] font-black tracking-wider uppercase text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {isAdmin ? 'ADMIN' : user.role === 'worker' ? 'WORKER' : 'CITIZEN'}
                  </span>
                </div>
              </button>
            ) : mounted && !user ? (
              <button
                type="button"
                onClick={() => setLoginOpen(true)}
                className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-2xl shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            ) : (
              <div className="w-16 h-8" />
            )}

            {/* Mobile Menu Trigger */}
            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-[#0B0F19] border-t border-slate-200 dark:border-slate-800 px-5 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2">
          <Link
            href="/report"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center space-x-2 w-full py-3 bg-red-600 text-white font-extrabold text-xs rounded-2xl shadow-md mb-3"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>+ Report Civic Issue</span>
          </Link>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </header>
  );
}
