# Spec — Links

_Source: 26 Nov 2026 (D15). Managed at Account → Links (`/account/links`)._

**Links are the easy way into Aultrum: anything in Flowstate can be published
as a link** and sent to someone outside it — by text, email or WhatsApp. The
person opens it and acts, without needing a Flowstate account. Account → Links
is where every published link is created, seen, paused and revoked.

## Kinds of link

| Link | Sent to | They can |
|---|---|---|
| **Shift request** | A supply agency | See the shifts needed (times, area, role) and respond: accept, offer workers, decline |
| **Carer invite** | A carer | Join the agency in the Aultrum carer app (the existing Aultrum Link) |
| **Praise** | A key person (family) | Thank a carer in a few words. Feeds Peak and the Rapport layer |
| _More to come_ | | _e.g. timesheet sign-off for a client, a bid response, an invoice to view_ |

## Rules

1. **Every link has an owner, a purpose and an expiry.** Default expiry is short;
   the owner can extend it.
2. **Revocable.** Revoking stops it at once; the page says the link has ended.
3. **Shows the minimum.** A link shows only what its purpose needs. Shift-request
   links show times, area and role — never the care receiver's name, address or
   any care detail. Addresses and key-safe codes are never in a link.
4. **Logged.** Every open and every action through a link is in the audit log.
5. **Actions go through the app's own actions**, with the same validation as
   inside Flowstate.
6. **Not guessable.** Long random tokens; one link per recipient where an
   action is personal (e.g. a praise link per family member).

## Open questions

1. Which link kinds are in v1 beyond shift request, carer invite and praise?
2. Can a link be forwarded (e.g. an agency passing a shift request to a colleague), or is it tied to one recipient?
