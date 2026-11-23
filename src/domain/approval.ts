import type { ApprovalStatus } from './types';

/** Audit action written when the Safety Officer (or Admin) keys in a worker. */
export const REGISTRATION_AUDIT_ACTION = 'Registered and activated by Safety Officer';

/**
 * A registration keyed by the Safety Officer is active immediately.
 * This replaces the earlier three-stage review. Helmet QR is on at submit.
 */
export function activatedRegistrationStatus(): ApprovalStatus {
  return 'approved';
}

export function registrationLabel(): string {
  return 'Active';
}

export function qrActive(status: ApprovalStatus): boolean {
  return status === 'approved';
}
