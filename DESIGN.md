---
version: anydesign-1
name: Ember Court
source: src/ (Next.js site); references reboot.studio, tinloof.com, dayjob.work (seesaw.website, curated.design); negative reference commit e62a1f9
captured_at: 2026-09-25
description: |
  A small B2B studio that finds clients by hand and writes the first message itself.
  The site reads like well-kept correspondence: cool paper, blue-black ink, index-card
  rules, and one red editor's pen that explains why each line of a letter is there.
colors:
  paper: "#F2F3EF"
  paper-deep: "#E6E9E3"
  ink: "#17233A"
  ink-muted: "#4B566B"
  rule: "#C9D2DF"
  pen: "#B3302A"
typography:
  display: { fontFamily: "Golos Text, sans-serif", fontSize: 48px, fontWeight: 600, lineHeight: 1.06, letterSpacing: -0.025em }
  heading: { fontFamily: "Golos Text, sans-serif", fontSize: 32px, fontWeight: 600, lineHeight: 1.15, letterSpacing: -0.015em }
  body: { fontFamily: "Golos Text, sans-serif", fontSize: 17px, fontWeight: 400, lineHeight: 1.6 }
  small: { fontFamily: "Golos Text, sans-serif", fontSize: 14px, fontWeight: 400, lineHeight: 1.5 }
  letter: { fontFamily: "PT Serif, serif", fontSize: 18px, fontWeight: 400, lineHeight: 1.7 }
  annotation: { fontFamily: "Golos Text, sans-serif", fontSize: 13.5px, fontWeight: 500, lineHeight: 1.4 }
spacing:
  base: 4px
  scale: [4, 8, 12, 16, 24, 32, 48, 64, 96, 128]
rounded:
  control: 6px
  sheet: 4px
components:
  button-primary: { backgroundColor: "{colors.ink}", textColor: "{colors.paper}", rounded: "{rounded.control}", padding: 12px 20px }
  button-secondary: { backgroundColor: "transparent", textColor: "{colors.ink}", rounded: "{rounded.control}", padding: 12px 20px }
  text-link: { textColor: "{colors.ink}" }
  letter-sheet: { backgroundColor: "#FFFFFF", rounded: "{rounded.sheet}", padding: 32px 36px }
  service-row: { padding: 28px 0 }
---

# Design Analysis: Ember Court

> Analysis generated with the `anydesign` skill. Date: 2026-09-25. Emphasis: design system

## Source

Type: the site's own source in `src/`, written against this file, plus the previous build (commit `e62a1f9`) captured with `capture_site.py` at desktop 1440 and mobile 375. The previous build is the negative reference: near-black `#0B0A09` with one orange accent, uppercase mono eyebrows, an italic accent phrase in the hero, WebGL fire, a marquee, a bento of identical cards and fade-up on every section. Those are the generated-page defaults this system replaces.

References picked from seesaw.website and curated.design and captured with `capture_site.py` (desktop, 3 frames each): **reboot.studio** (one narrow column of large Inter text, the point in black and the explanation in grey, no cards), **tinloof.com** (facts as a key-value column in small type), **dayjob.work** (proof as a dated log of facts). Ember Court takes the single-column reading flow, the key-value facts block and the "facts, not promises" stance; a dated log is deferred until there are real milestones.

## TL;DR

Letters, not landing-page chrome. The hero shows the actual product: a first message with red margin notes. Everything else is quiet paper and ink so that the pen is the only colour on the page.

## 1. Visual identity

### 1.1 Surface description

- Personality: exact, calm, literate, unhurried ✅
- Mood: a well-kept desk: paper, ink, a red pen for corrections ✅
- Stylistic references: editorial correspondence, library index cards, proofreading marks ⚠️
- Information density: low; long measures are capped at 64ch ✅
- Implicit positioning: a small team selling judgment, not volume ✅

### 1.2 Brand voice / Atmosphere

The visitor is a founder who receives bad cold messages every day. The site does not argue that ours are better; it shows one and annotates it. Colour, type and motion stay out of the way because the proof is the writing itself.

### 1.3 The "ONE brand thing"

- The thing: the red pen `{colors.pen}` (#B3302A) as margin notes and underlines on a letter.
- Why: it is what the studio actually does, reading and correcting each line before sending.
- Restraint: everything else is `{colors.ink}` on `{colors.paper}`; no second hue, no gradients.
- Where: hero annotations, strike-through on "what we don't do", the "new" tag. Never on buttons or large fills.

## 2. Design System (tokens)

### 2.1 Colors

| Token | Hex | Role | Where it appears | Confidence |
|---|---|---|---|---|
| `paper` | #F2F3EF | page surface | body background | ✅ |
| `paper-deep` | #E6E9E3 | quiet band | audit offer, fit section | ✅ |
| `ink` | #17233A | text, primary button | headings, body, CTA fill | ✅ |
| `ink-muted` | #4B566B | secondary text | ledes, descriptions | ✅ |
| `rule` | #C9D2DF | index-card lines | row dividers, letter lines | ✅ |
| `pen` | #B3302A | annotations only | margin notes, strike-throughs | ✅ |

Single light theme. The letter sheet is plain `#FFFFFF` to lift it from the paper.

### 2.2 Typography

Golos Text (Paratype, drawn for Russian-language interfaces) for everything except letters; PT Serif (Paratype, Cyrillic heritage) only inside letter sheets. ✅

| Token | Size | Weight | Line-height | Use |
|---|---|---|---|---|
| `display` | 48px (fluid 36-48) | 600 | 1.06 | hero h1 |
| `heading` | 32px (fluid 26-32) | 600 | 1.15 | section h2 |
| `body` | 17px | 400 | 1.6 | paragraphs |
| `small` | 14px | 400 | 1.5 | meta, footer |
| `letter` | 18px | 400 | 1.7 | letter text |
| `annotation` | 13.5px | 500 | 1.4 | red margin notes |

Sentence case everywhere. No uppercase labels, no monospace, no italic accent words in headings.

### 2.3 Spacing

Base 4px. Sections breathe at 96-128px desktop, 64px mobile. Rows inside a section use 24-32px. ✅

### 2.4 Radii

Two values: `{rounded.control}` (6px) for buttons, `{rounded.sheet}` (4px) for the letter sheet. Rows and sections have none. ✅

### 2.5 Elevation system

| Level | Name | Treatment | Use |
|---|---|---|---|
| 0 | flat | none | everything |
| 1 | sheet | `0 1px 0 #C9D2DF, 0 12px 32px -18px rgba(23,35,58,0.35)` | letter sheet only |

Flat by design; one lifted object per page.

### 2.6 Borders

1px `{colors.rule}` (#C9D2DF) between rows, like the lines of an index card. Focus: 2px `{colors.ink}` outline, 3px offset.

### 2.7 Accessibility quick-check

From `design-a11y.md`: ink on paper 14.08:1 AAA; ink-muted on paper 6.63:1 AA; ink-muted on paper-deep 6.03:1 AA; pen on paper 5.59:1 AA; paper on ink (button) 14.08:1 AAA; ink on paper-deep 12.8:1 AAA.

## 3. Components Inventory

### 3.1 Generic components

#### button-primary
- Ink fill `{colors.ink}` (#17233A), paper text, `{rounded.control}` (6px), 12px 20px.
- One per intent: "Написать в Telegram".
- Hover: text underline; no scale, no glow.

#### button-secondary
- Transparent, ink text, 1px ink border at 25% opacity.
- Used once: the free audit request.

#### text-link
- Ink text with a 1px underline at 30% opacity; hover makes the underline solid. No appended arrows.

#### letter-sheet
- White sheet, `{rounded.sheet}` (4px), level-1 elevation, faint `{colors.rule}` lines behind the text every 30.6px (18px × 1.7).

#### service-row
- Title (heading) on the left third, description and link on the right; 1px rule above; 28px vertical padding.

### 3.2 Signature components

- **Annotated letter** (hero): a letter sheet with 4 short paragraphs; each paragraph has a red underline and a numbered margin note in `{colors.pen}` explaining the decision. On load the underlines draw and notes appear one after another (the only choreographed motion on the site).
- **Struck exclusions**: "what we don't do" items are set in `{colors.ink-muted}` with a red 1.5px strike-through, the pen crossing things out.

## 4. Layout & Composition

### 4.1 Grid & containers

One reading column, max width 880px, 24px side padding (16px on phones). Large reading text (24-34px, weight 500) carries the home page; ink for the point, `{colors.ink-muted}` (#4B566B) for the explanation. Hierarchy by size and weight, never by colour.

### 4.2 Composition patterns

Home: one-column statement (ink sentence + muted sentence) with two CTAs → annotated letter → situation as large text → services as one linked sentence plus a two-column definition list → numbered three-step list (real sequence) → key-value facts → fit lists on `paper-deep` → audit offer → contacts. Services: page head, inline section index, then for each service: heading, ordered steps, included items as rows, struck exclusions.

### 4.3 Responsive behavior

| Breakpoint | Behaviour |
|---|---|
| < 768px | one column; letter moves below the hero text; margin notes sit under each paragraph |
| ≥ 768px | two-column hero and rows |

Touch targets ≥ 44px on nav and buttons.

### 4.4 Image behavior

No photography, no stock, no decorative gradients. The only illustration is the coal mark in the logo.

## 5. Reconstruction Notes

Stack: Next.js App Router, Tailwind 4 `@theme` tokens, Motion for the single hero sequence. Quick wins: keep copy in `src/content/*.json`; keep the red for the pen. Tricky bits: aligning margin notes to their paragraph at desktop (grid rows, not absolute positioning). States: hover underline, 2px ink focus ring, `prefers-reduced-motion` shows the finished letter immediately.

| Layer | Confidence | Why |
|---|---|---|
| Tokens | ✅ | defined here and in `globals.css` |
| Components | ✅ | implemented in `src/components` |
| Motion | ⚠️ | one sequence, tuned by eye |

## 6. Do's and Don'ts

### Do
- Keep `{colors.pen}` (#B3302A) for annotations, strike-throughs and the "new" tag only.
- Set every heading in sentence case in Golos Text 600 with negative tracking.
- Use PT Serif only inside a letter sheet.
- Use numbers only for real sequences (process steps, letter notes).
- Separate rows with 1px `{colors.rule}` lines instead of cards.

### Don't
- Don't add uppercase or monospace labels above headings.
- Don't colour or italicise a single word in a headline.
- Don't animate sections on scroll; the hero letter is the one moment of motion.
- Don't append arrows to links or buttons.
- Don't introduce a dark theme, gradients or a second accent hue.

## 7. Open Questions

- Real client results (numbers for Camirix) would replace the illustrative letter as the strongest proof.
- A custom domain and brand email would change the contact block.

## 8. Companion files

- `design-tokens.json`: generated from the frontmatter with `build_tokens_json.py`.
- `design-a11y.md`: contrast table from `check_contrast.py`.
