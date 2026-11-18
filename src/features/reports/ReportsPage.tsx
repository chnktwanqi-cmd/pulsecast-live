import { Printer } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { GhostButton } from '../../components/ui/Buttons';
import { GlassCard } from '../../components/ui/GlassCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { useDemo } from '../../data/store';
import { formatDateTime, monthKey } from '../../domain/dates';

export function ReportsPage() {
  const { state, today } = useDemo();
  const [month, setMonth] = useState(monthKey(today));
  const inMonth = (iso: string) => monthKey(iso) === month;

  const summary = useMemo(() => {
    const submitted = state.audit.filter((event) => inMonth(event.at) && event.action === 'Registration submitted').length;
    const approved = state.audit.filter((event) => inMonth(event.at) && event.action === 'Registration approve').length;
    const proposed = state.audit.filter((event) => inMonth(event.at) && event.action === 'Strike proposed').length;
    const strikes = state.audit.filter((event) => inMonth(event.at) && event.action === 'Strike approve' && event.detail.includes('now counts')).length;
    const training = state.workers.reduce(
      (count, worker) => count + worker.trainings.filter((record) => record.courseDate.startsWith(month)).length,
      0,
    );
    return { submitted, approved, proposed, strikes, training };
  }, [month, state.audit, state.workers]);

  const chart = [
    { name: 'Submitted', value: summary.submitted },
    { name: 'Approved', value: summary.approved },
    { name: 'Strikes proposed', value: summary.proposed },
    { name: 'Strikes counting', value: summary.strikes },
    { name: 'Courses dated', value: summary.training },
  ];
  const events = state.audit.filter((event) => inMonth(event.at)).slice(0, 40);

  return (
    <div>
      <PageHeader
        eyebrow="REPORTS · PRINTABLE"
        title="Monthly"
        accent="Safety"
        subtitle="Sample figures from the demo audit trail and training dates. Nothing here is a statutory submission."
        actions={
          <>
            <input className="control !w-auto" type="month" value={month} onChange={(event) => setMonth(event.target.value)} aria-label="Report month" />
            <GhostButton type="button" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print report
            </GhostButton>
          </>
        }
      />
      <div className="print-sheet space-y-4">
        <div className="grid gap-3 md:grid-cols-5">
          {chart.map((item) => (
            <GlassCard key={item.name} className="p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{item.name}</div>
              <div className="mt-1 text-3xl font-extrabold text-slate-900">{item.value}</div>
            </GlassCard>
          ))}
        </div>
        <GlassCard className="p-5">
          <h2 className="text-sm font-bold text-slate-800">Activity in {month}</h2>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart}>
                <CartesianGrid vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#c084fc" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
        <GlassCard className="p-5">
          <h2 className="text-sm font-bold text-slate-800">Audit extract</h2>
          <ul className="mt-3 space-y-2">
            {events.length === 0 ? <li className="text-sm text-slate-400">No demo events in this month. Try the current month.</li> : null}
            {events.map((event) => (
              <li key={event.id} className="rounded-2xl bg-white/70 px-3 py-2 text-sm">
                <span className="font-semibold text-slate-800">{event.action}</span>
                <span className="text-slate-500"> · {event.target} · {formatDateTime(event.at)}</span>
                <div className="text-xs text-slate-400">{event.detail}</div>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}
