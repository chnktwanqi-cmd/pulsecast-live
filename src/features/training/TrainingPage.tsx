import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../../components/ui/GlassCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { tokens } from '../../config/tokens';
import { useDemo } from '../../data/store';
import { formatDate } from '../../domain/dates';
import { getExpiryTier } from '../../domain/expiry';
import { canEditTraining } from '../../domain/permissions';
import type { CourseCode, TrainingRecord, Worker } from '../../domain/types';
import { TrainingModal } from './TrainingModal';

const COURSES: CourseCode[] = ['SIC', 'BCSS', 'CSOC'];

export function TrainingPage() {
  const { state, today, actor } = useDemo();
  const navigate = useNavigate();
  const [editing, setEditing] = useState<{ worker: Worker; record: TrainingRecord | null; course: CourseCode } | null>(null);
  const project = state.projects.find((item) => item.id === state.currentProjectId);
  const scoped = state.currentProjectId === 'all'
    ? state.workers
    : state.workers.filter((worker) => worker.projectId === state.currentProjectId);

  return (
    <div>
      <PageHeader
        eyebrow={project ? `${project.code} · SITE SAFETY INTELLIGENCE` : 'ALL PROJECTS · SITE SAFETY INTELLIGENCE'}
        title="Training"
        accent="Matrix"
        subtitle="SIC, BCSS and CSOC for the project. Colours follow the same expiry tiers as the pass monitor."
      />
      <GlassCard className="overflow-hidden p-2 md:p-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-400">
                <th className="px-3 py-3">Worker</th>
                {COURSES.map((course) => (
                  <th key={course} className="px-3 py-3">
                    {course}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scoped.map((worker) => (
                <tr key={worker.id} className="border-t border-slate-100">
                  <td className="px-3 py-3">
                    <button className="text-left font-semibold text-slate-800" onClick={() => navigate(`/workers/${worker.id}`)}>
                      {worker.firstName} {worker.lastName}
                    </button>
                    <div className="text-xs text-slate-400">{worker.designation}</div>
                  </td>
                  {COURSES.map((course) => {
                    const record = worker.trainings.find((item) => item.course === course);
                    const tier = record ? getExpiryTier(record.expiry, today) : null;
                    return (
                      <td key={course} className="px-3 py-3">
                        <button
                          className="rounded-xl px-2 py-1 text-left text-xs font-semibold disabled:cursor-default"
                          style={tier ? { background: tokens.expiry[tier].bg, color: tokens.expiry[tier].text } : undefined}
                          disabled={!canEditTraining(actor.role)}
                          onClick={() => setEditing({ worker, record: record ?? null, course })}
                        >
                          {record ? (
                            <>
                              {tokens.expiry[tier!].label}
                              <span className="mt-0.5 block font-medium opacity-80">{formatDate(record.expiry)}</span>
                            </>
                          ) : (
                            <span className="text-slate-400">No record</span>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
      <TrainingModal
        open={Boolean(editing)}
        worker={editing?.worker ?? null}
        initial={editing?.record}
        course={editing?.course}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}
