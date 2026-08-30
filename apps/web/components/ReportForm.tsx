'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, AlertCircle, CheckCircle, ArrowRight, ShieldCheck, Sparkles, Navigation, LocateFixed, Mic, MicOff } from 'lucide-react';
import CameraCapture from './CameraCapture';
import { DetectionResult, AnalyzeApiResponse, analyzeImageWithLiveApi } from '../lib/aiDetector';
import { matchZoneByCoordinates, reverseGeocodeReal, RealGeoAddress } from '../lib/zoneMatcher';
import { generateComplaintNumber } from '../lib/complaintNumber';
import { addIssue, getStoredIssues, attachEvidenceAndUpvote, updateIssueAiResults } from '../lib/store';
import { createIssue } from '../lib/db';

import { IssueCategory, CivicIssue } from '../lib/types';
import { findNearbyExistingIssue, NearbyIssueMatch } from '../lib/geoDistance';
import { useAuth } from '../lib/authContext';

const CATEGORIES: { id: IssueCategory; label: string; code: string; defaultDesc: string }[] = [
  { id: 'pothole', label: 'Pothole & Road Cavity', code: 'RD-POT', defaultDesc: 'Hazardous asphalt road pothole causing vehicle traffic slowdown and safety risk.' },
  { id: 'permanent_broken_streetlight', label: 'Permanent Broken Streetlight', code: 'LT-PBK', defaultDesc: 'Long-term defective or smashed streetlight pole creating chronic dark accident/crime hotspot.' },
  { id: 'blind_corner', label: 'Blind Corner / Hazardous Turn', code: 'TR-BLC', defaultDesc: 'Obstructed road junction or sharp blind curve with zero vehicle sightlines causing near-miss collisions.' },
  { id: 'lack_of_cctv', label: 'Lack of CCTV / Security Blind Spot', code: 'SC-CTV', defaultDesc: 'High-traffic public junction, park, or dark alley vulnerable due to absent municipal surveillance cameras.' },
  { id: 'overgrown_bushes', label: 'Overgrown Bushes Blocking Sidewalk', code: 'HO-BSH', defaultDesc: 'Dense untrimmed bushes and tree branches forcing pedestrians onto moving traffic lanes.' },
  { id: 'fallen_tree', label: 'Fallen Tree / Road Obstruction', code: 'RD-TRE', defaultDesc: 'Uprooted tree or heavy timber blocking municipal vehicle traffic and transit lane.' },
  { id: 'exposed_wires', label: 'Dangling Electric Conductor', code: 'EL-WIR', defaultDesc: 'Low-hanging or snapped 440V power wire creating immediate electrical and fire hazard.' },
  { id: 'garbage', label: 'Solid Waste Bin Overflow', code: 'WM-GRB', defaultDesc: 'Overflowing municipal garbage bin blocking pedestrian walkway and drainage.' },
  { id: 'water_logging', label: 'Storm Drain Flood Inundation', code: 'DR-FLD', defaultDesc: 'Stagnant storm water accumulation due to blocked municipal drainage culvert.' },
  { id: 'broken_footpath', label: 'Displaced Footpath Paver', code: 'PD-PAV', defaultDesc: 'Cracked and displaced concrete walking slabs hazardous for pedestrians.' },
  { id: 'streetlight', label: 'Out-of-Service Streetlight', code: 'LT-STL', defaultDesc: 'Non-functioning municipal luminaire pole causing complete nighttime blackout.' },
  { id: 'manhole', label: 'Uncovered Drain Chamber', code: 'SW-MNH', defaultDesc: 'Missing or fractured sewer manhole cover creating open fall hazard.' },
  { id: 'water_leakage', label: 'Main Pipeline Fracture', code: 'WS-LKG', defaultDesc: 'Underground potable water supply main pipeline fracture discharging onto roadway.' },
  { id: 'dead_animal', label: 'Stray Animal Sanitation', code: 'SN-ANM', defaultDesc: 'Urgent municipal health request for stray animal carcass removal.' },
  { id: 'road_damage', label: 'Bitumen Subsidence / Caving', code: 'RD-SUB', defaultDesc: 'Significant road asphalt caving and structural bitumen deformation.' },
];

export default function ReportForm() {
  const router = useRouter();
  const { user } = useAuth();

  const [category, setCategory] = useState<IssueCategory>('pothole');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<DetectionResult | null>(null);
  const [liveApiData, setLiveApiData] = useState<AnalyzeApiResponse | null>(null);
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');

  // GPS Coordinates state
  const [latitude, setLatitude] = useState<number>(26.9068);
  const [longitude, setLongitude] = useState<number>(75.7873);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState<RealGeoAddress | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'prompt' | 'granted' | 'denied' | 'fallback'>('prompt');

  // 50m Spatial Deduplication State
  const [nearbyDuplicate, setNearbyDuplicate] = useState<NearbyIssueMatch | null>(null);
  const [dismissedDuplicateId, setDismissedDuplicateId] = useState<string | null>(null);

  // Voice Dictation state
  const [isListening, setIsListening] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Automatically request real GPS location on mount
  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  // Update reverse geocoding & matched ward whenever coordinates change, + 50m deduplication check
  useEffect(() => {
    let isCurrent = true;

    async function lookupGeo() {
      const geo = await reverseGeocodeReal(latitude, longitude);
      if (isCurrent) {
        setResolvedAddress(geo);

        // Autofill title with real location if user hasn't typed a custom one
        if (!title || title.includes('on Main') || title.includes('in Ward')) {
          const catLabel = CATEGORIES.find(c => c.id === category)?.label || 'Civic Defect';
          const areaLabel = geo.road ? `${geo.road}, ${geo.city || ''}` : geo.suburb ? `${geo.suburb}, ${geo.city || ''}` : geo.ward_name;
          setTitle(`${catLabel} near ${areaLabel}`);
        }
      }
    }

    lookupGeo();

    // Check 50m deduplication against existing issues ONLY for the SAME problem category
    const issues = getStoredIssues();
    const match = findNearbyExistingIssue(latitude, longitude, issues, 50, category);
    if (match && match.issue.id !== dismissedDuplicateId) {
      setNearbyDuplicate(match);
    } else {
      setNearbyDuplicate(null);
    }

    return () => {
      isCurrent = false;
    };
  }, [latitude, longitude, category, dismissedDuplicateId]);

  const fetchCurrentLocation = () => {
    if (typeof window === 'undefined') return;
    setIsLocating(true);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLat = Number(position.coords.latitude.toFixed(6));
          const userLng = Number(position.coords.longitude.toFixed(6));
          const userAccuracy = Math.round(position.coords.accuracy);

          setLatitude(userLat);
          setLongitude(userLng);
          setAccuracy(userAccuracy);
          setGpsStatus('granted');
          setIsLocating(false);
        },
        (error) => {
          console.warn('Geolocation access note:', error.message);
          setGpsStatus('fallback');
          setIsLocating(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setGpsStatus('fallback');
      setIsLocating(false);
    }
  };

  const startVoiceDictation = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice dictation is not supported on this browser. Try Chrome or Edge!');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handlePhotoCaptured = (
    url: string,
    result: DetectionResult,
    apiResponse?: AnalyzeApiResponse
  ) => {
    setPhotoUrl(url);
    setAiResult(result);
    if (apiResponse) {
      setLiveApiData(apiResponse);
    }

    if (result.is_civic_issue && result.category && result.category !== category) {
      setCategory(result.category);
    }

    if (result.is_civic_issue && !description) {
      const found = CATEGORIES.find(c => c.id === (result.category || category));
      if (found) setDescription(found.defaultDesc);
    }

    const areaName = resolvedAddress?.road || resolvedAddress?.suburb || resolvedAddress?.city || 'Local Area';
    if (result.is_civic_issue && result.detected_class !== 'Non-Civic Image (Rejected)') {
      const issueLabel = apiResponse?.issue_type && apiResponse.issue_type !== 'invalid_non_defect'
        ? apiResponse.issue_type.toUpperCase().replace(/_/g, ' ')
        : result.detected_class;
      setTitle(`${issueLabel} near ${areaName}`);
    }
  };

  const handleMergeDuplicate = (targetIssueId: string) => {
    const photoToAttach = photoUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80';
    const updated = attachEvidenceAndUpvote(targetIssueId, photoToAttach, 'Citizen Reporter');
    if (updated) {
      router.push(`/track/${updated.complaint_number || updated.id}?justUpvoted=true`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!photoUrl) {
      setErrorMsg('Please capture or select a photo of the defect before submitting.');
      return;
    }

    // 🚫 AI CANCELLED / FALSE REPORT GUARD
    if (
      liveApiData?.detected === false ||
      (liveApiData?.severity !== undefined && liveApiData.severity === 0) ||
      aiResult?.is_civic_issue === false ||
      aiResult?.detected_class === 'Clean Road Surface (No Defect)'
    ) {
      setErrorMsg(
        liveApiData?.description ||
        liveApiData?.rejection_reason ||
        '🚫 REPORT REJECTED BY AI: The vision model evaluated this photo and found NO valid civic defect. Please upload a clear photo of the actual infrastructure problem.'
      );
      return;
    }

    setIsSubmitting(true);


    try {
      const geo = resolvedAddress || await reverseGeocodeReal(latitude, longitude);
      const zoneFallback = matchZoneByCoordinates(latitude, longitude);

      const zoneName = geo.ward_name || zoneFallback.zone_name;
      const deptName = geo.department || zoneFallback.department;
      const cityCode = geo.city_code || zoneFallback.city_code;

      const complaintNumber = generateComplaintNumber(cityCode, 2026);
      const now = new Date();
      const deadline = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000); // 15-day SLA

      const photoFinal = photoUrl || '';

      const userReporterId = user?.id || (user as any)?.uid || undefined;
      const userReporterEmail = user?.email || undefined;
      const userReporterName = user?.displayName || user?.email?.split('@')[0] || 'Verified Citizen';

      const newIssue: CivicIssue = {
        id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `issue-${Date.now()}`,
        complaint_number: complaintNumber,
        reporter_id: userReporterId,
        reporter_name: userReporterName,
        reporter_email: userReporterEmail,
        zone_id: '',
        zone_name: zoneName,
        department: deptName,
        category,
        title: title || `${category.toUpperCase()} at ${zoneName}`,
        description: description || `Civic issue reported via live camera at ${zoneName}.`,
        photo_url: photoFinal,
        additional_photos: photoFinal ? [photoFinal] : [],
        ai_confidence: liveApiData?.detections?.[0]?.confidence ?? aiResult?.confidence ?? 0.95,
        ai_detected_class: liveApiData?.issue_type ? liveApiData.issue_type.toUpperCase() : (aiResult?.detected_class || 'Pothole'),
        ai_analysis_status: liveApiData ? 'completed' : 'analyzing',
        ai_severity: liveApiData?.severity,
        ai_count: liveApiData?.count,
        ai_detections: liveApiData?.detections,
        ai_description: liveApiData?.description,
        latitude,
        longitude,
        status: 'pending',
        upvote_count: 1,
        reported_at: now.toISOString(),
        deadline_at: deadline.toISOString(),
        escalated: false,
        has_upvoted: true,
      };

      // Save to Firebase Firestore database and local store so both live phone scans and local client see the new docket immediately
      const savedIssue = await createIssue(newIssue).catch(err => {
        console.warn('Firebase Firestore create issue note:', err);
        return null;
      });
      addIssue(savedIssue || newIssue);

      // Launch background AI analysis if not finished yet
      if (!liveApiData && photoUrl) {
        analyzeImageWithLiveApi(photoUrl, category)
          .then((apiData) => {
            updateIssueAiResults(newIssue.id, apiData);
          })
          .catch((err) => {
            console.warn('Background AI analysis error note:', err);
          });
      }

      router.push(`/track/${complaintNumber}?justCreated=true`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to submit report. Please try again.');
      setIsSubmitting(false);
    }
  };

  const wardDisplay = resolvedAddress?.ward_name || 'Resolving local ward...';
  const deptDisplay = resolvedAddress?.department || 'Municipal Public Works (Roads / Sanitation)';

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 50m Spatial Deduplication Warning Banner */}
      {nearbyDuplicate && (
        <div className="p-5 bg-amber-950/40 border border-[#D95F02]/50 rounded-2xl space-y-3.5 text-xs text-amber-200 shadow-xl">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-[#D95F02] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-300 text-sm">
                Existing Ticket within {nearbyDuplicate.distanceMeters} Meters Detected
              </h4>
              <p className="text-amber-200/90 mt-1 leading-relaxed text-xs">
                Ticket <span className="font-mono-data font-bold text-[#D95F02]">{nearbyDuplicate.issue.complaint_number}</span> (
                <em>"{nearbyDuplicate.issue.title}"</em>) is registered at this coordinate. Attach your photo as supporting evidence to upvote and escalate priority.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
            <button
              type="button"
              onClick={() => handleMergeDuplicate(nearbyDuplicate.issue.id)}
              className="px-5 py-2.5 bg-[#D95F02] hover:bg-[#c05300] text-white font-bold rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer active:scale-95"
            >
              <span>+ Attach Evidence & Upvote #{nearbyDuplicate.issue.complaint_number}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setDismissedDuplicateId(nearbyDuplicate.issue.id);
                setNearbyDuplicate(null);
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              File Separate New Ticket Anyway →
            </button>
            <button
              type="button"
              onClick={() => router.push(`/track/${nearbyDuplicate.issue.complaint_number}`)}
              className="px-3.5 py-2.5 bg-[#E8E5DF] hover:bg-[#C9C4BA] text-slate-800 border border-[#D95F02]/40 font-semibold rounded-xl transition-all cursor-pointer"
            >
              View Docket
            </button>
          </div>
        </div>
      )}

      {/* 1. Category Picker */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider">
          1. Select Defect Category
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setCategory(cat.id);
                  if (!description || description === CATEGORIES.find(c => c.id === category)?.defaultDesc) {
                    setDescription(cat.defaultDesc);
                  }
                }}
                className={`p-3.5 rounded-2xl border text-left flex items-start space-x-2.5 transition-all text-xs ${
                  isSelected
                    ? 'border-[#D95F02] bg-amber-950/40 text-amber-300 font-bold ring-2 ring-amber-500/30 shadow-md'
                    : 'border-[#C9C4BA] bg-[#E8E5DF] hover:bg-[#C9C4BA] text-[#4B5563]'
                }`}
              >
                <span className="font-mono-data text-[10px] bg-[#F0EEE9] text-[#D95F02] border border-[#D95F02]/40 px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                  {cat.code}
                </span>
                <span className="font-semibold text-xs leading-snug">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Live Camera & AI Detector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider">
            2. Edge Computer Vision Scanner (YOLOv8)
          </label>
          <span className="text-[11px] font-semibold text-[#1A56A4] bg-[#EEF4FF] border border-[#1A56A4]/40 px-3 py-1 rounded-full">
            Edge Model Ready
          </span>
        </div>
        <CameraCapture
          onPhotoCaptured={handlePhotoCaptured}
          selectedCategory={category}
        />
      </div>

      {/* 3. Real-Time GPS & Real-World Address Resolver */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl border border-[#C9C4BA]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#D95F02] flex items-center space-x-2 uppercase tracking-wider">
            <LocateFixed className="w-4 h-4 text-[#D95F02]" />
            <span>3. PostGIS Spatial Ward Jurisdiction</span>
          </span>
          <button
            type="button"
            onClick={fetchCurrentLocation}
            disabled={isLocating}
            className="text-xs text-slate-950 bg-[#D95F02] hover:bg-[#D95F02] font-bold flex items-center space-x-1.5 px-3.5 py-2 rounded-xl shadow-xs transition-all"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Acquiring...' : 'Re-Scan GPS'}</span>
          </button>
        </div>

        {gpsStatus === 'granted' && (
          <div className="p-3 bg-[#EDFBF0]/90 border border-[#176B3A]/80 rounded-xl text-xs text-[#176B3A] flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-[#176B3A] shrink-0" />
              <span className="font-bold">Live GPS Location Confirmed</span>
            </span>
            {accuracy && (
              <span className="font-mono-data text-[11px] bg-[#176B3A] text-white px-2.5 py-0.5 rounded-full font-bold">
                ±{accuracy}m Accuracy
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-[#F0EEE9]/90 p-4 rounded-2xl border border-[#C9C4BA] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#6B6860] block tracking-wider">Jurisdictional Ward</span>
            <p className="font-extrabold text-[#1E2328] text-sm">{wardDisplay}</p>
            <p className="text-xs text-[#1A56A4] font-semibold">{deptDisplay}</p>
          </div>

          <div className="bg-[#F0EEE9]/90 p-4 rounded-2xl border border-[#C9C4BA] flex flex-col justify-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#6B6860] block tracking-wider">Geospatial Coordinates</span>
            <p className="font-mono-data text-[#D95F02] font-bold text-xs">
              Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}
            </p>
            <span className="text-xs text-[#6B6860] truncate">
              {resolvedAddress?.display_name ? resolvedAddress.display_name.slice(0, 50) + '...' : 'Geocoding matched'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Issue Title & Landmark */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider">
            4. Docket Summary / Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Hazardous asphalt road pothole near GT Road junction"
            className="w-full px-4 py-3 text-xs sm:text-sm bg-white border border-[#C9C4BA] rounded-xl outline-none focus:border-[#D95F02] font-semibold text-[#1E2328] placeholder-slate-400 shadow-xs"
            required
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider">
              Field Evidence Description
            </label>
            <button
              type="button"
              onClick={startVoiceDictation}
              className={`text-xs font-semibold flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                isListening
                  ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                  : 'bg-[#E8E5DF] hover:bg-[#C9C4BA] text-[#4B5563] border-[#C9C4BA]'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-3.5 h-3.5" />
                  <span>Recording...</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-[#D95F02]" />
                  <span>Voice Dictate</span>
                </>
              )}
            </button>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Specify physical landmarks, lane direction, or hazard risks..."
            className="w-full px-4 py-3 text-xs sm:text-sm bg-white border border-[#C9C4BA] rounded-xl outline-none focus:border-[#D95F02] font-medium text-[#1E2328] placeholder-slate-400 leading-relaxed shadow-xs"
          />
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-[#FEF2F2] border border-[#B91C1C] rounded-2xl text-xs sm:text-sm text-[#B91C1C] flex items-center space-x-3 shadow-md">
          <AlertCircle className="w-5 h-5 text-[#B91C1C] shrink-0" />
          <span className="font-semibold leading-relaxed">{errorMsg}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !photoUrl}
        className="w-full py-4.5 px-6 bg-[#D95F02] hover:bg-[#D95F02] disabled:bg-[#C9C4BA] text-slate-950 font-extrabold text-sm sm:text-base rounded-2xl shadow-xl shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-center space-x-2.5"
      >
        {isSubmitting ? (
          <span>Generating Official Municipal Docket...</span>
        ) : (
          <>
            <span>Register Official Municipal Grievance Docket</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  );
}
