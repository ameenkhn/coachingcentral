# Coaching Central — website (Draft 2 structure)

Static, framework-free multi-page site (HTML + CSS + vanilla JS). No build step, no dependencies.
Open `index.html` directly or serve the folder with any static server.

Draft 2 implements the client's *Draft 2 Team Brief* / *Vibe Prompt* (22 Sep 2026): homepage = story + journey + trust + direction; subpages = information + details + conversion; the assessment is a popup; Services replaces Programs/Support; Learn & Grow replaces Workshops; Start Here is gone.

## Pages

| File | Role |
| --- | --- |
| `index.html` | Home — 01 Hero → 02 The questions (+ popup trigger) → 04 Build · Attract · Grow (interactive panel, `#method`) → 05 How we can help (three routes) → 06 Experience behind Coaching Central → 07 Coach stories → 08 Community (₹299/yr) → 09 Final CTA |
| `about.html` | The experience behind Coaching Central — origin story, what it is / isn't, Sitanshu & Sushil (`#people`), brand collaborations, what we believe |
| `coaching-kits.html` | Clean catalogue: Coaching Business Launch Kit + Goal-Setting Master Toolkit → `launch-kit.html`, `goal-setting-toolkit.html` |
| `services.html` | "Let us help build it" — how it works, the journey (Build `#build` / Attract `#attract` / Grow `#grow` with the six capabilities), levels of involvement, Ongoing Support (`#ongoing-support`), Implementation (`#implementation`), conversation CTA |
| `strategy-session.html` | 1:1 Business Strategy Session (from ₹1,500) — product page under Services |
| `community.html` | ₹299/year network + resources: what's inside, join flow, member area (`#member-area`, login) |
| `learn-grow.html` | Live workshops & short courses (Exly listings), kit walkthroughs (`#walkthroughs`), Mentorship with Sushil Mehrotra (`#mentorship`), how booking works |
| `exly.html` | Coaching Central × Exly — the platform we run on and set coaches up on (reached from the footer "Runs on Exly" and Services → Technology) |
| `contact.html` | Contact form + WhatsApp |

**Top navigation:** About · Coaching Kits · Services · Community · Learn & Grow · Login · Find Your Next Step →

**Find Your Next Step** is a popup on every page. Any `<a href="#next-step" data-next-step>` opens it; opening a page with `#next-step` in the URL opens it automatically (usable in emails/ads). The popup loads Coaching Central's hosted Exly enquiry form in an iframe — see below.

Shared header, mobile menu, footer, sticky mobile CTA, lead-capture modal and assessment modal are identical markup on every page. Search for `<header class="header"` / `<footer class="footer"` / `id="modal"` / `id="assessModal"` and change all eleven pages together (a one-off stamping script was used for Draft 2; not in the repo).

### Find Your Next Step — the popup (`#assessModal`)
Every `[data-next-step]` CTA (76 of them across the 11 pages: header, hero, sticky mobile bar, section CTAs, footer) opens one shared popup. The popup embeds **`SITE_CONFIG.links.nextStep`** in an iframe — currently `https://coachingcentral.exlyapp.com/?init_contact=true`, which opens Exly's "Get in touch" form.

- The iframe is loaded **lazily, on first open** — never on page load, so it costs nothing until someone clicks.
- A spinner covers the frame until the iframe's `load` event; after 12s it swaps to "…you can open it in a new tab instead".
- An **Open in a new tab** link sits in the popup header (icon-only under 480px) as the escape hatch if Exly ever blocks framing or is slow.
- Verified: `coachingcentral.exlyapp.com` sends no `X-Frame-Options` or CSP `frame-ancestors`, and no frame-busting script, so embedding works.
- `dataLayer.push({event:'next_step_open', mode:'hosted'|'built-in'})` fires on open.

**Fallback — the built-in check (`assets/js/assessment.js`).** Empty `links.nextStep` and the same popup shows the Draft 2 next-step check instead: four questions (where are you → biggest question → how clear are you → how much help) → one of three broad need states (*Get Clear*, *Get Moving*, *Get Growing*) → a short read, **one recommended next action**, and the three routes (Coaching Kits / Strategy Session / Services) with the visitor's help level highlighted. No roadmap, no lead gate; emailing the result is optional. Copy lives in `QUESTIONS` / `RESULTS` / `ROUTES`, logic in `computeResult`; answers persist in `sessionStorage`. The script exits early while a hosted URL is set, so nothing renders twice.

## Configuration (do this before go-live)

Everything external lives in `SITE_CONFIG` at the top of `assets/js/main.js`:

```js
whatsapp: '918178501112',                                   // +91 81785 01112 → wa.me links everywhere
instagram: 'https://www.instagram.com/coachingcentralorg/',
formEndpoint: '',       // URL that receives lead POSTs (JSON). Empty = stored in localStorage + console only
links: {
  // Find Your Next Step — opened in the popup's iframe by every [data-next-step] CTA.
  // Empty it to fall back to the built-in next-step check.
  nextStep: 'https://coachingcentral.exlyapp.com/?init_contact=true',
  launchKit: '',        // Exly checkout — Launch Kit (Phase 2: free starters + low-ticket kit)
  toolkit: '',          // Exly checkout — Goal-Setting Master Toolkit + walkthrough (bundled)
  goalSession: '',      // Exly booking — personal Goal-Setting Session (optional paid add-on)
  strategySession: '',  // Exly booking — 1:1 Business Strategy Session
  support: '',          // Ongoing Support enquiry URL
  implementation: '',   // Services enquiry URL
  mentorship: '',       // Mentorship with Sushil Mehrotra enquiry URL
  community: 'https://coachingcentral.exlyapp.com/f1cc3d14-…',   // ⚠ still the old ₹199 lifetime listing — replace with the ₹299/year membership URL
  login: 'https://coachingcentral.exlyapp.com/eud/login/email'
}
```

Nothing is broken while a value is empty: checkout/booking buttons open the interest modal instead. `Login` appears in the header, mobile menu, footer and the Community member area as soon as `links.login` is set.

### Lead capture
Three forms share one handler (`CCLeads.submit`): the interest/contact modal, the optional "email me this result" form in the built-in check, and the contact page. (Leads from the Find Your Next Step popup land in Exly, not here.) Each POSTs JSON to `formEndpoint` (`source`, `name`, `email`, `whatsapp`, plus `interest`/`message`, or the assessment answers + result). `dataLayer.push` events: `lead_submit`, `next_step_open`, `assessment_complete`.

## Content still needed from the client (Phase 2)

- **Coach stories** — `index.html#stories` has the two named coaches (Alka Beniwal / Earth Aroma, Gurpreet Soni / Balanced Nest) with a Before → Journey → Now frame and three testimonial slots. All copy inside `.is-placeholder` elements is placeholder; replace it, remove the class and the "Story in progress" chips. Nothing was invented.
- **Community** — ₹299/year is live in copy; the Exly membership listing/URL still needs creating (`links.community`).
- **Launch Kit** — free starter tools + low-ticket complete kit are described; assets, price and checkout URL are Phase 2. The free-templates popup from Draft 1 is parked (no triggers remain; `launch-kit.html` routes "send me the starters" to the interest modal).
- **Goal-Setting Toolkit** — 15-minute walkthrough (bundled) and the personal Goal-Setting Session add-on need a price/URL.
- **Mentorship with Sushil Mehrotra** — one-off premium session / ongoing formats need pricing and a booking URL.
- **Services** — detailed descriptions per capability if wanted (current copy is the coach-facing rewrite of the six areas).
- **Photography** — all photos in `assets/img/photos/` are licensed Unsplash placeholders; replace at the same file names/sizes. Founder/mentor photos: swap the `<span class="person__avatar">` monograms for `<img>`.
- **Form endpoint, GTM snippet, canonical domain** for the `og:` tags.

### Dropped in Draft 2 (deliberately)
Start Here page, Programs and Support pages (merged into Services), Workshops page (renamed Learn & Grow), the homepage quick-start block (now Q1 of the popup), the trust strip, the Community × Exly duo and the "What you get" grid, the member-exclusive prices table and `memberPrices` config, the community-member Exly offer, and the free-templates popup. Small chip/tag lists were removed from all cards at the client's request.

## Design system
`assets/css/styles.css` — tokens at the top (brand colours, fluid type scale, 8px spacing, radii, shadows, motion), then components, then page sections; Draft 2 additions are in section 28 at the end. Fonts: Manrope (headings) + Inter (body). Motion respects `prefers-reduced-motion`; images below the fold are lazy-loaded WebP with explicit dimensions.
