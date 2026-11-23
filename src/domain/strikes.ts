import type { Role, StrikeDecision, StrikeRecord, StrikeStatus } from './types';

export type StrikeLevel = 0 | 1 | 2 | 3;
export type StrikeColor = 'green' | 'yellow' | 'orange' | 'red';

/** Only approved strikes count. Proposed or half-approved strikes do not. */
export function currentStrikeLevel(strikes: Pick<StrikeRecord, 'status'>[]): StrikeLevel {
  const approved = strikes.filter((strike) => strike.status === 'approved').length;
  return Math.min(3, approved) as StrikeLevel;
}

export function strikeColor(level: StrikeLevel): StrikeColor {
  if (level === 0) return 'green';
  if (level === 1) return 'yellow';
  if (level === 2) return 'orange';
  return 'red';
}

export function strikeLabel(level: StrikeLevel): string {
  if (level === 0) return 'No Strike';
  return `Strike ${level}`;
}

export function canProposeStrike(role: Role): boolean {
  return role === 'Safety Officer' || role === 'Safety Manager';
}

export function canDecideStrike(status: StrikeStatus, role: Role): boolean {
  if (status === 'pending_manager') return role === 'Safety Manager';
  if (status === 'pending_director') return role === 'Project Director';
  return false;
}

export function nextStrikeStatus(
  status: StrikeStatus,
  role: Role,
  action: StrikeDecision,
): StrikeStatus | null {
  if (!canDecideStrike(status, role)) return null;
  if (action === 'reject') return 'rejected';
  if (status === 'pending_manager' && action === 'approve') return 'pending_director';
  if (status === 'pending_director' && action === 'approve') return 'approved';
  return null;
}

export function strikeStatusLabel(status: StrikeStatus): string {
  if (status === 'pending_manager') return 'Awaiting Safety Manager';
  if (status === 'pending_director') return 'Awaiting Project Director';
  if (status === 'approved') return 'Approved';
  return 'Rejected';
}

export function openStrike(strikes: StrikeRecord[]): StrikeRecord | undefined {
  return strikes.find((strike) => strike.status === 'pending_manager' || strike.status === 'pending_director');
}
