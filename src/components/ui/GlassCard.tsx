import type { CSSProperties, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export function GlassCard({
  className,
  children,
  style,
}: {
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-white/80 bg-white/60 shadow-glass backdrop-blur-xl',
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}
