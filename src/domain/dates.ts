export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(date: Date | string, days: number): string {
  const base = typeof date === 'string' ? parseISODate(date) : startOfDay(date);
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return toISODate(next);
}

export function daysBetween(target: string | Date, today: Date): number {
  const end = startOfDay(typeof target === 'string' ? parseISODate(target) : target);
  const start = startOfDay(today);
  const ms = 24 * 60 * 60 * 1000;
  return Math.round((end.getTime() - start.getTime()) / ms);
}

export function formatDate(iso: string): string {
  if (!iso) return '—';
  const date = parseISODate(iso);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${formatDate(toISODate(date))} ${hh}:${mm}`;
}

export function monthKey(date: Date | string): string {
  const value = typeof date === 'string' ? new Date(date) : date;
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}`;
}

export function ageInYears(dob: string, today: Date): number {
  const born = parseISODate(dob);
  let age = today.getFullYear() - born.getFullYear();
  const month = today.getMonth() - born.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < born.getDate())) age -= 1;
  return age;
}

export function isoDaysAgo(today: Date, days: number, hour = 9): string {
  const date = startOfDay(today);
  date.setDate(date.getDate() - days);
  date.setHours(hour, 12, 0, 0);
  return date.toISOString();
}
