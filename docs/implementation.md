# SiteSafe prototype — implementation notes

This document expands the README for someone picking the prototype up before a backend exists.

## What the prototype is

A Vite + React + TypeScript app styled with Tailwind. Routing is React Router. Charts are Recharts. Helmet stickers use `qrcode.react`. Icons are `lucide-react`. State is in memory and mirrored to `localStorage`. Vitest covers the pure rules.

There is no server, no login, and no persistence beyond the browser. The role switcher is a demo of permissions, not authentication.

## Visual system

The owner’s concept screens set the shell: a pale pink / lilac / blue mesh, a white translucent sidebar, a gradient wordmark and a gradient accent on the page title. Tokens live in `src/config/tokens.ts`.

| Token group | Use |
| --- | --- |
| `color` | Ink, muted text, pink, purple, blue. Copied to CSS variables for the mesh. |
| `radius`, `blur`, `shadow` | Glass cards and worker cards. |
| `strike` | No Strike green, Strike 1 yellow, Strike 2 orange, Strike 3 red. Background, text and dot. |
| `expiry` | Same four colours for pass and course dates. |
| `avatar` | Gradient list for initials. The first eight match the concept cast. |

Reusable components in `src/components/ui`:

- `GlassCard` — translucent panel
- `StatusPill`, `StrikeBadge`, `ExpiryBadge` — text plus colour
- `Modal`, `Drawer`
- `DataTable` — sortable columns
- `FilterBar`, `FilterSelect`
- `Stepper` — registration steps
- `Avatar`, `Logo`, `PageHeader`, `Field`, buttons

Internal screens never use colour alone for status. The public strike value is the exception, and it is gated.

## Routes

| Path | Screen |
| --- | --- |
| `/` | Overview: KPIs, charts, worker grid with expiry filter |
| `/workers` | Worker Registry |
| `/workers/new` | Multi-step registration |
| `/workers/:id` | Internal profile, training, strikes, approvals |
| `/qr` | Helmet QR gallery |
| `/qr/:id` | Printable sticker |
| `/p/:publicToken` | Public profile, no sidebar |
| `/training` | Training matrix |
| `/expiry` | CSOC and work-permit monitor |
| `/strikes` | Disciplinary queue |
| `/contractors` | Contractor directory |
| `/reports` | Monthly report and print view |
| `/emergency` | Site emergency directory |
| `/admin` | Users, flag, audit log, reset |

The project switcher filters workers to DE178, DE204, DE311 or all projects. The seed is concentrated on DE178 so the registry opens on the concept cast.

## Sample cast

The first registry cards are the concept workers, with the real contractor name replaced by Vantage Maincon:

| ID | Name | Contractor | Role | Strike |
| --- | --- | --- | --- | --- |
| W-00281 | Daniel Tan | Vantage Maincon | Site Engineer | No Strike |
| W-00282 | Aiman Rahman | Alpha Engineering | General Worker | Strike 1 |
| W-00283 | Raj Kumar | Beta Civil Works | Site Supervisor | Strike 2 |
| W-00284 | Muhammad Ali | Vantage Maincon | Site Coordinator | No Strike |
| W-00285 | Ng Wei Ming | Gamma Contractors | Trade Worker | Strike 3 |
| W-00286 | Suresh Nathan | Alpha Engineering | General Worker | No Strike |
| W-00287 | Lim Hao Jun | Beta Civil Works | Project Manager | Strike 1 |
| W-00288 | Farid Ismail | Gamma Contractors | General Worker | No Strike |

Forty workers in total. Pending registrations sit at each approval stage. Four strikes sit in the disciplinary queue so the sidebar badge reads 4 on DE178. NRIC values look like `S****123A`. Phones, addresses, UENs and certificate numbers are obviously fictional.

## Expiry rule

`getExpiryTier(date, today)` in `src/domain/expiry.ts`:

- green: 30 days or more remaining
- yellow: 15–29 days
- orange: 0–14 days, including today
- red: before today

The worker grid filter matches if **either** the CSOC or the work permit is in the selected tier. The overview chart counts each worker once, by the worse of the two dates. Tests pin the boundaries, including time-of-day on `Date` inputs.

## Repository seam

```ts
interface WorkforceRepository {
  load(today: Date): AppState;
  save(state: AppState): void;
  reset(today: Date): AppState;
}
```

`DemoStoreProvider` loads through `LocalWorkforceRepository`, saves whenever state changes, and exposes commands (`registerWorker`, `decideRegistration`, `proposeStrike`, `decideStrike`, training and contractor edits, role and flag changes). Pages do not touch `localStorage` themselves.

Commands check the active user’s role and return `{ ok, error }`. The audit log records the actor, role, action and a short detail string.

## Role visibility

| Action | Roles |
| --- | --- |
| Register or resubmit | Safety Personnel, Safety Officer, Safety Manager |
| Approve a registration stage | The role that owns that stage only |
| Edit training | Personnel, Officer, Manager |
| Propose a strike | Personnel, Officer, Manager |
| Approve a strike | Safety Manager, then Project Director |
| Edit contractors | Safety Manager, Project Director, Admin |
| Edit users | Admin |
| Toggle the public strike flag | Safety Manager, Admin |
| Reset demo data | Officer, Manager, Admin |

Project Director can review and can decide strikes that have already passed the manager. They cannot register workers or skip a registration stage.

## Public versus internal

Internal profile shows masked NRIC, date of birth, phone, address, permit and CSOC numbers, next of kin, strike reasons, evidence filenames and the approval trail.

Public profile is a separate module. `toPublicProfile` returns `null` until the worker is approved, so an inactive QR does not reveal who it belongs to. When it returns a profile, the keys are exactly the allowlist in `PUBLIC_PROFILE_KEYS`. The concept card’s layout is kept: centred glass card, registration pill, rows, colour strike dot, disclaimer, and **Back to Internal Portal**. A banner states that strike disclosure is still pending privacy approval.

The displayed name matches the concept card (full name and worker id). That is an identification choice for the helmet sticker. It is not permission to add confidential fields. The public type cannot hold them, and the test fails if a masked NRIC, phone, address, permit number or strike reason string leaks into the JSON.

## What is stubbed

- Evidence is a filename, not an upload.
- Notifications are derived from records waiting on the active role.
- Monthly report counts come from the local audit log and training course dates.
- CSV export downloads in the browser from the filtered list.
- Print uses the browser print dialog and hides the shell.
- There is no email, SMS, MOM lookup or real QR signing.
