import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { initialApprovalStatus, nextApprovalStatus } from '../domain/approval';
import { addDays } from '../domain/dates';
import { canManageContractors, canManageUsers, canRegister, canResetDemo, canToggleStrikeFlag } from '../domain/permissions';
import { canProposeStrike, currentStrikeLevel, nextStrikeStatus, openStrike } from '../domain/strikes';
import type {
  AppState,
  AppUser,
  ApprovalAction,
  Company,
  Role,
  StrikeDecision,
  TrainingRecord,
  Worker,
  WorkerDraft,
} from '../domain/types';
import { LocalWorkforceRepository } from './localRepository';

const repo = new LocalWorkforceRepository();

function uid(): string {
  return crypto.randomUUID();
}

export interface ActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

interface StoreValue {
  state: AppState;
  today: Date;
  actor: AppUser;
  toast: string | null;
  dismissToast: () => void;
  directoryQuery: string;
  setDirectoryQuery: (query: string) => void;
  setCurrentUser: (userId: string) => void;
  setProject: (projectId: string) => void;
  setPublicStrikeIndicator: (on: boolean) => void;
  resetDemo: () => ActionResult;
  registerWorker: (draft: WorkerDraft) => ActionResult;
  resubmitWorker: (workerId: string, draft: WorkerDraft, remarks: string) => ActionResult;
  decideRegistration: (
    workerId: string,
    action: Extract<ApprovalAction, 'approve' | 'reject' | 'request_changes'>,
    remarks: string,
  ) => ActionResult;
  saveTraining: (
    workerId: string,
    input: Omit<TrainingRecord, 'id' | 'workerId'> & { id?: string },
  ) => ActionResult;
  deleteTraining: (workerId: string, trainingId: string) => ActionResult;
  proposeStrike: (
    workerId: string,
    input: { reason: string; date: string; evidenceName: string },
  ) => ActionResult;
  decideStrike: (strikeId: string, action: StrikeDecision, remarks: string) => ActionResult;
  saveCompany: (company: Omit<Company, 'id'> & { id?: string }) => ActionResult;
  deleteCompany: (companyId: string) => ActionResult;
  updateUserRole: (userId: string, role: Role) => ActionResult;
}

const StoreContext = createContext<StoreValue | null>(null);

function actorOf(state: AppState): AppUser {
  return state.users.find((user) => user.id === state.currentUserId) ?? state.users[0];
}

function withAudit(state: AppState, action: string, target: string, detail: string): AppState {
  const actor = actorOf(state);
  return {
    ...state,
    audit: [
      {
        id: uid(),
        at: new Date().toISOString(),
        actor: actor.name,
        role: actor.role,
        action,
        target,
        detail,
      },
      ...state.audit,
    ].slice(0, 400),
  };
}

function nextWorkerId(workers: Worker[]): string {
  const max = workers.reduce((highest, worker) => {
    const value = Number(worker.id.replace('W-', ''));
    return Number.isFinite(value) ? Math.max(highest, value) : highest;
  }, 280);
  return `W-${String(max + 1).padStart(5, '0')}`;
}

function syncCsoc(worker: Worker, csocNumber: string, csocExpiry: string): Worker {
  const existing = worker.trainings.find((record) => record.course === 'CSOC');
  const trainings = existing
    ? worker.trainings.map((record) =>
        record.course === 'CSOC'
          ? { ...record, certificateNumber: csocNumber, expiry: csocExpiry, courseDate: addDays(csocExpiry, -365) }
          : record,
      )
    : [
        ...worker.trainings,
        {
          id: uid(),
          workerId: worker.id,
          course: 'CSOC' as const,
          courseDate: addDays(csocExpiry, -365),
          expiry: csocExpiry,
          certificateNumber: csocNumber,
        },
      ];
  return { ...worker, csocNumber, csocExpiry, trainings };
}

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const [state, setState] = useState<AppState>(() => repo.load(today));
  const [toast, setToast] = useState<string | null>(null);
  const [directoryQuery, setDirectoryQuery] = useState('');

  useEffect(() => {
    repo.save(state);
  }, [state]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const api = useMemo<StoreValue>(() => {
    const actor = actorOf(state);

    const update = (recipe: (current: AppState) => AppState) => {
      setState((current) => recipe(current));
    };

    return {
      state,
      today,
      actor,
      toast,
      dismissToast: () => setToast(null),
      directoryQuery,
      setDirectoryQuery,
      setCurrentUser: (userId) => {
        const nextUser = state.users.find((user) => user.id === userId);
        if (!nextUser) return;
        update((current) =>
          withAudit(
            { ...current, currentUserId: userId },
            'Role switched',
            nextUser.role,
            `${nextUser.name} is now the active demo role.`,
          ),
        );
        setToast(`Acting as ${nextUser.role}`);
      },
      setProject: (projectId) => {
        update((current) => ({ ...current, currentProjectId: projectId }));
      },
      setPublicStrikeIndicator: (on) => {
        if (!canToggleStrikeFlag(actor.role)) {
          setToast('Only a Safety Manager or Admin can change this flag.');
          return;
        }
        update((current) =>
          withAudit(
            { ...current, publicStrikeIndicator: on },
            'Public strike indicator',
            'QR profile',
            on
              ? 'Colour-only strike dot switched on for the demo. Privacy approval is still pending.'
              : 'Colour-only strike dot hidden on the public QR page.',
          ),
        );
        setToast(on ? 'Public strike dot is on' : 'Public strike dot is hidden');
      },
      resetDemo: () => {
        if (!canResetDemo(actor.role)) return { ok: false, error: 'This role cannot reset the demo.' };
        const next = repo.reset(today);
        setState(next);
        setDirectoryQuery('');
        setToast('Demo data reset');
        return { ok: true };
      },
      registerWorker: (draft) => {
        if (!canRegister(actor.role)) return { ok: false, error: 'This role cannot register workers.' };
        const id = nextWorkerId(state.workers);
        const worker: Worker = {
          id,
          publicToken: `qs${uid().replace(/-/g, '').slice(0, 10)}`,
          firstName: draft.firstName.trim(),
          lastName: draft.lastName.trim(),
          avatarIndex: state.workers.length,
          companyId: draft.companyId,
          projectId: draft.projectId,
          designation: draft.designation,
          trade: draft.trade,
          nationality: draft.nationality,
          nricMasked: draft.nricMasked.toUpperCase(),
          dob: draft.dob,
          phone: draft.phone.trim(),
          address: draft.address.trim(),
          workPermitNumber: draft.workPermitNumber.trim(),
          workPermitExpiry: draft.workPermitExpiry,
          csocNumber: draft.csocNumber.trim(),
          csocExpiry: draft.csocExpiry,
          siteInduction: draft.siteInduction,
          approvalStatus: initialApprovalStatus(),
          approvalTrail: [
            {
              id: uid(),
              at: new Date().toISOString(),
              role: actor.role,
              actor: actor.name,
              action: 'submit',
              remarks: 'Registration submitted for review. Not auto-approved.',
              from: 'pending_personnel',
              to: 'pending_personnel',
            },
          ],
          trainings: [],
          strikes: [],
          nextOfKin: draft.nextOfKin,
          createdAt: new Date().toISOString(),
        };
        const withCourse = syncCsoc(worker, worker.csocNumber, worker.csocExpiry);
        update((current) =>
          withAudit(
            { ...current, workers: [...current.workers, withCourse] },
            'Registration submitted',
            `${withCourse.firstName} ${withCourse.lastName}`,
            'Status set to Pending Review. QR stays inactive until all three approvals.',
          ),
        );
        setToast(`${withCourse.firstName} ${withCourse.lastName} is Pending Review`);
        return { ok: true, id };
      },
      resubmitWorker: (workerId, draft, remarks) => {
        const worker = state.workers.find((item) => item.id === workerId);
        if (!worker) return { ok: false, error: 'Worker not found.' };
        const next = nextApprovalStatus(worker.approvalStatus, actor.role, 'resubmit');
        if (!next) return { ok: false, error: 'This registration cannot be resubmitted by the current role.' };
        if (!remarks.trim()) return { ok: false, error: 'Add a remark for the resubmission.' };
        update((current) => {
          const workers = current.workers.map((item) => {
            if (item.id !== workerId) return item;
            const patched = syncCsoc(
              {
                ...item,
                firstName: draft.firstName.trim(),
                lastName: draft.lastName.trim(),
                nationality: draft.nationality,
                nricMasked: draft.nricMasked.toUpperCase(),
                dob: draft.dob,
                phone: draft.phone.trim(),
                address: draft.address.trim(),
                companyId: draft.companyId,
                projectId: draft.projectId,
                designation: draft.designation,
                trade: draft.trade,
                siteInduction: draft.siteInduction,
                workPermitNumber: draft.workPermitNumber.trim(),
                workPermitExpiry: draft.workPermitExpiry,
                nextOfKin: draft.nextOfKin,
                approvalStatus: next,
                approvalTrail: [
                  ...item.approvalTrail,
                  {
                    id: uid(),
                    at: new Date().toISOString(),
                    role: actor.role,
                    actor: actor.name,
                    action: 'resubmit' as const,
                    remarks: remarks.trim(),
                    from: item.approvalStatus,
                    to: next,
                  },
                ],
              },
              draft.csocNumber.trim(),
              draft.csocExpiry,
            );
            return patched;
          });
          return withAudit(
            { ...current, workers },
            'Registration resubmitted',
            `${draft.firstName} ${draft.lastName}`,
            remarks.trim(),
          );
        });
        setToast('Resubmitted as Pending Review');
        return { ok: true, id: workerId };
      },
      decideRegistration: (workerId, action, remarks) => {
        const worker = state.workers.find((item) => item.id === workerId);
        if (!worker) return { ok: false, error: 'Worker not found.' };
        if ((action === 'reject' || action === 'request_changes') && remarks.trim().length < 3) {
          return { ok: false, error: 'Remarks are required for this decision.' };
        }
        const next = nextApprovalStatus(worker.approvalStatus, actor.role, action);
        if (!next) return { ok: false, error: 'This role cannot act on the current approval stage.' };
        const note = remarks.trim() || 'Approved at this stage.';
        update((current) => {
          const workers = current.workers.map((item) =>
            item.id === workerId
              ? {
                  ...item,
                  approvalStatus: next,
                  approvalTrail: [
                    ...item.approvalTrail,
                    {
                      id: uid(),
                      at: new Date().toISOString(),
                      role: actor.role,
                      actor: actor.name,
                      action,
                      remarks: note,
                      from: item.approvalStatus,
                      to: next,
                    },
                  ],
                }
              : item,
          );
          return withAudit(
            { ...current, workers },
            `Registration ${action.replace('_', ' ')}`,
            `${worker.firstName} ${worker.lastName}`,
            note,
          );
        });
        setToast(next === 'approved' ? 'Approved. Helmet QR is now active.' : 'Decision recorded');
        return { ok: true };
      },
      saveTraining: (workerId, input) => {
        const worker = state.workers.find((item) => item.id === workerId);
        if (!worker) return { ok: false, error: 'Worker not found.' };
        if (!input.certificateNumber.trim() || !input.courseDate || !input.expiry) {
          return { ok: false, error: 'Course date, expiry and certificate number are required.' };
        }
        update((current) => {
          const workers = current.workers.map((item) => {
            if (item.id !== workerId) return item;
            const id = input.id || uid();
            const record: TrainingRecord = {
              id,
              workerId,
              course: input.course,
              courseDate: input.courseDate,
              expiry: input.expiry,
              certificateNumber: input.certificateNumber.trim(),
            };
            const exists = item.trainings.some((entry) => entry.id === id);
            let trainings = exists
              ? item.trainings.map((entry) => (entry.id === id ? record : entry))
              : [...item.trainings, record];
            let nextWorker = { ...item, trainings };
            if (record.course === 'CSOC') nextWorker = syncCsoc(nextWorker, record.certificateNumber, record.expiry);
            return nextWorker;
          });
          return withAudit(
            { ...current, workers },
            input.id ? 'Training updated' : 'Training added',
            `${worker.firstName} ${worker.lastName}`,
            `${input.course} · ${input.certificateNumber.trim()}`,
          );
        });
        setToast('Training record saved');
        return { ok: true };
      },
      deleteTraining: (workerId, trainingId) => {
        const worker = state.workers.find((item) => item.id === workerId);
        if (!worker) return { ok: false, error: 'Worker not found.' };
        update((current) =>
          withAudit(
            {
              ...current,
              workers: current.workers.map((item) =>
                item.id === workerId
                  ? { ...item, trainings: item.trainings.filter((record) => record.id !== trainingId) }
                  : item,
              ),
            },
            'Training removed',
            `${worker.firstName} ${worker.lastName}`,
            trainingId,
          ),
        );
        setToast('Training record removed');
        return { ok: true };
      },
      proposeStrike: (workerId, input) => {
        if (!canProposeStrike(actor.role)) return { ok: false, error: 'This role cannot propose strikes.' };
        const worker = state.workers.find((item) => item.id === workerId);
        if (!worker) return { ok: false, error: 'Worker not found.' };
        if (worker.approvalStatus !== 'approved') {
          return { ok: false, error: 'Strikes can be proposed only for an approved worker.' };
        }
        if (openStrike(worker.strikes)) return { ok: false, error: 'A strike is already awaiting approval.' };
        const level = currentStrikeLevel(worker.strikes);
        if (level >= 3) return { ok: false, error: 'This worker is already at Strike 3.' };
        if (input.reason.trim().length < 8) return { ok: false, error: 'Describe the reason in a short sentence.' };
        if (!input.evidenceName.trim()) return { ok: false, error: 'Add an evidence filename placeholder.' };
        const nextLevel = (level + 1) as 1 | 2 | 3;
        const strikeId = uid();
        update((current) => {
          const workers = current.workers.map((item) =>
            item.id === workerId
              ? {
                  ...item,
                  strikes: [
                    ...item.strikes,
                    {
                      id: strikeId,
                      workerId,
                      level: nextLevel,
                      reason: input.reason.trim(),
                      date: input.date,
                      evidenceName: input.evidenceName.trim(),
                      issuer: actor.name,
                      issuerRole: actor.role,
                      status: 'pending_manager' as const,
                      trail: [
                        {
                          id: uid(),
                          at: new Date().toISOString(),
                          role: actor.role,
                          actor: actor.name,
                          action: 'propose' as const,
                          remarks: input.reason.trim(),
                          from: 'new' as const,
                          to: 'pending_manager' as const,
                        },
                      ],
                    },
                  ],
                }
              : item,
          );
          return withAudit(
            { ...current, workers },
            'Strike proposed',
            `${worker.firstName} ${worker.lastName}`,
            `Strike ${nextLevel} awaiting Safety Manager. It does not count yet.`,
          );
        });
        setToast(`Strike ${nextLevel} proposed. It does not count until both approvals.`);
        return { ok: true, id: strikeId };
      },
      decideStrike: (strikeId, action, remarks) => {
        const worker = state.workers.find((item) => item.strikes.some((strike) => strike.id === strikeId));
        const strike = worker?.strikes.find((item) => item.id === strikeId);
        if (!worker || !strike) return { ok: false, error: 'Strike not found.' };
        if (action === 'reject' && remarks.trim().length < 3) {
          return { ok: false, error: 'Remarks are required to reject a strike.' };
        }
        const next = nextStrikeStatus(strike.status, actor.role, action);
        if (!next) return { ok: false, error: 'This role cannot decide the strike at its current stage.' };
        const note = remarks.trim() || 'Approved.';
        update((current) => {
          const workers = current.workers.map((item) =>
            item.id !== worker.id
              ? item
              : {
                  ...item,
                  strikes: item.strikes.map((entry) =>
                    entry.id !== strikeId
                      ? entry
                      : {
                          ...entry,
                          status: next,
                          trail: [
                            ...entry.trail,
                            {
                              id: uid(),
                              at: new Date().toISOString(),
                              role: actor.role,
                              actor: actor.name,
                              action,
                              remarks: note,
                              from: entry.status,
                              to: next,
                            },
                          ],
                        },
                  ),
                },
          );
          return withAudit(
            { ...current, workers },
            `Strike ${action}`,
            `${worker.firstName} ${worker.lastName}`,
            next === 'approved' ? `${note} Strike now counts.` : note,
          );
        });
        setToast(next === 'approved' ? 'Strike approved and now counts' : 'Strike decision recorded');
        return { ok: true };
      },
      saveCompany: (company) => {
        if (!canManageContractors(actor.role)) return { ok: false, error: 'This role cannot edit contractors.' };
        if (!company.name.trim() || !company.uen.trim()) return { ok: false, error: 'Name and UEN are required.' };
        const id = company.id || `c-${uid().slice(0, 8)}`;
        const nextCompany: Company = {
          id,
          name: company.name.trim(),
          kind: company.kind,
          uen: company.uen.trim(),
          focus: company.focus.trim(),
          contactName: company.contactName.trim(),
          phone: company.phone.trim(),
        };
        update((current) => {
          const exists = current.companies.some((item) => item.id === id);
          const companies = exists
            ? current.companies.map((item) => (item.id === id ? nextCompany : item))
            : [...current.companies, nextCompany];
          return withAudit(
            { ...current, companies },
            exists ? 'Contractor updated' : 'Contractor added',
            nextCompany.name,
            nextCompany.focus || nextCompany.kind,
          );
        });
        setToast('Contractor saved');
        return { ok: true, id };
      },
      deleteCompany: (companyId) => {
        if (!canManageContractors(actor.role)) return { ok: false, error: 'This role cannot delete contractors.' };
        if (state.workers.some((worker) => worker.companyId === companyId)) {
          return { ok: false, error: 'Reassign or remove workers before deleting this contractor.' };
        }
        const company = state.companies.find((item) => item.id === companyId);
        update((current) =>
          withAudit(
            { ...current, companies: current.companies.filter((item) => item.id !== companyId) },
            'Contractor deleted',
            company?.name ?? companyId,
            'Removed from the demo directory.',
          ),
        );
        setToast('Contractor removed');
        return { ok: true };
      },
      updateUserRole: (userId, role) => {
        if (!canManageUsers(actor.role)) return { ok: false, error: 'Only Admin can change user roles.' };
        const admins = state.users.filter((user) => user.role === 'Admin' && user.id !== userId);
        const target = state.users.find((user) => user.id === userId);
        if (target?.role === 'Admin' && role !== 'Admin' && admins.length === 0) {
          return { ok: false, error: 'Keep at least one Admin.' };
        }
        update((current) =>
          withAudit(
            {
              ...current,
              users: current.users.map((user) => (user.id === userId ? { ...user, role } : user)),
            },
            'User role changed',
            target?.name ?? userId,
            role,
          ),
        );
        setToast('Role updated');
        return { ok: true };
      },
    };
  }, [state, today, toast, directoryQuery]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useDemo(): StoreValue {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useDemo must be used inside DemoStoreProvider');
  return value;
}
