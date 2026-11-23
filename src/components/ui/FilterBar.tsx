import type { ReactNode, SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export function FilterBar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-col gap-3 lg:flex-row lg:items-center', className)}>{children}</div>;
}

export function FilterSelect({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-11 rounded-2xl border border-slate-200/80 bg-white/85 px-3 text-sm font-medium text-slate-700 outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100',
        className,
      )}
      {...props}
    />
  );
}
