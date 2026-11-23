export type Role = 'Safety Officer' | 'Safety Manager' | 'Project Director' | 'Admin';

/** Safety Officer registration is active on submit. There is no onboarding queue. */
export type ApprovalStatus = 'approved';

export type ApprovalAction = 'activate';

export interface ApprovalEvent {
  id: string;
  at: string;
  role: Role;
  actor: string;
  action: ApprovalAction;
  remarks: string;
  from: ApprovalStatus;
  to: ApprovalStatus;
}

export type StrikeStatus = 'pending_manager' | 'pending_director' | 'approved' | 'rejected';

export type StrikeDecision = 'approve' | 'reject';

export interface StrikeEvent {
  id: string;
  at: string;
  role: Role;
  actor: string;
  action: 'propose' | StrikeDecision;
  remarks: string;
  from: StrikeStatus | 'new';
  to: StrikeStatus;
}

export interface StrikeRecord {
  id: string;
  workerId: string;
  level: 1 | 2 | 3;
  reason: string;
  date: string;
  evidenceName: string;
  issuer: string;
  issuerRole: Role;
  status: StrikeStatus;
  trail: StrikeEvent[];
}

export type CourseCode = 'SIC' | 'BCSS' | 'CSOC';

export interface TrainingRecord {
  id: string;
  workerId: string;
  course: CourseCode;
  courseDate: string;
  expiry: string;
  certificateNumber: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export type InductionStatus = 'Completed' | 'Pending' | 'Not started';

export interface Worker {
  id: string;
  publicToken: string;
  firstName: string;
  lastName: string;
  avatarIndex: number;
  companyId: string;
  projectId: string;
  designation: string;
  trade: string;
  nationality: string;
  nricMasked: string;
  dob: string;
  phone: string;
  address: string;
  workPermitNumber: string;
  workPermitExpiry: string;
  csocNumber: string;
  csocExpiry: string;
  siteInduction: InductionStatus;
  approvalStatus: ApprovalStatus;
  approvalTrail: ApprovalEvent[];
  trainings: TrainingRecord[];
  strikes: StrikeRecord[];
  nextOfKin: EmergencyContact;
  createdAt: string;
  /** Profile photo as a data URL. Null for seed workers, who use an initials placeholder. */
  photoDataUrl: string | null;
}

export interface Company {
  id: string;
  name: string;
  kind: 'main' | 'sub';
  uen: string;
  focus: string;
  contactName: string;
  phone: string;
  /** Identity colour from the preset palette. Not a status colour. */
  color: string;
}

export interface Project {
  id: string;
  code: string;
  name: string;
}

export interface AppUser {
  id: string;
  name: string;
  role: Role;
  email: string;
  initials: string;
}

export interface SiteContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  hours: string;
  notes: string;
}

export interface AuditEvent {
  id: string;
  at: string;
  actor: string;
  role: Role;
  action: string;
  target: string;
  detail: string;
}

export interface AppState {
  version: 2;
  companies: Company[];
  projects: Project[];
  users: AppUser[];
  workers: Worker[];
  siteContacts: SiteContact[];
  audit: AuditEvent[];
  currentUserId: string;
  currentProjectId: string;
  publicStrikeIndicator: boolean;
}

export interface WorkerDraft {
  firstName: string;
  lastName: string;
  nationality: string;
  nricMasked: string;
  dob: string;
  phone: string;
  address: string;
  companyId: string;
  projectId: string;
  designation: string;
  trade: string;
  siteInduction: InductionStatus;
  csocNumber: string;
  csocExpiry: string;
  workPermitNumber: string;
  workPermitExpiry: string;
  nextOfKin: EmergencyContact;
  photoDataUrl: string | null;
}
