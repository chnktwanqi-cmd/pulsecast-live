import { Link } from 'react-router-dom';
import { Avatar } from '../../components/ui/Avatar';
import { ExpiryBadge } from '../../components/ui/ExpiryBadge';
import { StrikeBadge } from '../../components/ui/StrikeBadge';
import { approvalLabel, approvalStageLabel } from '../../domain/approval';
import { strikeLevelOf } from '../../domain/filterWorkers';
import type { Company, Worker } from '../../domain/types';
import { personInitials } from '../../lib/initials';

export function WorkerCard({
  worker,
  company,
  today,
  variant,
}: {
  worker: Worker;
  company?: Company;
  today: Date;
  variant: 'registry' | 'board';
}) {
  const level = strikeLevelOf(worker);
  return (
    <Link
      to={`/workers/${worker.id}`}
      data-testid={`worker-card-${worker.id}`}
      className="block rounded-[1.35rem] border border-white bg-white/90 p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-glass"
    >
      <div className="flex items-start gap-3">
        <Avatar initials={personInitials(worker.firstName, worker.lastName)} index={worker.avatarIndex} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-[15px] font-bold text-slate-900">
                {worker.firstName} {worker.lastName}
              </div>
              <div className="truncate text-xs text-slate-500">{company?.name ?? 'Contractor'}</div>
            </div>
            <div className="shrink-0 text-right text-xs text-slate-500">{worker.designation}</div>
          </div>
        </div>
      </div>
      <div className="mt-4 text-sm font-medium text-slate-500">{worker.id}</div>
      {variant === 'board' ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          <ExpiryBadge date={worker.csocExpiry} today={today} prefix="CSOC" />
          <ExpiryBadge date={worker.workPermitExpiry} today={today} prefix="Pass" />
        </div>
      ) : null}
      {worker.approvalStatus !== 'approved' ? (
        <div className="mt-2 text-[11px] font-semibold text-pink-600">
          {approvalLabel(worker.approvalStatus)} · {approvalStageLabel(worker.approvalStatus)}
        </div>
      ) : null}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-slate-400">Strike Status</span>
        <StrikeBadge level={level} />
      </div>
    </Link>
  );
}
