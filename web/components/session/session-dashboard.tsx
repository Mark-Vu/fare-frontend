"use client"

import { useState } from "react"
import type { ReactNode } from "react"
import Link from "next/link"
import { IconArrowLeft, IconPlane, IconBuilding, IconCheck, IconChevronDown } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { useSessionEvents } from "@/hooks/use-session-events"
import { planningTasks } from "@/lib/planning-tasks"
import { tripDates } from "@/lib/trip-format"
import type { StepStatus } from "@/types/session"
import type { SessionSnapshot } from "@/types/dashboard"
import { LiveBrowser } from "./live-browser"
import { ActivityFeed } from "./activity-feed"
import { FlightResults } from "./flight-results"
import { HotelResults } from "./hotel-results"
import { FinalPlan } from "./final-plan"

function FlowStep({ number, title, description, status, children }: { number: number; title: string; description: string; status: StepStatus; children?: ReactNode }) {
  return <li className="relative pb-9 last:pb-0">
    <span aria-hidden="true" className="absolute top-10 bottom-0 left-[17px] w-px bg-border" />
    <div className="relative flex items-start gap-4">
      <span className={`grid size-9 shrink-0 place-items-center rounded-full border text-sm font-semibold ${status === "completed" ? "border-primary bg-primary text-primary-foreground" : status === "running" ? "border-primary/25 bg-sun text-forest motion-safe:animate-pulse" : status === "failed" ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-border bg-background text-muted-foreground"}`} aria-label={`Step ${number}: ${status}`}>
        {status === "completed" ? <IconCheck className="size-4" /> : number}
      </span>
      <div className="min-w-0 flex-1 pt-1">
        <div className="flex flex-wrap items-center gap-3"><h2 className={`text-lg font-semibold tracking-tight ${status === "pending" ? "text-muted-foreground" : ""}`}>{title}</h2>{status === "running" && <span className="text-[10px] font-medium tracking-wider text-primary uppercase">In progress</span>}</div>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
    {children && <div className="relative mt-5 ml-0 sm:ml-[52px]">{children}</div>}
  </li>
}

export function SessionDashboard({ snapshot }: { snapshot: SessionSnapshot }) {
  const state = useSessionEvents(snapshot)
  const session = state.session
  const [agent, setAgent] = useState<"flight" | "hotel">("flight")
  const completed = state.status === "completed"
  const failed = state.status === "failed"
  const searchesDone = state.flight === "completed" && state.hotel === "completed"
  const searchStatus: StepStatus = searchesDone ? "completed" : failed ? "failed" : state.status === "created" ? "pending" : "running"
  const browserStatus = agent === "flight" ? state.flight : state.hotel

  return <div className="mx-auto max-w-4xl">
    <Link href={`/dashboard/${encodeURIComponent(session.groupId)}`} className="mb-7 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary"><IconArrowLeft className="size-4" />All group trips</Link>
    <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
      <div><p className="mb-2 text-xs font-medium tracking-widest text-primary uppercase">Your next adventure</p><h1 className="text-5xl font-semibold tracking-[-0.05em] sm:text-6xl">{session.destination}</h1><p className="mt-3 text-sm text-muted-foreground">{session.origin} → {session.destination}<span className="mx-3 text-border">/</span>{tripDates(session.startDate, session.endDate)}</p></div>
      <div className="flex flex-wrap items-center gap-3"><span role="status" className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium ${failed ? "border-destructive/30 text-destructive" : "border-primary/20 bg-primary/5 text-primary"}`}><span className={`size-1.5 rounded-full bg-current ${!completed && !failed ? "motion-safe:animate-pulse" : ""}`} />{completed ? "Your trip is ready" : state.status === "created" ? "Understanding your group" : failed ? "Planning interrupted" : state.status === "planning" ? "Building your itinerary" : "Planning your trip"}</span></div>
    </div>
    <p role="status" className="mb-6 text-xs text-muted-foreground">{state.connection === "connected" ? session.message ?? "Connected to your group’s planning session." : "Reconnecting to live updates…"}</p>
    {state.error && <div role="alert" className="mb-5 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">{state.error}</div>}

    <ol aria-label="Trip planning steps">
      <FlowStep number={1} title="Finding flights & stays" description={searchesDone ? "Your agents have finished the research. Flight and hotel options are ready." : state.status === "created" ? "Choose your destination in the group chat. Your agents will start searching here automatically." : "Your flight and hotel agents are searching together for your trip dates."} status={searchStatus}>
        <details key={searchesDone ? "finished" : "searching"} open={!searchesDone} className="group rounded-2xl border border-border bg-card">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
            <span>{searchesDone ? "View agent research & results" : "Follow the agents live"}</span><IconChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <div className="space-y-5 border-t border-border p-4 sm:p-5">
            <div role="group" aria-label="Select agent browser" className="flex w-fit gap-1 rounded-lg bg-secondary/60 p-1">
              <Button variant={agent === "flight" ? "default" : "ghost"} size="sm" aria-pressed={agent === "flight"} onClick={() => setAgent("flight")}><IconPlane className="size-3.5" />Flight agent{state.flight === "completed" && <IconCheck className="size-3" />}</Button>
              <Button variant={agent === "hotel" ? "default" : "ghost"} size="sm" aria-pressed={agent === "hotel"} onClick={() => setAgent("hotel")}><IconBuilding className="size-3.5" />Hotel agent{state.hotel === "completed" && <IconCheck className="size-3" />}</Button>
            </div>
            <LiveBrowser status={browserStatus} agentType={agent} previews={state.previews[agent]} />
            <p role="status" className="text-xs leading-5 text-muted-foreground">{agent === "flight" ? state.flightMessage : state.hotelMessage}</p>
            {state.flights.length > 0 && <FlightResults flights={state.flights} />}
            {state.hotels.length > 0 && <HotelResults hotels={state.hotels} />}
          </div>
        </details>
      </FlowStep>

      <FlowStep number={2} title="Building your itinerary" description={state.planning === "completed" ? "Your flight, stay, and daily schedule have been brought together." : state.planning === "running" ? "Using your group’s preferences and the search results to plan each day." : "Starts when both agents finish their searches."} status={state.planning}>
        {state.planning !== "pending" && <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <p className="mb-4 text-[11px] text-muted-foreground">Live planner · progress arrives from your group’s planning session.</p>
          <ul aria-live="polite" aria-label="Itinerary building tasks" className="space-y-4 text-sm">
            {planningTasks.map(task => {
              const status = state.planningTasks[task.id]
              return <li key={task.id} className={`flex items-center gap-3 ${status === "pending" ? "text-muted-foreground/60" : status === "failed" ? "text-destructive" : "text-primary"}`}>
                <span aria-hidden="true" className={`grid size-5 shrink-0 place-items-center rounded-full ${status === "completed" ? "bg-primary text-primary-foreground" : status === "running" ? "bg-sun/60 motion-safe:animate-pulse" : "border border-current/30"}`}>
                  {status === "completed" ? <IconCheck className="size-3.5" /> : status === "running" ? <span className="size-1.5 rounded-full bg-primary" /> : status === "failed" ? "!" : null}
                </span>
                <span className="flex-1">{task.title}</span>
                <span className="text-[10px] font-medium">{status === "completed" ? "Done" : status === "running" ? "Working…" : status === "failed" ? "Interrupted" : "Queued"}</span>
              </li>
            })}
          </ul>
        </div>}
      </FlowStep>

      <FlowStep number={3} title="Trip ready" description={state.plan ? "Your group’s next adventure is ready. Open any day to see the full schedule." : "Your complete plan will appear here, with each day mapped out."} status={state.plan ? "completed" : failed ? "failed" : "pending"}>
        {state.plan && <FinalPlan plan={state.plan} session={session} />}
      </FlowStep>
    </ol>

    <details className="group mt-10 border-t border-border pt-5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-2 text-xs text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden"><span>Agent activity · {state.activity.length} updates</span><IconChevronDown className="size-4 transition-transform group-open:rotate-180" /></summary>
      <div className="mt-4"><ActivityFeed events={state.activity} /></div>
    </details>
  </div>
}
