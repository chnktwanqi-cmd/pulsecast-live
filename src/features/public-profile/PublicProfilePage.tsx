import { ArrowLeft, Check, Shield } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { tokens } from '../../config/tokens';
import { CompanyChip } from '../../components/ui/CompanyChip';
import { WorkerPortrait } from '../../components/ui/WorkerPortrait';
import { useDemo } from '../../data/store';
import type { ExpiryTier } from '../../domain/expiry';
import { toPublicProfile, type PublicProfile } from './toPublicProfile';

export function PublicProfilePage() {
  const { publicToken } = useParams();
  const { state, today } = useDemo();
  const worker = state.workers.find((item) => item.publicToken === publicToken);
  const company = state.companies.find((item) => item.id === worker?.companyId);
  const project = state.projects.find((item) => item.id === worker?.projectId);
  const profile = worker ? toPublicProfile(worker, company, project, today, state.publicStrikeIndicator) : null;

  return (
    <div className="mesh flex min-h-screen flex-col items-center px-4 py-10">
      <Link
        to="/"
        className="no-print mb-5 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Internal Portal
      </Link>
      <div
        className="mb-3 max-w-md rounded-full bg-amber-50 px-4 py-2 text-center text-xs font-semibold text-amber-800"
        data-testid="privacy-banner"
      >
        {state.publicStrikeIndicator
          ? 'Prototype: strike disclosure on public page pending privacy approval'
          : 'Prototype: public strike indicator is switched off pending privacy approval'}
      </div>
      {!worker ? (
        <CardShell>
          <p className="text-sm text-slate-500">This QR token is not in the demo.</p>
        </CardShell>
      ) : null}
      {worker && !profile ? (
        <CardShell>
          <p className="text-sm font-semibold text-slate-800">This helmet QR is not active.</p>
          <p className="mt-2 text-sm text-slate-500">
            This registration is not active, so no name, company or pass status is shown.
          </p>
        </CardShell>
      ) : null}
      {profile ? <PublicCard profile={profile} /> : null}
      <p className="mt-6 text-center text-[11px] text-slate-400">
        Synthetic sample data · Not connected to production systems
      </p>
    </div>
  );
}

function CardShell({ children }: { children: ReactNode }) {
  return <div className="w-full max-w-[440px] rounded-[1.8rem] border border-white/80 bg-white/80 p-8 text-center shadow-glass backdrop-blur-xl">{children}</div>;
}

function PublicCard({ profile }: { profile: PublicProfile }) {
  return (
    <article
      className="w-full max-w-[440px] rounded-[1.8rem] border border-white/80 bg-white/85 p-6 shadow-glass backdrop-blur-xl"
      data-testid="public-card"
      style={{ boxShadow: `0 0 0 4px ${profile.companyColor}22, 0 18px 50px rgba(15,23,42,0.08)` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-pink-500 to-violet-600">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="gradient-text text-sm font-extrabold leading-none">SiteSafe</div>
            <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">Public worker ID</div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
          <Check className="h-3.5 w-3.5" /> Registered
        </span>
      </div>
      <div className="mt-6 flex flex-col items-center text-center">
        <WorkerPortrait
          initials={profile.initials}
          index={profile.avatarIndex}
          photoDataUrl={profile.photoDataUrl}
          color={profile.companyColor}
          size="lg"
          alt={profile.displayName}
        />
        <h1 className="mt-4 text-2xl font-extrabold text-slate-900">{profile.displayName}</h1>
        <div className="mt-2">
          <CompanyChip name={profile.company} color={profile.companyColor} />
        </div>
        <span className="mt-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">Site registration active</span>
      </div>
      <dl className="mt-6">
        <PublicRow label="Worker ID" value={profile.workerCode} />
        <PublicRow label="Project" value={profile.project} />
        <PublicRow label="Designation" value={profile.designation} />
        <PublicRow label="Site induction" value={profile.siteInduction} />
        <PublicRow label="Training Status" value={profile.trainingStatusLabel} />
        <PublicRow label="CSOC" value={<TierValue tier={profile.csocTier} label={profile.csocLabel} />} />
        <PublicRow label="Work Permit" value={<TierValue tier={profile.workPermitTier} label={profile.workPermitLabel} />} />
        {profile.strikeColor ? (
          <PublicRow
            label="Strike Status"
            value={
              <span
                data-testid="public-strike-dot"
                className="inline-block h-3.5 w-3.5 rounded-full"
                style={{ background: dotColor(profile.strikeColor) }}
                aria-label="Strike status indicator"
              />
            }
          />
        ) : null}
      </dl>
      <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-center text-xs leading-relaxed text-slate-500">
        Illustrative public QR profile only · No detailed disciplinary reason, warning letter or personal contact data is displayed. This is not proof of a valid MOM work pass.
      </p>
    </article>
  );
}

function PublicRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 text-sm">
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-right font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

function TierValue({ tier, label }: { tier: ExpiryTier; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: tokens.expiry[tier].dot }} />
      {label}
    </span>
  );
}

function dotColor(color: NonNullable<PublicProfile['strikeColor']>): string {
  if (color === 'green') return tokens.strike[0].dot;
  if (color === 'yellow') return tokens.strike[1].dot;
  if (color === 'orange') return tokens.strike[2].dot;
  return tokens.strike[3].dot;
}
