import { describe, expect, it } from 'vitest';
import { buildSeed } from '../../data/seed';
import { PUBLIC_PROFILE_KEYS, toPublicProfile } from './toPublicProfile';

const today = new Date(2026, 10, 18);

describe('toPublicProfile', () => {
  const state = buildSeed(today);
  const raj = state.workers.find((worker) => worker.id === 'W-00283');
  const company = state.companies.find((item) => item.id === raj?.companyId);
  const project = state.projects.find((item) => item.id === raj?.projectId);

  it('exposes only the public allowlist', () => {
    const profile = toPublicProfile(raj!, company, project, today, true);
    expect(profile).not.toBeNull();
    expect(Object.keys(profile!).sort()).toEqual([...PUBLIC_PROFILE_KEYS].sort());
  });

  it('keeps disciplinary text, NRIC, phone and permit numbers off the public profile', () => {
    const profile = toPublicProfile(raj!, company, project, today, true)!;
    const blob = JSON.stringify(profile);
    expect(blob).not.toContain(raj!.nricMasked);
    expect(blob).not.toContain(raj!.phone);
    expect(blob).not.toContain(raj!.address);
    expect(blob).not.toContain(raj!.workPermitNumber);
    expect(blob).not.toContain(raj!.csocNumber);
    expect(blob).not.toContain(raj!.dob);
    expect(blob).not.toContain(raj!.nextOfKin.phone);
    expect(blob).not.toContain('excavator');
    expect(blob).not.toContain('Chin strap');
    expect(profile.strikeColor).toBe('orange');
    expect(profile.displayName).toBe('Raj Kumar');
    expect(profile.company).toBe('Beta Civil Works');
    expect(profile.companyColor).toBe(company?.color);
    expect(profile.photoDataUrl).toBeNull();
  });

  it('drops the strike colour when the privacy flag is off', () => {
    const profile = toPublicProfile(raj!, company, project, today, false);
    expect(profile?.strikeColor).toBeNull();
  });

  it('publishes every registered worker because registration is active immediately', () => {
    expect(state.workers.every((worker) => worker.approvalStatus === 'approved')).toBe(true);
    expect(state.users.map((user) => user.name)).not.toContain('Aisha Rahman');
    const profile = toPublicProfile(raj!, company, project, today, true);
    expect(profile?.registrationActive).toBe(true);
  });
});
