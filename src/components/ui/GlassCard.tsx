import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export function GlassCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-white/80 bg-white/60 shadow-glass backdrop-blur-xl',
        className,
      )}
    >
      {children}
    </div>
  );
}
