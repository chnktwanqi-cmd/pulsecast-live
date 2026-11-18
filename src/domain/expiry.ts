import { daysBetween } from './dates';

export type ExpiryTier = 'green' | 'yellow' | 'orange' | 'red';

/**
 * Days remaining versus today:
 * Green >= 30, Yellow 15–29, Orange 0–14, Red expired (< 0).
 */
export function getExpiryTier(date: string | Date, today: Date): ExpiryTier {
  const days = daysBetween(date, today);
  if (days < 0) return 'red';
  if (days <= 14) return 'orange';
  if (days <= 29) return 'yellow';
  return 'green';
}

const RANK: Record<ExpiryTier, number> = { green: 0, yellow: 1, orange: 2, red: 3 };

export function worseTier(a: ExpiryTier, b: ExpiryTier): ExpiryTier {
  return RANK[a] >= RANK[b] ? a : b;
}

export function tierLabel(tier: ExpiryTier): string {
  if (tier === 'green') return 'Valid';
  if (tier === 'yellow') return 'Expiring';
  if (tier === 'orange') return 'Due soon';
  return 'Expired';
}
