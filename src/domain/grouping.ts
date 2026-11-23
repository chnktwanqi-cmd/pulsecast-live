import type { Company, Worker } from './types';

const BUCKETS = ['Director', 'Project Manager', 'Engineer', 'Coordinator', 'Supervisor', 'Worker trades'] as const;

export type DesignationBucket = (typeof BUCKETS)[number];

/** Director, Project Manager, Engineer, Coordinator, Supervisor, then worker trades. */
export function designationRank(designation: string): number {
  const value = designation.toLowerCase();
  if (value.includes('director')) return 0;
  if (value.includes('project manager')) return 1;
  if (value.includes('engineer')) return 2;
  if (value.includes('coordinator')) return 3;
  if (value.includes('supervisor') || value.includes('foreman')) return 4;
  return 5;
}

export function designationBucket(designation: string): DesignationBucket {
  return BUCKETS[designationRank(designation)];
}

export interface PersonnelGroup {
  company: Company;
  workers: Worker[];
}

export function companyOrder(companies: Company[]): Company[] {
  const mains = companies.filter((company) => company.kind === 'main');
  const subs = companies
    .filter((company) => company.kind === 'sub')
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));
  return [...mains, ...subs];
}

export function compareWorkers(a: Worker, b: Worker): number {
  const rank = designationRank(a.designation) - designationRank(b.designation);
  if (rank !== 0) return rank;
  const designation = a.designation.localeCompare(b.designation);
  if (designation !== 0) return designation;
  return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
}

/** Main contractor first, then subcontractors A–Z, then designation hierarchy inside each company. */
export function groupPersonnel(workers: Worker[], companies: Company[]): PersonnelGroup[] {
  return companyOrder(companies)
    .map((company) => ({
      company,
      workers: workers.filter((worker) => worker.companyId === company.id).slice().sort(compareWorkers),
    }))
    .filter((group) => group.workers.length > 0);
}
