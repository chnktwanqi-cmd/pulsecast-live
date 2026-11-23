import { Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GhostButton } from '../../components/ui/Buttons';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { ExpiryBadge } from '../../components/ui/ExpiryBadge';
import { FilterBar, FilterSelect } from '../../components/ui/FilterBar';
import { GlassCard } from '../../components/ui/GlassCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { tokens } from '../../config/tokens';
import { useDemo } from '../../data/store';
import { daysBetween } from '../../domain/dates';
import { getExpiryTier, tierLabel, worseTier, type ExpiryTier } from '../../domain/expiry';
import { groupPersonnel } from '../../domain/grouping';
import { downloadCsv } from '../../lib/csv';
import type { Worker } from '../../domain/types';

export function ExpiryPage() {
  const { state, today } = useDemo();
  const navigate = useNavigate();
  const [tier, setTier] = useState<ExpiryTier | ''>('');
  const [companyId, setCompanyId] = useState('');
  const [doc, setDoc] = useState<'either' | 'csoc' | 'pass'>('either');
  const project = state.projects.find((item) => item.id === state.currentProjectId);
  const scoped = state.currentProjectId === 'all'
    ? state.workers
    : state.workers.filter((worker) => worker.projectId === state.currentProjectId);

  const counts = useMemo(() => {
    const base = { green: 0, yellow: 0, orange: 0, red: 0 };
    scoped.forEach((worker) => {
      const worst = worseTier(getExpiryTier(worker.csocExpiry, today), getExpiryTier(worker.workPermitExpiry, today));
      base[worst] += 1;
    });
    return base;
  }, [scoped, today]);

  const filtered = scoped.filter((worker) => {
    if (companyId && worker.companyId !== companyId) return false;
    if (!tier) return true;
    const csoc = getExpiryTier(worker.csocExpiry, today);
    const pass = getExpiryTier(worker.workPermitExpiry, today);
    if (doc === 'csoc') return csoc === tier;
    if (doc === 'pass') return pass === tier;
    return csoc === tier || pass === tier;
  });

  const columns: Column<Worker>[] = [
    {
      key: 'name',
      header: 'Worker',
      sortValue: (worker) => `${worker.firstName} ${worker.lastName}`,
      render: (worker) => (
        <div>
          <div className="font-semibold text-slate-800">
            {worker.firstName} {worker.lastName}
          </div>
          <div className="text-xs text-slate-400">{worker.id}</div>
        </div>
      ),
    },
    {
      key: 'company',
      header: 'Contractor',
      sortValue: (worker) => state.companies.find((item) => item.id === worker.companyId)?.name ?? '',
      render: (worker) => state.companies.find((item) => item.id === worker.companyId)?.name ?? '—',
    },
    {
      key: 'csoc',
      header: 'CSOC',
      sortValue: (worker) => worker.csocExpiry,
      render: (worker) => <ExpiryBadge date={worker.csocExpiry} today={today} prefix="CSOC" />,
    },
    {
      key: 'pass',
      header: 'Work permit',
      sortValue: (worker) => worker.workPermitExpiry,
      render: (worker) => <ExpiryBadge date={worker.workPermitExpiry} today={today} prefix="Pass" />,
    },
    {
      key: 'days',
      header: 'Soonest',
      sortValue: (worker) => Math.min(daysBetween(worker.csocExpiry, today), daysBetween(worker.workPermitExpiry, today)),
      render: (worker) => {
        const days = Math.min(daysBetween(worker.csocExpiry, today), daysBetween(worker.workPermitExpiry, today));
        return <span className="font-semibold">{days < 0 ? `${Math.abs(days)}d over` : `${days}d`}</span>;
      },
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow={project ? `${project.code} · SITE SAFETY INTELLIGENCE` : 'ALL PROJECTS · SITE SAFETY INTELLIGENCE'}
        title="Permit"
        accent="Expiry"
        subtitle="Green is 30 days or more, yellow 15–29, orange 0–14, red is already expired."
        actions={
          <GhostButton
            type="button"
            onClick={() => {
              downloadCsv('sitesafe-expiry.csv', [
                ['Worker ID', 'Name', 'Company', 'CSOC expiry', 'CSOC tier', 'Work permit expiry', 'Work permit tier'],
                ...filtered.map((worker) => [
                  worker.id,
                  `${worker.firstName} ${worker.lastName}`,
                  state.companies.find((item) => item.id === worker.companyId)?.name ?? '',
                  worker.csocExpiry,
                  tierLabel(getExpiryTier(worker.csocExpiry, today)),
                  worker.workPermitExpiry,
                  tierLabel(getExpiryTier(worker.workPermitExpiry, today)),
                ]),
              ]);
            }}
          >
            <Upload className="h-4 w-4" />
            Export CSV
          </GhostButton>
        }
      />
      <div className="grid gap-3 md:grid-cols-4">
        {(['green', 'yellow', 'orange', 'red'] as ExpiryTier[]).map((item) => (
          <button key={item} onClick={() => setTier(item)} className="text-left">
            <GlassCard className="p-4">
              <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: tokens.expiry[item].text }}>
                {tierLabel(item)}
              </div>
              <div className="mt-1 text-3xl font-extrabold text-slate-900">{counts[item]}</div>
            </GlassCard>
          </button>
        ))}
      </div>
      <GlassCard className="mt-4 p-4">
        <FilterBar>
          <FilterSelect aria-label="Tier" value={tier} onChange={(event) => setTier(event.target.value as ExpiryTier | '')}>
            <option value="">All tiers</option>
            <option value="green">Green ≥ 30 days</option>
            <option value="yellow">Yellow 15–29</option>
            <option value="orange">Orange 0–14</option>
            <option value="red">Expired</option>
          </FilterSelect>
          <FilterSelect aria-label="Document" value={doc} onChange={(event) => setDoc(event.target.value as typeof doc)}>
            <option value="either">CSOC or work permit</option>
            <option value="csoc">CSOC only</option>
            <option value="pass">Work permit only</option>
          </FilterSelect>
          <FilterSelect aria-label="Contractor" value={companyId} onChange={(event) => setCompanyId(event.target.value)}>
            <option value="">All contractors</option>
            {state.companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </FilterSelect>
        </FilterBar>
        <div className="mt-4 space-y-6">
          {groupPersonnel(filtered, state.companies).map((group) => (
            <section key={group.company.id}>
              <div className="mb-2 flex items-center gap-2 px-1">
                <span className="h-3 w-3 rounded-full" style={{ background: group.company.color }} />
                <h3 className="text-sm font-bold text-slate-800">{group.company.name}</h3>
                <span className="rounded-full px-2 py-0.5 text-[11px] font-bold text-white" style={{ background: group.company.color }}>
                  {group.workers.length}
                </span>
              </div>
              <DataTable columns={columns} rows={group.workers} rowKey={(worker) => worker.id} onRow={(worker) => navigate(`/workers/${worker.id}`)} />
            </section>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
