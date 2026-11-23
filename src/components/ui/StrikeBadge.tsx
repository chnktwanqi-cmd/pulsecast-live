import { tokens, type StrikeLevel } from '../../config/tokens';
import { strikeLabel } from '../../domain/strikes';
import { StatusPill } from './StatusPill';

export function StrikeBadge({ level }: { level: StrikeLevel }) {
  const tone = tokens.strike[level];
  return (
    <StatusPill bg={tone.bg} color={tone.text}>
      {strikeLabel(level)}
    </StatusPill>
  );
}
