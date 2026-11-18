export function personInitials(first: string, last: string): string {
  const a = first.trim().split(/\s+/)[0]?.[0] ?? '';
  const b = last.trim().split(/\s+/)[0]?.[0] ?? '';
  return `${a}${b}`.toUpperCase();
}
