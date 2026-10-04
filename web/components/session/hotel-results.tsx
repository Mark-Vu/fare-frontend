"use client"
import { IconBuilding, IconArrowUpRight } from "@tabler/icons-react"
import { money } from "@/lib/trip-format"
import { actOnTrip } from "@/lib/api/live-trip"
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
      await actOnTrip(groupId, {
        action: "select_hotel",
        offer_id: hotel.id,
        name: hotel.name,
        city: hotel.neighborhood,
        total: String(hotel.price),
        nightly: hotel.nights ? String(hotel.price / hotel.nights) : "",
        rating: hotel.rating != null ? String(hotel.rating) : "",
      })
      setNote(`${hotel.name} is now the group stay. WhatsApp was told.`)
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Could not save that stay.")
    } finally {
      setBusy(null)
    }
  }
  return <section className="rounded-2xl border border-border bg-card p-6">
    <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight"><IconBuilding className="size-5 text-primary" />Stays found</h2>
    <p className="mt-1 text-xs text-muted-foreground">Full stay total · one room · guest scores out of 10. Choosing one updates the shared trip and the WhatsApp group.</p>
    {note && <p className="mt-3 text-sm text-primary">{note}</p>}
    <div className="mt-4 divide-y divide-border">{hotels.map(hotel => <div key={hotel.id} className="py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{hotel.name}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{hotel.neighborhood} · {hotel.nights} nights · {hotel.adults ?? 2} adults</p>
          {hotel.rating != null && <p className="mt-2 text-xs text-primary">{hotel.rating} / 10{hotel.reviewCount != null && ` · ${hotel.reviewCount.toLocaleString()} reviews`}</p>}
        </div>
        <span className="shrink-0 text-right text-lg font-semibold tracking-tight">{money(hotel.price, hotel.currency)}<span className="mt-1 block text-[10px] font-normal text-muted-foreground">{hotel.currency ?? "CAD"} total stay</span></span>
      </div>
      {hotel.priceNote && <p className="mt-3 text-[11px] text-muted-foreground">{hotel.priceNote}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {hotel.url && /^https?:\/\//i.test(hotel.url) && <a href={hotel.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary">View stay<IconArrowUpRight className="size-3" /></a>}
        {groupId && <button type="button" disabled={busy === hotel.id} onClick={() => void pick(hotel)} className="rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">Use this stay</button>}
      </div>
    </div>)}</div>
  </section>
}
