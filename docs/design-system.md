# Tropical Design System

The Tropical Design System is a premium, high-contrast visual framework created 
specifically for the EscapeMaster ecosystem. It combines organic, vibrant colors 
with technical precision.

## Design Philosophy

- **Vibrant Professionalism:** Use saturated colors for interactive elements.
- **Glassmorphism:** Use backdrop blurs and semi-transparent surfaces to create 
  depth.
- **Heading Hierarchy:** High contrast between oversized, bold headings and 
  refined body text.

## Color Palette

The following CSS variables are available in `src/styles/global.css`:

- `--color-tropical-primary`: #0d3d34 (Deep forest green).
- `--color-tropical-secondary`: #d56a34 (Terracotta accent).
- `--color-tropical-accent`: #ff6b6b (Soft coral / Alert).
- `--color-tropical-light`: #f8fafc (Clean slate).
- `--color-tropical-dark`: #0f172a (Deep ink).

## Typography

- **Headings:** `Outfit` (Sans-serif) with weights 700 and 900.
- **Body:** `Inter` (Sans-serif) for high readability in technical data.
- **Mono:** `JetBrains Mono` for IDs and technical logs.

## UI Components

### Badges
Use the following variants for the `Badge` component:
- `tropical`: Primary status (Primary background, white text).
- `outline`: Secondary or inactive status.

### Buttons
- **Primary:** Use `variant="tropical"` for core actions.
- **Secondary:** Use `variant="outline"` for alternative paths.
- **Destructive:** Use `variant="ghost"` with `text-tropical-accent`.
