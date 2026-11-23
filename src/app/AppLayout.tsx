import { Bell, ChevronDown, Menu, Search, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';
import { Drawer } from '../components/ui/Drawer';
import { useDemo } from '../data/store';
import { cn } from '../lib/cn';
import { NAV } from './nav';

function Sidebar({
  onNavigate,
  pendingStrikes,
}: {
  onNavigate?: () => void;
  pendingStrikes: number;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-4 pt-6">
        <Logo />
      </div>
      <div className="px-5 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Workspace</div>
      <nav className="flex-1 space-y-1 overflow-auto px-3">
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : false}
              onClick={onNavigate}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                  isActive ? 'bg-pink-50 text-pink-600' : 'text-slate-600 hover:bg-white/70',
                )
              }
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
              <span className="flex-1">{item.label}</span>
              {'badge' in item && item.badge && pendingStrikes > 0 ? (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-pink-100 px-1.5 text-[11px] font-bold text-pink-600">
                  {pendingStrikes}
                </span>
              ) : null}
            </NavLink>
          );
        })}
      </nav>
      <div className="m-3 rounded-2xl border border-white bg-gradient-to-br from-pink-50 via-white to-violet-50 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-bold leading-snug text-slate-900">Safety starts with every worker.</p>
          <Sparkles className="h-4 w-4 shrink-0 text-violet-400" />
        </div>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          One secure workspace for worker profiles, training and site management.
        </p>
        <Link
          to="/qr"
          onClick={onNavigate}
          className="mt-3 inline-flex rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm"
        >
          Explore QR IDs →
        </Link>
      </div>
    </div>
  );
}

export function AppLayout() {
  const { state, actor, setCurrentUser, setProject, toast, dismissToast, setDirectoryQuery } = useDemo();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [roleOpen, setRoleOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);

  const project = state.projects.find((item) => item.id === state.currentProjectId);
  const scoped = state.currentProjectId === 'all'
    ? state.workers
    : state.workers.filter((worker) => worker.projectId === state.currentProjectId);

  const pendingStrikes = scoped.reduce(
    (count, worker) =>
      count + worker.strikes.filter((strike) => strike.status === 'pending_manager' || strike.status === 'pending_director').length,
    0,
  );

  const notices = useMemo(() => {
    const items: { id: string; title: string; body: string; to: string }[] = [];
    scoped.forEach((worker) => {
      worker.strikes.forEach((strike) => {
        const strikeWaiting =
          (strike.status === 'pending_manager' && actor.role === 'Safety Manager') ||
          (strike.status === 'pending_director' && actor.role === 'Project Director');
        if (strikeWaiting) {
          items.push({
            id: strike.id,
            title: `Strike ${strike.level} · ${worker.firstName} ${worker.lastName}`,
            body: 'Disciplinary approval is waiting on you. The strike does not count yet.',
            to: '/strikes',
          });
        }
      });
    });
    return items;
  }, [actor.role, scoped]);

  return (
    <div className="mesh">
      <div className="flex min-h-screen">
        <aside className="no-print sticky top-0 hidden h-screen w-[252px] shrink-0 border-r border-white/70 bg-white/75 backdrop-blur-xl lg:block">
          <Sidebar pendingStrikes={pendingStrikes} />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="no-print sticky top-0 z-30 flex items-center gap-3 px-4 py-4 backdrop-blur-md lg:px-8">
            <button
              className="grid h-11 w-11 place-items-center rounded-2xl bg-white/80 text-slate-600 shadow-sm lg:hidden"
              onClick={() => setNavOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <form
              className="relative min-w-0 flex-1"
              onSubmit={(event) => {
                event.preventDefault();
                setDirectoryQuery(query);
                navigate(`/workers?q=${encodeURIComponent(query)}`);
              }}
            >
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search workers, IDs, contractors..."
                className="h-11 w-full rounded-full border border-white/80 bg-white/75 pl-11 pr-4 text-sm outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-pink-100"
                aria-label="Search workers, IDs, contractors"
              />
            </form>
            <div className="relative">
              <button
                className="inline-flex h-11 items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 text-sm font-semibold text-slate-700 shadow-sm"
                onClick={() => {
                  setProjectOpen((open) => !open);
                  setRoleOpen(false);
                }}
                data-testid="project-switcher"
              >
                {project?.name ?? 'All projects'}
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
              {projectOpen ? (
                <>
                  <button className="fixed inset-0 z-20 cursor-default" aria-label="Close project menu" onClick={() => setProjectOpen(false)} />
                  <div className="absolute right-0 z-30 mt-2 w-52 overflow-hidden rounded-2xl border border-white bg-white/95 p-1 shadow-glass">
                    <button
                      className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-pink-50"
                      onClick={() => {
                        setProject('all');
                        setProjectOpen(false);
                      }}
                    >
                      All projects
                    </button>
                    {state.projects.map((item) => (
                      <button
                        key={item.id}
                        className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-pink-50"
                        onClick={() => {
                          setProject(item.id);
                          setProjectOpen(false);
                        }}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
            <button
              className="relative grid h-11 w-11 place-items-center rounded-full border border-white/80 bg-white/80 text-slate-600 shadow-sm"
              aria-label="Notifications"
              onClick={() => setBellOpen(true)}
            >
              <Bell className="h-4 w-4" />
              {notices.length > 0 ? <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-pink-500" /> : null}
            </button>
            <div className="relative">
              <button
                className="flex h-11 items-center gap-2 rounded-full border border-white/80 bg-white/80 pl-1.5 pr-3 shadow-sm"
                onClick={() => {
                  setRoleOpen((open) => !open);
                  setProjectOpen(false);
                }}
                data-testid="role-switcher"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-pink-500 to-violet-500 text-[11px] font-bold text-white">
                  {actor.initials}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-xs font-bold leading-tight text-slate-800">{actor.role}</span>
                  <span className="block text-[10px] leading-tight text-slate-400">Main Contractor</span>
                </span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
              {roleOpen ? (
                <>
                  <button className="fixed inset-0 z-20 cursor-default" aria-label="Close role menu" onClick={() => setRoleOpen(false)} />
                  <div className="absolute right-0 z-30 mt-2 w-72 overflow-hidden rounded-2xl border border-white bg-white/95 p-1 shadow-glass">
                    <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Demo role switcher
                    </p>
                    {state.users.map((user) => (
                      <button
                        key={user.id}
                        data-testid={`role-${user.role.toLowerCase().replace(/\s+/g, '-')}`}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-pink-50',
                          user.id === actor.id && 'bg-pink-50',
                        )}
                        onClick={() => {
                          setCurrentUser(user.id);
                          setRoleOpen(false);
                        }}
                      >
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
                          {user.initials}
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-slate-800">{user.role}</span>
                          <span className="block text-xs text-slate-400">{user.name}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </header>
          <main className="flex-1 px-4 pb-6 lg:px-8">
            <Outlet />
          </main>
          <footer className="no-print px-6 pb-6 text-center text-[11px] text-slate-400">
            SiteSafe Concept UI · Synthetic sample data · Liquid Glass Design · Not connected to production systems
          </footer>
        </div>
      </div>
      <Drawer open={navOpen} title="Workspace" onClose={() => setNavOpen(false)}>
        <Sidebar pendingStrikes={pendingStrikes} onNavigate={() => setNavOpen(false)} />
      </Drawer>
      <Drawer open={bellOpen} title="For this role" onClose={() => setBellOpen(false)}>
        {notices.length === 0 ? (
          <p className="text-sm text-slate-500">Nothing is waiting on {actor.role} right now.</p>
        ) : (
          <div className="space-y-2">
            {notices.map((notice) => (
              <Link
                key={notice.id}
                to={notice.to}
                onClick={() => setBellOpen(false)}
                className="block rounded-2xl border border-slate-100 bg-white px-4 py-3"
              >
                <div className="text-sm font-semibold text-slate-800">{notice.title}</div>
                <div className="mt-1 text-xs text-slate-500">{notice.body}</div>
              </Link>
            ))}
          </div>
        )}
      </Drawer>
      {toast ? (
        <button
          className="no-print fixed bottom-5 right-5 z-40 max-w-sm rounded-2xl bg-slate-900 px-4 py-3 text-left text-sm font-medium text-white shadow-xl"
          onClick={dismissToast}
        >
          {toast}
        </button>
      ) : null}
    </div>
  );
}
