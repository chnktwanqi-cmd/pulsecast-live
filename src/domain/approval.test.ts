import { describe, expect, it } from 'vitest';
import { initialApprovalStatus, nextApprovalStatus } from './approval';

describe('registration approval', () => {
  it('starts at Pending Review and never auto-approves', () => {
    expect(initialApprovalStatus()).toBe('pending_personnel');
    expect(initialApprovalStatus()).not.toBe('approved');
  });

  it('walks Personnel, Officer, then Manager before Approved', () => {
    const officer = nextApprovalStatus('pending_personnel', 'Safety Personnel', 'approve');
    const manager = nextApprovalStatus(officer!, 'Safety Officer', 'approve');
    const approved = nextApprovalStatus(manager!, 'Safety Manager', 'approve');
    expect(officer).toBe('pending_officer');
    expect(manager).toBe('pending_manager');
    expect(approved).toBe('approved');
  });

  it('rejects a role acting out of turn', () => {
    expect(nextApprovalStatus('pending_personnel', 'Safety Officer', 'approve')).toBeNull();
    expect(nextApprovalStatus('pending_officer', 'Safety Manager', 'approve')).toBeNull();
    expect(nextApprovalStatus('pending_manager', 'Project Director', 'approve')).toBeNull();
    expect(nextApprovalStatus('approved', 'Safety Manager', 'approve')).toBeNull();
  });

  it('supports reject, request changes, and resubmit', () => {
    expect(nextApprovalStatus('pending_officer', 'Safety Officer', 'reject')).toBe('rejected');
    expect(nextApprovalStatus('pending_personnel', 'Safety Personnel', 'request_changes')).toBe(
      'changes_requested',
    );
    expect(nextApprovalStatus('changes_requested', 'Safety Officer', 'resubmit')).toBe('pending_personnel');
    expect(nextApprovalStatus('changes_requested', 'Project Director', 'resubmit')).toBeNull();
    expect(nextApprovalStatus('rejected', 'Safety Personnel', 'approve')).toBeNull();
  });
});
