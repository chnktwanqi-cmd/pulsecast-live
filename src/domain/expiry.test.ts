import { describe, expect, it } from 'vitest';
import { getExpiryTier, worseTier } from './expiry';

const today = new Date(2026, 10, 18);

describe('getExpiryTier', () => {
  it('marks dates before today as expired red', () => {
    expect(getExpiryTier('2026-11-17', today)).toBe('red');
    expect(getExpiryTier('2025-01-01', today)).toBe('red');
  });

  it('marks today through 14 days as orange', () => {
    expect(getExpiryTier('2026-11-18', today)).toBe('orange');
    expect(getExpiryTier('2026-11-25', today)).toBe('orange');
    expect(getExpiryTier('2026-12-02', today)).toBe('orange');
  });

  it('marks 15 through 29 days as yellow', () => {
    expect(getExpiryTier('2026-12-03', today)).toBe('yellow');
    expect(getExpiryTier('2026-12-08', today)).toBe('yellow');
    expect(getExpiryTier('2026-12-17', today)).toBe('yellow');
  });

  it('marks 30 days and beyond as green', () => {
    expect(getExpiryTier('2026-12-18', today)).toBe('green');
    expect(getExpiryTier('2027-05-01', today)).toBe('green');
  });

  it('ignores the time of day on Date inputs', () => {
    expect(getExpiryTier(new Date(2026, 10, 18, 23, 59), today)).toBe('orange');
    expect(getExpiryTier(new Date(2026, 11, 18, 0, 30), new Date(2026, 10, 18, 22, 0))).toBe('green');
  });

  it('picks the more urgent of two tiers', () => {
    expect(worseTier('green', 'orange')).toBe('orange');
    expect(worseTier('red', 'yellow')).toBe('red');
  });
});
