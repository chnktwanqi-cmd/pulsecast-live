import { Shield } from 'lucide-react';
import { cn } from '../../lib/cn';

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 shadow-md shadow-pink-400/30">
        <Shield className="h-5 w-5 text-white" strokeWidth={2.2} />
      </div>
      <div className={cn(compact && 'sr-only')}>
        <div className="gradient-text text-[1.15rem] font-extrabold leading-none tracking-tight">SiteSafe</div>
        <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Workforce Safety Portal
        </div>
      </div>
    </div>
  );
}
