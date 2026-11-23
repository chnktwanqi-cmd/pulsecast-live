import { PUBLIC_STRIKE_INDICATOR } from '../config/flags';
import { REGISTRATION_AUDIT_ACTION } from '../domain/approval';
import { COMPANY_PALETTE } from '../domain/companyColors';
import { addDays, isoDaysAgo } from '../domain/dates';
import type {
  ApprovalEvent,
  AppState,
  AuditEvent,
  Company,
  InductionStatus,
  Project,
  SiteContact,
  StrikeRecord,
  TrainingRecord,
  Worker,
} from '../domain/types';

interface SeedRow {
  first: string;
  last: string;
  companyId: string;
  projectId: string;
  designation: string;
  trade: string;
  nationality: string;
  csocOffset: number;
  wpOffset: number;
  induction: InductionStatus;
}

const ROWS: SeedRow[] = [
  { first: 'Daniel', last: 'Tan', companyId: 'c-main', projectId: 'p-de178', designation: 'Site Engineer', trade: 'Engineering', nationality: 'Singaporean', csocOffset: 140, wpOffset: 220, induction: 'Completed' },
  { first: 'Aiman', last: 'Rahman', companyId: 'c-alpha', projectId: 'p-de178', designation: 'General Worker', trade: 'General Worker', nationality: 'Malaysian', csocOffset: 80, wpOffset: 60, induction: 'Completed' },
  { first: 'Raj', last: 'Kumar', companyId: 'c-beta', projectId: 'p-de178', designation: 'Site Supervisor', trade: 'Supervision', nationality: 'Indian', csocOffset: 90, wpOffset: 110, induction: 'Completed' },
  { first: 'Muhammad', last: 'Ali', companyId: 'c-main', projectId: 'p-de178', designation: 'Site Coordinator', trade: 'Coordination', nationality: 'Bangladeshi', csocOffset: 70, wpOffset: 45, induction: 'Completed' },
  { first: 'Ng', last: 'Wei Ming', companyId: 'c-gamma', projectId: 'p-de178', designation: 'Trade Worker', trade: 'Electrical', nationality: 'Singaporean', csocOffset: 40, wpOffset: 55, induction: 'Completed' },
  { first: 'Suresh', last: 'Nathan', companyId: 'c-alpha', projectId: 'p-de178', designation: 'General Worker', trade: 'General Worker', nationality: 'Indian', csocOffset: 100, wpOffset: 30, induction: 'Completed' },
  { first: 'Lim', last: 'Hao Jun', companyId: 'c-beta', projectId: 'p-de178', designation: 'Project Manager', trade: 'Management', nationality: 'Singaporean', csocOffset: 160, wpOffset: 180, induction: 'Completed' },
  { first: 'Farid', last: 'Ismail', companyId: 'c-gamma', projectId: 'p-de178', designation: 'General Worker', trade: 'Concreting', nationality: 'Malaysian', csocOffset: 50, wpOffset: 75, induction: 'Completed' },
  { first: 'Priya', last: 'Menon', companyId: 'c-main', projectId: 'p-de178', designation: 'WSH Coordinator', trade: 'Safety', nationality: 'Singaporean', csocOffset: 20, wpOffset: 18, induction: 'Completed' },
  { first: 'Gavin', last: 'Loh', companyId: 'c-delta', projectId: 'p-de178', designation: 'Foreman', trade: 'Electrical', nationality: 'Singaporean', csocOffset: 7, wpOffset: 90, induction: 'Completed' },
  { first: 'Hannah', last: 'Teo', companyId: 'c-main', projectId: 'p-de178', designation: 'Site Engineer', trade: 'Engineering', nationality: 'Singaporean', csocOffset: 0, wpOffset: 14, induction: 'Completed' },
  { first: 'Farah', last: 'Rahman', companyId: 'c-epsilon', projectId: 'p-de178', designation: 'Trade Worker', trade: 'Formwork', nationality: 'Malaysian', csocOffset: -5, wpOffset: 40, induction: 'Completed' },
  { first: 'Joshua', last: 'Ng', companyId: 'c-beta', projectId: 'p-de178', designation: 'Site Supervisor', trade: 'Supervision', nationality: 'Singaporean', csocOffset: 15, wpOffset: -12, induction: 'Completed' },
  { first: 'Mei', last: 'Ling', companyId: 'c-alpha', projectId: 'p-de178', designation: 'General Worker', trade: 'Painting', nationality: 'Chinese', csocOffset: 29, wpOffset: 16, induction: 'Completed' },
  { first: 'Arun', last: 'Kumar', companyId: 'c-gamma', projectId: 'p-de204', designation: 'Trade Worker', trade: 'Welding', nationality: 'Indian', csocOffset: 10, wpOffset: 8, induction: 'Pending' },
  { first: 'Siti', last: 'Aminah', companyId: 'c-delta', projectId: 'p-de178', designation: 'General Worker', trade: 'Electrical', nationality: 'Indonesian', csocOffset: 45, wpOffset: 60, induction: 'Completed' },
  { first: 'Wei', last: 'Jie', companyId: 'c-epsilon', projectId: 'p-de178', designation: 'Trade Worker', trade: 'Scaffold', nationality: 'Malaysian', csocOffset: 3, wpOffset: 22, induction: 'Pending' },
  { first: 'Chloe', last: 'Tan', companyId: 'c-main', projectId: 'p-de311', designation: 'Site Coordinator', trade: 'Coordination', nationality: 'Singaporean', csocOffset: 80, wpOffset: 90, induction: 'Completed' },
  { first: 'Hafiz', last: 'Abdullah', companyId: 'c-beta', projectId: 'p-de178', designation: 'General Worker', trade: 'Concreting', nationality: 'Bangladeshi', csocOffset: -20, wpOffset: -2, induction: 'Completed' },
  { first: 'Nicole', last: 'Goh', companyId: 'c-alpha', projectId: 'p-de178', designation: 'Site Engineer', trade: 'Engineering', nationality: 'Singaporean', csocOffset: 25, wpOffset: 40, induction: 'Completed' },
  { first: 'Ravi', last: 'Shankar', companyId: 'c-gamma', projectId: 'p-de204', designation: 'Trade Worker', trade: 'Plumbing', nationality: 'Indian', csocOffset: 6, wpOffset: 100, induction: 'Not started' },
  { first: 'Jolene', last: 'Poh', companyId: 'c-main', projectId: 'p-de178', designation: 'Project Manager', trade: 'Management', nationality: 'Singaporean', csocOffset: 200, wpOffset: 200, induction: 'Completed' },
  { first: 'Adam', last: 'Wong', companyId: 'c-delta', projectId: 'p-de178', designation: 'Foreman', trade: 'M&E', nationality: 'Singaporean', csocOffset: 12, wpOffset: 28, induction: 'Completed' },
  { first: 'Liyana', last: 'Hassan', companyId: 'c-epsilon', projectId: 'p-de178', designation: 'Trade Worker', trade: 'Formwork', nationality: 'Malaysian', csocOffset: 14, wpOffset: 0, induction: 'Completed' },
  { first: 'Kenji', last: 'Sato', companyId: 'c-beta', projectId: 'p-de311', designation: 'Site Supervisor', trade: 'Supervision', nationality: 'Japanese', csocOffset: 33, wpOffset: 19, induction: 'Completed' },
  { first: 'Brenda', last: 'Ong', companyId: 'c-alpha', projectId: 'p-de178', designation: 'General Worker', trade: 'Painting', nationality: 'Singaporean', csocOffset: -1, wpOffset: 50, induction: 'Completed' },
  { first: 'Imran', last: 'Said', companyId: 'c-gamma', projectId: 'p-de178', designation: 'Trade Worker', trade: 'Welding', nationality: 'Malaysian', csocOffset: 18, wpOffset: 15, induction: 'Completed' },
  { first: 'Tessa', last: 'Lim', companyId: 'c-main', projectId: 'p-de178', designation: 'WSH Coordinator', trade: 'Safety', nationality: 'Singaporean', csocOffset: 60, wpOffset: 45, induction: 'Completed' },
  { first: 'Harun', last: 'Yusof', companyId: 'c-delta', projectId: 'p-de204', designation: 'Trade Worker', trade: 'Electrical', nationality: 'Malaysian', csocOffset: 9, wpOffset: -8, induction: 'Pending' },
  { first: 'Grace', last: 'Chan', companyId: 'c-epsilon', projectId: 'p-de178', designation: 'General Worker', trade: 'Scaffold', nationality: 'Singaporean', csocOffset: 75, wpOffset: 21, induction: 'Completed' },
  { first: 'Danish', last: 'Ibrahim', companyId: 'c-beta', projectId: 'p-de178', designation: 'Trade Worker', trade: 'Concreting', nationality: 'Indian', csocOffset: 4, wpOffset: 11, induction: 'Completed' },
  { first: 'Yvonne', last: 'Koh', companyId: 'c-alpha', projectId: 'p-de311', designation: 'Site Coordinator', trade: 'Coordination', nationality: 'Singaporean', csocOffset: 110, wpOffset: 130, induction: 'Completed' },
  { first: 'Faizal', last: 'Rahman', companyId: 'c-gamma', projectId: 'p-de178', designation: 'General Worker', trade: 'Lifting', nationality: 'Malaysian', csocOffset: -30, wpOffset: 17, induction: 'Completed' },
  { first: 'Andrea', last: 'Lim', companyId: 'c-main', projectId: 'p-de178', designation: 'Site Engineer', trade: 'Engineering', nationality: 'Singaporean', csocOffset: 16, wpOffset: 90, induction: 'Completed' },
  { first: 'Benjamin', last: 'Ng', companyId: 'c-delta', projectId: 'p-de178', designation: 'Foreman', trade: 'M&E', nationality: 'Singaporean', csocOffset: 2, wpOffset: 70, induction: 'Completed' },
  { first: 'Nurul', last: 'Aisyah', companyId: 'c-epsilon', projectId: 'p-de204', designation: 'Trade Worker', trade: 'Formwork', nationality: 'Indonesian', csocOffset: 27, wpOffset: -15, induction: 'Not started' },
  { first: 'Marcus', last: 'Yeo', companyId: 'c-beta', projectId: 'p-de178', designation: 'General Worker', trade: 'Plumbing', nationality: 'Singaporean', csocOffset: 8, wpOffset: 5, induction: 'Completed' },
  { first: 'Shalini', last: 'Devi', companyId: 'c-alpha', projectId: 'p-de178', designation: 'Trade Worker', trade: 'Electrical', nationality: 'Indian', csocOffset: 50, wpOffset: -3, induction: 'Completed' },
  { first: 'Patrick', last: 'Goh', companyId: 'c-gamma', projectId: 'p-de311', designation: 'Project Manager', trade: 'Management', nationality: 'Singaporean', csocOffset: 300, wpOffset: 240, induction: 'Completed' },
  { first: 'Camila', last: 'Costa', companyId: 'c-main', projectId: 'p-de178', designation: 'Site Coordinator', trade: 'Coordination', nationality: 'Singaporean', csocOffset: 22, wpOffset: 13, induction: 'Completed' },
];

const BCSS_ROLES = new Set([
  'Site Supervisor',
  'Site Coordinator',
  'Site Engineer',
  'Project Manager',
  'WSH Coordinator',
  'Foreman',
]);

const KIN_FIRST = ['Lina', 'Omar', 'Hui', 'John', 'Siti', 'Raju', 'Grace', 'Hafiz'];
const KIN_REL = ['Spouse', 'Sibling', 'Parent', 'Spouse'];

function workerCode(index: number): string {
  return `W-${String(281 + index).padStart(5, '0')}`;
}

function publicToken(index: number): string {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  let n = (index + 1) * 2654435761;
  let out = 'qs';
  for (let i = 0; i < 10; i += 1) {
    n = (Math.imul(n, 1664525) + 1013904223) >>> 0;
    out += alphabet[n % alphabet.length];
  }
  return out;
}

function approvalTrail(workerId: string, today: Date): ApprovalEvent[] {
  return [
    {
      id: `ap-${workerId}-activate`,
      at: isoDaysAgo(today, 12, 10),
      role: 'Safety Officer',
      actor: 'Sofia Ong',
      action: 'activate',
      remarks: 'Registered and activated by Safety Officer. Helmet QR is on.',
      from: 'approved',
      to: 'approved',
    },
  ];
}

function trainingsFor(workerId: string, row: SeedRow, index: number, today: Date, csocExpiry: string): TrainingRecord[] {
  const serial = String(281 + index).padStart(5, '0');
  const records: TrainingRecord[] = [
    {
      id: `tr-csoc-${index}`,
      workerId,
      course: 'CSOC',
      courseDate: addDays(csocExpiry, -365),
      expiry: csocExpiry,
      certificateNumber: `CSOC-DEMO-${serial}`,
    },
    {
      id: `tr-sic-${index}`,
      workerId,
      course: 'SIC',
      courseDate: addDays(today, -20),
      expiry: addDays(today, row.csocOffset + 40),
      certificateNumber: `SIC-DEMO-${serial}`,
    },
  ];
  if (BCSS_ROLES.has(row.designation)) {
    const bcssExpiry = addDays(today, Math.max(row.wpOffset, 10));
    records.push({
      id: `tr-bcss-${index}`,
      workerId,
      course: 'BCSS',
      courseDate: addDays(bcssExpiry, -730),
      expiry: bcssExpiry,
      certificateNumber: `BCSS-DEMO-${serial}`,
    });
  }
  return records;
}

function approvedStrike(
  workerId: string,
  level: 1 | 2 | 3,
  daysAgo: number,
  reason: string,
  evidenceName: string,
  today: Date,
): StrikeRecord {
  const id = `sk-${workerId}-${level}`;
  return {
    id,
    workerId,
    level,
    reason,
    date: addDays(today, -daysAgo),
    evidenceName,
    issuer: 'Sofia Ong',
    issuerRole: 'Safety Officer',
    status: 'approved',
    trail: [
      {
        id: `${id}-propose`,
        at: isoDaysAgo(today, daysAgo, 10),
        role: 'Safety Officer',
        actor: 'Sofia Ong',
        action: 'propose',
        remarks: reason,
        from: 'new',
        to: 'pending_manager',
      },
      {
        id: `${id}-mgr`,
        at: isoDaysAgo(today, daysAgo - 1, 15),
        role: 'Safety Manager',
        actor: 'Marcus Lim',
        action: 'approve',
        remarks: 'Manager endorsement recorded on the sample file.',
        from: 'pending_manager',
        to: 'pending_director',
      },
      {
        id: `${id}-dir`,
        at: isoDaysAgo(today, Math.max(daysAgo - 2, 0), 17),
        role: 'Project Director',
        actor: 'Helen Chua',
        action: 'approve',
        remarks: 'Director endorsement recorded. Strike now counts.',
        from: 'pending_director',
        to: 'approved',
      },
    ],
  };
}

function pendingStrike(
  workerId: string,
  status: 'pending_manager' | 'pending_director',
  reason: string,
  evidenceName: string,
  today: Date,
): StrikeRecord {
  const id = `sk-${workerId}-open`;
  const trail: StrikeRecord['trail'] = [
    {
      id: `${id}-propose`,
      at: isoDaysAgo(today, 3, 9),
      role: 'Safety Officer',
      actor: 'Sofia Ong',
      action: 'propose',
      remarks: reason,
      from: 'new',
      to: 'pending_manager',
    },
  ];
  if (status === 'pending_director') {
    trail.push({
      id: `${id}-mgr`,
      at: isoDaysAgo(today, 1, 15),
      role: 'Safety Manager',
      actor: 'Marcus Lim',
      action: 'approve',
      remarks: 'Manager signed. Still waiting on the Project Director.',
      from: 'pending_manager',
      to: 'pending_director',
    });
  }
  return {
    id,
    workerId,
    level: 1,
    reason,
    date: addDays(today, -3),
    evidenceName,
    issuer: 'Sofia Ong',
    issuerRole: 'Safety Officer',
    status,
    trail,
  };
}

function strikesFor(workerId: string, today: Date): StrikeRecord[] {
  if (workerId === 'W-00282') {
    return [approvedStrike(workerId, 1, 48, 'Did not clip on at an open slab edge after the toolbox reminder.', 'edge-observation-note.pdf', today)];
  }
  if (workerId === 'W-00283') {
    return [
      approvedStrike(workerId, 1, 70, 'Chin strap was unfastened during the morning helmet check.', 'helmet-check-note.pdf', today),
      approvedStrike(workerId, 2, 18, 'Entered the excavator exclusion zone a second time in the same week.', 'swing-zone-photo.jpg', today),
    ];
  }
  if (workerId === 'W-00285') {
    return [
      approvedStrike(workerId, 1, 90, 'Left a live cable tail unprotected at the riser cupboard.', 'riser-note.pdf', today),
      approvedStrike(workerId, 2, 55, 'Worked from a tower scaffold without the green tag.', 'scaffold-tag-photo.jpg', today),
      approvedStrike(workerId, 3, 12, 'Third repeat of an unguarded opening on the same deck.', 'opening-photo.jpg', today),
    ];
  }
  if (workerId === 'W-00287') {
    return [approvedStrike(workerId, 1, 36, 'Hot-work permit was not posted at the bay before the crew started.', 'hotwork-permit-gap.pdf', today)];
  }
  if (workerId === 'W-00290') {
    return [pendingStrike(workerId, 'pending_manager', 'Scaffold tag was not updated before the crew went up.', 'scaffold-tag-gap.jpg', today)];
  }
  if (workerId === 'W-00291') {
    return [pendingStrike(workerId, 'pending_manager', 'Housekeeping blocked a secondary exit on Level 6.', 'exit-block-photo.jpg', today)];
  }
  if (workerId === 'W-00292') {
    return [pendingStrike(workerId, 'pending_director', 'Harness lanyard left unhooked while shifting formwork.', 'formwork-harness.jpg', today)];
  }
  if (workerId === 'W-00293') {
    return [pendingStrike(workerId, 'pending_director', 'Night-shift crew started before the induction sticker check.', 'night-shift-note.pdf', today)];
  }
  if (workerId === 'W-00303') {
    return [approvedStrike(workerId, 1, 27, 'Fire extinguisher was missing from the welding bay for a full shift.', 'bay-extinguisher.pdf', today)];
  }
  if (workerId === 'W-00317') {
    return [approvedStrike(workerId, 1, 9, 'Cut through a marked service line after the permit was withdrawn.', 'service-strike-note.pdf', today)];
  }
  return [];
}

const companies: Company[] = [
  { id: 'c-main', name: 'Vantage Maincon', kind: 'main', uen: '202600001A', focus: 'Main contractor', contactName: 'Helen Chua', phone: '+65 6100 0100', color: COMPANY_PALETTE[0].hex },
  { id: 'c-alpha', name: 'Alpha Engineering', kind: 'sub', uen: '202611102B', focus: 'Structural steel', contactName: 'Paul Seah', phone: '+65 6100 0201', color: COMPANY_PALETTE[1].hex },
  { id: 'c-beta', name: 'Beta Civil Works', kind: 'sub', uen: '202622203C', focus: 'Civil works', contactName: 'Nora Tan', phone: '+65 6100 0302', color: COMPANY_PALETTE[3].hex },
  { id: 'c-gamma', name: 'Gamma Contractors', kind: 'sub', uen: '202633304D', focus: 'Architectural trades', contactName: 'Chris Ho', phone: '+65 6100 0403', color: COMPANY_PALETTE[5].hex },
  { id: 'c-delta', name: 'Delta M&E Services', kind: 'sub', uen: '202644405E', focus: 'Mechanical & electrical', contactName: 'Irene Pek', phone: '+65 6100 0504', color: COMPANY_PALETTE[2].hex },
  { id: 'c-epsilon', name: 'Epsilon Formwork', kind: 'sub', uen: '202655506F', focus: 'Formwork & scaffolding', contactName: 'Sam Lee', phone: '+65 6100 0605', color: COMPANY_PALETTE[4].hex },
];

const projects: Project[] = [
  { id: 'p-de178', code: 'DE178', name: 'DE178 Project' },
  { id: 'p-de204', code: 'DE204', name: 'DE204 Project' },
  { id: 'p-de311', code: 'DE311', name: 'DE311 Project' },
];

const siteContacts: SiteContact[] = [
  { id: 'sc-1', name: 'Project emergency desk', role: 'Site control', phone: '+65 6100 0178', hours: '24 hours', notes: 'Fictional project desk for the DE178 sample site.' },
  { id: 'sc-2', name: 'Site first aid post', role: 'First aid', phone: '+65 6100 0179', hours: '06:30–19:30', notes: 'Sample clinic extension. Not a real facility.' },
  { id: 'sc-3', name: 'Tower crane rescue lead', role: 'Rescue', phone: '+65 6100 0180', hours: 'During lifts', notes: 'Fictional duty phone for the sample crane crew.' },
  { id: 'sc-4', name: 'Night shift controller', role: 'Night works', phone: '+65 6100 0181', hours: '19:00–07:00', notes: 'Sample night controller.' },
  { id: 'sc-5', name: 'Maincon safety office', role: 'WSH office', phone: '+65 6100 0182', hours: '08:00–18:00', notes: 'Vantage Maincon safety office, fictional.' },
  { id: 'sc-6', name: 'SCDF', role: 'National fire & ambulance', phone: '995', hours: '24 hours', notes: 'Public emergency number. Listed for the site directory only.' },
  { id: 'sc-7', name: 'Police', role: 'National police', phone: '999', hours: '24 hours', notes: 'Public emergency number.' },
];

export function buildSeed(today: Date): AppState {
  const audit: AuditEvent[] = [];
  const workers: Worker[] = ROWS.map((row, index) => {
    const id = workerCode(index);
    const csocExpiry = addDays(today, row.csocOffset);
    const workPermitExpiry = addDays(today, row.wpOffset);
    const serial = String(281 + index).padStart(5, '0');
    const trail = approvalTrail(id, today);
    const strikes = strikesFor(id, today);
    const worker: Worker = {
      id,
      publicToken: publicToken(index),
      firstName: row.first,
      lastName: row.last,
      avatarIndex: index,
      companyId: row.companyId,
      projectId: row.projectId,
      designation: row.designation,
      trade: row.trade,
      nationality: row.nationality,
      nricMasked: `S****${String(100 + index).padStart(3, '0')}A`,
      dob: `${1978 + (index % 20)}-${String((index % 12) + 1).padStart(2, '0')}-${String((index % 27) + 1).padStart(2, '0')}`,
      phone: `+65 8${String(100 + index).padStart(3, '0')} ${String(1000 + index)}`,
      address: `Dormitory ${(index % 4) + 1}, ${80 + index} Pioneer Walk, Singapore`,
      workPermitNumber: `WP-DEMO-${serial}`,
      workPermitExpiry,
      csocNumber: `CSOC-DEMO-${serial}`,
      csocExpiry,
      siteInduction: row.induction,
      approvalStatus: 'approved',
      approvalTrail: trail,
      trainings: trainingsFor(id, row, index, today, csocExpiry),
      strikes,
      nextOfKin: {
        name: `${KIN_FIRST[index % KIN_FIRST.length]} ${row.last}`,
        relationship: KIN_REL[index % KIN_REL.length],
        phone: `+65 9${String(200 + index).padStart(3, '0')} ${String(2000 + index)}`,
      },
      createdAt: isoDaysAgo(today, 40 - (index % 25), 8),
      photoDataUrl: null,
    };
    trail.forEach((event) => {
      audit.push({
        id: `audit-${event.id}`,
        at: event.at,
        actor: event.actor,
        role: event.role,
        action: REGISTRATION_AUDIT_ACTION,
        target: `${worker.firstName} ${worker.lastName}`,
        detail: event.remarks,
      });
    });
    strikes.forEach((strike) => {
      strike.trail.forEach((event) => {
        audit.push({
          id: `audit-${event.id}`,
          at: event.at,
          actor: event.actor,
          role: event.role,
          action: event.action === 'propose' ? 'Strike proposed' : `Strike ${event.action}`,
          target: `${worker.firstName} ${worker.lastName}`,
          detail: event.remarks,
        });
      });
    });
    return worker;
  });

  audit.sort((a, b) => (a.at < b.at ? 1 : -1));

  return {
    version: 2,
    companies,
    projects,
    users: [
      { id: 'u-officer', name: 'Sofia Ong', role: 'Safety Officer', email: 'sofia.ong@vantagemaincon.example', initials: 'SO' },
      { id: 'u-manager', name: 'Marcus Lim', role: 'Safety Manager', email: 'marcus.lim@vantagemaincon.example', initials: 'ML' },
      { id: 'u-director', name: 'Helen Chua', role: 'Project Director', email: 'helen.chua@vantagemaincon.example', initials: 'HC' },
      { id: 'u-admin', name: 'Adrian Koh', role: 'Admin', email: 'adrian.koh@vantagemaincon.example', initials: 'AK' },
    ],
    workers,
    siteContacts,
    audit,
    currentUserId: 'u-officer',
    currentProjectId: 'p-de178',
    publicStrikeIndicator: PUBLIC_STRIKE_INDICATOR,
  };
}
