import { useState } from 'react';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { GlassCard } from '../../components/ui/GlassCard';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { GhostButton, PrimaryButton } from '../../components/ui/Buttons';
import { useDemo } from '../../data/store';
import { formatDateTime } from '../../domain/dates';
import { canManageUsers, canResetDemo, canToggleStrikeFlag } from '../../domain/permissions';
import type { AuditEvent, Role } from '../../domain/types';

const ROLES: Role[] = ['Safety Officer', 'Safety Manager', 'Project Director', 'Admin'];

export function AdminPage() {
  const { state, actor, updateUserRole, setPublicStrikeIndicator, resetDemo } = useDemo();
  const [query, setQuery] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState('');
  const events = state.audit.filter((event) => {
    const haystack = `${event.action} ${event.actor} ${event.target} ${event.detail}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });
  const columns: Column<AuditEvent>[] = [
    { key: 'at', header: 'When', sortValue: (row) => row.at, render: (row) => formatDateTime(row.at) },
    { key: 'actor', header: 'Actor', sortValue: (row) => row.actor, render: (row) => `${row.actor} · ${row.role}` },
    { key: 'action', header: 'Action', sortValue: (row) => row.action, render: (row) => row.action },
    { key: 'target', header: 'Target', sortValue: (row) => row.target, render: (row) => row.target },
    { key: 'detail', header: 'Detail', render: (row) => <span className="text-slate-500">{row.detail}</span> },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="SYSTEM"
        title="Settings"
        accent="& Admin"
        subtitle="Role visibility, the privacy flag for the public strike dot, the audit log, and a reset for this demo."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard className="p-5">
          <h2 className="text-sm font-bold text-slate-800">Users and roles</h2>
          <p className="mt-1 text-xs text-slate-500">The top-bar switcher changes which actions are enabled. Admin can reassign the sample roles.</p>
          <ul className="mt-4 space-y-3">
            {state.users.map((user) => (
              <li key={user.id} className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-800">{user.name}</div>
                  <div className="text-xs text-slate-400">{user.email}</div>
                </div>
                <select
                  className="control !w-auto"
                  aria-label={`Role for ${user.name}`}
                  disabled={!canManageUsers(actor.role)}
                  value={user.role}
                  onChange={(event) => {
                    const result = updateUserRole(user.id, event.target.value as Role);
                    setError(result.ok ? '' : result.error ?? '');
                  }}
                >
                  {ROLES.map((role) => (
                    <option key={role}>{role}</option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        </GlassCard>
        <GlassCard className="p-5">
          <h2 className="text-sm font-bold text-slate-800">Public strike indicator</h2>
          <p className="mt-1 text-sm text-slate-500">
            Default is on for the demo only. Privacy approval is still pending. The public page shows a colour dot and never a reason, date or warning letter.
          </p>
          <label className="mt-4 flex items-center gap-3 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={state.publicStrikeIndicator}
              disabled={!canToggleStrikeFlag(actor.role)}
              onChange={(event) => setPublicStrikeIndicator(event.target.checked)}
            />
            PUBLIC_STRIKE_INDICATOR
          </label>
          {!canToggleStrikeFlag(actor.role) ? (
            <p className="mt-2 text-xs text-slate-400">Switch to Safety Manager or Admin to change the flag.</p>
          ) : null}
          <div className="mt-6 border-t border-slate-100 pt-4">
            <h3 className="text-sm font-bold text-slate-800">Reset demo data</h3>
            <p className="mt-1 text-xs text-slate-500">Clears local changes and reloads the fictional workforce relative to today.</p>
            <GhostButton className="mt-3" type="button" disabled={!canResetDemo(actor.role)} onClick={() => setConfirm(true)} data-testid="reset-demo">
              Reset demo data
            </GhostButton>
          </div>
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
        </GlassCard>
      </div>
      <GlassCard className="mt-4 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-sm font-bold text-slate-800">Audit log</h2>
          <input
            className="control md:max-w-xs"
            placeholder="Search the log"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search audit log"
          />
        </div>
        <div className="mt-3">
          <DataTable columns={columns} rows={events} rowKey={(row) => row.id} />
        </div>
      </GlassCard>
      <Modal open={confirm} title="Reset demo data?" subtitle="Local registrations, decisions and contractor edits will be replaced by the sample set." onClose={() => setConfirm(false)}>
        <div className="flex justify-end gap-2">
          <GhostButton type="button" onClick={() => setConfirm(false)}>
            Cancel
          </GhostButton>
          <PrimaryButton
            type="button"
            onClick={() => {
              const result = resetDemo();
              setError(result.ok ? '' : result.error ?? '');
              setConfirm(false);
            }}
          >
            Reset
          </PrimaryButton>
        </div>
      </Modal>
    </div>
  );
}
