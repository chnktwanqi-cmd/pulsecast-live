import { Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlassCard } from '../../components/ui/GlassCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { useDemo } from '../../data/store';

export function EmergencyPage() {
  const { state } = useDemo();
  return (
    <div>
      <PageHeader
        eyebrow="SITE DIRECTORY"
        title="Emergency"
        accent="Contacts"
        subtitle="Fictional site numbers for the sample project, plus the public national emergency numbers. Next of kin stays on the internal worker profile."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {state.siteContacts.map((contact) => (
          <GlassCard key={contact.id} className="p-5">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-pink-50 text-pink-600">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{contact.name}</h2>
                <p className="text-sm text-slate-500">{contact.role}</p>
                <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{contact.phone}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {contact.hours} · {contact.notes}
                </p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
      <GlassCard className="mt-4 p-5">
        <h2 className="text-sm font-bold text-slate-800">Next of kin</h2>
        <p className="mt-1 text-sm text-slate-500">
          Household contacts are stored on each internal worker profile and are omitted from the public QR page.{' '}
          <Link className="font-semibold text-pink-600" to="/workers">
            Open the Worker Registry
          </Link>
          .
        </p>
      </GlassCard>
    </div>
  );
}
