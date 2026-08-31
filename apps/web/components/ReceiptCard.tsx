'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Download, Shield, CheckCircle, ExternalLink, QrCode, Copy, Check } from 'lucide-react';
import { generateQRCodeDataURL, getOfficialTrackingUrl } from '../lib/pdfReceipt';
import { CivicIssue } from '../lib/types';


interface ReceiptCardProps {
  issue: CivicIssue;
}

export default function ReceiptCard({ issue }: ReceiptCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [trackingUrl, setTrackingUrl] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate clean, error-corrected high-precision QR code
    const url = getOfficialTrackingUrl(issue.complaint_number);
    setTrackingUrl(url);

    generateQRCodeDataURL(url).then((qrUrl: string) => {
      setQrDataUrl(qrUrl);
    });
  }, [issue.complaint_number]);

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(trackingUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    }
  };


  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      if (!receiptRef.current) return;

      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Receipt_${issue.complaint_number}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Printable Receipt Container */}
      <div
        ref={receiptRef}
        className="glass-card rounded-3xl p-6 sm:p-8 border border-[#C9C4BA] shadow-xl space-y-6 text-[#1E2328] font-sans"
      >
        {/* Receipt Header */}
        <div className="flex items-start justify-between border-b border-[#C9C4BA] pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-[#D95F02] flex items-center justify-center text-slate-950 font-bold text-xs">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">CivicTrack</span>
            </div>
            <p className="text-[10px] text-[#6B6860] font-medium">
              Official Grievance Registration Receipt • Municipal Wards
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#6B6860] block tracking-wider">
              Complaint Number
            </span>
            <span className="font-mono-data font-bold text-sm sm:text-base text-[#D95F02] bg-[#F0EEE9] px-2.5 py-0.5 rounded-lg border border-[#C9C4BA]">
              {issue.complaint_number}
            </span>
          </div>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#6B6860] block">Assigned Ward</span>
            <span className="font-bold text-[#1E2328] text-sm">{issue.zone_name}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[#6B6860] block">Department</span>
            <span className="font-semibold text-[#1A56A4]">{issue.department}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[#6B6860] block">Defect Category</span>
            <span className="font-semibold text-[#2D3340] capitalize">{issue.category.replace('_', ' ')}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[#6B6860] block">AI Verification & Count</span>
            <span className="font-mono-data font-bold text-[#176B3A] bg-[#EDFBF0] border border-[#176B3A] px-2 py-0.5 rounded-md text-[11px]">
              {(issue.ai_confidence * 100).toFixed(1)}% AI Confirmed {issue.ai_count || issue.category === 'pothole' ? `• ${issue.ai_count || 1} ${issue.category === 'pothole' ? ((issue.ai_count || 1) > 1 ? 'Potholes' : 'Pothole') : 'Count'}` : ''}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[#6B6860] block">Reported Timestamp</span>
            <span className="font-mono-data text-[#4B5563]">{new Date(issue.reported_at).toLocaleString()}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[#6B6860] block">Target SLA Deadline</span>
            <span className="font-mono-data font-bold text-[#D95F02]">
              {new Date(issue.deadline_at).toLocaleDateString()} (15 Days)
            </span>
          </div>
        </div>

        {/* Description Snippet */}
        <div className="bg-[#F0EEE9]/80 p-3.5 rounded-xl border border-[#C9C4BA] text-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#6B6860] block tracking-wider">
            Issue Description / Landmark
          </span>
          <p className="text-[#4B5563] leading-relaxed font-medium">{issue.description}</p>
        </div>

        {/* Bottom Verification Seal & QR Code */}
        <div className="pt-4 border-t border-dashed border-[#C9C4BA] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center space-x-1.5 text-[#176B3A] font-bold text-xs">
              <CheckCircle className="w-4 h-4 text-[#176B3A] shrink-0" />
              <span>Immutable Ticket Registered</span>
            </div>
            <p className="text-[10px] text-[#6B6860] leading-tight">
              Scan QR code on any mobile camera or Google Lens to open the live ticket status & timeline.
            </p>
            {trackingUrl && (
              <div className="flex items-center space-x-2 pt-1">
                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-mono-data font-bold text-[#1A56A4] hover:underline truncate max-w-[220px]"
                  title={trackingUrl}
                >
                  {trackingUrl}
                </a>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="p-1 rounded bg-[#E8E5DF] hover:bg-[#C9C4BA] text-[#1E2328] transition-colors shrink-0"
                  title="Copy verification link"
                >
                  {copiedUrl ? <Check className="w-3 h-3 text-[#176B3A]" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            )}
          </div>

          {qrDataUrl && (
            <a
              href={trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-white border-2 border-[#1E2328]/20 hover:border-emerald-500 rounded-xl shadow-md shrink-0 block transition-transform hover:scale-105 cursor-pointer group"
              title="Click or Scan to Open Live Tracking Page"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt={`QR Code for ${issue.complaint_number}`} className="w-20 h-20" />
              <span className="block text-[8px] font-black text-center text-slate-500 group-hover:text-emerald-600 mt-0.5">
                SCAN / CLICK
              </span>
            </a>
          )}
        </div>

      </div>

      {/* PDF Download Button */}
      <button
        type="button"
        onClick={handleDownloadPdf}
        disabled={isGeneratingPdf}
        className="w-full py-3.5 px-4 bg-[#D95F02] hover:bg-[#D95F02] text-slate-950 text-xs font-extrabold rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center space-x-2"
      >
        <Download className="w-4 h-4 text-slate-950" />
        <span>{isGeneratingPdf ? 'Generating Official PDF...' : 'Download Official PDF Receipt'}</span>
      </button>
    </div>
  );
}
