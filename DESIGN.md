---
name: Zivra
description: Suas fotos e vídeos, só pra quem você escolheu.
colors:
  envelope: "#ffc629"
  envelope-deep: "#f2b200"
  on-envelope: "#1b1f3b"
  ink: "#16181d"
  ink-soft: "#5f6470"
  paper: "#fafafa"
  print: "#ffffff"
  line: "#e7e7ea"
  pencil: "#e5262f"
  film: "#16181d"
  ink-dark: "#f2f2f3"
  ink-soft-dark: "#a3a6ae"
  paper-dark: "#0d0d0f"
  print-dark: "#17171a"
  line-dark: "#2a2a2e"
  pencil-dark: "#ff4a52"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 4rem)"
    fontWeight: 900
    lineHeight: 1.02
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 112"
  wordmark:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontWeight: 900
    lineHeight: 0.92
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 125"
  headline:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.33
  title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.375
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "'tnum'"
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.43
rounded:
  md: "0.375rem"
  lg: "0.5rem"
  xl: "0.75rem"
  2xl: "1rem"
  full: "9999px"
spacing:
  gutter: "1rem"
  stack: "1rem"
  bar: "3.5rem"
  feed: "500px"
  profile: "56rem"
  frame: "64rem"
components:
  button-primary:
    backgroundColor: "{colors.envelope}"
    textColor: "{colors.on-envelope}"
    rounded: "{rounded.lg}"
    padding: "0.5rem 1.25rem"
  button-primary-hover:
    backgroundColor: "{colors.envelope-deep}"
    textColor: "{colors.on-envelope}"
  button-secondary:
    backgroundColor: "{colors.line}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "0.5rem 1.25rem"
  button-destructive:
    backgroundColor: "{colors.pencil}"
    textColor: "{colors.print}"
    rounded: "{rounded.md}"
    padding: "0.75rem 1.25rem"
  input-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "0.625rem 0.75rem"
  card:
    backgroundColor: "{colors.print}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
  avatar-fallback:
    backgroundColor: "{colors.envelope}"
    textColor: "{colors.on-envelope}"
    rounded: "{rounded.full}"
  icon-chip:
    backgroundColor: "{colors.envelope}"
    textColor: "{colors.on-envelope}"
    rounded: "{rounded.full}"
    size: "2.75rem"
  top-bar:
    backgroundColor: "{colors.print}"
    textColor: "{colors.ink}"
    height: "{spacing.bar}"
---

# Design System: Zivra

## Overview

**Creative North Star: "The Quiet Feed"**

Zivra is a plain social layout that gets out of the way of people's photos. One shell serves every signed-in and public screen: a sticky translucent top bar with the wordmark and icon actions, a single centered content column, and a bottom tab bar on phones. There is no side menu. The feed reads like Instagram (one 500px column of cards); the profile reads like Pinterest (a masonry of prints in columns).

The surface is neutral: near-white paper, white cards, hairline gray borders, near-black ink, with a full dark scheme driven by `prefers-color-scheme`. Envelope yellow is the single accent and appears in small, deliberate doses: the primary action, the avatar fallback, the round icon chips, and text-only posts in the profile grid. Red is functional only (liked state, errors, destruction). Photos supply the rest of the color.

**Key Characteristics:**
- One shell, no sidebar: top bar plus centered column, bottom tabs under 640px.
- Neutral paper and white cards with 1px hairline borders; no decorative shadows.
- Envelope yellow is an accent, never a surface.
- Archivo throughout, with its width axis widened for the wordmark and hero.
- Content edge-to-edge on phones, carded with rounded corners from `sm` up.

## Colors

A neutral gray-and-white ground with one warm yellow accent and one functional red.

### Primary
- **Envelope Yellow** (`envelope`): fills the primary button, the avatar initial fallback, the 44px round icon chips on the landing page, text-selection highlight, and the tile behind a text-only post in the profile masonry. In dark mode it also colors the inline "Publicar" comment action.
- **Envelope Deep** (`envelope-deep`): hover state of the primary button only.
- **Envelope Ink** (`on-envelope`): the deep navy text on any yellow fill. Yellow never carries white or plain ink text.

### Tertiary
- **Grease Pencil Red** (`pencil` / `pencil-dark`): the liked state of the like icon, field errors and form alerts, the over-limit character counter, the destructive "Excluir" buttons, and the text caret.

### Neutral
- **Ink** (`ink` / `ink-dark`): body text, icons, focus rings.
- **Soft Ink** (`ink-soft` / `ink-soft-dark`): timestamps, field labels, placeholders, secondary copy, inactive tabs.
- **Paper** (`paper` / `paper-dark`): page background, input fill, sheet fill.
- **Print** (`print` / `print-dark`): cards, composer, top bar (at 90% with blur), bottom tab bar, the landing features band.
- **Line** (`line` / `line-dark`): every border and divider, and the fill of the secondary button.
- **Film** (`film`): the modal backdrop at 70% opacity. Photo and video containers sit on pure black.

### Named Rules
**The Accent-Only Rule.** Envelope yellow fills controls and small marks (primary button, avatar fallback, icon chip, text-post tile), never a page, section, header, or card background. If a screen reads as yellow, it is wrong.

**The Red Means State Rule.** Pencil red only reports something: liked, error, limit reached, or destroy. It is never decoration or emphasis.

## Typography

**Display Font:** Archivo (variable, with `wdth` axis; fallback system-ui, sans-serif)
**Body Font:** Archivo
**Label Font:** Archivo

**Character:** One grotesque family doing all the work. Weight and the width axis carry hierarchy: the wordmark and hero headline widen and go black; everything else stays at normal width (sheet titles excepted, at wdth 112) so the interface feels like a familiar social app. Numerals are tabular everywhere.

### Hierarchy
- **Wordmark** (900, wdth 125, line-height 0.92, -0.02em): the lowercase "zivra" logotype and the profile 404 message only.
- **Display** (900, clamp(2.5rem, 6vw, 4rem), line-height 1.02, wdth 112, tight tracking): the landing hero headline. Policy pages use the same weight at 2.25rem.
- **Headline** (700, 1.5rem): page titles (auth card, follow requests) and empty-state headings at 1.25rem.
- **Title** (600, 1.25rem): profile username, text-only post body in the feed, settings section titles at 1.125rem bold.
- **Body** (400, 1rem, line-height 1.5): captions, comments, bios (max 60ch), hero lead (1.125rem, 42ch, relaxed).
- **Label** (600, 0.875rem): field labels in Soft Ink, error messages in red, captions under counts.

### Named Rules
**The Weight Not Size Rule.** Usernames, like counts and action words are set semibold at body size, like Instagram; hierarchy inside a card comes from weight, not from bigger type.

## Layout

A single shell for every screen. The top bar is 56px tall, sticky, with content capped at 64rem and 1rem side gutters. Below it a single centered column whose width depends on the page: the feed at 500px, profile at 56rem, settings and follow requests at 36rem, policy pages at 42rem, auth at 24rem centered without the bar.

Under the `sm` breakpoint (640px) signed-in users get a fixed 4-column bottom tab bar (feed, new post, settings, profile) respecting the safe-area inset, and main content gets 5rem bottom padding. Feed cards and the composer go edge to edge on phones (top and bottom borders only) and become bordered rounded cards from `sm` up.

The profile grid is a CSS columns masonry: 2 columns with 4px gaps on phones, 3 columns with 16px gaps from `sm`. Images keep their natural aspect. The landing hero splits into a text column and a 3-column photo mosaic from `md` (768px).

Rhythm: 1rem is the default gap and card padding; 0.75rem inside card headers; 2rem to 3rem between page sections.

## Elevation & Depth

Flat. Depth comes from tonal layering (white Print cards on gray Paper) and 1px Line borders, not shadows. The only blur is the top bar: Print at 90% opacity with `backdrop-blur-md` so content scrolls under it. Modals use a native `<dialog>` over a Film backdrop at 70%. Hover feedback is a 5% ink wash (`ink/5`), not a lift.

### Named Rules
**The Hairline Rule.** Separate with a 1px Line border or a tonal step. No drop shadows on cards, buttons, bars or sheets.

## Shapes

Soft, consistent corners. Controls and icon hit areas are rounded 8px (`lg`); cards, the composer, settings sections and masonry tiles 12px (`xl`) from `sm` up; the auth card 16px (`2xl`); sheets 8px (top corners only on phones, where they rise as bottom sheets). Avatars and icon chips are full circles. Destructive buttons use 6px (`md`). Photos are cropped by their card's radius and never framed.

Icons are authored for Zivra: 24px grid, 1.75 stroke, round caps and joins, single `currentColor` path. The like mark is a hand-drawn loop, not a heart. The logo mark is an Envelope Yellow rounded square with navy sprocket holes and a heavy navy Z, in fixed brand colors on both schemes. In the lockup it tilts -8deg like a stuck-on sticker, and the wordmark's i carries a small yellow square for its dot. App icons stay upright.

## Components

### Buttons
- **Shape:** gently rounded (8px).
- **Primary:** Envelope Yellow fill, Envelope Ink text, bold, 0.5rem 1.25rem padding; 0.75rem vertical in forms, 0.75rem 1.5rem at 1.125rem in the hero. One primary per decision (Postar, Seguir, Aceitar, Criar conta).
- **Hover / Focus:** fill deepens to Envelope Deep over 150ms; focus is a 2px ink outline at 2px offset (navy on yellow surfaces). Disabled drops to 50% opacity.
- **Secondary:** Line-gray fill with ink text, same shape and padding; hover fades to 80% opacity. Used for Entrar, Editar perfil, Seguindo, Solicitado, Recusar.
- **Destructive:** 2px red outline with red text to open, solid red with white text to confirm, 6px radius.
- **Icon buttons:** bare icon in an 8px-radius hit area with 8px padding and an `ink/5` hover wash.

### Chips
- **Icon chip:** 44px Envelope Yellow circle holding a 24px icon in Envelope Ink, beside a short feature title. Landing page only so far.

### Cards / Containers
- **Corner Style:** 12px from `sm`; square and edge-to-edge on phones.
- **Background:** Print on Paper.
- **Shadow Strategy:** none (see Elevation).
- **Border:** 1px Line, full border from `sm`, top and bottom only on phones.
- **Internal Padding:** 1rem; post header 0.75rem 1rem; settings sections 1.5rem 1.25rem (1.75rem sides from `sm`).

### Post Card
Header row (32px avatar, semibold username, soft "· há 2 horas"), full-width media on black capped at 80vh, then the action row (loop like, comment), semibold like count, caption with the username inline, a "Ver os N comentários" toggle, and a borderless comment input separated by a hairline. Double-click on a photo likes it. Text-only posts set the text at Title size in place of media.

### Profile Masonry
Pinterest-style columns of tiles with natural aspect ratios. On hover or focus a black-to-transparent gradient rises from the bottom with like and comment counts in white. Text-only posts render as an Envelope Yellow tile with up to six lines of semibold Envelope Ink text. Opening a tile shows the full Post Card in a sheet.

### Inputs / Fields
- **Style:** Paper fill, 1px Line border, 8px radius, 0.625rem 0.75rem padding, 1rem text; label above in 0.875rem semibold Soft Ink.
- **Focus:** border shifts to Ink, no glow.
- **Error:** border turns Pencil Red and a semibold red message sits under the field.
- **Inline inputs** (composer, comment box) are borderless and transparent inside their card.

### Navigation
- **Top bar:** wordmark left; right side icon links (feed, new post, follow requests, settings) and a 32px avatar linking to the profile. Active tab in Ink, inactive in Soft Ink, hover `ink/5` wash. Visitors see a plain "Entrar" text button and a primary "Criar conta".
- **Bottom tabs (phones):** four equal cells, 28px icons, Print fill with a top hairline.

### Sheet
Native `<dialog>`: a bottom sheet up to 92dvh on phones, a centered 36rem panel from `sm`. A sticky header with a bold, slightly widened (wdth 112) title and a close icon, separated by a hairline. Used for an opened post and follower lists.

### Avatar
Circle, cover-cropped photo. Without a photo: Envelope Yellow disc with the uppercase first initial in bold Envelope Ink.

## Do's and Don'ts

### Do:
- **Do** route every screen except auth through the one shell: top bar, centered column, bottom tabs under 640px.
- **Do** keep Envelope Yellow to the primary button, avatar fallback, icon chips and text-post tiles, always with Envelope Ink text.
- **Do** separate surfaces with 1px Line borders and the Paper/Print tonal step.
- **Do** let content run edge to edge on phones and card it (12px radius, full border) from `sm` up.
- **Do** draw new icons on the 24px grid with 1.75 stroke and round caps, in `currentColor`.
- **Do** define every new color for both schemes, as the root tokens do.

### Don't:
- **Don't** add a side menu or a second navigation layout.
- **Don't** fill pages, sections, headers or cards with yellow.
- **Don't** use Pencil Red for anything but liked, error, limit and destructive states.
- **Don't** put drop shadows on cards, buttons or bars.
- **Don't** bring in an icon library or emoji as icons.
- **Don't** widen Archivo beyond normal width outside the wordmark, the hero headline and sheet titles.
