# Style lock: Fare

Established: 2026-10-03. Source: user brief, generated travel photography, and viewed product references.

## Palette

- Background: `#f7f6ed` for the page canvas
- Surface: `#fcfbf5` for panels and chat bubbles
- Primary: `#0f3924` for primary controls
- Forest: `#00301a` for dark story and CTA sections
- Sun: `#f2d173` for emphasis on Forest only
- Accent: `#dedc96` with `#072918` on-accent text
- Text primary: `#101e16`, 15.88:1 against Background
- Text muted: `#4b5a50`, 6.73:1 against Background
- Accent brand text: `#146f46`, 5.71:1 against Background
- Button label: `#f9f9f1`, 12.17:1 against Primary
- WhatsApp deep: `#004b33` with white text at 10.22:1
- Dark mode: not needed. One light theme with deliberate Forest sections is locked.

## Color contract

- Text-safe pairings used: Text/Background 15.88, Text/Surface 16.61, Muted/Background 6.73, Primary/On-primary 12.17, Forest/White 14.61, Forest/Sun 9.84, WhatsApp-deep/White 10.22, WhatsApp-ink/Paper 14.21, WhatsApp-ink/Outgoing 13.54, Accent/On-accent 11.04.
- UI-safe pairings used: Ring/Background 4.30, WhatsApp/Paper 3.84, WhatsApp/White 4.40. These carry focus or icon state, not body text.
- Decorative only: Border/Background 1.50, Accent/Background 1.31, Sun/Background 1.37. These never carry small text or sole state meaning.

## Typography

- Display and body: Geist Sans
- Data and short numeric labels: Geist Mono
- Scale: 16px base, hero 72px maximum, section headings 36px to 48px
- Display line-height floor: 1.01

## Shape language

- Radius: 12px controls, 16px panels and imagery, 48px iPhone shell
- Shadow: soft deep-green ambient shadow only on key product surfaces
- Borders: low-contrast hairlines for ledgers and section internals

## Density and spacing

- Base unit: 4px
- Standard section padding: 64px mobile, 80px tablet, 96px desktop
- Pivotal story: viewport-height pinned stage with a 35rem desktop and 28rem mobile phone viewport
- Content panel padding: 24px minimum
- Compact rows: 12px to 20px vertical padding
- Overall density: compact editorial, image-led, no padded filler
- Section separation: fixed section padding. Dark product sections are content surfaces, not alternating separators.

## Structure

- Macrostructure: landing uses Long Scroll Narrative
- Narrative arc: hook H3, problem plus solution plus how F3, mechanism F6, group fit F1, product proof F5, destination range F7, consensus F2, close C2
- Shared chrome: N2 balanced product bar and Ft2 inline footer
- Body archetypes: H3, F3, F6, F1, F5, F7, F2, C2
- Proof note: proof is merged into working product views because no verified customer metrics or testimonials were supplied
- Build record: `.tastemaker/log.json` and the first line stamp in `app/globals.css`

## Reference intelligence

- Reference board: `.tastemaker/reference-board.md`, viewed sources
- Design read: consumer travel landing page for friend groups, mode Persuade, compact editorial travel with a social-native product demonstration
- Dials: variance 7, motion 7, density 6, art direction 8
- Foundation: existing Next.js, Tailwind, and shadcn stack with GSAP added for scroll storytelling
- Quality bar: GuideGeek for one-chat planning, Mindtrip for explained tradeoffs, Layla for trip-specific visual range
- Anti-references: generic AI feature grids, floating chat cards, empty whitespace, fake proof

## Taste memory

- Profile priors used: none
- Decision log: `.tastemaker/decisions.log`
- Last resolved decisions: reject airy spacing and static chat cards; keep compact pacing, a taller iPhone with Dynamic Island, and 20rem destination rows locked to the 5/7 heading grid
- Pending review: overall Long Scroll Narrative structure and scroll duration
- Profile promotion: none. This is one project-specific feedback sequence.
- Memory precedence: the user request for an iPhone shell overrides Tastemaker's default avoidance of decorative device chrome.

## Mood descriptors

Warm, social, capable, escapist.

## Assets

- Anchor: `/public/images/hero-japan-cove.png`
- Photography: four generated travel scenes with cinematic natural light
- Interface icons: Tabler only
- Logo: Tabler Compass with the Geist wordmark, used as a temporary product mark because no brand asset was supplied

## Motion

- Feel: direct and restrained
- Curves: `power3.out` for entrances and linear scrub for the planning story
- Durations: 200ms controls, 300ms photo hover, 550ms section entrance, scroll-linked story for the product demonstration
- Entrance distance: 18px
- Screen track: one GSAP ScrollTrigger pin and scrub, then standard document flow
- Frequency: no decorative loops and no animation on repeated scan tasks
- Reduced motion: the phone expands to show the full thread and section reveals collapse to opacity-only feedback
- Verified by: `audit_motion.py` and browser checks on 2026-10-03

## Do not

- Do not return to 128px to 160px padding on every section.
- Do not use a static cluster of floating message cards.
- Do not use fabricated quotes, metrics, customer names, or logos.
- Do not add a second animation engine.
- Do not add gradient text, purple SaaS color, or sparkle-led AI decoration.
- Do not detach the destination heading from the grid below it.
