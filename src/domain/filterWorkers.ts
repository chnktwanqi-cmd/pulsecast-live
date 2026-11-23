import { getExpiryTier, type ExpiryTier } from './expiry';
import { currentStrikeLevel, type StrikeLevel } from './strikes';
import type { Company, Worker } from './types';

export interface WorkerFilter {
  q?: string;
  companyId?: string;
  trade?: string;
  designation?: string;
  tier?: ExpiryTier | '';
  strike?: '' | '0' | '1' | '2' | '3';
}

export function workerMatches(
  worker: Worker,
  filter: WorkerFilter,
  today: Date,
  companies: Company[],
): boolean {
  if (filter.companyId && worker.companyId !== filter.companyId) return false;
  if (filter.trade && worker.trade !== filter.trade) return false;
  if (filter.designation && worker.designation !== filter.designation) return false;
  if (filter.strike !== undefined && filter.strike !== '') {
    const level = String(currentStrikeLevel(worker.strikes)) as '0' | '1' | '2' | '3';
    if (level !== filter.strike) return false;
  }
  if (filter.tier) {
    const csoc = getExpiryTier(worker.csocExpiry, today);
    const pass = getExpiryTier(worker.workPermitExpiry, today);
    if (csoc !== filter.tier && pass !== filter.tier) return false;
  }
  const query = filter.q?.trim().toLowerCase();
  if (query) {
    const company = companies.find((item) => item.id === worker.companyId)?.name ?? '';
    const haystack = [
      worker.firstName,
      worker.lastName,
      `${worker.firstName} ${worker.lastName}`,
      worker.id,
      worker.trade,
      worker.designation,
      company,
    ]
      .join(' ')
      .toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  return true;
}

export function strikeLevelOf(worker: Worker): StrikeLevel {
  return currentStrikeLevel(worker.strikes);
}
