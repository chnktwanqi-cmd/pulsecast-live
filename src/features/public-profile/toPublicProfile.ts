import { getExpiryTier, tierLabel, type ExpiryTier } from '../../domain/expiry';
import { currentStrikeLevel, strikeColor, type StrikeColor } from '../../domain/strikes';
import type { Company, Project, Worker } from '../../domain/types';

/**
 * Public QR profile. The type is intentionally closed: it cannot carry NRIC/FIN,
 * work permit or certificate numbers, date of birth, phone, address, next-of-kin,
 * or disciplinary text. Build it only through `toPublicProfile`.
 *
 * The owner's concept card shows the worker's name, badge id, company, project,
 * designation, induction and a colour-only strike dot. Those identity fields are
 * included. Confidential fields are not.
 */
export interface PublicProfile {
  displayName: string;
  initials: string;
  avatarIndex: number;
  company: string;
  companyColor: string;
  photoDataUrl: string | null;
  workerCode: string;
  project: string;
  designation: string;
  siteInduction: string;
  registrationActive: true;
  trainingStatusLabel: string;
  trainingValidity: 'valid' | 'expiring' | 'expired' | 'none';
  csocTier: ExpiryTier;
  csocLabel: string;
  workPermitTier: ExpiryTier;
  workPermitLabel: string;
  /** Null when PUBLIC_STRIKE_INDICATOR is off. Colour only, never a reason. */
  strikeColor: StrikeColor | null;
}

export const PUBLIC_PROFILE_KEYS = [
  'displayName',
  'initials',
  'avatarIndex',
  'company',
  'companyColor',
  'photoDataUrl',
  'workerCode',
  'project',
  'designation',
  'siteInduction',
  'registrationActive',
  'trainingStatusLabel',
  'trainingValidity',
  'csocTier',
  'csocLabel',
  'workPermitTier',
  'workPermitLabel',
  'strikeColor',
] as const;

function initials(worker: Worker): string {
  const first = worker.firstName.trim().split(/\s+/)[0]?.[0] ?? '';
  const last = worker.lastName.trim().split(/\s+/)[0]?.[0] ?? '';
  return `${first}${last}`.toUpperCase();
}

function trainingValidity(worker: Worker, today: Date): PublicProfile['trainingValidity'] {
  if (worker.trainings.length === 0) return 'none';
  const tiers = worker.trainings.map((record) => getExpiryTier(record.expiry, today));
  if (tiers.includes('red')) return 'expired';
  if (tiers.includes('orange') || tiers.includes('yellow')) return 'expiring';
  return 'valid';
}

function trainingLabel(validity: PublicProfile['trainingValidity']): string {
  if (validity === 'valid') return 'Record available';
  if (validity === 'expiring') return 'Expiring';
  if (validity === 'expired') return 'Expired';
  return 'No record';
}

export function toPublicProfile(
  worker: Worker,
  company: Company | undefined,
  project: Project | undefined,
  today: Date,
  showStrike: boolean,
): PublicProfile | null {
  if (worker.approvalStatus !== 'approved') return null;
  const validity = trainingValidity(worker, today);
  const csocTier = getExpiryTier(worker.csocExpiry, today);
  const workPermitTier = getExpiryTier(worker.workPermitExpiry, today);
  return {
    displayName: `${worker.firstName} ${worker.lastName}`,
    initials: initials(worker),
    avatarIndex: worker.avatarIndex,
    company: company?.name ?? 'Contractor',
    companyColor: company?.color ?? '#1E3A5F',
    photoDataUrl: worker.photoDataUrl,
    workerCode: worker.id,
    project: project?.name ?? 'Project',
    designation: worker.designation,
    siteInduction: worker.siteInduction,
    registrationActive: true,
    trainingStatusLabel: trainingLabel(validity),
    trainingValidity: validity,
    csocTier,
    csocLabel: tierLabel(csocTier),
    workPermitTier,
    workPermitLabel: tierLabel(workPermitTier),
    strikeColor: showStrike ? strikeColor(currentStrikeLevel(worker.strikes)) : null,
  };
}
