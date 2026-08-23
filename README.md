# Ozofryn — v5 Redesign (Restrained Corporate)

Static HTML/CSS/JS build implementing the developer brief in
`Ozofryn Website .docx`. This is a **separate version** from
`website-v4` — it does not replace it.

## What changed vs. earlier versions

- Business hierarchy is now **Company → Business (Bunkering / Bulk
  Trading) → Markets (UAE / India) → Responsibility → Contact**.
  Products are secondary and no longer drive the homepage or nav.
- White canvas, charcoal type, the brand accent (**Verified Green**,
  `#358611`) used confidently on the primary interactive path
  (buttons, eyebrows, hover states) plus one full-section fill per
  page (`.band-accent`, using the deeper `#2A6A0E`) — not the retired
  neon chartreuse `#D9F323`. See `DESIGN.md` for the full system.
- No animated counters, custom cursor, magnetic buttons, marquee or
  parallax. Only a subtle scroll-reveal, per the brief's "subtle
  transitions only" instruction.
- Typeface is **Carlito** (Google Fonts), metric-compatible with
  Calibri, per §13 of the brief ("Calibri should remain the working
  typeface unless the final web implementation identifies a closely
  matched, licensed web font with better screen rendering").
- Copy is taken from Appendix A of the brief wherever it was provided
  in full. Anything the brief left in square brackets is kept as a
  visibly flagged **TBC** placeholder (dashed amber box, hover for
  the reason) rather than invented — see "Outstanding content" below.

## Pages

`index.html` (Home) · `about.html` · `bunkering.html` · `bulk-trading.html`
· `products.html` · `markets.html` · `responsibility.html` · `contact.html`
· `privacy-notice.html` and `website-terms.html` (stub legal pages,
linked from the footer so no links are broken — full text still
needs legal counsel).

## Dropping in Storyblocks images/videos

Every image on the site is a normal `<img>` tag pointing at a file
that **does not exist yet** under `assets/img/`. Until the file
exists, an inline placeholder shows what the image should depict and
the exact filename it expects, e.g.:

```
Hero photo/video — marine supply, terminal or cargo operation
assets/img/hero-marine-supply.jpg
```

To add real media: save your Storyblocks download as that **exact
filename** into `assets/img/` (or `assets/video/` for the one video
example on the homepage hero) and the placeholder is replaced
automatically — no HTML editing required. Recommended crops:

| File | Suggested aspect | Used on |
|---|---|---|
| `hero-marine-supply.jpg` (or `.mp4`) | ~5:4 | Home hero |
| `about-operations.jpg` | 4:3 | About |
| `leadership-1.jpg` / `-2.jpg` / `-3.jpg` | 1:1 | About — management |
| `bunkering-hero.jpg` | 21:9 wide | Bunkering |
| `bulk-trading-hero.jpg` | 21:9 wide | Bulk Trading |
| `market-uae.jpg` / `market-india.jpg` | 4:3 | Markets |

Keep images natural-colour, no synthetic glow/AI look, per brief §13.
For a homepage hero **video** instead of a photo, swap the `<img>`
block in `index.html`'s hero for a `<video>` tag — see the code
comment pattern already used for the media placeholder `onerror`
fallback and replicate it with the video `error` event.

## Outstanding content (flagged as TBC on the pages themselves)

These come directly from Appendix A / §16 of the brief and are
**not fabricated** — each is marked inline so nothing unverified
ships silently:

- UAE legal entity name, registration/licence number, registered
  office address, and confirmed working hours for both offices.
- India CIN/registration number (India entity name & address are
  already filled in from brief §14).
- Confirmed bunkering ports, delivery modes, minimum quantities,
  working hours and grades regularly available.
- Confirmed bulk product grades, typical parcel sizes and active
  trade corridors.
- Desk-specific email addresses for Bunkering and Bulk Trading
  (currently the general `info@ozofryn.com` is used as fallback).
- Management/leadership names, designations, ≤80-word bios and
  photographs.
- Compliance email for the "speak-up" channel.
- Approved HSE policy link.
- Legal review of the UAE/India entity-relationship wording
  (Markets page).
- Full Privacy Notice, Website Terms, Cookie Notice and General
  Terms & Conditions text (currently stub pages).

## Forms

The Bunkering, Bulk Trading and general Contact forms are front-end
only (`data-demo` shows a "received" confirmation on submit but sends
nothing). Per brief §15, wire them to role-based mailboxes and a
CRM/enquiry log before launch — e.g. a form backend (Formspree,
Netlify Forms, custom endpoint) or, if migrated into WordPress later,
native Elementor/Gravity Forms with the same field sets.

## Structure

```
assets/css/styles.css   design system (variables, components)
assets/js/main.js       nav, scroll-reveal, form demo, year stamp
assets/img/             logo + favicon shipped; drop photography here
assets/video/           drop hero video here (optional)
```
