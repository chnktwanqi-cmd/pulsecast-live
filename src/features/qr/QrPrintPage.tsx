import { ArrowLeft, Download, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Link, useParams } from 'react-router-dom';
import { GhostButton, PrimaryButton } from '../../components/ui/Buttons';
import { useDemo } from '../../data/store';
import { qrActive } from '../../domain/approval';
import { personInitials } from '../../lib/initials';
import { downloadStickerPdf, printStickerPdf, stickerShortName, type StickerPerson } from './stickerPdf';

export function QrPrintPage() {
  const { workerId } = useParams();
  const { state } = useDemo();
  const worker = state.workers.find((item) => item.id === workerId);
  if (!worker || !qrActive(worker.approvalStatus)) {
    return (
      <div className="mx-auto max-w-md rounded-3xl bg-white/80 p-8 text-center">
        <p className="text-sm text-slate-500">This helmet QR is not active.</p>
        <Link to="/qr" className="mt-3 inline-block text-sm font-semibold text-pink-600">
          Back to QR Helmet IDs
        </Link>
      </div>
    );
  }
  const company = state.companies.find((item) => item.id === worker.companyId);
  const color = company?.color ?? '#1E3A5F';
  const url = `${window.location.origin}/p/${worker.publicToken}`;
  const person: StickerPerson = {
    firstName: worker.firstName,
    lastName: worker.lastName,
    workerCode: worker.id,
    companyColor: color,
    publicUrl: url,
  };

  return (
    <div>
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-2">
        <Link to="/qr" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
          <ArrowLeft className="h-4 w-4" />
          QR Helmet IDs
        </Link>
        <div className="flex flex-wrap gap-2">
          <GhostButton type="button" onClick={() => void downloadStickerPdf([person], `sitesafe-${worker.id}-sticker.pdf`)}>
            <Download className="h-4 w-4" />
            Download sticker PDF
          </GhostButton>
          <PrimaryButton type="button" onClick={() => void printStickerPdf([person])}>
            <Printer className="h-4 w-4" />
            Print
          </PrimaryButton>
        </div>
      </div>
      <article className="mx-auto flex max-w-md flex-col items-center rounded-[2rem] border border-white bg-white/90 p-8 text-center shadow-glass">
        <div
          data-testid="sticker-preview"
          className="grid place-items-center bg-white text-slate-900"
          style={{
            width: '50mm',
            height: '50mm',
            borderRadius: '50%',
            border: '0.35mm dashed #94a3b8',
            boxShadow: `inset 0 0 0 2.2mm ${color}`,
          }}
        >
          <div className="flex h-[40mm] w-[40mm] flex-col items-center justify-center">
            <div className="text-[8px] font-extrabold tracking-[0.16em]" style={{ color }}>
              SITESAFE
            </div>
            {worker.photoDataUrl ? (
              <img src={worker.photoDataUrl} alt="" className="mb-0.5 h-5 w-5 rounded-full object-cover" />
            ) : (
              <span className="mb-0.5 grid h-5 w-5 place-items-center rounded-full text-[8px] font-bold text-white" style={{ background: color }}>
                {personInitials(worker.firstName, worker.lastName)}
              </span>
            )}
            <QRCodeSVG value={url} size={64} fgColor="#0f172a" bgColor="#ffffff" level="M" />
            <div className="text-[9px] font-bold leading-none">{stickerShortName(worker.firstName, worker.lastName)}</div>
            <div className="text-[8px] leading-none text-slate-500">{worker.id}</div>
          </div>
        </div>
        <p className="mt-4 max-w-xs text-xs text-slate-500">
          Print at 100% scale. Do not fit to page. The cut line is a 50 mm circle. The PDF keeps a quiet zone around the QR.
        </p>
        <p className="mt-2 text-xs text-slate-400">{company?.name}</p>
        <Link className="no-print mt-4 inline-block text-sm font-semibold text-pink-600" to={`/p/${worker.publicToken}`}>
          Open public profile
        </Link>
      </article>
    </div>
  );
}
