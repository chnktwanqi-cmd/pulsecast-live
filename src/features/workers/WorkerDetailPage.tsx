import { ArrowLeft, QrCode } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { GhostButton, PrimaryButton } from '../../components/ui/Buttons';
import { ExpiryBadge } from '../../components/ui/ExpiryBadge';
import { GlassCard } from '../../components/ui/GlassCard';
import { StatusPill } from '../../components/ui/StatusPill';
import { StrikeBadge } from '../../components/ui/StrikeBadge';
import { CompanyChip } from '../../components/ui/CompanyChip';
import { WorkerPortrait } from '../../components/ui/WorkerPortrait';
import { useDemo } from '../../data/store';
import { qrActive, registrationLabel } from '../../domain/approval';
import { formatDate, formatDateTime } from '../../domain/dates';
import { canEditTraining } from '../../domain/permissions';
import { canDecideStrike, canProposeStrike, currentStrikeLevel, strikeStatusLabel } from '../../domain/strikes';
import { personInitials } from '../../lib/initials';
import { cn } from '../../lib/cn';
import { ProposeStrikeModal } from '../strikes/ProposeStrikeModal';
import { TrainingModal } from '../training/TrainingModal';
import type { TrainingRecord } from '../../domain/types';

const TABS = ['Profile', 'Training', 'Strikes'] as const;

export function WorkerDetailPage() {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const { state, today, actor, deleteTraining, decideStrike } = useDemo();
  const worker = state.workers.find((item) => item.id === workerId);
  const [tab, setTab] = useState<(typeof TABS)[number]>('Profile');
  const [trainingOpen, setTrainingOpen] = useState(false);
  const [editing, setEditing] = useState<TrainingRecord | null>(null);
  const [strikeOpen, setStrikeOpen] = useState(false);
  const [error, setError] = useState('');

  if (!worker) {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-sm text-slate-500">This worker is not in the demo.</p>
        <Link to="/workers" className="mt-3 inline-block text-sm font-semibold text-pink-600">
          Back to Worker Registry
        </Link>
      </GlassCard>
    );
  }

  const company = state.companies.find((item) => item.id === worker.companyId);
  const project = state.projects.find((item) => item.id === worker.projectId);
  const level = currentStrikeLevel(worker.strikes);
  const color = company?.color ?? '#1E3A5F';

  return (
    <div>
      <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>
      <GlassCard className="p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <WorkerPortrait
              initials={personInitials(worker.firstName, worker.lastName)}
              index={worker.avatarIndex}
              photoDataUrl={worker.photoDataUrl}
              color={color}
              size="lg"
              alt={`${worker.firstName} ${worker.lastName}`}
            />
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                {worker.firstName} {worker.lastName}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <CompanyChip name={company?.name ?? 'Contractor'} color={color} />
                <span>{worker.designation}</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-slate-500">{worker.id}</span>
                <StrikeBadge level={level} />
                <StatusPill bg="#E7F8EE" color="#178A4A">
                  {registrationLabel()} · QR {qrActive(worker.approvalStatus) ? 'on' : 'off'}
                </StatusPill>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {qrActive(worker.approvalStatus) ? (
              <Link
                to={`/qr/${worker.id}`}
                className="gradient-btn inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold text-white shadow-lg shadow-pink-500/20"
              >
                <QrCode className="h-4 w-4" />
                Helmet QR
              </Link>
            ) : null}
            {canProposeStrike(actor.role) ? (
              <GhostButton type="button" data-testid="propose-strike" onClick={() => setStrikeOpen(true)}>
                Propose strike
              </GhostButton>
            ) : null}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <ExpiryBadge date={worker.csocExpiry} today={today} prefix="CSOC" />
          <ExpiryBadge date={worker.workPermitExpiry} today={today} prefix="Work permit" />
        </div>
      </GlassCard>

      <div className="mt-4 flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item}
            data-testid={`tab-${item.toLowerCase()}`}
            onClick={() => setTab(item)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-semibold',
              tab === item ? 'gradient-btn text-white' : 'bg-white/70 text-slate-600',
            )}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === 'Profile' ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <GlassCard className="p-5">
            <h2 className="text-sm font-bold text-slate-800">Internal profile</h2>
            <p className="mt-1 text-xs text-slate-400">These fields stay off the public QR page.</p>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="NRIC / FIN" value={worker.nricMasked} />
              <Row label="Date of birth" value={formatDate(worker.dob)} />
              <Row label="Mobile" value={worker.phone} />
              <Row label="Address" value={worker.address} />
              <Row label="Nationality" value={worker.nationality} />
              <Row label="Project" value={project?.name ?? '—'} />
              <Row label="Trade" value={worker.trade} />
              <Row label="Induction" value={worker.siteInduction} />
              <Row label="CSOC number" value={worker.csocNumber} />
              <Row label="Work permit number" value={worker.workPermitNumber} />
            </dl>
            <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
              Active · registered by Safety Officer. Helmet QR is on. Onboarding is not queued for later approval.
            </p>
          </GlassCard>
          <GlassCard className="p-5">
            <h2 className="text-sm font-bold text-slate-800">Next of kin</h2>
            <p className="mt-1 text-xs text-slate-400">Internal only. Not printed on the helmet ID.</p>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Name" value={worker.nextOfKin.name} />
              <Row label="Relationship" value={worker.nextOfKin.relationship} />
              <Row label="Phone" value={worker.nextOfKin.phone} />
            </dl>
          </GlassCard>
        </div>
      ) : null}

      {tab === 'Training' ? (
        <GlassCard className="mt-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">SIC, BCSS and CSOC</h2>
            {canEditTraining(actor.role) ? (
              <PrimaryButton
                type="button"
                onClick={() => {
                  setEditing(null);
                  setTrainingOpen(true);
                }}
              >
                Add record
              </PrimaryButton>
            ) : null}
          </div>
          <div className="mt-4 space-y-3">
            {worker.trainings.map((record) => (
              <div key={record.id} className="flex flex-col gap-2 rounded-2xl border border-white bg-white/75 px-4 py-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold text-slate-800">{record.course}</div>
                  <div className="text-xs text-slate-500">
                    {formatDate(record.courseDate)} → {formatDate(record.expiry)} · {record.certificateNumber}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ExpiryBadge date={record.expiry} today={today} prefix={record.course} />
                  {canEditTraining(actor.role) ? (
                    <>
                      <GhostButton
                        type="button"
                        onClick={() => {
                          setEditing(record);
                          setTrainingOpen(true);
                        }}
                      >
                        Edit
                      </GhostButton>
                      <GhostButton type="button" onClick={() => deleteTraining(worker.id, record.id)}>
                        Remove
                      </GhostButton>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
            {worker.trainings.length === 0 ? <p className="text-sm text-slate-400">No training records yet.</p> : null}
          </div>
        </GlassCard>
      ) : null}

      {tab === 'Strikes' ? (
        <GlassCard className="mt-4 p-5">
          <h2 className="text-sm font-bold text-slate-800">Disciplinary record</h2>
          <p className="mt-1 text-xs text-slate-500">
            Yellow is Strike 1, orange is Strike 2, red is Strike 3. Only strikes approved by both the Safety Manager and the Project Director count. Reasons stay on this internal page.
          </p>
          <div className="mt-4 space-y-3">
            {worker.strikes.length === 0 ? <p className="text-sm text-slate-400">No strikes on file.</p> : null}
            {worker.strikes.map((strike) => (
              <div key={strike.id} className="rounded-2xl border border-white bg-white/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-semibold text-slate-800">
                    Strike {strike.level} · {formatDate(strike.date)}
                  </div>
                  <StatusPill bg="#F8FAFC" color="#475569">
                    {strikeStatusLabel(strike.status)}
                  </StatusPill>
                </div>
                <p className="mt-2 text-sm text-slate-600">{strike.reason}</p>
                <p className="mt-1 text-xs text-slate-400">
                  Evidence placeholder: {strike.evidenceName} · Issued by {strike.issuer} ({strike.issuerRole})
                </p>
                <ol className="mt-3 space-y-1 text-xs text-slate-500">
                  {strike.trail.map((event) => (
                    <li key={event.id}>
                      {formatDateTime(event.at)} · {event.actor} · {event.action} · {event.remarks}
                    </li>
                  ))}
                </ol>
                {canDecideStrike(strike.status, actor.role) ? (
                  <StrikeDecisionBox
                    onDecide={(action, note) => {
                      const result = decideStrike(strike.id, action, note);
                      setError(result.ok ? '' : result.error ?? 'Could not record the decision.');
                    }}
                  />
                ) : null}
              </div>
            ))}
          </div>
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
        </GlassCard>
      ) : null}

      <TrainingModal open={trainingOpen} worker={worker} initial={editing} onClose={() => setTrainingOpen(false)} />
      <ProposeStrikeModal worker={worker} open={strikeOpen} onClose={() => setStrikeOpen(false)} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2">
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-right font-semibold text-slate-800">{value}</dd>
    </div>
  );
}

function StrikeDecisionBox({ onDecide }: { onDecide: (action: 'approve' | 'reject', note: string) => void }) {
  const [note, setNote] = useState('Reviewed the sample evidence.');
  return (
    <div className="mt-3 rounded-2xl bg-slate-50 p-3">
      <textarea className="min-h-16 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" value={note} onChange={(event) => setNote(event.target.value)} />
      <div className="mt-2 flex gap-2">
        <PrimaryButton type="button" data-testid="strike-approve" onClick={() => onDecide('approve', note)}>
          Approve strike
        </PrimaryButton>
        <GhostButton type="button" onClick={() => onDecide('reject', note)}>
          Reject
        </GhostButton>
      </div>
    </div>
  );
}
