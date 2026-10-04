"use client"
import { IconPlane, IconChevronDown } from "@tabler/icons-react"
import { money } from "@/lib/trip-format"
import { actOnTrip } from "@/lib/api/live-trip"
import { travelSourceLabel } from "@/lib/travel-source-label"
import type { Flight } from "@/types/flight"
import { OfferLink } from "@/components/session/offer-link"
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
        ...(flight.source ? { source: flight.source } : {}),
        ...(flight.bookingUrl ? { booking_url: flight.bookingUrl } : {}),
        ...(flight.linkType ? { link_type: flight.linkType } : {}),
      })
      setNote(`${flight.airline} is now the group fare. WhatsApp was told.`)
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Could not save that flight.")
    } finally {
      setBusy(null)
    }
  }
  return <details className="group/flights overflow-hidden rounded-2xl border border-blue-200 border-t-4 border-t-blue-500 bg-blue-50/60">
    <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-4 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 sm:p-6 [&::-webkit-details-marker]:hidden">
      <h2 className="flex items-center gap-3 text-lg font-semibold tracking-tight"><span className="grid size-10 place-items-center rounded-xl bg-blue-600 text-white"><IconPlane className="size-5" /></span>Flights found</h2>
      <span className="flex items-center gap-3"><span className="rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-[11px] font-semibold text-blue-800">{flights.length} {flights.length === 1 ? "flight" : "flights"} found</span><IconChevronDown aria-hidden="true" className="size-4 text-blue-700 transition-transform group-open/flights:rotate-180" /></span>
    </summary>
    <div className="border-t border-blue-200 px-4 pb-4 sm:px-6 sm:pb-6">
    <p className="mt-3 text-xs text-muted-foreground">Round trip · one adult, economy · outbound times shown. Choosing one updates the shared trip and the WhatsApp group.</p>
    {note && <p className="mt-3 text-sm text-blue-800">{note}</p>}
    <div className="mt-4 space-y-3">
      {flights.map((flight, index) => <div key={flight.id} className={`rounded-xl border bg-card p-4 transition-colors duration-200 hover:border-blue-400 ${index === 0 ? "border-blue-300 shadow-sm ring-1 ring-blue-200/60" : "border-blue-200/80"}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1 basis-40">
            <p className="text-sm font-semibold">{flight.airline}</p>
            {flight.source && <p className="mt-1 text-[11px] font-medium text-blue-800">{travelSourceLabel(flight.source)}</p>}
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{flight.route} · {flight.duration} · {flight.stops}</p>
            {flight.departureTime && <p className="mt-2 text-xs font-medium text-blue-800">{flight.departureTime} → {flight.arrivalTime ?? "Arrival unavailable"}</p>}
          </div>
          <span className="shrink-0 rounded-lg bg-blue-100 px-3 py-2 text-right text-lg font-semibold tracking-tight text-blue-900">{money(flight.price, flight.currency)}<span className="mt-1 block text-[10px] font-normal text-blue-700">{flight.currency ?? "CAD"} / person</span></span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {index === 0 && <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-semibold text-white"><IconPlane className="size-3" />Lowest displayed fare</span>}
          <OfferLink url={flight.bookingUrl} label={flight.linkType === "search" ? "Search flights" : "View flight"} />
          {groupId && <button type="button" disabled={busy === flight.id} onClick={() => void pick(flight)} className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-60">Use this fare</button>}
        </div>
      </div>)}
    </div>
    </div>
  </details>
}
