export type UserRole = 'citizen' | 'department_staff' | 'admin';

export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: UserRole;
  created_at: string;
}

export interface AdminZone {
  id: string;
  zone_name: string;
  department: string;
  city: string;
  city_code: string;
  official_handle: string;
  official_email?: string;
  boundary?: number[][][]; // GeoJSON Polygon coordinates [lng, lat]
  center: [number, number]; // [lat, lng]
}

export type IssueCategory =
  | 'pothole'
  | 'fallen_tree'
  | 'exposed_wires'
  | 'garbage'
  | 'water_logging'
  | 'broken_footpath'
  | 'streetlight'
  | 'permanent_broken_streetlight'
  | 'blind_corner'
  | 'lack_of_cctv'
  | 'overgrown_bushes'
  | 'manhole'
  | 'water_leakage'
  | 'dead_animal'
  | 'road_damage'
  | 'other';

export type IssueStatus =
  | 'pending'
  | 'verified'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'reopened'
  | 'rejected';

export type AiAnalysisStatus = 'pending' | 'analyzing' | 'completed' | 'failed';

export interface AiDetectionBox {
  confidence: number;
  box: [number, number, number, number];
  severity: number;
}

export interface CivicIssue {
  id: string;
  complaint_number: string; // e.g. CTR-2026-JPR-000184
  reporter_id?: string;
  reporter_name?: string;
  reporter_email?: string;
  zone_id: string;
  zone_name: string;
  department: string;
  category: IssueCategory;
  title: string;
  description: string;
  photo_url: string;
  additional_photos?: string[];
  ai_confidence: number;
  ai_detected_class: string;
  ai_analysis_status?: AiAnalysisStatus;
  ai_severity?: number;
  ai_count?: number;
  ai_detections?: AiDetectionBox[];
  ai_description?: string;
  rejection_reason?: string;
  latitude: number;
  longitude: number;
  status: IssueStatus;
  upvote_count: number;
  reported_at: string;
  deadline_at: string;
  resolved_at?: string;
  resolved_by?: string;
  contractor_name?: string;
  escalated: boolean;
  escalation_graphic_url?: string;
  escalation_email_sent_at?: string;
  department_email?: string;
  has_upvoted?: boolean;
}

export interface IssueStatusHistory {
  id: string;
  issue_id: string;
  old_status?: IssueStatus;
  new_status: IssueStatus;
  changed_by?: string;
  department_note?: string;
  created_at: string;
}

export interface ResolutionEvidence {
  id: string;
  issue_id: string;
  submitted_by?: string;
  contractor_name?: string;
  before_photo_url: string;
  after_photo_url: string;
  description: string;
  latitude?: number;
  longitude?: number;
  ai_verified_solved?: boolean;
  ai_verdict?: 'YES' | 'NO';
  ai_reason?: string;
  ai_confidence?: number;
  submitted_at: string;
  verification_status: 'pending' | 'confirmed' | 'rejected';
}

export interface ResolutionVerification {
  id: string;
  issue_id: string;
  user_id?: string;
  decision: 'confirmed' | 'rejected';
  comment?: string;
  photo_url?: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id?: string;
  issue_id?: string;
  complaint_number?: string;
  type: 'nearby_issue' | 'status_change' | 'deadline_warning' | 'escalation' | 'resolution';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface ZoneBudgetData {
  id: string;
  zone_id: string;
  zone_name: string;
  department: string;
  fiscal_year: string;
  allocated_amount: number | null;
  scheme_name: string | null;
  source_title?: string | null;
  source_url: string | null;
}

export interface DashboardMetrics {
  total_issues: number;
  active_issues: number;
  resolved_issues: number;
  overdue_issues: number;
  avg_resolution_days: number;
  citizen_verification_rate: number;
}

export interface ZoneLeaderboardAccountability {
  zone_id: string;
  zone_name: string;
  department: string;
  open_issues: number;
  overdue_count: number;
  avg_days_unresolved: number;
  escalated_count: number;
}

export interface ZoneLeaderboardPerformance {
  zone_id: string;
  zone_name: string;
  department: string;
  resolved_count: number;
  total_count: number;
  resolution_rate_percent: number;
  avg_resolution_days: number;
}
