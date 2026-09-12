# Design System

## Overview
The RiikonCenter design system emphasizes extreme minimalism, consistency, and a mobile-first approach. 

## Invariant Principles
1. **Absolute Minimalism:** Every element must have a clear reason to exist.
2. **Monochrome First:** Design entirely in black and white before introducing accent colors.
3. **Consistent Spacing:** Use the exact Tailwind spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px.
4. **Mobile-First:** All components must look good on mobile devices first.

## Color Palette & Styling
- **Default Palette:** The default color palette strictly focuses on Black and White (Monochrome).
- **Consistency with Shadcn/UI:** The default color palette, sizes, and other related stylings must use the utility classes and CSS variables provided by `shadcn/ui` (e.g., `bg-background`, `text-foreground`, `bg-primary`, `rounded-md`) to ensure consistency.

## Customization
- **Theme Selection:** Users can choose a specific predefined theme or configure a custom theme for themselves.
- **Typography Customization:** Users can change the display font across the platform.

## Typography
```css
Font: Inter (Fallback: -apple-system, BlinkMacSystemFont, sans-serif)
Heading: font-weight: 600, letter-spacing: -0.02em
Body: font-weight: 400, line-height: 1.6
Code: JetBrains Mono / Fira Code

Scale: Use the default Tailwind and Shadcn scale.
```

## Component Rules
- **Border radius:** Follow the `--radius` variable from `shadcn/ui`.
- **Shadows:** Avoid heavy shadows. Rely on borders and background contrast instead, or use the subtle default shadows from shadcn.
- **Buttons:** Use the built-in `shadcn/ui` variants (default, secondary, outline, ghost).
- **Effects:** No gradients, no glow effects, no complex animations.
