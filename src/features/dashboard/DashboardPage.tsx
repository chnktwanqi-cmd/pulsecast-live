import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { GlassCard } from '../../components/ui/GlassCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { useDemo } from '../../data/store';
import { getExpiryTier, tierLabel, worseTier, type ExpiryTier } from '../../domain/expiry';
import { strikeLevelOf, workerMatches } from '../../domain/filterWorkers';
import { tokens } from '../../config/tokens';
import { WorkerCard } from '../workers/WorkerCard';
import { cn } from '../../lib/cn';

const TIERS: ExpiryTier[] = ['green', 'yellow', 'orange', 'red'];

export function DashboardPage() {
  const { state, today } = useDemo();
  const [params, setParams] = useSearchParams();
  const tier = (params.get('tier') ?? '') as ExpiryTier | '';
  const project = state.projects.find((item) => item.id === state.currentProjectId);
  const scoped = state.currentProjectId === 'all'
    ? state.workers
    : state.workers.filter((worker) => worker.projectId === state.currentProjectId);

  const filtered = scoped.filter((worker) => workerMatches(worker, { tier }, today, state.companies));
  const onSite = scoped.filter((worker) => worker.approvalStatus === 'approved').length;
  const pending = scoped.filter((worker) => worker.approvalStatus.startsWith('pending') || worker.approvalStatus === 'changes_requested').length;
  const expiring = scoped.filter((worker) => {
    const worst = worseTier(getExpiryTier(worker.csocExpiry, today), getExpiryTier(worker.workPermitExpiry, today));
    return worst !== 'green';
  }).length;
  const strikes = scoped.filter((worker) => strikeLevelOf(worker) > 0).length;

  const tierChart = useMemo(
    () =>
      TIERS.map((item) => ({
        name: tierLabel(item),
        tier: item,
        value: scoped.filter(
          (worker) => worseTier(getExpiryTier(worker.csocExpiry, today), getExpiryTier(worker.workPermitExpiry, today)) === item,
        ).length,
      })),
    [scoped, today],
  );

  const companyChart = useMemo(
    () =>
      state.companies.map((company) => ({
        name: company.name.replace(' Services', '').replace(' Contractors', ''),
        value: scoped.filter((worker) => worker.companyId === company.id).length,
      })),
    [scoped, state.companies],
  );

  const eyebrow = project ? `${project.code} · SITE SAFETY INTELLIGENCE` : 'ALL PROJECTS · SITE SAFETY INTELLIGENCE';

  return (
    <div>
      <PageHeader
        eyebrow={eyebrow}
        title="Safety"
        accent="Overview"
        subtitle="Workers on site, passes that are running out, and strikes that have been fully approved."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Workers on site" value={onSite} hint="Approved registrations" />
        <Kpi label="Pending approvals" value={pending} hint="Including changes requested" />
        <Kpi label="Passes needing attention" value={expiring} hint="Yellow, orange or expired" />
        <Kpi label="Active strikes" value={strikes} hint="Approved strikes only" />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-5">
        <GlassCard className="p-5 xl:col-span-3">
          <h2 className="text-sm font-bold text-slate-800">Most urgent pass</h2>
          <p className="text-xs text-slate-400">Each worker counted once, by the worse of CSOC and work permit.</p>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tierChart}>
                <CartesianGrid vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(244,114,182,0.08)' }} />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {tierChart.map((entry) => (
                    <Cell key={entry.tier} fill={tokens.expiry[entry.tier].dot} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
        <GlassCard className="p-5 xl:col-span-2">
          <h2 className="text-sm font-bold text-slate-800">Headcount by contractor</h2>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={companyChart} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" allowDecimals={false} hide />
                <YAxis type="category" dataKey="name" width={110} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#c084fc" radius={[0, 10, 10, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="mt-4 p-4 md:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Worker grid</h2>
            <p className="text-xs text-slate-400">Filter by expiry tier. Orange is 0–14 days remaining.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <TierPill active={tier === ''} onClick={() => setParams({})} label="All tiers" testId="expiry-all" />
            {TIERS.map((item) => (
              <TierPill
                key={item}
                active={tier === item}
                onClick={() => setParams({ tier: item })}
                label={item === 'orange' ? 'Orange 0–14 days' : tierLabel(item)}
                testId={`expiry-${item}`}
              />
            ))}
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          {filtered.length} of {scoped.length} records · Click a worker card to inspect the internal profile.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((worker) => (
            <WorkerCard
              key={worker.id}
              worker={worker}
              company={state.companies.find((company) => company.id === worker.companyId)}
              today={today}
              variant="board"
            />
          ))}
        </div>
        {filtered.length === 0 ? <p className="py-10 text-center text-sm text-slate-400">No workers in this expiry tier.</p> : null}
      </GlassCard>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <GlassCard className="p-5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</div>
      <div className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{hint}</div>
    </GlassCard>
  );
}

function TierPill({
  active,
  onClick,
  label,
  testId,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  testId: string;
}) {
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1.5 text-xs font-semibold',
        active ? 'gradient-btn text-white shadow-sm' : 'bg-white/80 text-slate-600',
      )}
    >
      {label}
    </button>
  );
}
