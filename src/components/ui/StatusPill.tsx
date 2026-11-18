import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export function StatusPill({
  bg,
  color,
  children,
  className,
}: {
  bg: string;
  color: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', className)}
      style={{ background: bg, color }}
    >
      {children}
    </span>
  );
}
