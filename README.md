# Coaching Central — website

Static, framework-free multi-page site (HTML + CSS + vanilla JS). No build step, no dependencies.
Open `index.html` directly or serve the folder with any static server.

## Pages

Structure: **Home → categories → products.** The homepage is a hub; each category page lists what's inside it; products have their own pages.

| File | Purpose |
| --- | --- |
| `index.html` | Home — hero + quick-start → the questions → realisation + Build · Attract · Grow strip → **category grid** → Community × Exly → final CTA |
| `start-here.html` | Pathways ("What do you need right now?") + the next-step assessment (the header/hero CTAs and the homepage quick-start cards land here) |
| `about.html` | The experience behind Coaching Central, the interactive **Build · Attract · Grow** method (`#method`), people, what you get, what we believe (+ hidden coach-stories section) |
| **Categories** | |
| `coaching-kits.html` | Kits overview + free starter templates + member-prices banner → `launch-kit.html`, `goal-setting-toolkit.html` |
| `programs.html` | Levels of involvement, Strategy Session, Ongoing Support, Implementation, Premium Mentorship (coming later) → `strategy-session.html` |
| `support.html` | Support & Implementation — how it works, six capability areas |
| `community.html` | Coaching Central Community (₹199 lifetime): what's inside, **member-exclusive prices** table (`#member-prices`), how to join, Exly teaser |
| `workshops.html` | Workshops & Classes — the live Exly listings (moved here from Programs) + how booking works |
| `exly.html` | **Coaching Central × Exly** — why Exly, what the partnership means, the community-member Exly offer (`#offer`) |
| **Products** | `launch-kit.html` · `goal-setting-toolkit.html` · `strategy-session.html` (each buy panel shows the member price line) |
| `contact.html` | Contact form + WhatsApp |

Desktop nav (≥1200px): About · Start Here · Coaching Kits · Programs · Support · Community · Workshops. The mobile menu and footer also list Coaching Central × Exly and Contact.

Shared header, footer, mobile menu, sticky mobile CTA and lead-capture modal are the same markup on every page — when you change one, change all thirteen (search for `<header class="header"` / `<footer class="footer"` / `id="modal"`).

## Configuration (do this before go-live)

All external links and integrations live in one object at the top of `assets/js/main.js` — `SITE_CONFIG`. Values taken from the live Exly page (https://coachingcentral.exlyapp.com/) are already filled in:

```js
whatsapp: '918178501112',                                   // +91 81785 01112 → wa.me links everywhere
instagram: 'https://www.instagram.com/coachingcentralorg/',
formEndpoint: '',       // URL that receives lead POSTs (JSON). Empty = stored in localStorage + console only
links: {
  launchKit: '',        // Exly checkout URL — not listed on Exly yet
  toolkit: '',          // Exly checkout URL — not listed on Exly yet
  strategySession: '',  // Exly booking URL  — not listed on Exly yet
  support: '',          // Ongoing Support enquiry/booking URL
  implementation: '',   // Implementation enquiry URL
  community: 'https://coachingcentral.exlyapp.com/f1cc3d14-…',   // Coaching Central Community, ₹199 lifetime
  exlyOffer: '',        // Coaching Central × Exly — partner sign-up / offer URL for community members
  login: 'https://coachingcentral.exlyapp.com/eud/login/email'
},
memberPrices: {         // Member-exclusive prices — shown wherever <span data-member-price="key"> appears
  launchKit: '', toolkit: '', strategySession: '', support: '', workshops: '',
  exly: ''              // the Coaching Central × Exly offer, e.g. '3 months free'
},
memberPriceFallback: 'Member price shared inside the community'
```

While a member price is empty the site shows the fallback (or the element's own `data-member-fallback`) instead of a number — nothing is invented. Fill `memberPrices` and the values appear on `community.html#member-prices`, `workshops.html`, the product buy panels and `exly.html#offer`.

Nothing is broken while a value is empty: checkout/booking buttons open the interest form instead, and "Explore …" links always go to the product pages.

### Taken from the live Exly site
- About copy (verbatim), tagline *"You're Certified. Now What? Build the business around your coaching with practical tools, guidance and support."*
- **What you get** — 1-on-1 Guidance · Practical Learning · Digital Toolkits · Recorded Sessions · Coaches Community (home, about)
- **Live offerings** with prices and direct Exly booking links (`workshops.html`): Parenting Mastery Workshop: 90-Min ₹49 (24 Sep 2026) · Understanding Child Psychology ₹4,999 (4 weeks). Coaching Central Community ₹199 lifetime (`community.html`). Update these when listings change.
- **Exly wordmark** (`assets/img/partners/exly.svg`, also inline as `#b-exly`) from exlyapp.com; the Exly feature list on `exly.html` is what exlyapp.com lists (courses, live workshops/webinars, no-code website, brand-labelled app, inbuilt CRM, UPI/cards/net banking/wallets, invoicing, offers & promo codes, SEO).
- **Brand collaborations** logos (`assets/img/partners/`): Olive & Lime Co., Indian Society for NLP, WisdomTree Solutions
- Instagram + WhatsApp (brand glyphs in footer/contact), Login, Privacy Policy and Terms of Use links (Exly-hosted)
- Not carried over: the three testimonials on Exly (Morgan Ellis / Taylor Morgan / Jordan Lee) look like Exly sample content (generic names, default and AI-generated avatars) and the brief asks for real coach stories — confirm before publishing.

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
- **Member-exclusive prices** — the actual member prices for the kits, Strategy Session, support and workshops (`SITE_CONFIG.memberPrices`). Until they're set, every member-price slot reads "Member price shared inside the community".
- **Coaching Central × Exly offer** — the offer itself (e.g. months free / discount), any terms, and the partner sign-up URL (`SITE_CONFIG.links.exlyOffer`). Until set, "Get Exly with Coaching Central" opens the interest form with "Exly partner offer" preselected.
- **Workshops** — the third card on `workshops.html` ("Business sessions for coaches · Coming up") is a placeholder for the business-side sessions Exly's "Practical Learning" blurb describes; replace it with a real listing or remove it.
- **Exly checkout / booking URLs for the Launch Kit, Toolkit and Strategy Session** (not listed on Exly yet), **form endpoint, analytics (GTM) snippet, canonical domain** for the `og:` tags.

## Design system
`assets/css/styles.css` — tokens at the top (brand colours, fluid type scale, 8px spacing, radii, shadows, motion), then components (buttons, chips, cards, reveals), then page sections. Fonts: Manrope (headings) + Inter (body) via Google Fonts. Accent buttons use navy text on orange/teal for AA contrast.

Motion respects `prefers-reduced-motion`. Images below the fold are lazy-loaded WebP with explicit dimensions (no layout shift).
