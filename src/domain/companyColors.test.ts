import { describe, expect, it } from 'vitest';
import { COMPANY_PALETTE, identityColorsAvoidStatus, isIdentityColor, whiteContrast } from './companyColors';

describe('company identity colours', () => {
  it('stays off the expiry and strike colours', () => {
    expect(identityColorsAvoidStatus()).toBe(true);
  });

  it('keeps white label text at AA contrast', () => {
    for (const colour of COMPANY_PALETTE) {
      expect(whiteContrast(colour.hex)).toBeGreaterThanOrEqual(4.5);
      expect(isIdentityColor(colour.hex)).toBe(true);
    }
  });

  it('rejects a status colour', () => {
    expect(isIdentityColor('#F43F5E')).toBe(false);
    expect(isIdentityColor('#22C55E')).toBe(false);
  });
});
