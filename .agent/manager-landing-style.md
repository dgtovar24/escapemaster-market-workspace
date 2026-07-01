# Manager Landing Page Aesthetics

This document serves as the canonical memory for the aesthetics of the EscapeMaster Manager landing page (`manager.astro`). Always adhere strictly to these rules when making changes or additions.

## Core Aesthetic
**Minimalist B2B SaaS / Technical Editorial / Brutalist Blueprint**

The design is meant for a developer-oriented, high-end enterprise utility. It avoids colorful "AI slop" in favor of severe, structured, and deliberate precision.

## Typography
- **Headings (Display)**: `Syne` - Used for massive block text and hero statements in uppercase.
- **Body**: `Space Grotesk` - Default sans-serif for comfortable, geometric, yet technical reading.
- **Accents/Utilities**: `JetBrains Mono` - Crucial for navigation, system tags, timestamps, buttons, and sub-labels. Always uppercase, heavily tracked (`tracking-[0.1em]` or `tracking-[0.2em]`), and often wrapped in thin borders.

## Colors & Theming
Built natively around CSS custom properties for easy theme-switching. The baseline default is:
- `--tech-bg`: White
- `--tech-surface`: Light gray for slight contrast
- `--tech-border`: Very subtle translucent black (`rgba(0,0,0,0.08)`)
- `--tech-text`: Near black (`#111111`)
- `--tech-accent`: Deep black (`#000000`)

*Themes must maintain extreme contrast and limited hues (monochrome or duotone limits).*

## Signatures & Motifs
- **Dot Grid Background**: Used to create a "blueprint" or "graph paper" effect (`.bg-dot-grid`).
- **Blueprint Framing**: Use the `.blueprint-frame` utility which adds thin borders and corner 4x4px accent squares to containers.
- **Micro-wireframes**: Use `.wireframe-stroke` for SVG icons and simple geometric shapes that imply UI layouts rather than realistic colorful mockups.
- **Asterisk Logo**: The brand mark is a simple, massive monospace asterisk `*`.
- **Harsh Shadows**: Interactive elements should feature 0-blur harsh shadow displacements on hover (e.g., `box-shadow: 4px 4px 0px rgba(0,0,0,1)`).
- **Giant Footer Typography**: Ends with overlapping, outline-stroked typography that covers the width of the screen.

**NEVER use:** generic gradients, soft rounded colorful shadows, overused illustration packs (like flat color human figures), or default Tailwind colors without overriding their semantic intent.
