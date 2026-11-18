import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GhostButton, PrimaryButton } from '../../components/ui/Buttons';
import { GlassCard } from '../../components/ui/GlassCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusPill } from '../../components/ui/StatusPill';
import { StrikeBadge } from '../../components/ui/StrikeBadge';
import { useDemo } from '../../data/store';
import { formatDate } from '../../domain/dates';
import { canDecideStrike, canProposeStrike, currentStrikeLevel, strikeStatusLabel } from '../../domain/strikes';
import type { Worker } from '../../domain/types';
import { ProposeStrikeModal } from './ProposeStrikeModal';

export function StrikesPage() {
  const { state, actor, decideStrike } = useDemo();
  const [workerId, setWorkerId] = useState('');
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const project = state.projects.find((item) => item.id === state.currentProjectId);
  const scoped = state.currentProjectId === 'all'
    ? state.workers
    : state.workers.filter((worker) => worker.projectId === state.currentProjectId);
  const queue = scoped.flatMap((worker) =>
    worker.strikes
      .filter((strike) => strike.status === 'pending_manager' || strike.status === 'pending_director')
      .map((strike) => ({ worker, strike })),
  );
  const target = scoped.find((worker) => worker.id === workerId) ?? null;

  return (
    <div>
      <PageHeader
        eyebrow={project ? `${project.code} · SITE SAFETY INTELLIGENCE` : 'ALL PROJECTS · SITE SAFETY INTELLIGENCE'}
        title="Safety"
        accent="Strikes"
        subtitle="A strike counts only after the Safety Manager and the Project Director have both approved it."
        actions={
          canProposeStrike(actor.role) ? (
            <PrimaryButton type="button" data-testid="open-propose-strike" onClick={() => setOpen(true)} disabled={!target}>
              Propose strike
            </PrimaryButton>
          ) : null
        }
      />
      {canProposeStrike(actor.role) ? (
        <GlassCard className="mb-4 p-4">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Worker</label>
          <select
            className="control mt-2"
            value={workerId}
            onChange={(event) => setWorkerId(event.target.value)}
            data-testid="strike-worker"
          >
            <option value="">Choose an approved worker</option>
            {scoped
              .filter((worker) => worker.approvalStatus === 'approved')
              .map((worker) => (
                <option key={worker.id} value={worker.id}>
                  {worker.firstName} {worker.lastName} · {worker.id}
                </option>
              ))}
          </select>
        </GlassCard>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard className="p-5">
          <h2 className="text-sm font-bold text-slate-800">Awaiting decision</h2>
          <div className="mt-3 space-y-3">
            {queue.length === 0 ? <p className="text-sm text-slate-400">No strikes are in the queue.</p> : null}
            {queue.map(({ worker, strike }) => (
              <article key={strike.id} className="rounded-2xl bg-white/80 p-4" data-testid={`strike-queue-${strike.id}`}>
                <div className="flex items-center justify-between gap-2">
                  <Link className="font-semibold text-slate-800" to={`/workers/${worker.id}`}>
                    {worker.firstName} {worker.lastName}
                  </Link>
                  <StatusPill bg="#FFF7ED" color="#C2410C">
                    {strikeStatusLabel(strike.status)}
                  </StatusPill>
                </div>
                <p className="mt-2 text-sm text-slate-600">{strike.reason}</p>
                <p className="mt-1 text-xs text-slate-400">
                  Strike {strike.level} · {formatDate(strike.date)} · {strike.evidenceName}
                </p>
                {canDecideStrike(strike.status, actor.role) ? (
                  <div className="mt-3 flex gap-2">
                    <PrimaryButton
                      type="button"
                      data-testid="queue-approve"
                      onClick={() => {
                        const result = decideStrike(strike.id, 'approve', 'Approved from the disciplinary queue.');
                        setError(result.ok ? '' : result.error ?? '');
                      }}
                    >
                      Approve
                    </PrimaryButton>
                    <GhostButton
                      type="button"
                      onClick={() => {
                        const result = decideStrike(strike.id, 'reject', 'Rejected from the disciplinary queue.');
                        setError(result.ok ? '' : result.error ?? '');
                      }}
                    >
                      Reject
                    </GhostButton>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-slate-400">Switch role to decide this stage.</p>
                )}
              </article>
            ))}
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          </div>
        </GlassCard>
        <GlassCard className="p-5">
          <h2 className="text-sm font-bold text-slate-800">Current level</h2>
          <ul className="mt-3 space-y-2">
            {scoped.map((worker) => (
              <li key={worker.id}>
                <WorkerLevel worker={worker} />
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
      <ProposeStrikeModal worker={target} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

function WorkerLevel({ worker }: { worker: Worker }) {
  return (
    <Link to={`/workers/${worker.id}`} className="flex items-center justify-between rounded-2xl bg-white/70 px-3 py-2">
      <span className="text-sm font-semibold text-slate-700">
        {worker.firstName} {worker.lastName}
      </span>
      <StrikeBadge level={currentStrikeLevel(worker.strikes)} />
    </Link>
  );
}
