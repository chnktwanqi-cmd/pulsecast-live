import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { GlassCard } from '../../components/ui/GlassCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { useDemo } from '../../data/store';
import { qrActive } from '../../domain/approval';
import { Avatar } from '../../components/ui/Avatar';
import { personInitials } from '../../lib/initials';

export function QrGalleryPage() {
  const { state } = useDemo();
  const project = state.projects.find((item) => item.id === state.currentProjectId);
  const scoped = state.currentProjectId === 'all'
    ? state.workers
    : state.workers.filter((worker) => worker.projectId === state.currentProjectId);
  const active = scoped.filter((worker) => qrActive(worker.approvalStatus));
  const inactive = scoped.filter((worker) => !qrActive(worker.approvalStatus));
  const eyebrow = project ? `${project.code} · SITE SAFETY INTELLIGENCE` : 'ALL PROJECTS · SITE SAFETY INTELLIGENCE';

  return (
    <div>
      <PageHeader
        eyebrow={eyebrow}
        title="QR Helmet"
        accent="IDs"
        subtitle="Each approved worker has a helmet sticker. The QR opens a public profile that cannot carry confidential fields."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {active.map((worker) => {
          const company = state.companies.find((item) => item.id === worker.companyId);
          const url = `${window.location.origin}/p/${worker.publicToken}`;
          return (
            <GlassCard key={worker.id} className="p-4">
              <div className="flex items-center gap-3">
                <Avatar initials={personInitials(worker.firstName, worker.lastName)} index={worker.avatarIndex} size="sm" />
                <div className="min-w-0">
                  <div className="truncate font-bold text-slate-900">
                    {worker.firstName} {worker.lastName}
                  </div>
                  <div className="truncate text-xs text-slate-500">
                    {company?.name} · {worker.id}
                  </div>
                </div>
              </div>
              <div className="mt-4 grid place-items-center rounded-2xl bg-white/80 py-4">
                <QRCodeSVG value={url} size={132} bgColor="transparent" fgColor="#1e1b4b" />
              </div>
              <div className="mt-3 flex gap-2 text-sm font-semibold">
                <Link className="text-pink-600" to={`/qr/${worker.id}`}>
                  Print sticker
                </Link>
                <Link className="text-violet-600" to={`/p/${worker.publicToken}`}>
                  Public profile
                </Link>
              </div>
            </GlassCard>
          );
        })}
      </div>
      {inactive.length > 0 ? (
        <GlassCard className="mt-4 p-5">
          <h2 className="text-sm font-bold text-slate-800">QR inactive until approval</h2>
          <ul className="mt-3 space-y-1 text-sm text-slate-500">
            {inactive.map((worker) => (
              <li key={worker.id}>
                <Link className="font-semibold text-slate-700" to={`/workers/${worker.id}`}>
                  {worker.firstName} {worker.lastName}
                </Link>{' '}
                · {worker.id}
              </li>
            ))}
          </ul>
        </GlassCard>
      ) : null}
    </div>
  );
}
