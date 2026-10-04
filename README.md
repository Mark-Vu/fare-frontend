# Fare

Fare is the frontend for an AI group travel planner that lives in WhatsApp.
It includes an illustrative landing page and a live dashboard connected to the
Go orchestrator. It turns a group's dates, budgets, and preferences into one
shared trip recommendation.

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
cd web
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
web/
  app/
    page.tsx                         Illustrative landing page
    dashboard/[groupId]/             WhatsApp trip + live search sessions
      [sessionId]/                   Live session dashboard
  components/session/                Browser previews, results, progress, plan
  components/dashboard/              Group list, live trip tabs, session cards
  hooks/                             Group and session event subscriptions
  lib/api/                           Orchestrator HTTP and WebSocket clients
  lib/api/live-trip.ts               Two-way WhatsApp trip (itinerary, money, chat, documents)
  lib/session-snapshot.ts            Snapshot merging and browser event handling
  types/                             Dashboard, session, and service contracts
  public/images/                     Landing-page imagery
```

## Notes

The landing-page conversation is illustrative. The dashboard is connected to
the Go backend’s real group planning workflow: WhatsApp creates the trip,
the session page follows search progress, and itinerary / money / chat stay
in sync both ways.

## Live group dashboard

### Ownership and end-to-end flow

The three sibling repositories have distinct responsibilities:

| Repository                  | Responsibility                                                                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `fare-frontend`             | Render group sessions, live browser previews, offers, planner progress, the WhatsApp itinerary, money, chat, and traveler documents. Choosing a saved fare or stay writes back through the orchestrator and is announced in the group. |
| `fare-orchestrator-service` | Own the chat-driven trip workflow, start searches, select offers with Gemini, save dashboard snapshots, broadcast group events, and apply dashboard choices (flight, stay, budget, payer, documents) without the frontend starting a search. |
| `travel-search-services`    | Run separate Python flight/hotel workers with Skyvern browsers, extract offers, save results, and produce browser frames and recording metadata. |

```text
WhatsApp/Telegram message → Go orchestrator → flight and hotel Python bridges
                                               ↓
                                         Skyvern browsers
                                               ↓
Frontend ← group WebSocket ← Go orchestrator ← frames, progress, saved results
```

1. A planning message in the group chat creates a dashboard session. The group
   page at `/dashboard/{groupId}` receives it and shows a notification linking to
   `/dashboard/{groupId}/{sessionId}`. Use the actual group ID and backend-created
   session ID; URL segments are encoded when constructing API requests.
2. The orchestrator collects preferences and waits for the group's destination
   choice. A `created` session can legitimately have no search or browser yet.
3. After the choice, the orchestrator starts flight and hotel searches
   concurrently. Each service request uses the dashboard session ID as
   `session_id`; the worker supplies its own `search_id` and browser session ID.
4. Workers open Skyvern browsers and emit preview/progress events during
   navigation and extraction. The Go backend forwards these to the group's
   WebSocket with `agentType: "flight"` or `"hotel"`.
5. Workers finalize browser cleanup, recording handling, and result persistence
   before returning `search.result`. An earlier `search.status: complete` means
   extraction finished; the orchestrator still waits for the saved result.
6. Once both searches return usable offers, Gemini selects a flight/hotel
   combination and generates the day-by-day itinerary. Planner checkpoints and
   the saved plan arrive through dashboard snapshots.
7. `session.completed` means the plan is ready for group approval. It does not
   mean travel has been booked. A failed search or planner failure interrupts the
   session and returns the chat workflow to destination choice for a retry.

Opening a dashboard, mounting a component, or reconnecting must never launch or
resubmit a search. The frontend observes work initiated by the chat workflow.
Picking a flight or stay, saving a budget, naming a payer, sending dashboard
chat, or storing passport details are writes against the existing trip. They
do not start Skyvern or call the Python bridges.

`/dashboard` lists WhatsApp-created trips. `/dashboard/{groupId}` shows the
shared itinerary, money, flights & stays, and chat on top, with live search
sessions underneath. `/dashboard/{groupId}/{sessionId}` follows one session
(browser preview when frames exist, saved offers, planner) and embeds the
same WhatsApp plan at the bottom.

This orchestrator maps the singleton WhatsApp trip into the session snapshot
the frontend already understands (`GET /groups/{groupId}/sessions` and
`GET /groups/{groupId}/events`). JPEG Skyvern frames still require the Python
bridges and `FLIGHT_SERVICE_WS_URL` / `HOTEL_SERVICE_WS_URL` on a backend that
forwards worker events. Saved offers and the itinerary still appear from the
chat workflow without those bridges.

### Local streaming configuration

Configure `web/.env.local` from `web/.env.example`:

```dotenv
NEXT_PUBLIC_ORCHESTRATOR_URL=http://localhost:8000
NEXT_PUBLIC_ORCHESTRATOR_WS_URL=ws://localhost:8000
```

The active dashboard connects only to the Go backend. Configure these values in
`fare-orchestrator-service/.env`, not the frontend environment:

```dotenv
DASHBOARD_URL=http://localhost:3000
MOCK_LLM=false
MOCK_TRAVEL=false
FLIGHT_SERVICE_WS_URL=ws://127.0.0.1:8765
HOTEL_SERVICE_WS_URL=ws://127.0.0.1:8766
SEARCH_FRONTEND_ORIGIN=http://localhost:3000
```

The flight bridge binds to `127.0.0.1:8765`. The hotel bridge defaults to
`127.0.0.1:8766` and accepts a `WS_PORT` override. Both allow the local frontend
origins on ports 3000 and 8080. `SEARCH_FRONTEND_ORIGIN` is the Origin header the
Go backend uses when connecting to the bridges.

Run four terminals. Each example below starts from the `fare-frontend` repository
root and assumes the sibling repositories and Python virtual environment already
exist. Populate the backend/service environment files first; keep all Skyvern,
Gemini, Mongo, and AWS credentials out of `NEXT_PUBLIC_*` variables.

Frontend:

```bash
cd web
npm run dev
```

Go orchestrator:

```bash
cd ../fare-orchestrator-service
go run .
```

Flight bridge, using the travel services' root environment:

```bash
cd ../travel-search-services/flight-service
set -a
source ../.env
set +a
../.venv/bin/python websocket_test_server.py
```

Hotel bridge, using its separate hotel environment:

```bash
cd ../travel-search-services/hotel-service
set -a
source .env
set +a
WS_PORT=8766 ../.venv/bin/python websocket_test_server.py
```

These are startup instructions for the user, not permission for agents to run
builds or verification. Restart the Go orchestrator after changing its `.env` or
Go code. Restart the affected Python bridge after changing its environment or
service code. Restart Next.js after changing its public environment variables.

When `FLIGHT_SERVICE_WS_URL` / `HOTEL_SERVICE_WS_URL` are empty, the orchestrator
instead POSTs to `FLIGHT_SERVICE_URL` / `HOTEL_SERVICE_URL` (Lambda HTTP endpoints).
That path returns final results and does not provide live browser frames.
Running the Python bridges alone does not switch the orchestrator to streaming.
There is no automatic HTTP fallback when a configured bridge fails to connect.

The optional HTTP-mode `ORCHESTRATOR_PUBLIC_URL` enables final result callbacks
at `POST /travel-search/results/{requestID}`. It does not enable browser streaming.
Local Python source changes affect the bridges after restart; deployed Lambdas
need their own deployment to receive those changes.

`MOCK_TRAVEL=true` on the backend provides mock travel offers with real workflow
events, without real Skyvern previews. `MOCK_LLM=false` requires the configured
Gemini key. No frontend mock events or sample group history drive the dashboard.
For a hosted HTTPS frontend, configure a reachable HTTPS orchestrator and WSS
group endpoint; the loopback Python bridges belong on the orchestrator's host.

### Frontend data flow and files

| File                                                                                   | Role                                                                                                                                                               |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [group-socket.ts](web/lib/api/group-socket.ts)                                         | Shares one WebSocket per group across subscribers, caches snapshots and browser updates, retries connections, and delivers the cached snapshot to new subscribers. |
| [sessions.ts](web/lib/api/sessions.ts)                                                 | Reads group history and individual session snapshots over HTTP.                                                                                                    |
| [use-group-events.ts](web/hooks/use-group-events.ts)                                   | Updates group history and new-session notifications; falls back to HTTP polling while disconnected.                                                                |
| [session-loader.tsx](web/components/session/session-loader.tsx)                        | Loads the selected session through HTTP and group snapshots, then mounts its dashboard.                                                                            |
| [use-session-events.ts](web/hooks/use-session-events.ts)                               | Subscribes by stable group/session IDs, merges authoritative snapshots, and applies live browser updates.                                                          |
| [session-snapshot.ts](web/lib/session-snapshot.ts)                                     | Rejects older session revisions and retains a last frame across snapshot updates only when its browser session ID matches.                                         |
| [session-dashboard.tsx](web/components/session/session-dashboard.tsx)                  | Shows agent tabs, search results/errors, planning tasks, activity, the final itinerary, and the shared WhatsApp plan. |
| [live-trip.tsx](web/components/dashboard/live-trip.tsx), [live-trip.ts](web/lib/api/live-trip.ts) | Poll the WhatsApp trip: itinerary, locked fares, split, chat, documents. Actions POST to `/dashboard/trips/{groupId}`. |
| [live-browser.tsx](web/components/session/live-browser.tsx)                            | Renders JPEG data URLs and preview status, retaining the final frame after streaming ends.                                                                         |
| [dashboard.ts](web/types/dashboard.ts), [travel-search.ts](web/types/travel-search.ts) | Define the dashboard envelope, snapshots, nested service events, and browser preview types.                                                                        |

The direct-service helpers in `web/lib/api/travel-search.ts`, `flights.ts`, and
`hotels.ts` and fixtures under `web/lib/mock/` are not the active group dashboard
flow. Follow `group-socket.ts` and the hooks above when changing live behavior.

### Endpoints, events, and preview state

| Go endpoint                                  | Purpose                                        |
| -------------------------------------------- | ---------------------------------------------- |
| `GET /groups/{groupId}/events`               | WebSocket; immediately sends `group.snapshot`. |
| `GET /groups/{groupId}/sessions`             | Returns the group's saved session snapshots.   |
| `GET /groups/{groupId}/sessions/{sessionId}` | Returns one session within that group.         |
| `GET /dashboard/trips`                       | WhatsApp-created trips for the home list.      |
| `GET /dashboard/trips/{groupId}`             | Itinerary, money, offers, people, chat.        |
| `POST /dashboard/trips/{groupId}`            | Chat, pick fare/stay, budget, payer, documents. Never starts a search. |

Dashboard events use `version: 1`, `type`, `groupId`, and `revision`; session
events also carry `sessionId`. Normal workflow events include an authoritative
`snapshot`. Browser events instead carry `agentType` and a nested `event` from
the Python worker, whose IDs use snake case (`session_id`, `search_id`,
`browser_session_id`). Do not confuse the outer dashboard envelope with the
nested service event.

| Dashboard event                                                                    | Frontend behavior                                                                                            |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `group.snapshot`                                                                   | Load/reconcile group sessions and the selected session.                                                      |
| `session.started`, `session.updated`                                               | Update session metadata and group notifications.                                                             |
| `flight_search.*`, `hotel_search.*` (`started`, `progress`, `completed`, `failed`) | Update agent status/messages and saved offers; failures retain the specific agent error.                     |
| `agent.browser.live_view`                                                          | Store the optional Skyvern dashboard link; it is not an embedded video stream and may require Skyvern login. |
| `agent.browser.stream`                                                             | Update preview status: `starting`, `live`, `ended`, or `unavailable`.                                        |
| `agent.browser.frame`                                                              | Render nested `image/jpeg` base64 data as `data:image/jpeg;base64,...`.                                      |
| `flight_search.recording.completed`, `hotel_search.recording.completed`            | Backend stores recording completion metadata; this is separate from the live JPEG feed.                      |
| `planning.started`, `planning.task.updated`, `planning.completed`                  | Update planner checkpoints and the final plan.                                                               |
| `session.completed`, `session.failed`                                              | Display the final session outcome and any session error.                                                     |

Previews are indexed by agent and origin: flight airport code or hotel
`booking_com`. Match `browser_session_id` before carrying a frame into a new
snapshot. Keep subscriptions keyed to group/session identity; depending on the
entire changing snapshot causes unnecessary subscription resets.

Saved dashboard history retains up to 20 sessions per group, with Mongo when
configured. JPEG frames are stripped from Mongo persistence; an active Go process
and the frontend cache can retain the latest frame in memory. Reconnection reads
a fresh snapshot, not a replay of past frames. A completed search viewed after
a restart may therefore have results and preview metadata but no image.
Preview failures do not by themselves mean the travel search failed.

### Known fixes and troubleshooting

| Symptom                                              | Cause / relevant path                                                                                                                                                                            |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Results arrive but no live browser appears           | Empty orchestrator service WebSocket URLs select Lambda HTTP mode. Configure both bridge URLs and restart Go before the next chat-triggered search.                                              |
| Preview disappears during progress updates           | Preserve browser events in the shared cache and merge snapshots with `mergeSessionSnapshot`; keep the hook subscription independent of changing snapshot props.                                  |
| Hotel search rejects a seven-night stay              | Booking.com can label it `1 week` instead of `7 nights`. `hotel-service/booking.py` now converts weeks to nights while still checking requested dates, adult count, hotel links, and CAD totals. |
| Generic session interruption hides the agent failure | Go emits `flight_search.failed` / `hotel_search.failed`; the dashboard shows the agent's message below the selected browser. Hotel `ValueError` messages are included in the result's error.     |
| Old searches do not show newly enabled streaming     | Frames are emitted only while the worker is searching. Configuration changes apply to subsequent searches; do not automatically rerun old paid work.                                             |
| Results take longer than the browser activity        | Browser cleanup, recording readiness/upload, and Mongo persistence happen before the final result arrives.                                                                                       |

The week-format hotel fix and preview/configuration fixes were implemented
without post-change tests or live searches. The user owns verification; do not
describe these changes as tested.

### Instructions for agents

- Read root [AGENTS.md](AGENTS.md) and [web/AGENTS.md](web/AGENTS.md) before edits.
  Consult the installed Next.js guides required by `web/AGENTS.md` for Next.js
  code changes.
- Do not add authentication or console/debug logs for this hackathon.
- Do not run QA, tests, lint, type checks, builds, browser sessions, or post-change
  verification unless the user explicitly requests them. Startup commands in
  this README do not override that rule.
- Keep search initiation in the chat/orchestrator workflow. Frontend subscriptions
  and reconnects must remain observational. `select_flight` / `select_hotel` only
  lock a saved offer onto the trip and announce it in WhatsApp.
- Keep credentials on the backend and preserve session, search, revision, and
  browser-session correlation when modifying event handling.

For backend changes, read the sibling orchestrator's `README.md`,
`orchestrator/dashboard.go`, `tools/search_transport.go`, and
`dashboard/manager.go`. For worker changes, read the travel services' READMEs,
each service's `websocket_test_server.py`, `service.py`, and `live_browser.py`;
hotel extraction is in `hotel-service/booking.py`.

### Hotel sources and recordings

The updated hotel worker searches Booking.com and Airbnb concurrently and returns
up to eight offers per source. Hotel cards display the source, property type,
and original rating scale when supplied. A source failure can leave valid offers
from the other source available.

The backend persists all source recording metadata in
`snapshot.recordings.hotel.sources`, while retaining the legacy main recording
fields. The hotel browser panel switches between Booking.com and Airbnb videos,
preferring archived S3 links and falling back to provider replay links when
necessary. Provider links can expire. Booking.com remains the live frame preview;
Airbnb has a separate recording after the search finishes.

Existing single-recording snapshots still render. Worker changes require a hotel
Lambda deployment; backend and frontend changes require their respective restarts
or deployments. These integration changes have not been run through QA.
