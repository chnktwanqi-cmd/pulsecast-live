import { describe, expect, it } from 'vitest';
import { currentStrikeLevel, nextStrikeStatus } from './strikes';
import type { StrikeRecord } from './types';

function strike(status: StrikeRecord['status']): Pick<StrikeRecord, 'status'> {
  return { status };
}

describe('strike levels', () => {
  it('counts only fully approved strikes', () => {
    expect(currentStrikeLevel([])).toBe(0);
    expect(
      currentStrikeLevel([
        strike('approved'),
        strike('pending_manager'),
        strike('pending_director'),
        strike('rejected'),
      ]),
    ).toBe(1);
    expect(currentStrikeLevel([strike('approved'), strike('approved'), strike('approved'), strike('approved')])).toBe(
      3,
    );
  });

  it('requires both Safety Manager and Project Director', () => {
    const afterManager = nextStrikeStatus('pending_manager', 'Safety Manager', 'approve');
    expect(afterManager).toBe('pending_director');
    expect(currentStrikeLevel([strike(afterManager!)])).toBe(0);
    const afterDirector = nextStrikeStatus(afterManager!, 'Project Director', 'approve');
    expect(afterDirector).toBe('approved');
    expect(currentStrikeLevel([strike(afterDirector!)])).toBe(1);
  });

  it('blocks the wrong role and allows rejection at either stage', () => {
    expect(nextStrikeStatus('pending_manager', 'Project Director', 'approve')).toBeNull();
    expect(nextStrikeStatus('pending_director', 'Safety Manager', 'approve')).toBeNull();
    expect(nextStrikeStatus('pending_manager', 'Safety Officer', 'approve')).toBeNull();
    expect(nextStrikeStatus('pending_director', 'Project Director', 'reject')).toBe('rejected');
    expect(nextStrikeStatus('approved', 'Project Director', 'approve')).toBeNull();
  });
});
