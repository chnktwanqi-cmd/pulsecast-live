import { describe, expect, it } from 'vitest';
import { designationBucket, designationRank, groupPersonnel } from './grouping';
import type { Company, Worker } from './types';

const companies: Company[] = [
  { id: 'sub-b', name: 'Beta Civil Works', kind: 'sub', uen: 'B', focus: '', contactName: '', phone: '', color: '#0F766E' },
  { id: 'main', name: 'Vantage Maincon', kind: 'main', uen: 'M', focus: '', contactName: '', phone: '', color: '#1E3A5F' },
  { id: 'sub-a', name: 'Alpha Engineering', kind: 'sub', uen: 'A', focus: '', contactName: '', phone: '', color: '#1D4ED8' },
];

function worker(partial: Pick<Worker, 'id' | 'companyId' | 'designation' | 'firstName'>): Worker {
  return {
    id: partial.id,
    publicToken: partial.id,
    firstName: partial.firstName,
    lastName: 'Tan',
    avatarIndex: 0,
    companyId: partial.companyId,
    projectId: 'p',
    designation: partial.designation,
    trade: 'General Worker',
    nationality: 'Singaporean',
    nricMasked: 'S****100A',
    dob: '1990-01-01',
    phone: '+65 8000 0000',
    address: 'Dorm',
    workPermitNumber: 'WP',
    workPermitExpiry: '2027-01-01',
    csocNumber: 'CSOC',
    csocExpiry: '2027-01-01',
    siteInduction: 'Completed',
    approvalStatus: 'approved',
    approvalTrail: [],
    trainings: [],
    strikes: [],
    nextOfKin: { name: 'Kin', relationship: 'Spouse', phone: '+65 9000 0000' },
    createdAt: '2026-01-01T00:00:00.000Z',
    photoDataUrl: null,
  };
}

describe('personnel grouping', () => {
  it('ranks designation from director down to worker trades', () => {
    expect(designationRank('Director')).toBeLessThan(designationRank('Project Manager'));
    expect(designationRank('Project Manager')).toBeLessThan(designationRank('Site Engineer'));
    expect(designationRank('Site Engineer')).toBeLessThan(designationRank('WSH Coordinator'));
    expect(designationRank('Site Coordinator')).toBeLessThan(designationRank('Site Supervisor'));
    expect(designationRank('Foreman')).toBe(designationRank('Site Supervisor'));
    expect(designationRank('Site Supervisor')).toBeLessThan(designationRank('General Worker'));
    expect(designationBucket('Trade Worker')).toBe('Worker trades');
    expect(designationBucket('Site Engineer')).toBe('Engineer');
  });

  it('puts the main contractor first, then subcontractors A–Z, then rank inside the company', () => {
    const groups = groupPersonnel(
      [
        worker({ id: '1', companyId: 'sub-b', designation: 'General Worker', firstName: 'Ada' }),
        worker({ id: '2', companyId: 'main', designation: 'General Worker', firstName: 'Bea' }),
        worker({ id: '3', companyId: 'main', designation: 'Project Manager', firstName: 'Cara' }),
        worker({ id: '4', companyId: 'sub-a', designation: 'Site Supervisor', firstName: 'Dan' }),
        worker({ id: '5', companyId: 'sub-a', designation: 'Trade Worker', firstName: 'Eve' }),
      ],
      companies,
    );
    expect(groups.map((group) => group.company.name)).toEqual([
      'Vantage Maincon',
      'Alpha Engineering',
      'Beta Civil Works',
    ]);
    expect(groups[0].workers.map((item) => item.firstName)).toEqual(['Cara', 'Bea']);
    expect(groups[1].workers.map((item) => item.designation)).toEqual(['Site Supervisor', 'Trade Worker']);
  });
});
