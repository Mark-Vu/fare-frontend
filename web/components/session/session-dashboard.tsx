"use client"

import { useState } from "react"
import type { ReactNode } from "react"
import Link from "next/link"
import { IconArrowLeft, IconArrowUpRight, IconBrandWhatsapp, IconPlane, IconBuilding, IconCheck, IconChevronDown, IconAlertCircle, IconLoader2 } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { useSessionEvents } from "@/hooks/use-session-events"
import { planningTasks } from "@/lib/planning-tasks"
import { tripDates } from "@/lib/trip-format"
import { groupPathId } from "@/lib/group-id"
import { orchestratorUrl } from "@/lib/api/group-socket"
import type { StepStatus } from "@/types/session"
import type { SessionSnapshot } from "@/types/dashboard"
import { LiveBrowser } from "./live-browser"
import { ActivityFeed } from "./activity-feed"
import { FlightResults } from "./flight-results"
import { HotelResults } from "./hotel-results"
import { FinalPlan } from "./final-plan"
import { LiveTrip } from "@/components/dashboard/live-trip"
import { StepStatusBadge, stepStatusStyles } from "./step-status-badge"
import statusStyles from "./step-status.module.css"

function FlowStep({ number, title, description, status, children }: { number: number; title: string; description: string; status: StepStatus; children?: ReactNode }) {
  return <li className="relative pb-9 last:pb-0">
    <span aria-hidden="true" className="absolute top-10 bottom-0 left-[17px] w-px bg-border" />
    <div className="relative flex items-start gap-4">
      <span key={status} className={`${statusStyles.change} mt-3 grid size-9 shrink-0 place-items-center rounded-full border text-sm font-semibold ${stepStatusStyles[status].icon}`} aria-label={`Step ${number}: ${status}`}>
        {status === "completed" ? <IconCheck className="size-4" /> : status === "failed" ? <IconAlertCircle className="size-4" /> : status === "running" ? <IconLoader2 className="size-4 motion-safe:animate-spin" /> : number}
      </span>
      <div className={`min-w-0 flex-1 rounded-xl border px-4 py-3 transition-colors duration-300 ${stepStatusStyles[status].surface}`}>
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className={`text-lg font-semibold tracking-tight ${status === "pending" ? "text-muted-foreground" : ""}`}>{title}</h2><StepStatusBadge status={status} /></div>
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
  const [retryingFlight, setRetryingFlight] = useState(false)
  const [retryingHotel, setRetryingHotel] = useState(false)
  const [skipping, setSkipping] = useState(false)
  const [retryError, setRetryError] = useState<string | null>(null)
  const completed = state.status === "completed"
  const failed = state.status === "failed"
  const searchesDone = state.flight === "completed" && state.hotel === "completed"
  const flightFailed = state.flight === "failed"
  const hotelFailed = state.hotel === "failed"
  const searchRecoverable = flightFailed || hotelFailed
  const searchStatus: StepStatus = searchesDone ? "completed" : searchRecoverable || failed ? "failed" : state.status === "created" ? "pending" : "running"
  const browserStatus = agent === "flight" ? state.flight : state.hotel
  const sessionStepStatus: StepStatus = completed ? "completed" : failed && !searchRecoverable ? "failed" : "running"
  const plannerStatus: StepStatus = state.planning
  const plannerStarted = state.status === "planning" || state.planning === "running" || state.planning === "completed" || state.planning === "failed" || completed
  const planReady = completed || (state.planning === "completed" && !!state.plan)
  const readyStatus: StepStatus = planReady ? "completed" : failed && !searchRecoverable ? "failed" : state.planning === "running" ? "running" : "pending"
  const readyDescription = completed ? "Your flights, stay, and day-by-day itinerary are ready." : failed && !searchRecoverable ? "Planning was interrupted. Check the latest update before trying again." : state.plan ? "Finalizing your itinerary and saving your complete trip plan." : readyStatus === "running" ? "Preparing your complete trip plan as your daily schedule comes together." : "Your complete plan will appear here, with each day mapped out."
  const searchDescription = searchesDone
    ? "Your agents have finished the research. Flight and hotel options are ready."
    : flightFailed && hotelFailed
      ? "Flight and stay searches can each be run again. There is no limit."
      : flightFailed
        ? "Flights didn't come back. Retry them, or skip flights and keep planning the stay."
        : hotelFailed
          ? "The stay search didn't come back. Retry it. You can run it again as many times as you need."
          : state.status === "created"
            ? "Choose your destination in the group chat. Your agents will start searching here automatically."
            : "Your flight and hotel agents are searching together for your trip dates."

  async function retrySearch(kind: "flight" | "hotel") {
    const setRetrying = kind === "flight" ? setRetryingFlight : setRetryingHotel
    setRetrying(true)
    setRetryError(null)
    try {
      const response = await fetch(`${orchestratorUrl}/groups/${encodeURIComponent(session.groupId)}/sessions/${encodeURIComponent(session.id)}/retry-${kind}`, { method: "POST" })
      if (!response.ok) {
        const body = await response.json().catch(() => ({})) as { error?: string }
        throw new Error(body.error || `Could not retry the ${kind} search.`)
      }
    } catch (err) {
      setRetryError(err instanceof Error ? err.message : `Could not retry the ${kind} search.`)
    } finally {
      setRetrying(false)
    }
  }

  async function skipFlights() {
    setSkipping(true)
    setRetryError(null)
    try {
      const response = await fetch(`${orchestratorUrl}/groups/${encodeURIComponent(session.groupId)}/sessions/${encodeURIComponent(session.id)}/skip-flight`, { method: "POST" })
      if (!response.ok) {
        const body = await response.json().catch(() => ({})) as { error?: string }
        throw new Error(body.error || "Could not skip the flight search.")
      }
    } catch (err) {
      setRetryError(err instanceof Error ? err.message : "Could not skip the flight search.")
    } finally {
      setSkipping(false)
    }
  }

  return <div className="mx-auto max-w-4xl">
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
      <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full px-1 py-2 text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"><IconArrowLeft className="size-4" />Your trips</Link>
      <Link href={`/dashboard/${groupPathId(session.groupId)}`} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-xs font-medium shadow-[0_8px_24px_rgba(20,55,38,0.06)] transition-[border-color,background-color,box-shadow] hover:border-primary/40 hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"><IconBrandWhatsapp className="size-4 text-primary" />All group trips<IconArrowUpRight className="size-3.5 text-muted-foreground" /></Link>
    </div>
    <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
      <div><p className="mb-2 text-xs font-medium tracking-widest text-primary uppercase">Your next adventure</p><h1 className="text-5xl font-semibold tracking-[-0.05em] sm:text-6xl">{session.destination}</h1><p className="mt-3 text-sm text-muted-foreground">{session.origin} → {session.destination}<span className="mx-3 text-border">/</span>{tripDates(session.startDate, session.endDate)}</p></div>
      <div className="flex flex-wrap items-center gap-3"><StepStatusBadge key={state.status} status={sessionStepStatus} label={completed ? "Your trip is ready" : state.status === "created" ? "Understanding your group" : failed && !searchRecoverable ? "Planning interrupted" : state.status === "planning" ? "Building your itinerary" : "Planning your trip"} /></div>
    </div>
    <p role="status" className="mb-6 text-xs text-muted-foreground">{state.connection === "connected" ? session.message ?? "Connected to your group’s planning session." : "Reconnecting to live updates…"}</p>
    {state.error && <div role="alert" className="mb-5 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">{state.error}</div>}

    <ol aria-label="Trip planning steps">
      <FlowStep number={1} title="Finding flights & stays" description={searchDescription} status={searchStatus}>
        <details open className="group rounded-2xl border border-border bg-card">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
            <span>{searchesDone ? "View agent research & results" : "Follow the agents live"}</span><IconChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <div className="space-y-5 border-t border-border p-4 sm:p-5">
            <div role="group" aria-label="Select agent browser" className="flex w-fit gap-1 rounded-lg bg-secondary/60 p-1">
              <Button variant="ghost" size="sm" className={agent === "flight" ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white" : "text-blue-700 hover:bg-blue-100 hover:text-blue-800"} aria-pressed={agent === "flight"} onClick={() => setAgent("flight")}><IconPlane className="size-3.5" />Flight agent{state.flight === "completed" && <IconCheck className="size-3" />}</Button>
              <Button variant="ghost" size="sm" className={agent === "hotel" ? "bg-orange-600 text-white hover:bg-orange-700 hover:text-white" : "text-orange-700 hover:bg-orange-100 hover:text-orange-800"} aria-pressed={agent === "hotel"} onClick={() => setAgent("hotel")}><IconBuilding className="size-3.5" />Hotel agent{state.hotel === "completed" && <IconCheck className="size-3" />}</Button>
            </div>
            <LiveBrowser status={browserStatus} agentType={agent} previews={state.previews[agent]} recording={state.recordings?.[agent]} />
            <p role={browserStatus === "failed" ? "alert" : "status"} className={`text-xs leading-5 ${browserStatus === "failed" ? "text-destructive" : "text-muted-foreground"}`}>{agent === "flight" ? state.flightMessage : state.hotelMessage}</p>
            {searchRecoverable && <div className="flex flex-wrap items-center gap-3">
              {flightFailed && <Button size="sm" disabled={retryingFlight || skipping} onClick={() => void retrySearch("flight")}>{retryingFlight ? "Retrying flights…" : "Retry flight search"}</Button>}
              {hotelFailed && <Button size="sm" disabled={retryingHotel || skipping} onClick={() => void retrySearch("hotel")}>{retryingHotel ? "Retrying hotels…" : "Retry hotel search"}</Button>}
              {flightFailed && state.hotel === "completed" && <Button size="sm" variant="outline" disabled={skipping || retryingFlight} onClick={() => void skipFlights()}>{skipping ? "Skipping flights…" : "Skip flights"}</Button>}
              {retryError && <p role="alert" className="text-xs text-destructive">{retryError}</p>}
            </div>}
            {state.flights.length > 0 && <FlightResults flights={state.flights} groupId={session.groupId} />}
            {state.hotels.length > 0 && <HotelResults hotels={state.hotels} groupId={session.groupId} />}
          </div>
        </details>
      </FlowStep>

      <FlowStep number={2} title="Building your itinerary" description={plannerStatus === "completed" ? "Your flight, stay, and daily schedule have been brought together." : plannerStatus === "failed" ? "Itinerary planning was interrupted. Check the latest update below." : plannerStatus === "running" ? "Using your group’s preferences and the search results to plan each day." : "Starts when both agents finish their searches."} status={plannerStatus}>
        {plannerStarted && <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <p className="mb-4 text-[11px] text-muted-foreground">Live planner · each task updates as it progresses.</p>
          {plannerStatus === "running" && <div aria-hidden="true" className={`${statusStyles.plannerActivity} mb-4`} />}
          <ul aria-label="Itinerary building tasks" className="space-y-3 text-sm">
            {planningTasks.map((task, index) => {
              const status = state.planningTasks[task.id] ?? "pending"
              return <li key={task.id} style={{ animationDelay: `${index * 140}ms` }} className={`${plannerStatus === "running" ? statusStyles.plannerTaskEnter : ""} flex flex-wrap items-center gap-3 rounded-xl border p-3 transition-colors duration-300 ${stepStatusStyles[status].surface}`}>
                <span key={status} aria-hidden="true" className={`${statusStyles.change} ${status === "pending" && plannerStatus === "running" ? statusStyles.plannerWaiting : ""} grid size-7 shrink-0 place-items-center rounded-full border ${stepStatusStyles[status].icon}`}>
                  {status === "completed" ? <IconCheck className="size-4" /> : status === "running" ? <IconLoader2 className="size-4 motion-safe:animate-spin" /> : status === "failed" ? <IconAlertCircle className="size-4" /> : <span className="size-1.5 rounded-full bg-current" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`font-medium ${status === "pending" ? "text-muted-foreground" : ""}`}>{task.title}</p>
                  {state.planningTaskMessages?.[task.id] && <p className="mt-1 text-xs leading-5 text-muted-foreground">{state.planningTaskMessages[task.id]}</p>}
                </div>
                <StepStatusBadge status={status} />
              </li>
            })}
          </ul>
        </div>}
      </FlowStep>

      <FlowStep number={3} title="Trip ready" description={readyDescription} status={readyStatus}>
        {readyStatus === "running" && !state.plan && <div role="status" className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5">
          <p className="flex items-center gap-2 text-sm font-medium"><IconLoader2 aria-hidden="true" className="size-4 motion-safe:animate-spin" />Preparing your trip</p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{session.message || "Bringing your flights, stay, and daily activities together."}</p>
        </div>}
        {state.plan && <FinalPlan key={session.id} plan={state.plan} session={session} />}
      </FlowStep>
    </ol>

    <details className="group mt-10 border-t border-border pt-5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-2 text-xs text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden"><span>Agent activity · {state.activity.length} updates</span><IconChevronDown className="size-4 transition-transform group-open:rotate-180" /></summary>
      <div className="mt-4"><ActivityFeed events={state.activity} /></div>
    </details>

    <section className="mt-16 border-t border-border pt-10">
      <LiveTrip key={`${session.groupId}:${session.id}`} groupId={session.groupId} sessionId={session.id} embed />
    </section>
  </div>
}
