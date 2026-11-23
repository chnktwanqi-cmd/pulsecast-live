import { useEffect, useState } from 'react';
import { PrimaryButton, GhostButton } from '../../components/ui/Buttons';
import { Field } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { useDemo } from '../../data/store';
import { COURSES } from '../../domain/options';
import type { CourseCode, TrainingRecord, Worker } from '../../domain/types';

export function TrainingModal({
  open,
  worker,
  initial,
  course: preferredCourse,
  onClose,
}: {
  open: boolean;
  worker: Worker | null;
  initial?: TrainingRecord | null;
  course?: CourseCode;
  onClose: () => void;
}) {
  const { saveTraining } = useDemo();
  const [course, setCourse] = useState<CourseCode>('SIC');
  const [courseDate, setCourseDate] = useState('');
  const [expiry, setExpiry] = useState('');
  const [certificateNumber, setCertificateNumber] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setCourse(initial?.course ?? preferredCourse ?? 'SIC');
    setCourseDate(initial?.courseDate ?? '');
    setExpiry(initial?.expiry ?? '');
    setCertificateNumber(initial?.certificateNumber ?? '');
    setError('');
  }, [open, initial?.id, initial?.course, initial?.courseDate, initial?.expiry, initial?.certificateNumber, preferredCourse]);

  if (!worker) return null;

  return (
    <Modal
      open={open}
      title={initial ? 'Edit training record' : 'Add training record'}
      subtitle={`${worker.firstName} ${worker.lastName} · fictional certificate numbers only`}
      onClose={onClose}
    >
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          const result = saveTraining(worker.id, {
            id: initial?.id,
            course,
            courseDate,
            expiry,
            certificateNumber,
          });
          if (!result.ok) {
            setError(result.error ?? 'Could not save.');
            return;
          }
          onClose();
        }}
      >
        <Field label="Course">
          <select className="control" value={course} onChange={(event) => setCourse(event.target.value as CourseCode)}>
            {COURSES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Course date">
            <input className="control" type="date" value={courseDate} onChange={(event) => setCourseDate(event.target.value)} required />
          </Field>
          <Field label="Expiry">
            <input className="control" type="date" value={expiry} onChange={(event) => setExpiry(event.target.value)} required />
          </Field>
        </div>
        <Field label="Certificate number" hint="Use an obvious demo number such as SIC-DEMO-00991.">
          <input className="control" value={certificateNumber} onChange={(event) => setCertificateNumber(event.target.value)} required />
        </Field>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <div className="flex justify-end gap-2 pt-2">
          <GhostButton type="button" onClick={onClose}>
            Cancel
          </GhostButton>
          <PrimaryButton type="submit">Save record</PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
