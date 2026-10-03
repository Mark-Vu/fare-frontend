# Fare

Fare is a landing-page prototype for an AI group travel planner that lives in
WhatsApp. It turns a group's dates, budgets, and preferences into one shared
trip recommendation—without making one person manage the planning spreadsheet.

The experience follows a sample group trip from the first chat messages through
flight, stay, activity, and group-approval recommendations.

## Highlights

- Responsive, image-led landing page
- Animated WhatsApp planning story with scroll-driven progress
- iPhone-proportioned chat mockups
- Traveler constraint and date-overlap views
- Destination, recommendation, and group-consensus sections
- Reduced-motion support and semantic page structure

## Tech stack

- [Next.js 16](https://nextjs.org/) with the App Router
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [GSAP](https://gsap.com/) and ScrollTrigger for animation
- [Base UI](https://base-ui.com/) and shadcn/ui conventions
- [Tabler Icons](https://tabler.io/icons)

## Getting started

### Requirements

- Node.js 20.9 or newer
- npm

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

```bash
npm run dev        # Start the local development server
npm run build      # Create a production build
npm run start      # Serve the production build
npm run lint       # Run ESLint
npm run typecheck  # Check TypeScript without emitting files
npm run format     # Format TypeScript and TSX files with Prettier
```

## Project structure

```text
app/
  globals.css            Design tokens, components, and responsive styles
  layout.tsx             Fonts and page metadata
  page.tsx               Main landing page
components/
  reveal.tsx             Reusable entrance animations
  whatsapp-story.tsx     Scroll-driven product story
  ui/                    Shared interface primitives
public/images/           Landing-page imagery
lib/                     Shared utilities
```

## Notes

This repository currently contains the front-end concept and demonstration
experience. The WhatsApp conversation, search results, and trip approvals shown
on the page are illustrative and are not connected to a live planning backend.
