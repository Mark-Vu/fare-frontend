"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { IconBrandWhatsapp, IconArrowRight, IconCards, IconPlaneDeparture, IconPlane, IconX } from "@tabler/icons-react"
import gsap from "gsap"
import { Flip } from "gsap/Flip"
import { ScrollSmoother } from "gsap/ScrollSmoother"
import { listTrips, type TripCard } from "@/lib/api/live-trip"
import { groupPathId } from "@/lib/group-id"
import { useDashboardEvents } from "@/hooks/use-group-events"
import { SessionNotification } from "./session-notification"
import { destinationImage } from "@/lib/destination-image"
import { barcodeBars, seededAccent } from "@/lib/ticket"

gsap.registerPlugin(Flip)

const SCATTER_PRESETS = [
  { x: 2, y: -2, r: -0.4 },
  { x: -14, y: 7, r: 1.6 },
  { x: 8, y: 12, r: -1 },
  { x: -10, y: -9, r: 2 },
  { x: 13, y: 4, r: 0.5 },
]

function BoardingPassContent({ trip, interactive }: { trip: TripCard; interactive: boolean }) {
  const originCity = trip.origin || "Somewhere"
  const destCity = trip.destination || trip.group_name
  const bars = barcodeBars(trip.group_id)
  const daysUntil = trip.start_date ? Math.ceil((new Date(`${trip.start_date}T00:00:00`).getTime() - Date.now()) / 86400000) : null
  const inLabel = daysUntil === null ? "—" : daysUntil <= 0 ? "Today" : `${daysUntil}d`
  const nightsLabel = trip.nights ? `${trip.nights}` : "—"

  const accentTab = `flex h-16 flex-none items-center border-b-2 border-border px-8 transition-colors duration-500 ease-out [background-color:color-mix(in_oklch,var(--accent)_28%,var(--muted)_72%)] ${interactive ? "group-hover/card:border-transparent group-hover/card:[background-color:var(--accent)]" : ""}`

  return <div className="relative flex h-full w-full" style={{ "--accent": seededAccent(trip.group_id), "--border": "oklch(0.18 0.015 158)" } as React.CSSProperties}>
    <div style={{ "--border": "oklch(0.18 0.015 158)" } as React.CSSProperties} className={`ticket-notch relative z-10 flex w-[70%] flex-none flex-col overflow-hidden border-y-2 border-l-2 border-r-2 border-border bg-card transition-transform duration-300 ease-out [border-right-style:dashed] ${interactive ? "group-hover/card:-translate-x-1.5 group-hover/card:translate-y-0.5 group-hover/card:-rotate-1" : ""}`}>
      <div className={accentTab}>
        <p className={`flex min-w-0 items-center gap-2 truncate text-xl font-semibold text-foreground transition-colors duration-500 ease-out ${interactive ? "group-hover/card:text-white" : ""}`}>{trip.group_name} <IconBrandWhatsapp className="size-7 shrink-0" /> powered by Fare</p>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center gap-6 overflow-hidden px-5 pl-30 text-center">
        <div className="absolute inset-y-4 left-8 flex w-12 flex-col justify-between gap-1">
          {bars.map((w, i) => <span key={i} className="block rounded-[1px] bg-foreground/70" style={{ height: `${w}px` }} />)}
        </div>

        <p className="flex items-center gap-2 text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase"><IconPlaneDeparture className="size-4" />Boarding pass</p>

        <div className="min-w-0 max-w-full">
          <h2 className="truncate text-2xl font-semibold">{trip.destination || trip.group_name}</h2>
          {trip.dates && <p className="mt-1 truncate text-base text-muted-foreground">{trip.dates}</p>}
          <div className="mt-2 flex items-center justify-center text-3xl gap-4 font-mono text-2xl font-bold tracking-tight">
            <span className="min-w-0 truncate">{originCity}</span>
            <IconPlane className="size-7 shrink-0 -scale-y-100 rotate-90 text-primary" />
            <span className="min-w-0 truncate">{destCity}</span>
          </div>
        </div>

        <div className="flex items-center gap-10">
          <div>
            <p className="text-sm tracking-[0.15em] text-muted-foreground uppercase">In</p>
            <p className="font-mono text-lg font-semibold">{inLabel}</p>
          </div>
          <div>
            <p className="text-sm tracking-[0.15em] text-muted-foreground uppercase">Nights</p>
            <p className="font-mono text-lg font-semibold">{nightsLabel}</p>
          </div>
          <div>
            <p className="text-sm tracking-[0.15em] text-muted-foreground uppercase">Type</p>
            <p className="font-mono text-lg font-semibold">Group</p>
          </div>
        </div>

        {interactive && <p className="flex items-center gap-2 text-base text-primary">Click to open trip details <IconArrowRight className="size-5" /></p>}
      </div>
    </div>

    <div style={{ "--border": "oklch(0.18 0.015 158)" } as React.CSSProperties} className={`ticket-notch relative z-10 flex w-[30%] flex-none flex-col overflow-hidden border-y-2 border-r-2 border-border bg-muted transition-transform duration-300 ease-out ${interactive ? "group-hover/card:translate-x-1.5 group-hover/card:translate-y-0.5 group-hover/card:rotate-1" : ""}`}>
      <div className={`${accentTab} justify-end`}>
        <p className={`min-w-0 truncate text-lg font-medium tracking-wide text-black uppercase transition-colors duration-500 ease-out ${interactive ? "group-hover/card:text-white" : ""}`}>Status: {trip.state}</p>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center gap-5 overflow-hidden p-5 text-center">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover opacity-5 transition-opacity duration-500 ease-out group-hover/card:opacity-30"
            style={{ backgroundImage: `url(${destinationImage(trip.destination || trip.group_name)})`, backgroundPosition: "right center" }}
          />
        </div>

        <div className="relative z-10 flex min-w-0 flex-col items-center gap-2">
          <p className="truncate text-lg font-semibold">{trip.destination || trip.group_name}</p>
          <div className="flex items-center justify-center gap-2 font-mono text-base font-bold tracking-tight">
            <span className="min-w-0 truncate">{originCity}</span>
            <IconPlane className="size-4 shrink-0 -scale-y-100 rotate-90 text-primary" />
            <span className="min-w-0 truncate">{destCity}</span>
          </div>
          <div className="flex gap-4 font-mono text-sm tracking-wide text-muted-foreground uppercase">
            <span>In {inLabel}</span>
            <span>{nightsLabel}n</span>
          </div>
        </div>

        <div className="relative z-10 flex h-10 items-stretch gap-1.5">
          {bars.map((w, i) => <span key={i} className="block h-full rounded-[1px] bg-foreground/70" style={{ width: `${w}px` }} />)}
        </div>
      </div>
    </div>
  </div>
}

const CARD_SHELL = "boarding-pass flex h-72 shrink-0 [will-change:transform]"

export function TripList() {
  const [trips, setTrips] = useState<TripCard[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const { newSession, connection, error: sessionError, dismissSession } = useDashboardEvents()
  const [expanded, setExpanded] = useState(false)
  const flipState = useRef<Flip.FlipState | null>(null)
  const deckRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    let cancelled = false
    let raf = requestAnimationFrame(function wait() {
      const smoother = ScrollSmoother.get()
      if (smoother) smoother.paused(true)
      else if (!cancelled) raf = requestAnimationFrame(wait)
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      ScrollSmoother.get()?.paused(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let loading = false
    async function load() {
      if (loading) return
      loading = true
      try {
        const next = await listTrips(controller.signal)
        if (!controller.signal.aborted) {
          setTrips(next)
          setError(null)
        }
      } catch (err) {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Could not load trips.")
      } finally {
        loading = false
        if (!controller.signal.aborted) setLoaded(true)
      }
    }
    void load()
    const timer = setInterval(() => { void load() }, 5000)
    return () => { controller.abort(); clearInterval(timer) }
  }, [])

  function expandStack() {
    if (expanded || !deckRef.current) return
    flipState.current = Flip.getState(deckRef.current.querySelectorAll(".boarding-pass"))
    window.scrollTo({ top: 0 })
    setExpanded(true)
  }

  function collapseStack() {
    setExpanded(false)
  }

  useEffect(() => {
    if (expanded && flipState.current) {
      Flip.from(flipState.current, { duration: 0.8, ease: "power3.inOut", stagger: 0.05, absolute: true })
      flipState.current = null
    }
  }, [expanded])

  return <div className="flex min-h-[calc(100dvh-5rem-1px)] flex-col">
    <div className={`shrink-0 overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out ${expanded ? "max-h-0 opacity-0" : "max-h-80"}`}>
      <p className="mb-3 flex items-center gap-2 text-xs font-medium tracking-widest text-primary uppercase"><IconBrandWhatsapp className="size-4" />WhatsApp sessions</p>
      <h1 className="max-w-xl text-4xl font-semibold tracking-[-0.045em]">Trips start in the group chat.</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">Add Fare to a WhatsApp group and tag it. That group becomes a dashboard. Nothing here creates a new session.</p>
      <p role="status" className="mt-4 text-xs text-muted-foreground">{connection === "connected" ? "Listening for new planning sessions" : connection === "connecting" ? "Connecting to live updates…" : "Reconnecting to live updates…"}</p>
      {error && <p role="alert" className="mt-6 text-sm text-destructive">{error}</p>}
      {!error && sessionError && <p role="alert" className="mt-6 text-sm text-destructive">{sessionError}</p>}
    </div>

    <div ref={deckRef} className="relative z-40 mt-8 flex-1">
      {!expanded && trips.length > 0 && <button
        type="button"
        onClick={expandStack}
        aria-label="Expand trip stack"
        className="group/stack absolute inset-0 block h-full w-full cursor-pointer text-left"
      >
        {trips.slice(0, 5).map((trip, i) => {
          const depth = i
          const scatter = SCATTER_PRESETS[i]
          return <div
            key={trip.group_id}
            data-flip-id={trip.group_id}
            style={{
              zIndex: 5 - i,
              "--depth": depth,
              "--scatter": scatter
                ? `translate(${scatter.x}px, ${depth * 5 + scatter.y}px) rotate(${scatter.r}deg)`
                : `translateY(calc(var(--depth) * 6px))`,
            } as React.CSSProperties}
            className={`${CARD_SHELL} absolute inset-x-0 top-0 transition-transform duration-300 ease-out [transform:translateY(calc(var(--depth)*6px))] group-hover/stack:[transform:var(--scatter)]!`}
          >
            <BoardingPassContent trip={trip} interactive />
          </div>
        })}
        {trips.length > 1 && <span className="absolute -top-2 -right-2 z-50 flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow"><IconCards className="size-3.5" />{trips.length}</span>}
      </button>}
    </div>

    {!error && loaded && trips.length === 0 && <p className="mt-8 rounded-2xl border border-dashed border-border px-6 py-8 text-sm text-muted-foreground">No sessions yet. Tag Fare in WhatsApp and this list will fill in.</p>}
    {mounted && createPortal(<>
      <div
        aria-hidden={!expanded}
        className={`fixed inset-0 z-30 bg-background/70 backdrop-blur-md transition-opacity duration-700 ${expanded ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      {expanded && <button
        type="button"
        onClick={collapseStack}
        aria-label="Close expanded trip view"
        className="fixed right-4 top-4 z-50 flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md transition-colors hover:bg-muted"
      >
        <IconX className="size-5" />
      </button>}

      {expanded && <div className="fixed inset-0 z-40 flex flex-col gap-4 overflow-y-auto p-6 pt-20 pb-16 sm:p-10 sm:pt-24">
        {trips.map(trip => <Link
          key={trip.group_id}
          data-flip-id={trip.group_id}
          href={`/dashboard/${groupPathId(trip.group_id)}`}
          className={`${CARD_SHELL} group/card`}
        >
          <BoardingPassContent trip={trip} interactive />
        </Link>)}
      </div>}
    </>, document.body)}
    <SessionNotification session={newSession} dismissSession={dismissSession} />
  </div>
}
