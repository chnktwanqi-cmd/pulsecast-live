import { describe, expect, it } from 'vitest';
import { activatedRegistrationStatus, qrActive, REGISTRATION_AUDIT_ACTION, registrationLabel } from './approval';
import { canRegister } from './permissions';

describe('registration activation', () => {
  it('is active as soon as the Safety Officer submits', () => {
    expect(activatedRegistrationStatus()).toBe('approved');
    expect(qrActive(activatedRegistrationStatus())).toBe(true);
    expect(registrationLabel()).toBe('Active');
    expect(REGISTRATION_AUDIT_ACTION).toBe('Registered and activated by Safety Officer');
  });

  it('lets only the Safety Officer and Admin register', () => {
    expect(canRegister('Safety Officer')).toBe(true);
    expect(canRegister('Admin')).toBe(true);
    expect(canRegister('Safety Manager')).toBe(false);
    expect(canRegister('Project Director')).toBe(false);
  });
});
