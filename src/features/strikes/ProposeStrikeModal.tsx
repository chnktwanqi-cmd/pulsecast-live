import { useState } from 'react';
import { GhostButton, PrimaryButton } from '../../components/ui/Buttons';
import { Field } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { useDemo } from '../../data/store';
import { toISODate } from '../../domain/dates';
import { currentStrikeLevel, openStrike } from '../../domain/strikes';
import type { Worker } from '../../domain/types';

export function ProposeStrikeModal({
  worker,
  open,
  onClose,
}: {
  worker: Worker | null;
  open: boolean;
  onClose: () => void;
}) {
  const { proposeStrike, today } = useDemo();
  const [reason, setReason] = useState('');
  const [evidenceName, setEvidenceName] = useState('');
  const [date, setDate] = useState(toISODate(today));
  const [error, setError] = useState('');

  if (!worker) return null;
  const level = currentStrikeLevel(worker.strikes);
  const blocked = worker.approvalStatus !== 'approved' || Boolean(openStrike(worker.strikes)) || level >= 3;

  return (
    <Modal
      open={open}
      title={`Propose Strike ${Math.min(3, level + 1)}`}
      subtitle={`${worker.firstName} ${worker.lastName} · this stays internal until both approvals, and the reason never reaches the public QR page.`}
      onClose={onClose}
    >
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          const result = proposeStrike(worker.id, { reason, date, evidenceName });
          if (!result.ok) {
            setError(result.error ?? 'Could not propose.');
            return;
          }
          setReason('');
          setEvidenceName('');
          setError('');
          onClose();
        }}
      >
        <Field label="Date">
          <input className="control" type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
        </Field>
        <Field label="Reason" hint="Internal only. Safety Manager and Project Director both have to approve before it counts.">
          <textarea
            className="min-h-24 w-full rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2 text-sm outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            required
          />
        </Field>
        <Field label="Evidence placeholder" hint="Filename only. Nothing is uploaded.">
          <input
            className="control"
            placeholder="warning-letter.pdf"
            value={evidenceName}
            onChange={(event) => setEvidenceName(event.target.value)}
            required
          />
        </Field>
        {blocked ? <p className="text-sm text-amber-700">This worker cannot take a new strike right now.</p> : null}
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <div className="flex justify-end gap-2 pt-2">
          <GhostButton type="button" onClick={onClose}>
            Cancel
          </GhostButton>
          <PrimaryButton type="submit" disabled={blocked}>
            Propose strike
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
