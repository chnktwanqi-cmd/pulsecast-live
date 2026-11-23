import { Plus, Search, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PersonnelGroups } from '../../components/personnel/PersonnelGroups';
import { GhostButton, PrimaryButton } from '../../components/ui/Buttons';
import { FilterBar, FilterSelect } from '../../components/ui/FilterBar';
import { GlassCard } from '../../components/ui/GlassCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { useDemo } from '../../data/store';
import { downloadCsv } from '../../lib/csv';
import type { ExpiryTier } from '../../domain/expiry';
import { strikeLevelOf, workerMatches } from '../../domain/filterWorkers';
import { registrationLabel } from '../../domain/approval';
import { companyOrder } from '../../domain/grouping';
import { strikeLabel } from '../../domain/strikes';
import { DESIGNATIONS, TRADES } from '../../domain/options';
import { canRegister } from '../../domain/permissions';
import { WorkerCard } from './WorkerCard';

export function WorkerRegistryPage() {
  const { state, today, actor } = useDemo();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [companyId, setCompanyId] = useState('');
  const [strike, setStrike] = useState<'' | '0' | '1' | '2' | '3'>('');
  const [trade, setTrade] = useState('');
  const [designation, setDesignation] = useState('');
  const [tier, setTier] = useState<ExpiryTier | ''>('');

  const project = state.projects.find((item) => item.id === state.currentProjectId);
  const scoped = state.currentProjectId === 'all'
    ? state.workers
    : state.workers.filter((worker) => worker.projectId === state.currentProjectId);

  const filtered = useMemo(
    () =>
      scoped.filter((worker) =>
        workerMatches(worker, { q, companyId, strike, trade, designation, tier }, today, state.companies),
      ),
    [scoped, q, companyId, strike, trade, designation, tier, today, state.companies],
  );

  const eyebrow = project ? `${project.code} · SITE SAFETY INTELLIGENCE` : 'ALL PROJECTS · SITE SAFETY INTELLIGENCE';

  return (
    <div>
      <PageHeader
        eyebrow={eyebrow}
        title="Worker"
        accent="Registry"
        subtitle="Main Contractor and Subcontractor workforce profiles, site eligibility and strike status."
        actions={
          <>
            <GhostButton
              type="button"
              onClick={() => {
                const rows = [
                  ['Worker ID', 'Name', 'Company', 'Designation', 'Trade', 'Strike', 'Status', 'CSOC expiry', 'Work permit expiry'],
                  ...filtered.map((worker) => {
                    const company = state.companies.find((item) => item.id === worker.companyId);
                    return [
                      worker.id,
                      `${worker.firstName} ${worker.lastName}`,
                      company?.name ?? '',
                      worker.designation,
                      worker.trade,
                      strikeLabel(strikeLevelOf(worker)),
                      registrationLabel(),
                      worker.csocExpiry,
                      worker.workPermitExpiry,
                    ];
                  }),
                ];
                downloadCsv('sitesafe-workers.csv', rows);
              }}
            >
              <Upload className="h-4 w-4" />
              Export CSV
            </GhostButton>
            {canRegister(actor.role) ? (
              <Link
                to="/workers/new"
                data-testid="register-worker"
                className="gradient-btn inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold text-white shadow-lg shadow-pink-500/20"
              >
                <Plus className="h-4 w-4" />
                Register Worker
              </Link>
            ) : (
              <PrimaryButton type="button" disabled title="Only the Safety Officer can register workers">
                <Plus className="h-4 w-4" />
                Register Worker
              </PrimaryButton>
            )}
          </>
        }
      />
      <GlassCard className="p-4 md:p-5">
        <FilterBar>
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Search name, worker ID or trade..."
              className="h-11 w-full rounded-2xl border border-slate-200/80 bg-white/80 pl-11 pr-4 text-sm outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
              aria-label="Search name, worker ID or trade"
            />
          </div>
          <FilterSelect aria-label="Contractor" value={companyId} onChange={(event) => setCompanyId(event.target.value)}>
            <option value="">All Contractors</option>
            {companyOrder(state.companies).map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </FilterSelect>
          {companyId ? (
            <span
              className="inline-flex h-11 items-center rounded-full px-3 text-xs font-semibold text-white"
              style={{ background: state.companies.find((company) => company.id === companyId)?.color }}
            >
              {state.companies.find((company) => company.id === companyId)?.name}
            </span>
          ) : null}
          <FilterSelect aria-label="Strike level" value={strike} onChange={(event) => setStrike(event.target.value as typeof strike)}>
            <option value="">All Strike Levels</option>
            <option value="0">No Strike</option>
            <option value="1">Strike 1</option>
            <option value="2">Strike 2</option>
            <option value="3">Strike 3</option>
          </FilterSelect>
        </FilterBar>
        <div className="mt-3 flex flex-wrap gap-2">
          <FilterSelect aria-label="Trade" value={trade} onChange={(event) => setTrade(event.target.value)}>
            <option value="">All trades</option>
            {TRADES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </FilterSelect>
          <FilterSelect aria-label="Role" value={designation} onChange={(event) => setDesignation(event.target.value)}>
            <option value="">All roles</option>
            {DESIGNATIONS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </FilterSelect>
          <FilterSelect aria-label="Expiry tier" value={tier} onChange={(event) => setTier(event.target.value as ExpiryTier | '')}>
            <option value="">All expiry tiers</option>
            <option value="green">Green ≥ 30 days</option>
            <option value="yellow">Yellow 15–29 days</option>
            <option value="orange">Orange 0–14 days</option>
            <option value="red">Expired</option>
          </FilterSelect>
        </div>
        <p className="mt-4 text-xs text-slate-400">
          {filtered.length} of {scoped.length} records · Click a worker card to inspect the internal profile.
        </p>
        <div className="mt-4">
          <PersonnelGroups
            workers={filtered}
            companies={state.companies}
            render={(worker) => (
              <WorkerCard
                worker={worker}
                company={state.companies.find((company) => company.id === worker.companyId)}
                today={today}
                variant="registry"
              />
            )}
          />
        </div>
        {filtered.length === 0 ? <p className="py-12 text-center text-sm text-slate-400">No workers match these filters.</p> : null}
      </GlassCard>
    </div>
  );
}
