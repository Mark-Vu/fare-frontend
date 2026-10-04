"use client"
import { IconBuilding, IconChevronDown } from "@tabler/icons-react"
import { money } from "@/lib/trip-format"
import { actOnTrip } from "@/lib/api/live-trip"
import { OfferLink } from "@/components/session/offer-link"
import type { Hotel } from "@/types/hotel"
import { useState } from "react"

export function HotelResults({ hotels, groupId }: { hotels: Hotel[]; groupId?: string }) {
  const [busy, setBusy] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  async function pick(hotel: Hotel) {
    if (!groupId) return
    setBusy(hotel.id)
    setNote(null)
    try {
      await actOnTrip(groupId, { action: "select_hotel", offer_id: hotel.id, name: hotel.name, price: String(hotel.price), ...(hotel.source ? { source: hotel.source } : {}) })
      setNote(`${hotel.name} is now the group stay. WhatsApp was told.`)
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Could not save that stay.")
    } finally {
      setBusy(null)
    }
  }
  return <details className="group/hotels overflow-hidden rounded-2xl border border-orange-200 border-t-4 border-t-orange-500 bg-orange-50/60">
    <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-4 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500 sm:p-6 [&::-webkit-details-marker]:hidden">
      <h2 className="flex items-center gap-3 text-lg font-semibold tracking-tight"><span className="grid size-10 place-items-center rounded-xl bg-orange-600 text-white"><IconBuilding className="size-5" /></span>Stays found</h2>
      <span className="flex items-center gap-3"><span className="rounded-full border border-orange-200 bg-orange-100 px-3 py-1 text-[11px] font-semibold text-orange-800">{hotels.length} {hotels.length === 1 ? "stay" : "stays"} found</span><IconChevronDown aria-hidden="true" className="size-4 text-orange-700 transition-transform group-open/hotels:rotate-180" /></span>
    </summary>
    <div className="border-t border-orange-200 px-4 pb-4 sm:px-6 sm:pb-6">
    <p className="mt-3 text-xs text-muted-foreground">Full stay total · guest scores use each site’s rating scale. Choosing one updates the shared trip and the WhatsApp group.</p>
    {note && <p className="mt-3 text-sm text-orange-800">{note}</p>}
    <div className="mt-4 space-y-3">
      {hotels.map(hotel => <div key={hotel.id} className="rounded-xl border border-orange-200/80 bg-card p-4 transition-colors duration-200 hover:border-orange-400">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1 basis-40">
            <p className="text-sm font-semibold">{hotel.name}</p>
            {hotel.source && <p className="mt-1 text-[11px] font-medium text-orange-800">{hotel.source === "booking_com" ? "Booking.com" : hotel.source === "airbnb" ? "Airbnb" : hotel.source}{hotel.propertyType ? ` · ${hotel.propertyType}` : ""}</p>}
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{hotel.neighborhood} · {hotel.nights} nights · {hotel.adults ?? 2} adults</p>
            {hotel.rating != null && <div className="mt-2 flex flex-wrap items-center gap-2"><span className="rounded-md bg-orange-600 px-2 py-1 text-[11px] font-semibold text-white">{hotel.originalRating ?? hotel.rating} / {hotel.originalRatingScale ?? 10}</span>{hotel.reviewCount != null && <span className="text-[11px] text-muted-foreground">{hotel.reviewCount.toLocaleString()} reviews</span>}</div>}
          </div>
          <span className="shrink-0 rounded-lg bg-orange-100 px-3 py-2 text-right text-lg font-semibold tracking-tight text-orange-900">{money(hotel.price, hotel.currency)}<span className="mt-1 block text-[10px] font-normal text-orange-700">{hotel.currency ?? "CAD"} total stay</span></span>
        </div>
        {hotel.priceNote && <p className="mt-3 text-[11px] text-muted-foreground">{hotel.priceNote}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {groupId && <button type="button" disabled={busy === hotel.id} onClick={() => void pick(hotel)} className="cursor-pointer rounded-full bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60">{busy === hotel.id ? "Saving…" : "Use this stay"}</button>}
          <OfferLink url={hotel.url} label="View stay" />
        </div>
      </div>)}
    </div>
    </div>
  </details>
}
