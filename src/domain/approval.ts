import type { ApprovalAction, ApprovalStatus, Role } from './types';

const STAGE_ROLE: Partial<Record<ApprovalStatus, Role>> = {
  pending_personnel: 'Safety Personnel',
  pending_officer: 'Safety Officer',
  pending_manager: 'Safety Manager',
};

/** A submitted registration is never auto-approved. */
export function initialApprovalStatus(): ApprovalStatus {
  return 'pending_personnel';
}

export function canDecideRegistration(status: ApprovalStatus, role: Role, action: ApprovalAction): boolean {
  if (action === 'submit') return false;
  if (action === 'resubmit') {
    return (
      status === 'changes_requested' &&
      (role === 'Safety Personnel' || role === 'Safety Officer' || role === 'Safety Manager')
    );
  }
  if (action !== 'approve' && action !== 'reject' && action !== 'request_changes') return false;
  return STAGE_ROLE[status] === role;
}

export function nextApprovalStatus(
  status: ApprovalStatus,
  role: Role,
  action: ApprovalAction,
): ApprovalStatus | null {
  if (!canDecideRegistration(status, role, action)) return null;
  if (action === 'resubmit') return 'pending_personnel';
  if (action === 'reject') return 'rejected';
  if (action === 'request_changes') return 'changes_requested';
  if (status === 'pending_personnel') return 'pending_officer';
  if (status === 'pending_officer') return 'pending_manager';
  if (status === 'pending_manager') return 'approved';
  return null;
}

export function approvalLabel(status: ApprovalStatus): string {
  if (status === 'approved') return 'Approved';
  if (status === 'rejected') return 'Rejected';
  if (status === 'changes_requested') return 'Changes requested';
  return 'Pending Review';
}

export function approvalStageLabel(status: ApprovalStatus): string {
  switch (status) {
    case 'pending_personnel':
      return 'With Safety Personnel';
    case 'pending_officer':
      return 'With Safety Officer';
    case 'pending_manager':
      return 'With Safety Manager';
    case 'approved':
      return 'QR ID active';
    case 'rejected':
      return 'Closed';
    case 'changes_requested':
      return 'Waiting on resubmission';
  }
}

export function qrActive(status: ApprovalStatus): boolean {
  return status === 'approved';
}
