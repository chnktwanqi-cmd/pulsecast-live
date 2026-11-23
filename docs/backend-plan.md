# Backend integration plan (future work)

Nothing in this file is implemented. The prototype has no server, database, auth provider or hosting configuration. This is a sketch so a later project can replace `LocalWorkforceRepository` without redesigning the screens.

## Suggested tables

- `companies` — id, name, kind (`main` | `sub`), uen, focus, contact
- `projects` — id, code, name, company_id
- `users` — id, name, email, role, company_id
- `workers` — id (`W-…`), public_token (unique, unguessable), names, company_id, project_id, designation, trade, nationality, approval_status, induction, created_at
- `worker_private` — worker_id, nric or fin (encrypted), dob, phone, address, work_permit_number, work_permit_expiry, csoc_number, csoc_expiry
- `next_of_kin` — worker_id, name, relationship, phone
- `training_records` — worker_id, course (`SIC` | `BCSS` | `CSOC`), course_date, expiry, certificate_number
- `approval_events` — worker_id, actor_id, role, action, from_status, to_status, remarks, at
- `strikes` — worker_id, level, reason, occurred_on, evidence_object_key, issuer_id, status
- `strike_events` — strike_id, actor_id, role, action, from_status, to_status, remarks, at
- `audit_events` — actor_id, role, action, target, detail, at
- `site_contacts` — project_id, name, role, phone, hours, notes

Keep `worker_private`, `next_of_kin` and strike reason columns out of any query used by the public profile endpoint.

## Auth and roles

Replace the demo switcher with a real session. Map the four roles (Safety Officer, Safety Manager, Project Director, Admin) onto the permission table in `docs/implementation.md`. Strike transitions should call `nextStrikeStatus` on the server so the client cannot skip a stage. Registration creates an active worker; do not reintroduce an onboarding queue. Store the actor from the session, not from the request body.

Project Director and Safety Manager are distinct accounts. One person must not be able to satisfy both strike approvals.

## API sketch

All internal routes require a session. The public route does not.

- `GET /api/workers` — filters: project, company, trade, designation, expiry tier, strike level, search. Group by company, then designation.
- `POST /api/workers` — Safety Officer or Admin. Body includes a profile photo. Creates an active worker and the audit action `Registered and activated by Safety Officer`.
- `PUT /api/workers/:id/training` — add or edit a course
- `POST /api/strikes` — propose the next level
- `POST /api/strikes/:id/decisions` — manager or director
- `GET /api/expiry` — tiered pass list, same filters as the monitor
- `GET /api/reports?month=` — aggregates for the printable report
- `CRUD /api/companies`
- `GET /api/audit`
- `GET /api/public/:publicToken` — returns the `PublicProfile` shape or 404. Run `toPublicProfile` (or a server port of it) as the last step so extra columns cannot leak. Honour `PUBLIC_STRIKE_INDICATOR` from server config, default **off** until privacy approval is recorded.

CSV export can stay a client download of `GET /api/expiry` or move to a server file. Either way, do not include NRIC or next of kin in the expiry export.

## QR token security

- Generate the public token with a CSPRNG, at least 128 bits, encoded for URLs. Do not derive it from the worker id or NRIC.
- The sticker URL is `https://<public-host>/p/<token>`.
- Tokens are revocable. Rejected or suspended workers resolve to the inactive card.
- Rate-limit the public endpoint. Do not put the token in logs in full.
- The public response must not echo the internal id of private tables, permit numbers or strike text. A colour enum is the most the strike field may be, and only when the privacy flag is explicitly enabled in production config.
- Rotate a token if a sticker is lost, and leave the old token 404.

## Hosting (later)

When this leaves the prototype, a static host for the React app plus an API and database is enough. Put the public profile on the same origin as the QR links or on a dedicated public host that cannot reach the private database role. Do not add that configuration to this repository until the owner asks for a deployment.

Object storage, if evidence files become real, should be private and linked only from the internal strike view.

## Migration from the prototype

1. Keep the domain functions and the `PublicProfile` type.
2. Implement `WorkforceRepository` against the API.
3. Delete the localStorage seed from production builds.
4. Turn `PUBLIC_STRIKE_INDICATOR` off until the privacy review is signed.
5. Replace the role switcher with the session role and remove the demo users.
