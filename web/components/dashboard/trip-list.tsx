"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { IconBrandWhatsapp, IconArrowRight } from "@tabler/icons-react"
import { listTrips, type TripCard } from "@/lib/api/live-trip"
import { groupPathId } from "@/lib/group-id"

export function TripList() {
  const [trips, setTrips] = useState<TripCard[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    listTrips(controller.signal).then(setTrips).catch(err => {
      if (!(err instanceof DOMException)) setError(err instanceof Error ? err.message : "Could not load trips.")
    }).finally(() => setLoaded(true))
    return () => controller.abort()
  }, [])

  return <div>
    <p className="mb-3 flex items-center gap-2 text-xs font-medium tracking-widest text-primary uppercase"><IconBrandWhatsapp className="size-4" />WhatsApp sessions</p>
    <h1 className="max-w-xl text-4xl font-semibold tracking-[-0.045em]">Trips start in the group chat.</h1>
    <p className="mt-4 max-w-xl text-muted-foreground">Add Fare to a WhatsApp group and tag it. That group becomes a dashboard. Nothing here creates a new session.</p>
    {error && <p role="alert" className="mt-6 text-sm text-destructive">{error}</p>}
    <div className="mt-8 grid gap-4 md:grid-cols-2">
      {trips.map(trip => <Link key={trip.group_id} href={`/dashboard/${groupPathId(trip.group_id)}`} className="rounded-2xl border border-border bg-card p-6 transition hover:border-primary">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{trip.state}</p>
        <h2 className="mt-2 text-2xl font-semibold">{trip.destination || trip.group_name}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{trip.group_name}{trip.dates ? ` · ${trip.dates}` : ""}</p>
        <p className="mt-5 flex items-center gap-2 text-sm text-primary">Open trip <IconArrowRight className="size-4" /></p>
      </Link>)}
    </div>
    {!error && loaded && trips.length === 0 && <p className="mt-8 rounded-2xl border border-dashed border-border px-6 py-8 text-sm text-muted-foreground">No sessions yet. Tag Fare in WhatsApp and this list will fill in.</p>}
  </div>
}
