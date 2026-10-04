"use client"

import { useState } from "react"
import { IconBrandWhatsapp, IconCompass, IconSearch, IconX } from "@tabler/icons-react"
import { useDashboardEvents } from "@/hooks/use-group-events"
import { sessionDates, sessionDestination, sessionGroup, sessionIsLive } from "@/lib/session-display"
import { SessionCard } from "./session-card"
import { SessionNotification } from "./session-notification"

const filters = [
  { value: "all", label: "All trips" },
  { value: "live", label: "Planning live" },
  { value: "ready", label: "Ready to explore" },
  { value: "failed", label: "Needs attention" },
] as const

type Filter = (typeof filters)[number]["value"]

export function TripList() {
  const { sessions, newSession, connection, error, loaded, dismissSession } = useDashboardEvents()
  const [filter, setFilter] = useState<Filter>("all")
  const [query, setQuery] = useState("")
  const counts = {
    all: sessions.length,
    live: sessions.filter(sessionIsLive).length,
    ready: sessions.filter(session => session.status === "completed").length,
    failed: sessions.filter(session => session.status === "failed").length,
  }
  const search = query.trim().toLowerCase()
  const visible = sessions.filter(session => {
    if (filter === "live" && !sessionIsLive(session)) return false
    if (filter === "ready" && session.status !== "completed") return false
    if (filter === "failed" && session.status !== "failed") return false
    return !search || `${sessionDestination(session)} ${sessionGroup(session)} ${session.origin} ${sessionDates(session)}`.toLowerCase().includes(search)
  }).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))

  return <div className="min-h-[calc(100dvh-14rem)]">
    <header className="flex flex-wrap items-end justify-between gap-6">
      <div><p className="mb-3 text-xs font-medium tracking-[0.16em] text-primary uppercase">Your travel collection</p><h1 className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Every trip, in one place.</h1><p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">From the first idea to the final itinerary. Find a trip, catch up with your group, or follow Fare live.</p></div>
      <div role="status" className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-xs text-muted-foreground"><span className={`size-1.5 rounded-full ${connection === "connected" ? "bg-whatsapp" : "bg-amber-500 motion-safe:animate-pulse"}`} />{connection === "connected" ? "Live updates on" : connection === "connecting" ? "Connecting…" : "Reconnecting…"}</div>
    </header>

    <div className="mt-8 flex items-center gap-3 rounded-2xl border border-primary/10 bg-secondary/45 px-4 py-4 sm:px-5"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-card text-primary"><IconBrandWhatsapp className="size-4" /></span><p className="text-xs leading-5 text-muted-foreground sm:text-sm">A new idea? <span className="font-medium text-foreground">Tag Fare in your WhatsApp group.</span> Your next trip will appear here.</p></div>

    <div className="mt-8 flex flex-col justify-between gap-5 border-b border-border pb-5 lg:flex-row lg:items-center">
      <div aria-label="Filter trips" className="flex flex-wrap gap-2">{filters.map(item => <button key={item.value} type="button" aria-pressed={filter === item.value} onClick={() => setFilter(item.value)} className={`flex min-h-10 items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${filter === item.value ? "bg-primary text-primary-foreground" : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>{item.label}<span className={`rounded-full px-1.5 py-0.5 text-[10px] ${filter === item.value ? "bg-white/15" : "bg-background/80"}`}>{counts[item.value]}</span></button>)}</div>
      <div className="relative w-full lg:max-w-72"><label htmlFor="trip-search" className="sr-only">Search trips by destination, group, or dates</label><IconSearch aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" /><input id="trip-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search a destination or group" className="h-11 w-full rounded-full border border-border bg-card pr-10 pl-10 text-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 [&::-webkit-search-cancel-button]:appearance-none" />{query && <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-secondary"><IconX className="size-3.5" /></button>}</div>
    </div>

    {error && <p role="alert" className="mt-6 rounded-xl border border-destructive/20 bg-destructive/5 px-5 py-4 text-sm text-destructive">{error}</p>}
    {!loaded && !error ? <div role="status" aria-label="Loading trips" className="mt-7 flex flex-col gap-4">{[0, 1, 2].map(index => <div key={index} aria-hidden="true" className="ticket-skeleton relative h-80 overflow-hidden border-2 border-border bg-card" />)}</div> : visible.length ? <section aria-label="Trip sessions" className="mt-7 flex flex-col gap-4">{visible.map(session => <SessionCard key={`${session.groupId}:${session.id}`} session={session} />)}</section> : <div className="mt-7 flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 px-6 py-12 text-center"><span className="mb-5 grid size-14 place-items-center rounded-full bg-secondary text-primary"><IconCompass className="size-6" /></span><h2 className="text-xl font-semibold tracking-tight">{sessions.length ? "No trips match just yet." : error ? "Your trips will be here." : "Your next adventure starts in the chat."}</h2><p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">{sessions.length ? "Try another destination, group, or filter to find your trip." : error ? "We’ll show your sessions when live updates reconnect." : "Tag Fare with your travel idea in WhatsApp. Each planning session gets its own card here."}</p>{sessions.length > 0 && <button type="button" onClick={() => { setFilter("all"); setQuery("") }} className="mt-5 rounded-full bg-primary px-5 py-2.5 text-xs font-medium text-primary-foreground">Show all trips</button>}</div>}
    <SessionNotification session={newSession} dismissSession={dismissSession} />
  </div>
}
