import type { Role } from './types';

export function canRegister(role: Role): boolean {
  return role === 'Safety Officer' || role === 'Admin';
}

export function canManageContractors(role: Role): boolean {
  return role === 'Safety Manager' || role === 'Project Director' || role === 'Admin';
}

export function canManageUsers(role: Role): boolean {
  return role === 'Admin';
}

export function canEditTraining(role: Role): boolean {
  return role === 'Safety Officer' || role === 'Admin';
}

export function canToggleStrikeFlag(role: Role): boolean {
  return role === 'Admin' || role === 'Safety Manager';
}

export function canResetDemo(role: Role): boolean {
  return role === 'Admin' || role === 'Safety Manager' || role === 'Safety Officer';
}
