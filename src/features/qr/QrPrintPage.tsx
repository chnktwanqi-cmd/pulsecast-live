import { ArrowLeft, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Link, useParams } from 'react-router-dom';
import { PrimaryButton } from '../../components/ui/Buttons';
import { Avatar } from '../../components/ui/Avatar';
import { useDemo } from '../../data/store';
import { qrActive } from '../../domain/approval';
import { personInitials } from '../../lib/initials';

export function QrPrintPage() {
  const { workerId } = useParams();
  const { state } = useDemo();
  const worker = state.workers.find((item) => item.id === workerId);
  if (!worker || !qrActive(worker.approvalStatus)) {
    return (
      <div className="mx-auto max-w-md rounded-3xl bg-white/80 p-8 text-center">
        <p className="text-sm text-slate-500">This helmet QR is inactive until the registration is fully approved.</p>
        <Link to="/qr" className="mt-3 inline-block text-sm font-semibold text-pink-600">
          Back to QR Helmet IDs
        </Link>
      </div>
    );
  }
  const company = state.companies.find((item) => item.id === worker.companyId);
  const project = state.projects.find((item) => item.id === worker.projectId);
  const url = `${window.location.origin}/p/${worker.publicToken}`;

  return (
    <div>
      <div className="no-print mb-4 flex items-center justify-between">
        <Link to="/qr" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
          <ArrowLeft className="h-4 w-4" />
          QR Helmet IDs
        </Link>
        <PrimaryButton type="button" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Print sticker
        </PrimaryButton>
      </div>
      <article className="print-sheet mx-auto max-w-sm rounded-[2rem] border border-white bg-white/90 p-8 text-center shadow-glass">
        <div className="gradient-text text-lg font-extrabold">SiteSafe</div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Helmet digital ID</p>
        <div className="mt-5 flex justify-center">
          <Avatar initials={personInitials(worker.firstName, worker.lastName)} index={worker.avatarIndex} size="lg" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-slate-900">
          {worker.firstName} {worker.lastName}
        </h1>
        <p className="text-sm text-slate-500">{company?.name}</p>
        <p className="mt-1 text-sm font-semibold text-slate-700">{worker.id}</p>
        <p className="text-xs text-slate-400">{project?.name}</p>
        <div className="mt-5 grid place-items-center">
          <QRCodeSVG value={url} size={180} fgColor="#1e1b4b" bgColor="transparent" />
        </div>
        <p className="mt-3 text-xs text-slate-400">Scan for the public check. Not a work pass.</p>
        <Link className="no-print mt-4 inline-block text-sm font-semibold text-pink-600" to={`/p/${worker.publicToken}`}>
          Open public profile
        </Link>
      </article>
    </div>
  );
}
