# Approvals, strikes and the public QR boundary

## Registration

Submitting the registration form calls `initialApprovalStatus()`, which is hard-coded to `pending_personnel`. The UI copy on the review step says the same thing: submit does not approve.

`nextApprovalStatus` is a pure function. A role that does not own the current stage gets `null`, and the store refuses the command. The sequence is fixed:

```
submit → Pending Personnel → Pending Officer → Pending Manager → Approved
```

Reject ends the file. Request changes parks it until a safety role resubmits, which returns it to Pending Personnel rather than jumping ahead. The QR gallery and the public route both treat anything other than Approved as inactive.

Each decision stores actor, role, timestamp, from-status, to-status and remarks. Reject and request-changes require remarks. Approve uses the remarks field or a short default so the trail is never blank.

## Strikes

`currentStrikeLevel` counts records whose status is `approved`, capped at 3. A record in `pending_manager` or `pending_director` is visible internally and does not change the badge or the public dot.

`nextStrikeStatus` only allows:

- Safety Manager on `pending_manager` → `pending_director` or `rejected`
- Project Director on `pending_director` → `approved` or `rejected`

The public mapper reads the level, maps it to green / yellow / orange / red, and copies **only the colour** when the flag is on. The reason, date, issuer and evidence name are not parameters of `PublicProfile`.

## Privacy flag

`src/config/flags.ts`:

```ts
export const PUBLIC_STRIKE_INDICATOR = true;
```

The comment in that file is the control note: the default is for the prototype, privacy approval has not been given, and production must not copy the default blindly. Settings persists an override inside the demo state. Reset rebuilds state from the constant.

The public page always shows a visible banner:

- Flag on: “Prototype: strike disclosure on public page pending privacy approval”
- Flag off: the dot is removed and the banner says the indicator is switched off pending privacy approval

The disclaimer on the card states that no disciplinary reason, warning letter or personal contact data is displayed, and that the card is not proof of a valid MOM work pass.

## Fields that must not cross the boundary

Never render these from a public route, even if a future API returns them by mistake. The mapper is the choke point; do not spread a `Worker` into the public view.

- NRIC / FIN
- Date of birth
- Phone
- Address
- Next of kin
- Work permit number
- CSOC or training certificate numbers
- Strike reason, date, evidence, issuer, remarks
