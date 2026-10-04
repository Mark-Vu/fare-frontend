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

The landing-page conversation is illustrative. The dashboard is connected to
the Go backend’s real group planning workflow.

## Live group dashboard

Open `/dashboard/{groupId}` using the actual WhatsApp group ID. The page connects
to the Go orchestrator's group WebSocket. A bot planning trigger creates a session,
shows a popup, and links to `/dashboard/{groupId}/{sessionId}`. The session page
follows the backend's searches, browser frames, planning checkpoints, and saved
itinerary; opening a page never launches additional searches.

The backend waits for the group's destination choice before searching. Searches
run concurrently. The final plan has expandable days with timed local activities.
Reconnects receive a fresh saved snapshot instead of restarting paid work.

Configure `web/.env.local` from `web/.env.example`:

```dotenv
NEXT_PUBLIC_ORCHESTRATOR_URL=http://localhost:8000
NEXT_PUBLIC_ORCHESTRATOR_WS_URL=ws://localhost:8000
```

The frontend no longer connects directly to the individual travel-service
bridges. Configure their URLs on the Go backend instead:

```dotenv
DASHBOARD_URL=http://localhost:3000
MOCK_LLM=false
MOCK_TRAVEL=false
FLIGHT_SERVICE_WS_URL=ws://127.0.0.1:8765
HOTEL_SERVICE_WS_URL=ws://127.0.0.1:8766
SEARCH_FRONTEND_ORIGIN=http://localhost:3000
```

Both Python bridges support `WS_PORT`, retaining 8765 as the default. Run the
flight bridge on 8765 and the hotel bridge with `WS_PORT=8766`, using each service's
own environment and credentials. The Go backend can alternatively use the
services' Lambda HTTP URLs for results, but those calls do not provide live frames.
Restart the Go orchestrator after changing these URLs, and restart a Python
bridge after changing its service code. Running bridges alone does not enable
streaming while the orchestrator's WebSocket URLs are empty.

`MOCK_TRAVEL=true` on the backend provides mock travel offers with real workflow
events; Gemini still needs its configured key. No frontend mock events or sample
group history are used in the dashboard. Saved snapshots retain up to 20 sessions
per group, using Mongo when configured. Browser frames are not stored.

See the Go backend's README for the endpoints and event contract.
