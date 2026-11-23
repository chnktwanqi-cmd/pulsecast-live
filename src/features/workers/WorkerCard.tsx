import { Link } from 'react-router-dom';
import { CompanyChip } from '../../components/ui/CompanyChip';
import { ExpiryBadge } from '../../components/ui/ExpiryBadge';
import { StrikeBadge } from '../../components/ui/StrikeBadge';
import { WorkerPortrait } from '../../components/ui/WorkerPortrait';
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
  const color = company?.color ?? '#1E3A5F';
  return (
    <Link
      to={`/workers/${worker.id}`}
      data-testid={`worker-card-${worker.id}`}
      className="block overflow-hidden rounded-[1.35rem] border border-white bg-white/90 shadow-card transition hover:-translate-y-0.5 hover:shadow-glass"
      style={{ borderTop: `4px solid ${color}` }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <WorkerPortrait
            initials={personInitials(worker.firstName, worker.lastName)}
            index={worker.avatarIndex}
            photoDataUrl={worker.photoDataUrl}
            color={color}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-[15px] font-bold text-slate-900">
                  {worker.firstName} {worker.lastName}
                </div>
                <div className="mt-1">
                  <CompanyChip name={company?.name ?? 'Contractor'} color={color} />
                </div>
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
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-slate-400">Strike Status</span>
          <StrikeBadge level={level} />
        </div>
      </div>
    </Link>
  );
}
