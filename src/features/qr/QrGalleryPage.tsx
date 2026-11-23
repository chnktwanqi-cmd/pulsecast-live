import { Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { GhostButton } from '../../components/ui/Buttons';
import { CompanyChip } from '../../components/ui/CompanyChip';
import { GlassCard } from '../../components/ui/GlassCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { WorkerPortrait } from '../../components/ui/WorkerPortrait';
import { useDemo } from '../../data/store';
import { qrActive } from '../../domain/approval';
import { personInitials } from '../../lib/initials';
import { downloadStickerPdf, type StickerPerson } from './stickerPdf';

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
        subtitle="Each registered worker has a 50 mm round helmet sticker. The QR opens a public profile that cannot carry confidential fields."
        actions={
          <GhostButton
            type="button"
            onClick={() => {
              const people: StickerPerson[] = active.map((worker) => {
                const company = state.companies.find((item) => item.id === worker.companyId);
                return {
                  firstName: worker.firstName,
                  lastName: worker.lastName,
                  workerCode: worker.id,
                  companyColor: company?.color ?? '#1E3A5F',
                  publicUrl: `${window.location.origin}/p/${worker.publicToken}`,
                };
              });
              void downloadStickerPdf(people, 'sitesafe-stickers-a4.pdf');
            }}
          >
            <Download className="h-4 w-4" />
            Download A4 sticker sheet
          </GhostButton>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {active.map((worker) => {
          const company = state.companies.find((item) => item.id === worker.companyId);
          const url = `${window.location.origin}/p/${worker.publicToken}`;
          return (
            <GlassCard key={worker.id} className="overflow-hidden p-4" style={{ borderTop: `4px solid ${company?.color ?? '#1E3A5F'}` }}>
              <div className="flex items-center gap-3">
                <WorkerPortrait
                  initials={personInitials(worker.firstName, worker.lastName)}
                  index={worker.avatarIndex}
                  photoDataUrl={worker.photoDataUrl}
                  color={company?.color}
                  size="sm"
                />
                <div className="min-w-0">
                  <div className="truncate font-bold text-slate-900">
                    {worker.firstName} {worker.lastName}
                  </div>
                  <div className="mt-1">
                    <CompanyChip name={company?.name ?? 'Contractor'} color={company?.color ?? '#1E3A5F'} />
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{worker.id}</div>
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
          <h2 className="text-sm font-bold text-slate-800">QR not active</h2>
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
