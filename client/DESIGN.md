# Design System: Recovr

Recovr is a payment-recovery operations console: operators watch failed
Razorpay payments, review AI retry decisions, and track how much money has been
recovered. The interface must read as **infrastructure a finance team trusts** —
calm, dense, precise. Not a marketing site, not a consumer app.

The tokens and primitives described here are implemented in
`src/styles/index.css`; `src/App.tsx` currently renders a foundations preview
that exercises all of them.

---

## 1. Visual Theme & Atmosphere

**Density 6 · Variance 3 · Motion 2.**

Dark-first, near-monochrome, hairline-ruled. The atmosphere is a trading
terminal in low light: a single deep charcoal canvas, panels that sit barely
above it, thin white-alpha borders doing the structural work, and monospaced
figures everywhere money or identifiers appear. Colour appears only to carry
meaning — a recovered payment, a failed attempt, an in-flight retry. Nothing
glows, nothing gradients, nothing floats on blur.

Layouts are predictable and grid-aligned on purpose — an operator scanning a
table hundreds of times a day is not served by asymmetry or surprise. This is
the deliberate context-override the taste spectrum allows: a cockpit, not a
gallery.

---

## 2. Color Palette & Roles

Cool charcoal neutral ramp. Never pure black (`#000000`).

- **Canvas** (`#0a0b0d`) — page background, the single ground everything sits on
- **Inset** (`#0d0f12`) — recessed wells, sticky table headers
- **Surface** (`#131519`) — cards, panels, side rails
- **Surface Hover** (`#181b20`) — row and control hover
- **Surface Active** (`#1e2128`) — pressed / selected row
- **Hairline** (`rgba(255,255,255,0.07)`) — default 1px border and divider
- **Hairline Strong** (`rgba(255,255,255,0.12)`) — emphasized divider, control outline
- **Primary Text** (`#f2f3f5`) — headings, values, primary copy
- **Muted Text** (`#9aa0aa`) — labels, column meta, secondary copy
- **Faint Text** (`#6b7078`) — timestamps, ids, disabled, eyebrows

**Accent — one only, saturation < 80%:**

- **Steel Blue** (`#5b92d1`) — links, focus rings, active nav, in-flight state.
  Softs: `rgba(91,146,209,0.12)` fill, `rgba(91,146,209,0.5)` focus ring.

**Primary action** is near-white (`#f2f3f5` fill, `#0a0b0d` text) — high contrast,
zero colour. The accent is never spent on a button.

**Semantic status — muted, dark-calibrated, never neon:**

| Role | Meaning (domain) | Text | Soft fill | Border |
|---|---|---|---|---|
| Success | `completed` / recovered | `#46b17f` | `rgba(70,177,127,0.12)` | `rgba(70,177,127,0.32)` |
| Warning | `waiting_for_customer` | `#cf9a3d` | `rgba(207,154,61,0.12)` | `rgba(207,154,61,0.32)` |
| Danger | `failed` | `#d65b54` | `rgba(214,91,84,0.12)` | `rgba(214,91,84,0.32)` |
| Info | `processing` / in-flight | `#5b92d1` | `rgba(91,146,209,0.12)` | `rgba(91,146,209,0.32)` |
| Neutral | `stopped` / `pending` | `#8b909a` | `rgba(255,255,255,0.06)` | `rgba(255,255,255,0.14)` |

One palette throughout — no warm/cool grey drift.

---

## 3. Typography Rules

- **Sans:** `Geist` (400/500/600) — all UI text. Track-tight headings
  (`-0.02em`, `-0.025em` on page titles). Hierarchy is driven by **weight and
  colour**, not size; the scale tops out at 32px.
- **Mono:** `Geist Mono` (400/500) — every amount, count, rate, payment id,
  attempt number and timestamp. `font-variant-numeric: tabular-nums` globally so
  columns of figures align. Density is 6, so numbers are monospaced by rule.
- **Scale:** 12 / 13 / 14 (body) / 16 / 20 / 26 (page title) / 32 (headline
  figure). Body line-height 1.5, headings 1.25.
- **Line length:** `p` capped at ~68ch.
- **Banned:** `Inter`, generic system UI fonts as the primary face. **All serif
  fonts** — this is a dashboard.

---

## 4. Component Stylings

- **Buttons** (`.btn`, `.btn--primary`, `.btn--ghost`, `.btn--danger`,
  `.btn--sm`): flat, 6px radius, 34px tall (28px small). Tactile `translateY(0.5px)`
  on `:active`, no outer glow, no custom cursor. Primary is near-white fill;
  default is transparent with a strong hairline; ghost drops the border; danger
  is a soft red wash with a red hairline. Disabled: 45% opacity, no transform.
- **Cards** (`.card`, `.surface`): `--surface` fill, 1px `--border`, 10px radius.
  Restrained corners on purpose — a dense ops tool, not a landing page (this
  overrides the skill's 2.5rem default). Elevation via `--shadow` only when a
  panel genuinely floats (menus, popovers); in-page panels rely on border and
  the surface step, and dense regions should prefer border-top dividers
  (`.divider`) over nested cards.
- **Badges** (`.badge--{success|warning|danger|info|neutral}`): 20px pill, 4px
  radius, soft fill + matching hairline + a 5px dot in the status colour. Used
  in table cells for payment / attempt state.
- **Inline status** (`.status--*`): dot + label, no fill — for detail rows and
  timelines where a pill would be too heavy.
- **Metric** (`.metric`): mono, 32px, medium weight — the one large type on any
  screen, reserved for headline money figures.
- **Eyebrow** (`.eyebrow`): 12px, uppercase, `0.09em` tracking, faint — section
  and stat labels.
- **Loaders:** skeletal blocks matching the real layout (table rows, stat
  tiles). No circular spinners.
- **Empty states:** a short line naming what will populate the region and the
  action that triggers it (e.g. "No recovery attempts yet — run a simulation").
  No illustrations.
- **Focus:** 2px `--accent-ring` outline, 2px offset, on `:focus-visible` only.
- **App shell:** Fixed 244px left sidebar on the canvas colour, divided from
  content by one right hairline — no fill, no shadow on desktop. Brand lockup
  (28px monochrome mark + "Recovr" / "AI REVENUE RECOVERY" descriptor) sits above
  a flat 34px-row nav; the active row takes `--surface-active`, a 2px inset
  `--accent` left rule and an accent-tinted icon. Settings is pinned to the
  sidebar foot behind a hairline. A 56px header carries only a
  `Recovr / {Section}` breadcrumb and an account slot, on the canvas colour with
  a bottom hairline. Below 900px the sidebar becomes a transform-slid drawer over
  a 55%-black scrim, opened from a header menu button.

---

## 5. Layout Principles

- CSS Grid for page and panel structure; no `calc()` percentage math.
- Content contained to a max width (~1200–1400px) and centred; tables may go
  full-bleed within that.
- No overlapping elements — every control and value owns its cell.
- Predictable, symmetric grids are correct here (Variance 3). The banned
  "3 equal marketing cards" rule does not apply to a KPI stat row, which is a
  data grid — but stat tiles use `auto-fit minmax()`, not hardcoded thirds.
- Single-column collapse below 768px; no horizontal page scroll (wide tables
  scroll inside their own container).
- Full-height regions use `min-h-[100dvh]` / `min-height: 100dvh`, never
  `h-screen` / `100vh`.
- Spacing is a 4px scale (`--space-1`…`--space-8`); vertical rhythm tightens on
  mobile.

---

## 6. Motion & Interaction

Motion 2 — deliberately near-static.

- Transitions on colour and small transforms only, 60–120ms ease. No linear
  easing on anything the user waits for.
- **One perpetual micro-signal:** an in-flight recovery attempt
  (`.badge--info` / `.status--info`) breathes its dot opacity on a 1.8s loop.
  Nothing else animates on an idle screen.
- All motion is `transform` / `opacity` only. Never animate `top`, `left`,
  `width`, `height`.
- Everything under `@media (prefers-reduced-motion: no-preference)`; the pulse
  disappears entirely when reduced motion is requested.
- New rows / lists may fade+rise in once on load with a short stagger; they do
  not re-animate on filter changes.

---

## 7. Anti-Patterns (Banned)

- No emojis, anywhere — UI or copy.
- No `Inter`; no generic system font as the primary face.
- No serif fonts.
- No pure black (`#000000`) — charcoal ramp only.
- No neon, no outer-glow / colored shadows, no glassmorphism / backdrop blur.
- No gradients as decoration (no gradient text, no gradient fills on headers or
  buttons).
- More than one accent colour; any accent at saturation ≥ 80%.
- Spending the accent on primary buttons (they are near-white).
- Colour used decoratively rather than to signal state.
- Custom mouse cursors.
- Circular loading spinners; generic "No data" empty states.
- `100vh` / `h-screen` on full-height regions.
- Fake round numbers (`99.9%`, `50%`), placeholder names (`John Doe`, `Acme`,
  `Nexus`), AI copy clichés ("Seamless", "Elevate", "Unleash", "Next-Gen").
- Broken remote image links; decorative stock photography.
