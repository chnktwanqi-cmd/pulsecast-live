import { useState } from 'react';
import { GhostButton, PrimaryButton } from '../../components/ui/Buttons';
import { Field } from '../../components/ui/Field';
import { GlassCard } from '../../components/ui/GlassCard';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusPill } from '../../components/ui/StatusPill';
import { useDemo } from '../../data/store';
import { COMPANY_PALETTE } from '../../domain/companyColors';
import { companyOrder } from '../../domain/grouping';
import { canManageContractors } from '../../domain/permissions';
import type { Company } from '../../domain/types';

const empty: Omit<Company, 'id'> & { id?: string } = {
  name: '',
  kind: 'sub',
  uen: '',
  focus: '',
  contactName: '',
  phone: '',
  color: COMPANY_PALETTE[1].hex,
};

export function ContractorsPage() {
  const { state, actor, saveCompany, deleteCompany } = useDemo();
  const [editing, setEditing] = useState<(Omit<Company, 'id'> & { id?: string }) | null>(null);
  const [error, setError] = useState('');
  const allowed = canManageContractors(actor.role);

  return (
    <div>
      <PageHeader
        eyebrow="WORKSPACE · CONTRACTORS"
        title="Contractor"
        accent="Directory"
        subtitle="Vantage Maincon and the fictional subcontractors on this prototype. Headcount is counted from the worker registry."
        actions={
          allowed ? (
            <PrimaryButton type="button" onClick={() => setEditing({ ...empty })}>
              Add contractor
            </PrimaryButton>
          ) : null
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {companyOrder(state.companies).map((company) => {
          const headcount = state.workers.filter((worker) => worker.companyId === company.id).length;
          return (
            <GlassCard key={company.id} className="p-5" style={{ borderTop: `5px solid ${company.color}` }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="h-3.5 w-3.5 rounded-full" style={{ background: company.color }} aria-hidden />
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Identity colour</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">{company.name}</h2>
                  <p className="text-sm text-slate-500">{company.focus}</p>
                </div>
                <StatusPill bg={company.kind === 'main' ? '#FCE7F3' : '#EDE9FE'} color={company.kind === 'main' ? '#BE185D' : '#6D28D9'}>
                  {company.kind === 'main' ? 'Main Contractor' : 'Subcontractor'}
                </StatusPill>
              </div>
              <dl className="mt-4 space-y-1 text-sm text-slate-600">
                <div>UEN {company.uen}</div>
                <div>{company.contactName}</div>
                <div>{company.phone}</div>
                <div className="font-semibold text-slate-800">{headcount} workers</div>
              </dl>
              {allowed ? (
                <div className="mt-4 flex gap-2">
                  <GhostButton type="button" onClick={() => setEditing(company)}>
                    Edit
                  </GhostButton>
                  <GhostButton
                    type="button"
                    onClick={() => {
                      const result = deleteCompany(company.id);
                      setError(result.ok ? '' : result.error ?? '');
                    }}
                  >
                    Delete
                  </GhostButton>
                </div>
              ) : null}
            </GlassCard>
          );
        })}
      </div>
      {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
      <Modal open={Boolean(editing)} title={editing?.id ? 'Edit contractor' : 'Add contractor'} onClose={() => setEditing(null)}>
        {editing ? (
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              const result = saveCompany(editing);
              if (!result.ok) {
                setError(result.error ?? 'Could not save.');
                return;
              }
              setEditing(null);
            }}
          >
            <Field label="Name">
              <input className="control" value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} required />
            </Field>
            <Field label="Type">
              <select className="control" value={editing.kind} onChange={(event) => setEditing({ ...editing, kind: event.target.value as Company['kind'] })}>
                <option value="main">Main Contractor</option>
                <option value="sub">Subcontractor</option>
              </select>
            </Field>
            <Field label="UEN">
              <input className="control" value={editing.uen} onChange={(event) => setEditing({ ...editing, uen: event.target.value })} required />
            </Field>
            <Field label="Focus">
              <input className="control" value={editing.focus} onChange={(event) => setEditing({ ...editing, focus: event.target.value })} />
            </Field>
            <Field label="Contact">
              <input className="control" value={editing.contactName} onChange={(event) => setEditing({ ...editing, contactName: event.target.value })} />
            </Field>
            <Field label="Phone">
              <input className="control" value={editing.phone} onChange={(event) => setEditing({ ...editing, phone: event.target.value })} />
            </Field>
            <Field label="Identity colour">
              <div className="flex flex-wrap gap-2" role="listbox" aria-label="Identity colour">
                {COMPANY_PALETTE.map((colour) => {
                  const selected = editing.color === colour.hex;
                  return (
                    <button
                      key={colour.id}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      title={colour.label}
                      className="h-9 w-9 rounded-full border-2"
                      style={{ background: colour.hex, borderColor: selected ? '#0f172a' : 'transparent' }}
                      onClick={() => setEditing({ ...editing, color: colour.hex })}
                    />
                  );
                })}
              </div>
            </Field>
            <div className="flex justify-end gap-2">
              <GhostButton type="button" onClick={() => setEditing(null)}>
                Cancel
              </GhostButton>
              <PrimaryButton type="submit">Save</PrimaryButton>
            </div>
          </form>
        ) : null}
      </Modal>
    </div>
  );
}
