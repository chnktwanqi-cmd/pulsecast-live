import type { ReactNode } from 'react';

export function PageHeader({
  eyebrow,
  title,
  accent,
  subtitle,
  actions,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{eyebrow}</p>
        <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-slate-900">
          {title}
          {accent ? <span className="gradient-text"> {accent}</span> : null}
        </h1>
        <div className="mt-2 h-1 w-14 rounded-full bg-gradient-to-r from-pink-500 to-violet-500" />
        <p className="mt-3 max-w-xl text-sm text-slate-500">{subtitle}</p>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
