# Coaching Central — website

Static, framework-free multi-page site (HTML + CSS + vanilla JS). No build step, no dependencies.
Open `index.html` directly or serve the folder with any static server.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Home — the "You know how to coach. But what comes next?" story: hero → questions → realisation → BUILD · ATTRACT · GROW → pathways → levels of help → free templates → next-step assessment → experience → support → toolkit → final CTA |
| `about.html` | The experience behind Coaching Central, people, what we believe (+ hidden coach-stories section) |
| `start-here.html` | Pathways ("What do you need right now?") + the next-step assessment |
| `coaching-kits.html` | Kits overview + free starter templates |
| `programs.html` | Levels of involvement, Strategy Session, Ongoing Support, Implementation, Premium Mentorship (coming later) |
| `support.html` | Support & Implementation — how it works, six capability areas |
| `launch-kit.html` · `goal-setting-toolkit.html` · `strategy-session.html` | Product pages |
| `contact.html` | Contact form + WhatsApp |

Shared header, footer, mobile menu, sticky mobile CTA and lead-capture modal are the same markup on every page — when you change one, change all ten (search for `<header class="header"` / `<footer class="footer"` / `id="modal"`).

## Configuration (do this before go-live)

All external links and integrations live in one object at the top of `assets/js/main.js` — `SITE_CONFIG`:

```js
whatsapp: '',           // E.164 digits, e.g. '919876543210' → all "WhatsApp" buttons become wa.me links
formEndpoint: '',       // URL that receives lead POSTs (JSON). Empty = stored in localStorage + console only
links: {
  launchKit: '',        // Exly checkout URL — "Get the Launch Kit" buttons
  toolkit: '',          // Exly checkout URL — "Get the Toolkit"
  strategySession: '',  // Exly booking URL  — "Book a Strategy Session"
  support: '',          // Ongoing Support enquiry/booking URL
  implementation: '',   // Implementation enquiry URL
  login: ''             // Exly member login — the Login link stays hidden until set
}
```

Nothing is broken while these are empty: checkout/booking buttons open the interest form instead, WhatsApp buttons open the contact form, and "Explore …" links always go to the product pages.

### Lead capture
Three forms share one handler (`CCLeads.submit`): the modal (free templates / product interest / contact), the assessment lead step, and the contact page. Each POSTs JSON to `formEndpoint` (fields: `source`, `name`, `email`, `whatsapp`, plus `interest`/`message` or the assessment answers and result). A `dataLayer.push({event:'lead_submit'})` fires for GTM.

### Next-step assessment (`assets/js/assessment.js`)
Four questions → lead capture → mini-diagnosis. Answers persist in `sessionStorage`. The seven result paths (`RESULTS`) and the routing logic (`computeResult`) are plain data at the top of the file — copy can be edited without touching the rendering. Hero/"Start Here" quick-start cards pre-answer Q1 and jump to Q2.

## Content still needed from the client

- **Photography** — all photos in `assets/img/photos/` are licensed Unsplash placeholders chosen to match the brief (real people, planning, laptops, coaching conversations). Replace with Coaching Central's own imagery at the same file names/sizes (hero: 1920/1440/1024 wide + `hero-mobile` 4:5; others 900/600 wide, WebP).
- **Founder / mentor photos** — `about.html` uses monogram avatars; swap the `<span class="person__avatar">` for an `<img>`.
- **Coach stories** — the BEFORE → JOURNEY → AFTER section on `about.html` is built but `hidden` until real stories are supplied. No testimonials were invented.
- **Launch Kit price** — not in the brief; product page says "price shown at checkout".
- **Premium mentorship (Sushil Mehrotra)** — listed as "coming later" on `programs.html`.
- **Exly checkout / booking URLs, WhatsApp number, form endpoint, analytics (GTM) snippet, canonical domain** for the `og:` tags.

## Design system
`assets/css/styles.css` — tokens at the top (brand colours, fluid type scale, 8px spacing, radii, shadows, motion), then components (buttons, chips, cards, reveals), then page sections. Fonts: Manrope (headings) + Inter (body) via Google Fonts. Accent buttons use navy text on orange/teal for AA contrast.

Motion respects `prefers-reduced-motion`. Images below the fold are lazy-loaded WebP with explicit dimensions (no layout shift).
