"use client"
import { IconPlane } from "@tabler/icons-react"
import { money } from "@/lib/trip-format"
import { actOnTrip } from "@/lib/api/live-trip"
import type { Flight } from "@/types/flight"
import { useState } from "react"

export function FlightResults({ flights, groupId }: { flights: Flight[]; groupId?: string }) {
  const [busy, setBusy] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  async function pick(flight: Flight) {
    if (!groupId) return
    setBusy(flight.id)
    setNote(null)
    try {
      const [origin, destination] = flight.route.split("→").map(part => part.trim())
      await actOnTrip(groupId, {
        action: "select_flight",
        offer_id: flight.id,
        airline: flight.airline,
        origin: origin || "",
        destination: destination || "",
        summary: `${flight.duration} · ${flight.stops}`,
        price: String(flight.price),
      })
      setNote(`${flight.airline} is now the group fare. WhatsApp was told.`)
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Could not save that flight.")
    } finally {
      setBusy(null)
    }
  }
  return <section className="rounded-2xl border border-border bg-card p-6">
    <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight"><IconPlane className="size-5 text-primary" />Flights found</h2>
    <p className="mt-1 text-xs text-muted-foreground">Round trip · one adult, economy · outbound times shown. Choosing one updates the shared trip and the WhatsApp group.</p>
    {note && <p className="mt-3 text-sm text-primary">{note}</p>}
    <div className="mt-4 divide-y divide-border">{flights.map((flight, index) => <div key={flight.id} className="py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{flight.airline}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{flight.route} · {flight.duration} · {flight.stops}</p>
          {flight.departureTime && <p className="mt-1 text-xs text-muted-foreground">{flight.departureTime} → {flight.arrivalTime ?? "Arrival unavailable"}</p>}
        </div>
        <span className="shrink-0 text-right text-lg font-semibold tracking-tight">{money(flight.price, flight.currency)}<span className="mt-1 block text-[10px] font-normal text-muted-foreground">{flight.currency ?? "CAD"} / person</span></span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {index === 0 && <span className="inline-block rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">Lowest displayed fare</span>}
        {groupId && <button type="button" disabled={busy === flight.id} onClick={() => void pick(flight)} className="rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">Use this fare</button>}
      </div>
    </div>)}</div>
  </section>
}
