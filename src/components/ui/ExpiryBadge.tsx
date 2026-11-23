import { tokens } from '../../config/tokens';
import { daysBetween } from '../../domain/dates';
import { getExpiryTier, tierLabel, type ExpiryTier } from '../../domain/expiry';
import { StatusPill } from './StatusPill';

export function ExpiryBadge({
  date,
  today,
  prefix,
}: {
  date: string;
  today: Date;
  prefix: string;
}) {
  const tier: ExpiryTier = getExpiryTier(date, today);
  const tone = tokens.expiry[tier];
  const days = daysBetween(date, today);
  const when = days < 0 ? `${Math.abs(days)}d over` : days === 0 ? 'today' : `${days}d`;
  return (
    <StatusPill bg={tone.bg} color={tone.text}>
      {prefix} · {tierLabel(tier)} · {when}
    </StatusPill>
  );
}
