/**
 * SiteSafe liquid-glass tokens.
 * Retune the palette here. `applyTokens` pushes the same values into CSS variables
 * used by the mesh background, so pages do not hard-code a second palette.
 */
export const tokens = {
  color: {
    ink: '#1E1B4B',
    muted: '#64748B',
    pink: '#EC4899',
    pinkSoft: '#F9A8D4',
    purple: '#7C3AED',
    lilac: '#A78BFA',
    blue: '#3B82F6',
    sky: '#93C5FD',
    canvas: '#F7F4FC',
    white: '#FFFFFF',
  },
  radius: {
    card: '1.5rem',
    shell: '1.75rem',
    control: '1rem',
    pill: '999px',
  },
  blur: '24px',
  shadow: {
    glass: '0 24px 60px -28px rgba(88, 28, 135, 0.28)',
    card: '0 16px 40px -24px rgba(76, 29, 149, 0.32)',
  },
  strike: {
    0: { bg: '#E7F8EE', text: '#178A4A', dot: '#22C55E', label: 'No Strike' },
    1: { bg: '#FFF4CC', text: '#A16207', dot: '#EAB308', label: 'Strike 1' },
    2: { bg: '#FFE6D0', text: '#C2410C', dot: '#F97316', label: 'Strike 2' },
    3: { bg: '#FFE0E7', text: '#E11D48', dot: '#F43F5E', label: 'Strike 3' },
  },
  expiry: {
    green: { bg: '#E7F8EE', text: '#178A4A', dot: '#22C55E', label: 'Valid' },
    yellow: { bg: '#FFF4CC', text: '#A16207', dot: '#EAB308', label: 'Expiring' },
    orange: { bg: '#FFE6D0', text: '#C2410C', dot: '#F97316', label: 'Due soon' },
    red: { bg: '#FFE0E7', text: '#E11D48', dot: '#F43F5E', label: 'Expired' },
  },
  avatar: [
    'linear-gradient(135deg,#60A5FA,#818CF8)',
    'linear-gradient(135deg,#E879F9,#A855F7)',
    'linear-gradient(135deg,#FB923C,#FB7185)',
    'linear-gradient(135deg,#22D3EE,#3B82F6)',
    'linear-gradient(135deg,#A78BFA,#7C3AED)',
    'linear-gradient(135deg,#818CF8,#6366F1)',
    'linear-gradient(135deg,#818CF8,#60A5FA)',
    'linear-gradient(135deg,#2DD4BF,#22D3EE)',
    'linear-gradient(135deg,#F472B6,#C084FC)',
    'linear-gradient(135deg,#FBBF24,#FB923C)',
  ],
} as const;

export type StrikeLevel = 0 | 1 | 2 | 3;

export function applyTokens(target: HTMLElement = document.documentElement) {
  const c = tokens.color;
  target.style.setProperty('--c-ink', c.ink);
  target.style.setProperty('--c-muted', c.muted);
  target.style.setProperty('--c-pink', c.pink);
  target.style.setProperty('--c-pink-soft', c.pinkSoft);
  target.style.setProperty('--c-purple', c.purple);
  target.style.setProperty('--c-lilac', c.lilac);
  target.style.setProperty('--c-blue', c.blue);
  target.style.setProperty('--c-sky', c.sky);
  target.style.setProperty('--c-canvas', c.canvas);
  target.style.setProperty('--shadow-glass', tokens.shadow.glass);
  target.style.setProperty('--shadow-card', tokens.shadow.card);
  target.style.setProperty('--radius-card', tokens.radius.card);
  target.style.setProperty('--blur', tokens.blur);
}
