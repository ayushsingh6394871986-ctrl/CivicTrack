'use client';

import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Award, Shield, CheckCircle, Download, Printer, Sparkles, Building2, MapPin, QrCode, ArrowLeft } from 'lucide-react';
import { GovtCertificateRecord } from '@/lib/civicScore';

interface GovtCertificateModalProps {
  certificate: GovtCertificateRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function GovtCertificateModal({
  certificate,
  isOpen,
  onClose,
}: GovtCertificateModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

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

  if (!isOpen || !certificate || !mounted) return null;

  const handlePrint = () => {
    window.print();
  };

  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative my-auto bg-white dark:bg-[#111827] text-slate-900 dark:text-white max-w-2xl w-full rounded-3xl border-2 border-amber-400 shadow-2xl overflow-hidden my-6 animate-in zoom-in-95 duration-200"
      >
        
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-amber-500/10 border-b border-amber-400/30">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Government Certificate</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE CERTIFICATE CANVAS */}
        <div ref={printRef} className="p-8 sm:p-12 relative bg-[#FCFBF7] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 border-[10px] border-double border-amber-500/60 m-4 rounded-2xl shadow-inner text-center space-y-6">
          
          {/* Top National / Municipal Seal Banner */}
          <div className="flex items-center justify-between border-b-2 border-amber-500/30 pb-4">
            <div className="flex items-center space-x-3 text-left">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-amber-700 dark:text-amber-400">
                  Government of India • Ministry of Urban Affairs
                </p>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                  MUNICIPAL CORPORATION CIVIC GOVERNANCE CELL
                </h4>
              </div>
            </div>

            <div className="text-right font-mono text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5">
              <p>CERTIFICATE ID:</p>
              <p className="font-bold text-amber-600 dark:text-amber-400">{certificate.certificateId}</p>
            </div>
          </div>

          {/* Certificate Title */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/70 px-4 py-1 rounded-full border border-amber-300 dark:border-amber-700">
              NATIONAL CIVIC HONOUR AWARD
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-slate-900 dark:text-white">
              Certificate of Civic Excellence
            </h1>
            <p className="text-xs font-serif italic text-slate-600 dark:text-slate-400">
              This prestigious certificate of merit is officially conferred upon
            </p>
          </div>

          {/* Recipient Name Highlight */}
          <div className="py-3 border-y-2 border-dashed border-amber-400/40">
            <h2 className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight underline decoration-amber-500 decoration-wavy">
              {certificate.recipientName}
            </h2>
            {certificate.recipientEmail && (
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                Verified Citizen ID: {certificate.recipientEmail}
              </p>
            )}
          </div>

          {/* Award Text */}
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            In recognition of outstanding civic sense, proactive municipal grievance reporting, and exceptional contribution towards public safety and infrastructure in <strong className="text-slate-900 dark:text-white">{certificate.quarterLabel}</strong>. Ranked among the <strong className="text-amber-600 dark:text-amber-400">Top 3 Citizens</strong> of the quarter.
          </p>

          {/* Metrics Badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Quarterly Rank</span>
              <span className="text-base font-black text-amber-600 dark:text-amber-400">
                #{certificate.rank} {certificate.rank === 1 ? 'Gold Medal' : certificate.rank === 2 ? 'Silver Medal' : 'Bronze Medal'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Issues Resolved</span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{certificate.issuesResolved} Fixed</span>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Civic Points</span>
              <span className="text-base font-black text-blue-600 dark:text-blue-400">{certificate.pointsEarned} Pts</span>
            </div>
          </div>

          {/* Official Signatures & Digital Seal */}
          <div className="pt-6 flex items-end justify-between border-t-2 border-amber-500/30 text-left">
            <div className="space-y-1">
              <div className="w-14 h-14 rounded-full border-2 border-amber-500 bg-amber-50 dark:bg-amber-950 flex items-center justify-center shadow-md">
                <Award className="w-8 h-8 text-amber-500" />
              </div>
              <span className="text-[9px] font-mono text-slate-400 uppercase block">CRYPTOGRAPHIC DIGITAL SEAL</span>
            </div>

            <div className="text-center">
              <div className="font-serif italic text-sm text-slate-900 dark:text-white font-bold border-b border-slate-400 pb-1 px-4">
                Director General of Urban Governance
              </div>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold mt-1">
                Authorized Municipal Authority Signature
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Back / Done Button */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer"
          >
            Close & Return to Dashboard
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
