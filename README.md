# SiteSafe

Frontend prototype of a workforce safety portal for a fictional Singapore main contractor. It covers worker registration, staged approvals, helmet QR IDs, a public read-only profile, training, pass expiry, a three-level strike system, monthly reports and a role switcher.

This build is UI only. There is no backend, auth provider, database, hosting config or real personal data. Everything is fictional sample data kept in the browser.

The main contractor in the demo is **Vantage Maincon**. Subcontractors are Alpha Engineering, Beta Civil Works, Gamma Contractors, Delta M&E Services and Epsilon Formwork.

## Run

```bash
npm install
npm run dev
```

Then open the URL Vite prints (http://localhost:5173).

```bash
npm test    # expiry tiers, approval and strike machines, public profile allowlist
npm run build
```

Demo data is stored in `localStorage` under `sitesafe-demo-v2`. Settings → **Reset demo data** rebuilds it relative to today so the expiry tiers stay meaningful. Older `v1` data is ignored and reseeded.

## Click path

1. Open **Overview** and filter the worker grid to **Orange 0–14 days**.
2. Open a worker card and read **Training** and **Strikes**. Reasons are internal only.
3. From **Worker Registry**, as Safety Officer, register a worker with a profile photo. The record is **Active** on submit and the helmet QR is on. Other roles see the registry read-only. Lists are grouped by company, then designation.
4. Open **QR Helmet IDs**, then a sticker. Download the 50 mm PDF or print it at 100% scale. Open the public profile and confirm the strike value is a colour dot, with no reason, and that NRIC, phone, address, permit numbers and next of kin are absent.
5. Propose a strike, approve it as Safety Manager, then as Project Director on **Strike Approvals**. It counts only after both. Those roles do not approve onboarding.

## Folder structure

```
src/
  app/                 router, shell, navigation
  components/ui/       liquid-glass kit (cards, pills, modal, drawer, table, stepper)
  features/<feature>/  pages and feature components
  domain/              types and pure rules (expiry, approvals, strikes) plus tests
  data/                repository interface, localStorage implementation, seed
  config/              design tokens and the public strike feature flag
docs/                  longer notes on the model, workflows and a future backend
```

## Design tokens

`src/config/tokens.ts` is the palette: pink, purple and blue used as a soft mesh, glass radius, blur and shadow, strike colours (green / yellow / orange / red) and the four expiry colours. `applyTokens()` copies those values onto CSS variables consumed by the mesh background in `src/index.css`. Status pills read the same token object, so a retune does not require a second palette in the components.

The shell follows the owner’s concept screens: a translucent white sidebar, pink active item, gradient SiteSafe wordmark, gradient page title, and a pink-to-purple primary button. Body text stays at 14px or larger. Inside the portal, status is always text plus colour.

## Data model

Workers, companies, projects, users, site contacts and an audit log live in one `AppState` object (`version: 2`). A worker holds masked NRIC, contact details, CSOC and work-permit dates, induction, training records, strike records, next of kin, a profile photo data URL (null on seed workers) and an activation trail. Each company stores an identity colour from a preset palette.

`WorkforceRepository` (`src/data/repository.ts`) is the seam a future API can replace. `LocalWorkforceRepository` reads and writes `localStorage`. The React store calls that repository and exposes the commands the pages use.

Dates on the seed are offsets from the day the data is built, so every expiry tier and every strike level is present.

## Registration

The Safety Officer (or Admin) keys workers in directly. There is no Safety Personnel role and no onboarding queue. `activatedRegistrationStatus()` is `approved`, labelled **Active**, and the helmet QR is on at submit. The audit action is exactly `Registered and activated by Safety Officer`. A profile photo is required (image upload up to 5 MB, or camera capture where the browser supports it) and is stored as a data URL. Seed workers use generated initials placeholders, never photographs of real people.

Other roles see the registry read-only. Personnel lists group by company (main contractor first, then subcontractors A–Z) and then by designation: Director, Project Manager, Engineer, Coordinator, Supervisor, worker trades.

## Strike state machine

Levels shown on cards: No Strike, Strike 1 (yellow), Strike 2 (orange), Strike 3 (red).

A proposal is the next level after the count of **approved** strikes. The Safety Officer or Safety Manager may propose. The record then waits for:

1. Safety Manager → `pending_director`
2. Project Director → `approved`

Either role can reject at their stage. Rejected and half-approved strikes do not change the badge. At Strike 3, no further proposal is accepted. The reason, date and evidence filename stay on the internal profile.

## Public profile vs internal profile

`src/features/public-profile/toPublicProfile.ts` is the only builder of a `PublicProfile`. The type has no place for NRIC/FIN, date of birth, phone, address, next of kin, work-permit number, certificate number or disciplinary text. A unit test locks the key list and checks that those values do not appear in the JSON.

The public card follows the owner’s concept screen: photo or initials placeholder, name, contractor chip in that company’s identity colour, worker id, project, designation, induction, training status, CSOC and work-permit colour tiers, and a **colour-only** strike dot. The QR encodes `/p/:publicToken`, a random token, not the `W-00…` id. Helmet stickers are 50 mm circles in a real PDF (`jspdf` + `qrcode`), one worker or an A4 sheet, printed at 100% scale.

## Privacy flag

`PUBLIC_STRIKE_INDICATOR` in `src/config/flags.ts` defaults to **on** so the demo can show the dot. The file comment, the public banner (“Prototype: strike disclosure on public page pending privacy approval”) and Settings all say this is not a privacy sign-off. Safety Manager or Admin can switch the dot off; reset restores the code default. When the flag is off, `toPublicProfile` sets `strikeColor` to `null` and the row is omitted.

## Backend later

See `docs/backend-plan.md`. No API, database, auth provider or deploy configuration is included in this prototype.

## Out of scope

Real identity documents, MOM integration, email or SMS, file upload of evidence, production hosting, and any use of live personal data.
