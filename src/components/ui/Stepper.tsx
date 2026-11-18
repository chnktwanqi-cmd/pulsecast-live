import { Check } from 'lucide-react';
import { cn } from '../../lib/cn';

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex flex-wrap gap-2">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li
            key={step}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold',
              active && 'border-pink-200 bg-pink-50 text-pink-600',
              done && 'border-emerald-100 bg-emerald-50 text-emerald-700',
              !active && !done && 'border-slate-200 bg-white/70 text-slate-400',
            )}
          >
            <span
              className={cn(
                'grid h-5 w-5 place-items-center rounded-full text-[10px]',
                active && 'bg-pink-500 text-white',
                done && 'bg-emerald-500 text-white',
                !active && !done && 'bg-slate-100 text-slate-400',
              )}
            >
              {done ? <Check className="h-3 w-3" /> : index + 1}
            </span>
            {step}
          </li>
        );
      })}
    </ol>
  );
}
