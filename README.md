# Firstlight Travel Co. - static travel website

Multi-page, responsive, light-mode travel site. Plain HTML, one stylesheet, one script. No build step, no dependencies. Open `index.html` or serve the folder with any static host.

## Pages (18)

| Page | File | Purpose |
|---|---|---|
| Home | `index.html` | Hero, bento region grid, trip rail, business model, testimonials, guides, FAQ |
| Destinations | `destinations.html` | 8 regions, season filter, when-to-go table |
| Trips | `trips.html` | 8 departures, activity filter, inclusion/exclusion list |
| Trip detail | `trip-iceland-ring-road.html` | Gallery, 9-day itinerary, sticky booking box, trip FAQ |
| Pricing | `pricing.html` | Cost comparison, revenue disclosure, payment terms |
| Guides | `guides.html` | Article index, labelled ad slot |
| Guide article | `guide-iceland-october.html` | Long-form editorial with disclosure and in-article ad slot |
| About | `about.html` | Story, operating rules, team, company register details |
| Contact | `contact.html` | Validated enquiry form, direct contacts, map |
| FAQ | `faq.html` | Grouped accordions + FAQPage schema |
| Privacy policy | `privacy-policy.html` | CCPA/CPRA, GDPR, Google advertising disclosures |
| Cookie policy | `cookie-policy.html` | Per-cookie table, Consent Mode explanation |
| Terms of service | `terms.html` | Booking, liability, arbitration, governing law |
| Refunds | `refund-policy.html` | Full cancellation schedule |
| Disclaimer | `disclaimer.html` | Editorial independence, affiliate + ad disclosure (FTC) |
| Accessibility | `accessibility.html` | WCAG position for site and for trips |
| Sitemap | `sitemap.html` | Human sitemap |
| 404 | `404.html` | Error page, `noindex` |

Plus `robots.txt` and `sitemap.xml`.

## Design system

- **Theme lock:** light only, every page. No section inverts.
- **Accent lock:** one accent, rose `oklch(.545 .185 336)` (`#c22e6c` fallback). Darks are carried by ink, not by the accent.
- **Surface:** pure white body, faint blush surfaces for section alternation.
- **Radius lock:** media/cards 18px, inputs 12px, buttons and tags pill.
- **Type:** Bricolage Grotesque (display) / Instrument Sans (UI+body) / Newsreader (long-form prose only).
- Tokens live at the top of `assets/css/style.css` in both hex and OKLCH (OKLCH applied under `@supports`).

## Motion

Every animation is motivated and reversible:

- Hero entrance stagger (hierarchy).
- IntersectionObserver scroll reveals with grid-aware stagger (reading order).
- Counter animation on the bento stat cells (draws the eye to the group-size claim).
- Card lift, image scale, arrow slide on hover (affordance feedback).
- Sticky header state change via a sentinel element.

No `scroll` event listeners anywhere. `prefers-reduced-motion: reduce` collapses everything to static, and a 2.6s safety timer reveals content if the observer never fires (hidden tabs, headless renderers).

## Google Ads / AdSense readiness

Included: privacy policy, cookie policy, terms, refund policy, disclaimer, about, contact with physical address and phone, accessibility statement, FAQ, sitemap, working consent banner writing Consent Mode v2 signals when `gtag` is present, labelled ad slots that are visually separated from navigation and buttons, affiliate disclosure at point of use, and a plain business-model page.

Before you submit for review:

1. **Replace all placeholder contact details.** Address, phone (`(206) 555-0142` is in the reserved fictional 555-01xx range), and every `@firstlighttravel.co` email.
2. **Decide on advertising.** No ad units ship with this site. The legal pages still describe third-party advertising because the consent banner is built for it; if you never serve ads, strip the advertising sections from `privacy-policy.html`, `cookie-policy.html`, `disclaimer.html`, `pricing.html`, `guides.html` and the footer disclosure. If you do serve ads, add labelled units separated from navigation and buttons.
3. **Wire the contact form.** `contact.html` currently validates client-side and simulates success. Point it at your endpoint and remove the notice in `.form-note`.
4. **Audit cookies.** Run a scanner and correct the tables in `cookie-policy.html` to match what actually loads.
5. **Legal review.** The arbitration clause, refund schedule and Seller of Travel claims are state-specific. Have counsel review them.
6. **Update canonical URLs** in every `<head>` and in `sitemap.xml` / `robots.txt`.

## Images

Photography is loaded from Unsplash CDN URLs. Every `<img>` carries `data-fallback="<seed>"`; if a remote image 404s, `main.js` swaps in `https://picsum.photos/seed/<seed>/<w>/<h>` so no broken image ever renders. Swap in your own licensed photography before launch. Only UI icons are inline SVG; all imagery is photographic.

## Accessibility

Skip link, one `<h1>` per page, semantic landmarks, visible focus rings, 44px minimum touch targets, labels above inputs (never placeholder-only), inline errors next to their field, Escape closes the mobile drawer and restores focus, `[hidden]` respected by filters, reflow to 320px with no horizontal scroll.
