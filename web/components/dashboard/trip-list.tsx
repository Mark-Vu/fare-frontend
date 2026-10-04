"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { IconBrandWhatsapp, IconArrowRight } from "@tabler/icons-react"
import { listTrips, type TripCard } from "@/lib/api/live-trip"
import { groupPathId } from "@/lib/group-id"
import { useDashboardEvents } from "@/hooks/use-group-events"
import { SessionNotification } from "./session-notification"

export function TripList() {
  const [trips, setTrips] = useState<TripCard[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const { newSession, connection, error: sessionError, dismissSession } = useDashboardEvents()

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

  return <div>
    <p className="mb-3 flex items-center gap-2 text-xs font-medium tracking-widest text-primary uppercase"><IconBrandWhatsapp className="size-4" />WhatsApp sessions</p>
    <h1 className="max-w-xl text-4xl font-semibold tracking-[-0.045em]">Trips start in the group chat.</h1>
    <p className="mt-4 max-w-xl text-muted-foreground">Add Fare to a WhatsApp group and tag it. That group becomes a dashboard. Nothing here creates a new session.</p>
    <p role="status" className="mt-4 text-xs text-muted-foreground">{connection === "connected" ? "Listening for new planning sessions" : connection === "connecting" ? "Connecting to live updates…" : "Reconnecting to live updates…"}</p>
    {error && <p role="alert" className="mt-6 text-sm text-destructive">{error}</p>}
    {!error && sessionError && <p role="alert" className="mt-6 text-sm text-destructive">{sessionError}</p>}
    <div className="mt-8 grid gap-4 md:grid-cols-2">
      {trips.map(trip => <Link key={trip.group_id} href={`/dashboard/${groupPathId(trip.group_id)}`} className="rounded-2xl border border-border bg-card p-6 transition hover:border-primary">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{trip.state}</p>
        <h2 className="mt-2 text-2xl font-semibold">{trip.destination || trip.group_name}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{trip.group_name}{trip.dates ? ` · ${trip.dates}` : ""}</p>
        <p className="mt-5 flex items-center gap-2 text-sm text-primary">Open trip <IconArrowRight className="size-4" /></p>
      </Link>)}
    </div>
    {!error && loaded && trips.length === 0 && <p className="mt-8 rounded-2xl border border-dashed border-border px-6 py-8 text-sm text-muted-foreground">No sessions yet. Tag Fare in WhatsApp and this list will fill in.</p>}
    <SessionNotification session={newSession} dismissSession={dismissSession} />
  </div>
}
