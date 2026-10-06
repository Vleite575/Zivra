---
name: Zivra
description: Suas fotos e vídeos, só pra quem você escolheu. A one-hour photo lab envelope, not a white-card feed.
colors:
  envelope: "#ffc629"
  envelope-deep: "#f2b200"
  on-envelope: "#1b1f3b"
  ink: "#1b1f3b"
  ink-soft: "#4a4f6e"
  paper: "#f4f5f7"
  print: "#ffffff"
  line: "#d5d7de"
  pencil: "#e5262f"
  film: "#17140f"
  darkroom-ink: "#f1eee8"
  darkroom-ink-soft: "#b5ad9f"
  darkroom-print: "#221e18"
  darkroom-line: "#3a342b"
  darkroom-pencil: "#ff4a52"
typography:
  wordmark:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(4.5rem, 21vw, 17rem)"
    fontWeight: 900
    lineHeight: 0.92
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 125"
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 5.5vw, 4.25rem)"
    fontWeight: 900
    lineHeight: 0.92
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 125"
  headline:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 900
    lineHeight: 0.92
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 125"
  title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.4
    fontVariation: "'wdth' 112"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "'tnum' 1"
  lead:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.04em"
    fontVariation: "'wdth' 70"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  full: "9999px"
spacing:
  gutter: "16px"
  gutter-wide: "32px"
  section: "80px"
  container-wide: "72rem"
  container-profile: "56rem"
  container-doc: "48rem"
  container-app: "36rem"
components:
  button-primary:
    backgroundColor: "{colors.on-envelope}"
    textColor: "{colors.envelope}"
    typography: "{typography.title}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-hero:
    backgroundColor: "{colors.on-envelope}"
    textColor: "{colors.envelope}"
    typography: "{typography.title}"
    rounded: "{rounded.md}"
    padding: "16px 24px"
  button-outline:
    textColor: "{colors.on-envelope}"
    typography: "{typography.title}"
    rounded: "{rounded.md}"
    padding: "10px 24px"
  button-text:
    textColor: "{colors.on-envelope}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  nav-item:
    textColor: "{colors.on-envelope}"
    typography: "{typography.title}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  nav-item-active:
    backgroundColor: "{colors.on-envelope}"
    textColor: "{colors.envelope}"
  nav-item-hover:
    backgroundColor: "{colors.envelope-deep}"
  tab-bar:
    backgroundColor: "{colors.film}"
    typography: "{typography.label}"
    height: "64px"
  field:
    textColor: "{colors.on-envelope}"
    typography: "{typography.body}"
    padding: "8px 0"
  print:
    backgroundColor: "{colors.print}"
    textColor: "{colors.on-envelope}"
    padding: "5% 5% 12px"
  slip:
    backgroundColor: "{colors.print}"
    textColor: "{colors.on-envelope}"
    rounded: "{rounded.sm}"
    padding: "36px 24px 32px"
  composer:
    backgroundColor: "{colors.envelope}"
    textColor: "{colors.on-envelope}"
    rounded: "{rounded.sm}"
    padding: "16px"
  sheet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    width: "36rem"
  avatar:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.full}"
    size: "36px"
---

# Design System: Zivra

## Overview

**Creative North Star: "The One-Hour Photo Lab Envelope"**

Zivra is the envelope you picked up from the photo lab: chrome-yellow paper, blue-black printed ink, white-bordered prints inside, frame numbers along the film edge, a red grease pencil for circling the shots you like. Every surface is one of those physical things. The yellow envelope is the chrome (top strip, side rail, profile header, composer, auth background); the prints are the content; the film base is the dark strip that carries frames (the tab bar, the contact sheet, the landing's roll section, the footer).

Density is low and rhythm is chronological. One column of prints, in order, with generous vertical air between frames. Type is a single variable family, Archivo, pushed to its extremes on the width axis: expanded black for anything that announces, normal width for reading, condensed bold for the film's edge code. The world refuses the white-card gradient feed and the dark neon short-video feed; it is warm, printed, analog and tactile.

Motion is rare and physical: the grease-pencil loop drawing itself around a liked print, a primary CTA lifting 2px on hover. Nothing pulses, glows or bounces.

**Key Characteristics:**
- Chrome-yellow envelope chrome around white prints; blue-black envelope ink on both.
- One family (Archivo) carrying three voices by width: Expanded 125 display, normal body, Condensed 70 edge code.
- Content is always a print: white border, soft drop shadow, frame number with arrow underneath.
- Red is a pencil, not a brand color: likes, errors, the caret, your marks.
- Dark mode is the darkroom: warm film-base black, never navy.

## Colors

A full-saturation chrome yellow and a blue-black ink do all the brand work; everything else is paper, film and a single red pencil.

### Primary
- **Envelope Chrome Yellow** (envelope): the lab envelope itself. Fills app chrome (mobile top strip, desktop side rail), the profile header, the post composer, the auth background, landing hero and closing CTA bands, the sealed-private card, and text selection. It is a field color, applied in large flat areas, not a highlight.
- **Envelope Fold Yellow** (envelope-deep): the darker fold of the same paper. Hover fill for items sitting on yellow, and the triangular flap on the sealed-envelope card.

### Secondary
- **Envelope Ink Blue-Black** (on-envelope): the printed ink on the envelope. Text and icons on yellow, text on white prints and slips, and the fill of every primary button (with yellow text). It does not change in dark mode, because the envelope and the prints do not change in the darkroom.

### Tertiary
- **Grease-Pencil Red** (pencil; darkroom-pencil in dark): the like loop, the liked count, field and form errors, the over-limit character counter, the text caret. Never a fill, never a button, never decoration.

### Neutral
- **Ink** (ink / darkroom-ink): body text on the page background. Same value as envelope ink in light mode; flips to warm off-white (darkroom-ink) in dark.
- **Soft Ink** (ink-soft / darkroom-ink-soft): metadata, timestamps, handles, secondary paragraphs, empty states.
- **Cool Print White** (paper; film in dark): page background for app screens and sheets.
- **Print White** (print / darkroom-print): the bright alternating landing band. Physical prints and slips stay literal white in both schemes.
- **Rule Grey** (line / darkroom-line): dividers between list rows, comment thread rule, sheet header rule, scrollbar thumb.
- **Film Base** (film): warm near-black of developed film. Mobile tab bar, the contact-sheet strip on profiles, the landing film-roll band and footer, the dialog backdrop (at 70%), and the darkroom page background.

### Named Rules
**The Pencil Rule.** Red is only ever a mark someone made: a like, a correction, a caret, a limit crossed. If it is not a mark, it is not red.

**The Paper Doesn't Develop Rule.** Envelopes, prints and slips keep their light-mode colors in dark mode (yellow, white, blue-black ink). Only the room around them goes dark.

**The Darkroom Rule.** Dark backgrounds are warm film-base black (film), never navy or neutral grey.

## Typography

**Display Font:** Archivo, Expanded (wdth 125), Black 900 (fallback system-ui, sans-serif)
**Body Font:** Archivo, normal width, 400 to 700
**Label/Mono Font:** Archivo, Condensed (wdth 70), Bold 700; the film edge code

**Character:** One variable grotesque stretched across its width axis, so the whole ramp feels like one printer's job: shouting headlines in expanded black, plain reading text, and the condensed edge print of a film rebate. Tabular numerals are on globally so counts and frame numbers line up.

### Hierarchy
- **Wordmark** (900, wdth 125, clamp(4.5rem, 21vw, 17rem), 0.92): the lowercase "zivra" spanning the landing hero. Smaller instances (1.5rem to 2.25rem) in app chrome and auth header.
- **Display** (900, wdth 125, clamp(2.5rem, 5.5vw, 4.25rem), 0.92, -0.02em): landing hero headline. Profile names reach 4.5rem on desktop.
- **Headline** (900, wdth 125, 2.25rem to 3rem, 0.92): page titles (Pedidos, Ajustes, doc pages), section headings, slip titles. Measures capped at 14 to 16ch.
- **Title** (700, wdth 112, 1.125rem to 1.5rem): buttons, nav items, sheet headings, empty-state headings, profile counts, text-only posts (1.5rem).
- **Body** (400, 1rem / 15px in comments and captions, 1.5): post text, comments, lists. Long-form prose at 1.125rem, relaxed, max 68ch.
- **Lead** (400, 1.125rem to 1.25rem, 1.625): the paragraph under a headline, 34 to 60ch.
- **Label** (700, wdth 70, 0.75rem, 0.04em): frame codes ("07A" plus arrow), character counters, film rebate marks, mobile tab labels (11px). Uppercase only for order-form field labels and profile count labels.

### Named Rules
**The Three Widths Rule.** Width carries the role: 125 announces, 112 acts (buttons, nav, titles), 100 reads, 70 marks the edge. Do not introduce a second family.

**The Edge Code Rule.** Condensed edge type belongs to things printed on film and order forms: frame numbers, counts, counters, field labels. It never heads a section.

## Layout

Mobile-first single column. App screens (feed, settings, requests) sit in a 36rem column with 16px gutters (24px from sm), 24px top padding (40px from md). Profiles widen to 56rem; doc pages 48rem; the landing runs at 72rem with 16px/32px gutters.

Signed-in chrome: below md, a sticky 56px yellow top strip (wordmark left, avatar right) plus a fixed film-black tab bar of four items honoring the safe-area inset; main content gets 80px bottom padding to clear it. From md, a sticky full-height 256px yellow side rail with the wordmark, a 48px gap, then the nav stack and logout pinned to the bottom.

Landing is a stack of full-bleed color bands (envelope, film, paper, print, envelope, film) with 64 to 96px vertical padding; two-column splits at md (1.1fr / 1fr in the hero). The profile is a yellow header band over a film-black contact sheet: a 3-column grid of square frames (8px gaps, 16px on sm) between sprocket-hole strips. Feed posts are separated by 24px vertical padding, not by cards or rules.

## Elevation & Depth

Flat chrome, lifted paper. Yellow bands, film strips and the page are flat; only physical paper objects (prints, slips, the sealed envelope card) cast a shadow, and it is a long, soft, blue-black-tinted drop with a negative spread, as if the paper sits a few millimetres off a table under overhead light.

### Shadow Vocabulary
- **Print drop** (`box-shadow: 0 18px 40px -18px rgb(27 31 59 / 0.45)`; feed posts use `-22px` spread at 0.5): every print and post frame.
- **Slip drop** (`box-shadow: 0 24px 50px -24px rgb(27 31 59 / 0.55)`; the envelope card uses 0.5): larger paper objects, the auth slip and the sealed-envelope card.

### Named Rules
**The Only Paper Lifts Rule.** Shadows belong to prints, slips and envelopes. Buttons, nav, the composer, chrome and sheets stay flat.

## Shapes

Nearly square. Paper is cut, not molded: prints are sharp-cornered; slips, envelope cards, the composer and in-band notices use a barely-there 4px corner. Interactive elements (buttons, nav items, hover fills) use 6px. Sheets get 8px (top corners only on mobile). Only avatars are round, with a 2px print-colored ring on photos.

Recurring silhouettes: the perforated top edge of the order slip (a row of envelope-yellow half-circles every 12px), the envelope flap (a downward triangle in envelope-deep across the top half), sprocket holes (12px white bars every 24px), and the grease-pencil loop (an open hand-drawn ellipse overshooting its print by 6%). Prints tilt a few degrees (-6 to 5) only when fanned or displayed on the landing; the feed is straight.

## Components

### Buttons
Printed, plain and confident: ink blocks with yellow letters, like the envelope's own type.
- **Shape:** softly squared (6px).
- **Primary:** envelope ink fill, envelope yellow text, title weight at wdth 112, 12px 24px (hero and forms 14 to 16px vertical, 1.125rem text). Hero CTA lifts 2px on hover over 200ms with the expo-out ease.
- **Outline:** 2px envelope-ink border, transparent fill, same type; for secondary profile actions (Editar perfil, Seguindo, Cancelar pedido).
- **Text:** underlined semibold link-button (Recusar, Já tenho conta, Entrar).
- **Disabled:** submit drops to 60% opacity; the composer's Postar becomes transparent with a 2px inset ink ring at 30% and 60% text.
- **Focus:** 2px outline offset 2px, ink on the page, envelope ink on yellow and white surfaces.

### Cards / Containers
There are no cards. Containers are paper objects:
- **Print:** white border at 5% of width (12 to 16px on feed posts), image at 4:5 or capped at 70vh, caption row with handle and frame code underneath, print drop shadow, square corners.
- **Order slip:** white, 4px corners, perforated top edge, headline title, 36px top padding; hosts every auth form.
- **Sealed envelope:** 4:3 yellow card with a fold-yellow flap triangle, lock icon and a title-weight label; the private-profile state.
- **Sheet:** native dialog on paper, bottom sheet under sm (92dvh max), centered 36rem panel above, film backdrop at 70%, sticky header with a rule.

### Inputs / Fields
Order-form fields: an uppercase condensed label above a 2px underline at 25% ink; the value is written on the line, no box. Focus darkens the rule to full ink; errors turn it pencil red with a semibold red message below. The comment input uses the same underline on the line color. The composer is a borderless textarea on a yellow block.

### Navigation
- **Desktop rail:** yellow, title-weight items at 1.125rem with 24px icons, 6px corners; hover fills fold yellow; current page inverts to ink fill with yellow text.
- **Mobile tab bar:** film black, four items, 24px icon over an 11px condensed label in white at 70%; current item turns envelope yellow.
- **Icons:** custom 24px line set, 1.75 stroke, round caps and joins, drawn from the lab world (stack of prints, envelope, grease-pencil loop).

### Grease-Pencil Loop (signature)
Liking draws a red hand-drawn ellipse around the print: a 1.5-unit stroke plus a second 0.7-unit pass offset half a unit at 55% opacity, roughened by a fractal-noise displacement for a waxy edge. It draws via stroke-dashoffset over 520ms on the expo-out ease and fades out when un-liked. The like button shows a matching loop icon and turns the count red. Double-tapping a photo also likes it.

### Frame Code
Every print carries its number in edge type: zero-padded id plus "A" and a small solid right-pointing triangle, at 0.75rem, in ink at 60 to 70% on white or in yellow on film.

### Contact Sheet
Profile posts as a 3-column grid of square frames on film black, bounded top and bottom by sprocket strips, each frame with its code beneath and its own loop if liked. Hover adds a 10% white wash.

## Do's and Don'ts

### Do:
- **Do** put every photo or post inside a print: white border, print drop shadow, frame code underneath.
- **Do** use envelope yellow as a field (bands, rail, strip, composer), with envelope ink for all text and icons on it.
- **Do** carry voice through Archivo's width axis: wdth 125 at 900 for headlines, 112 at 700 for buttons and titles, 70 at 700 for edge codes and field labels.
- **Do** keep red to marks: likes, errors, the caret, crossed limits.
- **Do** go warm black (film) for dark surfaces and the darkroom theme, and keep prints, slips and envelopes in their light colors there.
- **Do** honor reduced motion; the loop and lifts collapse to instant.

### Don't:
- **Don't** use white rounded cards with gradients, or a dark neon video-feed look.
- **Don't** use red as a button, fill, badge or brand accent.
- **Don't** use navy or neutral grey for dark surfaces.
- **Don't** add shadows to buttons, chrome, the composer or sheets; only paper lifts.
- **Don't** head sections with small uppercase edge-type labels; edge type marks film and forms, not content structure.
- **Don't** pull icons from a library or use glyph icons; draw them on the 24px, 1.75-stroke grid.
- **Don't** set pencil red text on envelope yellow; it falls under AA.
