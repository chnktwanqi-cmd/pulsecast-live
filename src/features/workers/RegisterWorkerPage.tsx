import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GhostButton, PrimaryButton } from '../../components/ui/Buttons';
import { Field } from '../../components/ui/Field';
import { GlassCard } from '../../components/ui/GlassCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { Stepper } from '../../components/ui/Stepper';
import { useDemo } from '../../data/store';
import { ageInYears } from '../../domain/dates';
import { DESIGNATIONS, INDUCTIONS, NATIONALITIES, TRADES } from '../../domain/options';
import type { InductionStatus, WorkerDraft } from '../../domain/types';

const STEPS = ['Worker', 'Engagement', 'Passes & kin', 'Review'];

function blank(companyId: string, projectId: string): WorkerDraft {
  return {
    firstName: '',
    lastName: '',
    nationality: 'Singaporean',
    nricMasked: '',
    dob: '',
    phone: '',
    address: '',
    companyId,
    projectId,
    designation: 'General Worker',
    trade: 'General Worker',
    siteInduction: 'Pending',
    csocNumber: '',
    csocExpiry: '',
    workPermitNumber: '',
    workPermitExpiry: '',
    nextOfKin: { name: '', relationship: 'Spouse', phone: '' },
  };
}

export function RegisterWorkerPage() {
  const { state, today, registerWorker } = useDemo();
  const navigate = useNavigate();
  const projectId = state.currentProjectId === 'all' ? state.projects[0]?.id ?? '' : state.currentProjectId;
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<WorkerDraft>(() => blank(state.companies[0]?.id ?? '', projectId));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof WorkerDraft>(key: K, value: WorkerDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const validate = (index: number) => {
    const next: Record<string, string> = {};
    if (index === 0) {
      if (!draft.firstName.trim()) next.firstName = 'Enter a fictional first name.';
      if (!draft.lastName.trim()) next.lastName = 'Enter a fictional last name.';
      if (!/^[STFGM]\*{4}\d{3}[A-Z]$/i.test(draft.nricMasked.trim())) next.nricMasked = 'Use a mask like S****123A. Do not enter a real NRIC.';
      const age = ageInYears(draft.dob, today);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.dob) || Number.isNaN(age) || age < 18 || age > 80) {
        next.dob = 'Use a fictional adult date of birth.';
      }
      if (draft.phone.trim().length < 8) next.phone = 'Enter a fictional mobile.';
      if (draft.address.trim().length < 6) next.address = 'Enter a fictional address.';
    }
    if (index === 1) {
      if (!draft.companyId) next.companyId = 'Choose a contractor.';
      if (!draft.projectId) next.projectId = 'Choose a project.';
    }
    if (index === 2) {
      if (draft.csocNumber.trim().length < 4) next.csocNumber = 'Enter a fictional CSOC number.';
      if (!draft.csocExpiry) next.csocExpiry = 'Choose a CSOC expiry.';
      if (draft.workPermitNumber.trim().length < 4) next.workPermitNumber = 'Enter a fictional work permit number.';
      if (!draft.workPermitExpiry) next.workPermitExpiry = 'Choose a work permit expiry.';
      if (draft.nextOfKin.name.trim().length < 2) next.kinName = 'Enter a fictional next-of-kin name.';
      if (draft.nextOfKin.phone.trim().length < 8) next.kinPhone = 'Enter a fictional next-of-kin phone.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const company = state.companies.find((item) => item.id === draft.companyId);
  const project = state.projects.find((item) => item.id === draft.projectId);
  const eyebrowProject = state.projects.find((item) => item.id === state.currentProjectId);

  return (
    <div>
      <PageHeader
        eyebrow={eyebrowProject ? `${eyebrowProject.code} · SITE SAFETY INTELLIGENCE` : 'ALL PROJECTS · SITE SAFETY INTELLIGENCE'}
        title="Register"
        accent="Worker"
        subtitle="Submit a pack for review. It lands as Pending Review and is never auto-approved."
      />
      <GlassCard className="p-5 md:p-6">
        <Stepper steps={STEPS} current={step} />
        <form
          className="mt-6"
          onSubmit={(event) => {
            event.preventDefault();
            if (step < 3) {
              if (validate(step)) setStep(step + 1);
              return;
            }
            const result = registerWorker(draft);
            if (result.ok && result.id) navigate(`/workers/${result.id}`);
            else setErrors({ form: result.error ?? 'Could not submit.' });
          }}
        >
          {step === 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="First name" error={errors.firstName}>
                <input className="control" value={draft.firstName} onChange={(event) => set('firstName', event.target.value)} data-testid="reg-first" />
              </Field>
              <Field label="Last name" error={errors.lastName}>
                <input className="control" value={draft.lastName} onChange={(event) => set('lastName', event.target.value)} data-testid="reg-last" />
              </Field>
              <Field label="Nationality">
                <select className="control" value={draft.nationality} onChange={(event) => set('nationality', event.target.value)}>
                  {NATIONALITIES.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </Field>
              <Field label="Fictional masked NRIC / FIN" error={errors.nricMasked} hint="Example S****123A. Never a real number.">
                <input className="control" value={draft.nricMasked} onChange={(event) => set('nricMasked', event.target.value)} placeholder="S****123A" data-testid="reg-nric" />
              </Field>
              <Field label="Date of birth" error={errors.dob}>
                <input className="control" type="date" value={draft.dob} onChange={(event) => set('dob', event.target.value)} data-testid="reg-dob" />
              </Field>
              <Field label="Mobile" error={errors.phone}>
                <input className="control" value={draft.phone} onChange={(event) => set('phone', event.target.value)} placeholder="+65 8123 0000" />
              </Field>
              <Field label="Address" error={errors.address}>
                <input className="control" value={draft.address} onChange={(event) => set('address', event.target.value)} />
              </Field>
            </div>
          ) : null}
          {step === 1 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Contractor" error={errors.companyId}>
                <select className="control" value={draft.companyId} onChange={(event) => set('companyId', event.target.value)}>
                  {state.companies.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Project" error={errors.projectId}>
                <select className="control" value={draft.projectId} onChange={(event) => set('projectId', event.target.value)}>
                  {state.projects.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Designation">
                <select className="control" value={draft.designation} onChange={(event) => set('designation', event.target.value)}>
                  {DESIGNATIONS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </Field>
              <Field label="Trade">
                <select className="control" value={draft.trade} onChange={(event) => set('trade', event.target.value)}>
                  {TRADES.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </Field>
              <Field label="Site induction">
                <select className="control" value={draft.siteInduction} onChange={(event) => set('siteInduction', event.target.value as InductionStatus)}>
                  {INDUCTIONS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </Field>
            </div>
          ) : null}
          {step === 2 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="CSOC number" error={errors.csocNumber}>
                <input className="control" value={draft.csocNumber} onChange={(event) => set('csocNumber', event.target.value)} placeholder="CSOC-DEMO-00991" />
              </Field>
              <Field label="CSOC expiry" error={errors.csocExpiry}>
                <input className="control" type="date" value={draft.csocExpiry} onChange={(event) => set('csocExpiry', event.target.value)} />
              </Field>
              <Field label="Work permit number" error={errors.workPermitNumber}>
                <input className="control" value={draft.workPermitNumber} onChange={(event) => set('workPermitNumber', event.target.value)} placeholder="WP-DEMO-00991" />
              </Field>
              <Field label="Work permit expiry" error={errors.workPermitExpiry}>
                <input className="control" type="date" value={draft.workPermitExpiry} onChange={(event) => set('workPermitExpiry', event.target.value)} />
              </Field>
              <Field label="Next of kin" error={errors.kinName}>
                <input
                  className="control"
                  value={draft.nextOfKin.name}
                  onChange={(event) => set('nextOfKin', { ...draft.nextOfKin, name: event.target.value })}
                />
              </Field>
              <Field label="Relationship">
                <select
                  className="control"
                  value={draft.nextOfKin.relationship}
                  onChange={(event) => set('nextOfKin', { ...draft.nextOfKin, relationship: event.target.value })}
                >
                  {['Spouse', 'Parent', 'Sibling', 'Child'].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </Field>
              <Field label="Kin phone" error={errors.kinPhone}>
                <input
                  className="control"
                  value={draft.nextOfKin.phone}
                  onChange={(event) => set('nextOfKin', { ...draft.nextOfKin, phone: event.target.value })}
                  placeholder="+65 9123 0000"
                />
              </Field>
            </div>
          ) : null}
          {step === 3 ? (
            <div className="space-y-2 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">
                {draft.firstName} {draft.lastName} · {draft.designation}
              </p>
              <p>
                {company?.name} · {project?.name} · {draft.trade}
              </p>
              <p>CSOC {draft.csocNumber} expires {draft.csocExpiry}</p>
              <p>Work permit {draft.workPermitNumber} expires {draft.workPermitExpiry}</p>
              <p>Next of kin {draft.nextOfKin.name} ({draft.nextOfKin.relationship})</p>
              <p className="rounded-2xl bg-pink-50 px-4 py-3 text-pink-700">
                Submitting sets the status to Pending Review. The helmet QR stays inactive until Safety Personnel, Safety Officer and Safety Manager have each approved.
              </p>
              {errors.form ? <p className="text-rose-600">{errors.form}</p> : null}
            </div>
          ) : null}
          <div className="mt-6 flex justify-between">
            <GhostButton type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>
              Back
            </GhostButton>
            <PrimaryButton type="submit" data-testid={step === 3 ? 'reg-submit' : 'reg-next'}>
              {step === 3 ? 'Submit for review' : 'Continue'}
            </PrimaryButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
