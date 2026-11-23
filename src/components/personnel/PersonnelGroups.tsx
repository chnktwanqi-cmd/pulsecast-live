import type { ReactNode } from 'react';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { designationBucket, groupPersonnel } from '../../domain/grouping';
import type { Company, Worker } from '../../domain/types';

function buckets(workers: Worker[]) {
  const groups: { bucket: string; workers: Worker[] }[] = [];
  workers.forEach((worker) => {
    const bucket = designationBucket(worker.designation);
    const last = groups[groups.length - 1];
    if (!last || last.bucket !== bucket) groups.push({ bucket, workers: [worker] });
    else last.workers.push(worker);
  });
  return groups;
}

export function PersonnelGroups({
  workers,
  companies,
  render,
  layout = 'grid',
}: {
  workers: Worker[];
  companies: Company[];
  render: (worker: Worker) => ReactNode;
  layout?: 'grid' | 'stack';
}) {
  const groups = groupPersonnel(workers, companies);
  const [closed, setClosed] = useState<Record<string, boolean>>({});
  if (groups.length === 0) return null;
  return (
    <div className="space-y-5">
      {groups.map((group) => {
        const open = !closed[group.company.id];
        return (
          <section key={group.company.id} data-testid={`company-group-${group.company.id}`}>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-2xl border border-white bg-white/80 px-4 py-3 text-left shadow-card"
              style={{ borderLeft: `6px solid ${group.company.color}` }}
              aria-expanded={open}
              onClick={() => setClosed((current) => ({ ...current, [group.company.id]: open }))}
            >
              <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ background: group.company.color }} aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-slate-900">{group.company.name}</span>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {group.company.kind === 'main' ? 'Main contractor' : 'Subcontractor'}
                </span>
              </span>
              <span
                className="rounded-full px-2.5 py-1 text-xs font-bold text-white"
                style={{ background: group.company.color }}
              >
                {group.workers.length}
              </span>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
            </button>
            {open
              ? buckets(group.workers).map((chunk) => (
                  <div key={chunk.bucket} className="mt-3">
                    <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">{chunk.bucket}</div>
                    <div className={layout === 'grid' ? 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-3'}>
                      {chunk.workers.map((worker) => render(worker))}
                    </div>
                  </div>
                ))
              : null}
          </section>
        );
      })}
    </div>
  );
}
