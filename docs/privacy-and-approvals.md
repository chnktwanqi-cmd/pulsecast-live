# Approvals, strikes and the public QR boundary

## Registration

The earlier three-stage review is retired. The Safety Officer registers the worker and the record is Active on submit. `activatedRegistrationStatus()` returns `approved`. The helmet QR is on immediately. The store writes one audit entry whose action is `Registered and activated by Safety Officer`.

Only the Safety Officer and Admin can open the registration form. Other roles see the registry read-only. A profile photo is required before submit. Seed workers keep a null photo and an initials placeholder.

Safety Manager and Project Director do not approve onboarding. Their approval actions are only on **Strike Approvals**.

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
