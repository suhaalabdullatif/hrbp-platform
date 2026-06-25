---
name: HUMAIN brand design system
description: How the HUMAIN brand was sourced and wired into the HRBP frontend, and the rules for extending it.
---

# HUMAIN brand system (hrbp-platform frontend)

The brand was extracted from an attached HUMAIN brand-guidelines PDF.

- **Palette:** Neutrals White/Black/Stone (#E5E5E5) + signature "Rise" gradient Aqua #00879F → Air #00D49C → Oasis #D0F94A. Primary = aqua.
- **Typography:** Optician Sans for display/headlines/numbers, Inter for body (Inter substitutes for the brand's ABC Repro). Optician Sans was obtained from the npm `optician-sans` package (its bundled webfont), not the PDF — it is single-weight (400), geometric, has digits, limited glyph set. Bundled as a local woff2/woff.
- **Logo:** the HUMAIN wordmark (distinctive double-crossbar H) was cropped from the PDF into transparent PNGs (white + black variants).

**Why token-driven matters:** the UI library is shadcn-style and fully CSS-token-driven, so rewriting the tokens in `index.css` rebrands the entire component library + all pages at once. Prefer token edits over per-component color changes.

**Typography rule (learned the hard way):** a global `h1,h2 { text-transform: uppercase }` rule forced dynamic titles (employee/user names on detail pages, which are `<h2>`) into all-caps — a readability/correctness regression flagged in code review. Keep h1/h2 in the display face but **natural case**; apply the `uppercase` utility explicitly only on static marketing/section headings (login hero, etc.).

**Contrast:** sidebar active state is aqua with white text — keep the aqua deep enough (≈ `189 100% 26%`) for WCAG AA at nav text sizes. Don't lighten it back toward the vivid brand aqua without rechecking contrast.
