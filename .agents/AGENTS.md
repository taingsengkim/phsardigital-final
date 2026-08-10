# UI Components
- ALWAYS prioritize using `shadcn-ui` components instead of writing custom Tailwind HTML elements.
- Check the `components/ui` directory for existing components.
- If a component is missing, install it using `npx shadcn-ui@latest add <component-name>` (or the equivalent command configured for this project).

# Typography Standards
Follow this standard typography scale for modern responsive web design:
- **H1 (Main Heading)**: `text-4xl` or `text-3xl` (32px - 48px) - Page title (1 per page)
- **H2 (Section Heading)**: `text-3xl` or `text-2xl` (24px - 32px) - Major content sections
- **H3 (Sub-heading)**: `text-xl` or `text-lg` (20px - 24px) - Subsection headers, card titles
- **H4 (Minor Heading)**: `text-lg` (18px) - Small headings, UI group titles
- **Body Text (Standard)**: `text-base` (16px) - Default text, paragraphs, list items
- **Secondary Body**: `text-sm` (14px) - Captions, form labels, secondary UI
- **Small Text / Badges**: `text-xs` (12px) - Footers, legal text, badges

# Global Layout Scale
- The global root UI scale is set to `85%` via `style={{ fontSize: "85%" }}` on the `<html />` tag in `app/layout.tsx`.
- This ensures all Tailwind `rem` values render smaller globally, simulating a zoomed-out aesthetic. DO NOT REMOVE THIS without explicit user permission.
