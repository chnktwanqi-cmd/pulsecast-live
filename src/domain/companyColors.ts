/**
 * Contractor identity colours. Kept off the expiry and strike palette
 * (green / yellow / orange / red) so a company chip is never read as a status.
 */
export const COMPANY_PALETTE = [
  { id: 'navy', label: 'Navy', hex: '#1E3A5F' },
  { id: 'blue', label: 'Blue', hex: '#1D4ED8' },
  { id: 'sky', label: 'Sky', hex: '#0369A1' },
  { id: 'teal', label: 'Teal', hex: '#0F766E' },
  { id: 'cyan', label: 'Cyan', hex: '#155E75' },
  { id: 'violet', label: 'Violet', hex: '#5B21B6' },
  { id: 'indigo', label: 'Indigo', hex: '#3730A3' },
  { id: 'slate', label: 'Slate', hex: '#334155' },
] as const;

export type CompanyColor = (typeof COMPANY_PALETTE)[number]['hex'];

const STATUS_HEX = new Set(['#22c55e', '#eab308', '#f97316', '#f43f5e', '#178a4a', '#a16207', '#c2410c', '#e11d48']);

export function isIdentityColor(hex: string): boolean {
  return COMPANY_PALETTE.some((item) => item.hex.toLowerCase() === hex.toLowerCase());
}

export function identityColorsAvoidStatus(): boolean {
  return COMPANY_PALETTE.every((item) => !STATUS_HEX.has(item.hex.toLowerCase()));
}

/** WCAG contrast of white text on the colour. */
export function whiteContrast(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const channel = (value: number) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  return 1.05 / (luminance + 0.05);
}
