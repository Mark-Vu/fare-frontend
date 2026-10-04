"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { IconBrandWhatsapp, IconBuilding, IconCheck, IconChevronDown, IconMapPin, IconPlane, IconSend } from "@tabler/icons-react"
import { actOnTrip, getTrip, type TripView } from "@/lib/api/live-trip"
import { getSessionSnapshot } from "@/lib/api/sessions"
import type { SessionSnapshot } from "@/types/dashboard"
import { ActivityEditor, useItineraryEdits } from "@/components/session/activity-editor"
import { OfferLink } from "@/components/session/offer-link"
import { ExpenseTracker } from "./expense-tracker"
import { travelSourceLabel } from "@/lib/travel-source-label"
import { TripSkeleton } from "@/components/ui/skeleton"

const tabs = ["Itinerary", "Money", "Flights & stays", "Chat"] as const
type Tab = (typeof tabs)[number]

function cad(n: number | null | undefined) {
  if (n == null || Number.isNaN(n) || n === 0) return "—"
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(n)
}

function when(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
}

function firstPositive(...values: Array<number | null | undefined>) {
  for (const value of values) if (value != null && !Number.isNaN(value) && value > 0) return value
  return 0
}
function lowestPrice(rows: { price?: number }[] | undefined) {
  let best = 0
  for (const row of rows ?? []) if (row.price && row.price > 0 && (best === 0 || row.price < best)) best = row.price
  return best
}
function moneyBreakdown(trip: TripView, quote: SessionSnapshot | null) {
  const named = trip.people?.filter(person => person.name).length ?? 0
  const people = Math.max(1, trip.spend?.people || named || quote?.session.adults || 1)
  const flightEach = firstPositive(trip.spend?.flight_each, trip.flights?.find(flight => flight.selected)?.price, quote?.plan?.flightPrice, lowestPrice(quote?.flights))
  const hotelGroup = firstPositive(trip.spend?.hotel_group, trip.hotels?.find(hotel => hotel.selected)?.total, quote?.plan?.hotelPrice ? quote.plan.hotelPrice * people : 0, lowestPrice(quote?.hotels))
  const hotelEach = firstPositive(trip.spend?.hotel_each, people ? hotelGroup / people : 0)
  const travelEach = firstPositive(trip.spend?.travel_each, flightEach + hotelEach)
  const travelGroup = firstPositive(trip.spend?.travel_group, flightEach * people + hotelGroup)
  const fromSearch = !(trip.spend?.flight_each > 0 || trip.spend?.hotel_group > 0) && (flightEach > 0 || hotelGroup > 0)
  return { flightEach, hotelGroup, hotelEach, travelEach, travelGroup, fromSearch }
}

function BookedPair({ flights, hotel, nights }: { flights: TripView["flights"]; hotel: TripView["hotels"][number] | undefined; nights: number }) {
  const flight = flights[0]
  return <section aria-label="Flight and stay on this trip" className="grid gap-4 md:grid-cols-2">
    <article className="flex flex-col rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-card p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-blue-600 text-white"><IconPlane className="size-5" /></span>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide uppercase ${flight ? "bg-blue-600 text-white" : "bg-secondary text-muted-foreground"}`}>{flight && <IconCheck className="size-3.5" />}{flight ? "On the trip" : "Not chosen"}</span>
      </div>
      <p className="mt-5 text-xs font-medium tracking-widest text-blue-700 uppercase">Flight</p>
      {flight ? <>
        <h3 className="mt-1 text-2xl font-semibold tracking-tight">{flight.airline || "Flight"}</h3>
        <p className="mt-2 text-sm">{flight.origin} → {flight.destination}</p>
        {flight.summary && <p className="mt-2 text-sm leading-6 text-muted-foreground">{flight.summary}</p>}
        <p className="mt-4 text-lg font-semibold">{cad(flight.price)}<span className="ml-1 text-sm font-normal text-muted-foreground">round trip each</span></p>
        {flight.source && <p className="mt-1 text-xs text-muted-foreground">{travelSourceLabel(flight.source)}</p>}
        <div className="mt-auto pt-4"><OfferLink url={flight.booking_url} label={flight.link_type === "search" ? "Search flights" : "View flight"} /></div>
      </> : <p className="mt-2 text-sm text-muted-foreground">No flight is on the trip yet.</p>}
    </article>
    <article className="flex flex-col overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-card">
      {hotel?.image && <img src={hotel.image} alt="" className="h-36 w-full object-cover" />}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-orange-600 text-white"><IconBuilding className="size-5" /></span>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide uppercase ${hotel ? "bg-orange-600 text-white" : "bg-secondary text-muted-foreground"}`}>{hotel && <IconCheck className="size-3.5" />}{hotel ? "On the trip" : "Not chosen"}</span>
        </div>
        <p className="mt-5 text-xs font-medium tracking-widest text-orange-700 uppercase">Stay</p>
        {hotel ? <>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight">{hotel.name}</h3>
          <p className="mt-2 text-sm">{[hotel.city, nights ? `${nights} nights` : ""].filter(Boolean).join(" · ")}</p>
          <p className="mt-4 text-lg font-semibold">{cad(hotel.total)}<span className="ml-1 text-sm font-normal text-muted-foreground">for the group</span></p>
          <p className="mt-1 text-xs text-muted-foreground">{[hotel.nightly ? `${cad(hotel.nightly)} / night` : "", hotel.source === "booking_com" ? "Booking.com" : hotel.source === "airbnb" ? "Airbnb" : hotel.source, hotel.property_type].filter(Boolean).join(" · ")}</p>
          <div className="mt-auto pt-4"><OfferLink url={hotel.booking_url || hotel.checkout_url || hotel.url} label="View stay" /></div>
        </> : <p className="mt-2 text-sm text-muted-foreground">No stay is on the trip yet.</p>}
      </div>
    </article>
  </section>
}

function alignOffers<T extends { offer_id: string }>(incoming: T[] | undefined, current: T[] | undefined) {
  const next = incoming ?? []
  const order: string[] = []
  const seen = new Set<string>()
  for (const row of [...(current ?? []), ...next]) {
    if (!row.offer_id || seen.has(row.offer_id)) continue
    order.push(row.offer_id)
    seen.add(row.offer_id)
  }
  const byId = new Map(next.map(row => [row.offer_id, row]))
  return order.flatMap(id => {
    const row = byId.get(id)
    return row ? [row] : []
  })
}

function messageKey(msg: { id?: string; at: string; sender: string; text: string }) {
  return `${msg.id || ""}|${msg.at}|${msg.sender}|${msg.text}`
}

function mergeMessages(current: TripView["messages"] | undefined, next: TripView["messages"] | undefined) {
  const server = next ?? []
  const echoed = new Set(server.filter(msg => !msg.bot).map(msg => msg.text))
  const pending = (current ?? []).filter(msg => msg.id?.startsWith("local-") && !echoed.has(msg.text))
  const seen = new Set<string>()
  const rows = []
  for (const msg of [...server, ...pending]) {
    const key = messageKey(msg)
    if (seen.has(key)) continue
    seen.add(key)
    rows.push(msg)
  }
  return rows.sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
}

function acceptSaved(current: TripView | null, next: TripView): TripView {
  if (!current) return next
  return { ...next, messages: mergeMessages(current.messages, next.messages), flights: alignOffers(next.flights, current.flights), hotels: alignOffers(next.hotels, current.hotels) }
}

function mergeTrip(current: TripView | null, next: TripView): TripView {
  if (!current || current.group_id !== next.group_id) return next
  const messages = mergeMessages(current.messages, next.messages)
  const older = Date.parse(next.updated_at) < Date.parse(current.updated_at)
  const olderRevision = current.current_session_id === next.current_session_id && (current.itinerary_revision ?? 0) > (next.itinerary_revision ?? 0)
  if (older || olderRevision) return { ...current, messages }
  return { ...next, messages, flights: alignOffers(next.flights, current.flights), hotels: alignOffers(next.hotels, current.hotels) }
}

function showSelection(trip: TripView, action: string, offerId: string): TripView {
  const people = Math.max(1, trip.spend?.people || trip.people?.filter(person => person.name).length || 1)
  const spend = trip.spend ? { ...trip.spend } : null
  if (action === "select_flight") {
    const flights = (trip.flights ?? []).map(flight => ({ ...flight, selected: flight.offer_id === offerId, reason: undefined }))
    const price = flights.find(flight => flight.selected)?.price || 0
    if (spend && price > 0) {
      spend.flight_each = price
      spend.travel_each = price + (spend.hotel_each || 0)
      spend.travel_group = price * people + (spend.hotel_group || 0)
    }
    return { ...trip, flights, spend: spend ?? trip.spend, updated_at: new Date().toISOString() }
  }
  const hotels = (trip.hotels ?? []).map(hotel => ({ ...hotel, selected: hotel.offer_id === offerId, reason: undefined }))
  const total = hotels.find(hotel => hotel.selected)?.total || 0
  if (spend && total > 0) {
    spend.hotel_group = total
    spend.hotel_each = Math.round(total / people * 100) / 100
    spend.travel_each = (spend.flight_each || 0) + spend.hotel_each
    spend.travel_group = (spend.flight_each || 0) * people + total
  }
  return { ...trip, hotels, spend: spend ?? trip.spend, updated_at: new Date().toISOString() }
}

export function LiveTrip({ groupId, embed = false, sessionId }: { groupId: string; embed?: boolean; sessionId?: string }) {
  const [trip, setTrip] = useState<TripView | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const visibleTabs: Tab[] = embed ? ["Money", "Flights & stays", "Chat"] : [...tabs]
  const [tab, setTab] = useState<Tab>(embed ? "Money" : "Itinerary")
  const [actor, setActor] = useState("")
  const [budget, setBudget] = useState("")
  const [chat, setChat] = useState("")
  const [quote, setQuote] = useState<SessionSnapshot | null>(null)
  const selectGeneration = useRef(0)
  const transcript = useRef<HTMLDivElement>(null)
  const stickToLatest = useRef(true)

  useEffect(() => {
    const saved = localStorage.getItem(`fare-actor:${groupId}`) || ""
    setActor(saved)
  }, [groupId])

  useEffect(() => {
    const controller = new AbortController()
    let stop = false
    async function load() {
      try {
        const next = await getTrip(groupId, controller.signal)
        if (!stop) {
          setTrip(current => mergeTrip(current, next))
          setBudget(current => current || next.budget_note || "")
          setError(null)
        }
        const sid = sessionId || next.current_session_id
        if (sid) {
          try {
            const snap = await getSessionSnapshot(groupId, sid, controller.signal)
            if (!stop) setQuote(snap)
          } catch (err) {
            if (err instanceof DOMException) throw err
          }
        }
      } catch (err) {
        if (!stop && !(err instanceof DOMException)) setError(err instanceof Error ? err.message : "Could not load this trip.")
      }
    }
    void load()
    const timer = setInterval(load, 4000)
    return () => { stop = true; controller.abort(); clearInterval(timer) }
  }, [groupId, sessionId])

  const itineraryEdits = useItineraryEdits(groupId, next => setTrip(current => mergeTrip(current, next)), sessionId)
  const itineraryEditable = !!trip?.editable && (!sessionId || trip.current_session_id === sessionId)

  const names = useMemo(() => trip?.people?.map(p => p.name).filter(Boolean) ?? [], [trip])

  useEffect(() => {
    const el = transcript.current
    if (tab !== "Chat" || !el || !stickToLatest.current) return
    el.scrollTop = el.scrollHeight
  }, [tab, trip?.messages?.length])

  useEffect(() => {
    const el = transcript.current
    if (!el || tab !== "Chat") return
    const onWheel = (event: WheelEvent) => {
      const max = el.scrollHeight - el.clientHeight
      if (max <= 0) return
      const next = Math.min(max, Math.max(0, el.scrollTop + event.deltaY))
      if (next === el.scrollTop) return
      el.scrollTop = next
      stickToLatest.current = max - next < 80
      event.preventDefault()
      event.stopPropagation()
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [tab])

  async function run(body: Record<string, string>) {
    const selecting = (body.action === "select_flight" || body.action === "select_hotel") && !!body.offer_id
    const chatting = body.action === "chat" && !!body.text
    const generation = selecting ? ++selectGeneration.current : 0
    const previous = trip
    if (selecting && trip) setTrip(showSelection(trip, body.action, body.offer_id))
    else if (chatting && trip) {
      stickToLatest.current = true
      const text = body.text
      setTrip(current => current ? { ...current, messages: [...(current.messages ?? []), { id: `local-${Date.now()}`, sender: actor || "You", text, bot: false, at: new Date().toISOString() }] } : current)
    } else setBusy(true)
    setError(null)
    try {
      const next = await actOnTrip(groupId, { actor: actor || "Someone", ...body })
      if (selecting && generation !== selectGeneration.current) return
      setTrip(current => selecting ? acceptSaved(current, next) : mergeTrip(current, next))
    } catch (err) {
      if (selecting && generation !== selectGeneration.current) return
      if (selecting && previous) setTrip(previous)
      if (chatting) {
        setTrip(current => current ? { ...current, messages: (current.messages ?? []).filter(msg => !(msg.id?.startsWith("local-") && msg.text === body.text)) } : current)
        setChat(body.text)
      }
      setError(err instanceof Error ? err.message : "That didn’t go through.")
    } finally {
      if (!selecting && !chatting) setBusy(false)
    }
  }

  if (!trip && !error) {
    return <TripSkeleton embed={embed} />
  }
  if (!trip) {
    if (embed) return <p className="text-sm text-muted-foreground">{error || "The shared WhatsApp plan appears here once Fare is tagged in the group."}</p>
    return <div className="max-w-lg"><p className="text-sm text-destructive">{error}</p><Link href="/dashboard" className="mt-4 inline-block text-sm text-primary">Back to trips</Link></div>
  }

  const chosenHotel = (trip.hotels ?? []).find(hotel => hotel.selected)
  const chosenFlights = (trip.flights ?? []).filter(flight => flight.selected)
  const figures = moneyBreakdown(trip, quote)

  return <div>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className={embed ? "text-2xl font-semibold tracking-tight" : "text-4xl font-semibold tracking-[-0.04em]"}>{embed ? "Shared plan · WhatsApp" : trip.destination || "Trip in progress"}</h1>
        {!embed && <p className="mt-2 flex items-center gap-2 text-xs font-medium tracking-widest text-primary uppercase"><IconBrandWhatsapp className="size-4" />{trip.group_name}</p>}
        <p className="mt-2 text-sm text-muted-foreground">{[trip.dates, trip.origin && `from ${trip.origin}`, trip.state].filter(Boolean).join(" · ")}</p>
      </div>
      <label className="text-xs text-muted-foreground">You are
        <select className="mt-1 block rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground" value={actor} onChange={e => { setActor(e.target.value); localStorage.setItem(`fare-actor:${groupId}`, e.target.value) }}>
          <option value="">Pick your name</option>
          {names.map(name => <option key={name} value={name}>{name}</option>)}
        </select>
      </label>
    </div>
    {error && <p role="alert" className="mt-4 rounded-xl border border-border bg-card px-4 py-3 text-sm text-destructive">{error}</p>}
    {!trip.editable && <p className="mt-4 rounded-xl border border-border bg-secondary/60 px-4 py-3 text-sm">This itinerary is read-only. Chat still stays in sync with WhatsApp.</p>}

    <div className="mt-6 flex gap-2 overflow-x-auto">
      {visibleTabs.map(item => <button key={item} type="button" onClick={() => setTab(item)} className={`rounded-full px-4 py-2 text-sm ${tab === item ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{item}</button>)}
    </div>

    {tab === "Itinerary" && <section className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
      <div className="space-y-3">
        {itineraryEditable && trip.can_undo_activity_edit && <button type="button" disabled={itineraryEdits.busy} onClick={() => void itineraryEdits.undo(trip.itinerary_revision ?? 0)} className="rounded-full border border-border px-3 py-1.5 text-xs disabled:opacity-50">Undo last edit</button>}
        {itineraryEdits.error && <p role="alert" className="text-sm text-destructive">{itineraryEdits.error}</p>}
        {(trip.days ?? []).length === 0 && <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">No day-by-day yet. Tag Fare in WhatsApp and ask for the plan — it will show up here.</div>}
        {(trip.days ?? []).map((day, i) => <details key={`${day.title}-${i}`} open={i === 0} className="group/day rounded-2xl border border-border bg-card">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
            <h2 className="font-semibold">{day.title}</h2>
            <IconChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open/day:rotate-180" />
          </summary>
          <div className="border-t border-border px-5 pt-4 pb-5">
            {day.body && <p className="text-sm leading-6 text-muted-foreground whitespace-pre-wrap">{day.body}</p>}
            {!!day.activities?.length && <ol className="mt-4 space-y-4">{day.activities.map((activity, index) => <li key={activity.id || index} className="flex gap-3 border-t border-border pt-4"><time className="w-12 shrink-0 text-xs text-primary">{activity.time}</time><div className="min-w-0 flex-1"><ActivityEditor activity={activity} revision={trip.itinerary_revision ?? 0} editable={itineraryEditable} busy={itineraryEdits.busy} onSave={itineraryEdits.save} pendingReplacement={trip.pending_activity_replacement} replacementActions={itineraryEdits} /></div></li>)}</ol>}
            {day.food_cad != null && <p className="mt-3 text-xs text-primary">Meals about {cad(day.food_cad)} each, not booked.</p>}
          </div>
        </details>)}
      </div>
      <aside className="space-y-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs tracking-widest uppercase text-muted-foreground">Flights + hotel</p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3"><dt>Flights each</dt><dd>{cad(figures.flightEach)}</dd></div>
            <div className="flex justify-between gap-3"><dt>Hotel, group</dt><dd>{cad(figures.hotelGroup)}</dd></div>
            <div className="flex justify-between gap-3"><dt>Hotel each</dt><dd>{cad(figures.hotelEach)}</dd></div>
            <div className="flex justify-between gap-3 border-t border-border pt-2 font-semibold"><dt>Total each</dt><dd>{cad(figures.travelEach)}</dd></div>
            <div className="flex justify-between gap-3 font-semibold"><dt>Group total</dt><dd>{cad(figures.travelGroup)}</dd></div>
          </dl>
          {(trip.spend?.food_per_day || trip.spend?.food_trip) && <p className="mt-3 text-xs text-muted-foreground">Food about {cad(trip.spend.food_per_day)} / day · {cad(trip.spend.food_trip)} for the trip, each. Not booked.</p>}
        </div>
        <div className="rounded-2xl bg-forest p-5 text-primary-foreground"><p className="text-xs tracking-widest uppercase text-sun">Stay</p><p className="mt-2 text-2xl font-semibold">{chosenHotel?.name || "Not chosen"}</p><p className="mt-2 text-sm opacity-80">{trip.nights ? `${trip.nights} nights` : "Dates come from the chat"}</p>{chosenHotel?.reason && <p className="mt-3 text-xs leading-5 opacity-80">{chosenHotel.reason}</p>}<div className="mt-3"><OfferLink url={chosenHotel?.booking_url || chosenHotel?.checkout_url || chosenHotel?.url} label="View stay" /></div></div>
        {chosenFlights.map((flight, index) => <div key={`${flight.offer_id}-${index}`} className="rounded-2xl border border-border bg-card p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">Chosen flight</p><p className="mt-2 font-semibold">{flight.airline}</p><p className="mt-1 text-sm text-muted-foreground">{flight.origin} → {flight.destination}</p><div className="mt-3"><OfferLink url={flight.booking_url} label={flight.link_type === "search" ? "Search flights" : "View flight"} /></div></div>)}
        {(trip.places ?? []).map((place, i) => <a key={`${place.name}-${place.neighborhood}-${i}`} href={place.map} target="_blank" rel="noreferrer" className="block rounded-2xl border border-border bg-card p-4"><p className="flex items-center gap-2 font-medium"><IconMapPin className="size-4 text-primary" />{place.name}</p><p className="mt-1 text-xs text-muted-foreground">{place.neighborhood}</p><p className="mt-2 text-sm leading-5">{place.why}</p>{place.est_cad != null && <p className="mt-2 text-xs">{cad(place.est_cad)} a person, rough</p>}</a>)}
      </aside>
    </section>}

    {tab === "Money" && <><section className="mt-6 grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Flights + hotel</h2>
        <p className="mt-1 text-xs text-muted-foreground">{figures.fromSearch ? "From the latest flight and stay search. Food is not in these numbers." : "Food is not in these numbers."}</p>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between"><dt>Flights each</dt><dd>{cad(figures.flightEach)}</dd></div>
          <div className="flex justify-between"><dt>Hotel, group</dt><dd>{cad(figures.hotelGroup)}</dd></div>
          <div className="flex justify-between"><dt>Hotel each</dt><dd>{cad(figures.hotelEach)}</dd></div>
          <div className="flex justify-between border-t border-border pt-3 font-semibold"><dt>Total each</dt><dd>{cad(figures.travelEach)}</dd></div>
          <div className="flex justify-between font-semibold"><dt>Group total</dt><dd>{cad(figures.travelGroup)}</dd></div>
        </dl>
        {!!trip.owes?.length && <ul className="mt-5 space-y-2 text-sm">{trip.owes.map(row => <li key={`${row.from}-${row.to}`} className="flex justify-between gap-3"><span>{row.from} pays {row.to}</span><span>{cad(row.amount)}</span></li>)}</ul>}
        {(trip.spend?.food_per_day || trip.spend?.food_trip) && <div className="mt-5 rounded-xl bg-secondary p-4 text-sm"><p className="font-medium">Food estimate</p><p className="mt-1 text-muted-foreground">{trip.spend.food_note}</p><p className="mt-2">{cad(trip.spend.food_per_day)} / day · {cad(trip.spend.food_trip)} for the trip, per person. Not booked.</p></div>}
      </div>
      <form className="rounded-2xl border border-border bg-card p-6" onSubmit={e => { e.preventDefault(); void run({ action: "set_budget", budget }) }}>
        <h2 className="font-semibold">Planning budget</h2>
        <p className="mt-1 text-sm text-muted-foreground">One number for the group, in CAD. It guides food and options. It does not change the locked fare.</p>
        {trip.budget_note && <p className="mt-3 text-sm">Saved budget: {trip.budget_note}</p>}
        <div className="mt-4 flex gap-2"><input value={budget} onChange={e => setBudget(e.target.value)} placeholder="2500" className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm" /><button disabled={busy} className="rounded-xl bg-primary px-4 text-sm text-primary-foreground">Save</button></div>
      </form>
    </section>
    <div className="mt-6">{(sessionId || trip.current_session_id) ? <ExpenseTracker key={`${groupId}:${sessionId || trip.current_session_id}`} groupId={groupId} sessionId={(sessionId || trip.current_session_id)!} /> : <p className="text-sm text-muted-foreground">Recorded expenses will be available once this trip has a planning session.</p>}</div>
    </>}

    {tab === "Flights & stays" && <div className="mt-6 space-y-8">
      {!embed && <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">Pick one fare and one stay. Each choice updates the shared trip.</p><button type="button" disabled={busy || !trip.editable} onClick={() => run({ action: "chat", text: "show flight and hotel options on the dashboard" })} className="cursor-pointer rounded-full bg-secondary px-4 py-2 text-sm hover:bg-secondary/70 disabled:cursor-not-allowed disabled:opacity-50">Ask Fare for options</button></div>}
      {!embed && <><section className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5">
        <h2 className="flex items-center gap-3 text-lg font-semibold"><span className="grid size-10 place-items-center rounded-xl bg-blue-600 text-white"><IconPlane className="size-5" /></span>Flights</h2>
        <p className="mt-2 text-xs text-muted-foreground">Round trip, per person. The outlined card is the fare on the trip now.</p>
        {(trip.flights ?? []).length === 0 && <p className="mt-4 text-sm text-muted-foreground">No fares yet.</p>}
      <div className="mt-4 grid gap-3 md:grid-cols-3">{(trip.flights ?? []).map((flight, i) => <article key={flight.offer_id || flight.summary || String(i)} className={`rounded-2xl border bg-card p-4 transition-colors ${flight.selected ? "border-blue-500 ring-2 ring-blue-200" : "border-blue-200 hover:border-blue-400"}`}><p className="text-xs uppercase tracking-wide text-muted-foreground">{flight.selected ? "Chosen" : "Fare"}</p><p className="mt-2 font-semibold">{flight.airline || "Flight"}</p>{flight.source && <p className="mt-1 text-xs text-muted-foreground">{travelSourceLabel(flight.source)}</p>}<p className="text-sm">{flight.origin} → {flight.destination}</p><p className="mt-2 text-sm text-muted-foreground">{flight.summary}</p><p className="mt-3 font-medium">{cad(flight.price)} round trip each</p>{flight.selected && flight.reason && <p className="mt-2 text-xs leading-5 text-muted-foreground">{flight.reason}</p>}<div className="mt-3 flex flex-wrap items-center gap-2"><OfferLink url={flight.booking_url} label={flight.link_type === "search" ? "Search flights" : "View flight"} /><button type="button" disabled={busy || !trip.editable || flight.selected} onClick={() => run({ action: "select_flight", offer_id: flight.offer_id, airline: flight.airline || "", origin: flight.origin || "", destination: flight.destination || "", summary: flight.summary || "", price: String(flight.price || 0), ...(flight.source ? { source: flight.source } : {}), ...(flight.booking_url ? { booking_url: flight.booking_url } : {}), ...(flight.link_type ? { link_type: flight.link_type } : {}) })} className="cursor-pointer rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{flight.selected ? "On the trip" : "Use this fare"}</button></div></article>)}</div>
      </section>
      <section className="rounded-2xl border border-orange-200 bg-orange-50/60 p-5">
        <h2 className="flex items-center gap-3 text-lg font-semibold"><span className="grid size-10 place-items-center rounded-xl bg-orange-600 text-white"><IconBuilding className="size-5" /></span>Stays</h2>
        <p className="mt-2 text-xs text-muted-foreground">Full stay for the group. The outlined card is the stay on the trip now.</p>
        {(trip.hotels ?? []).length === 0 && <p className="mt-4 text-sm text-muted-foreground">No stays yet.</p>}
      <div className="mt-4 grid gap-4 md:grid-cols-3">{(trip.hotels ?? []).map((hotel, i) => <article key={hotel.offer_id || hotel.name || String(i)} className={`overflow-hidden rounded-2xl border bg-card transition-colors ${hotel.selected ? "border-orange-500 ring-2 ring-orange-200" : "border-orange-200 hover:border-orange-400"}`}>
        {hotel.image && <img src={hotel.image} alt="" className="h-36 w-full object-cover" />}
        <div className="bg-card p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">{hotel.selected ? "Chosen stay" : hotel.city}</p><h3 className="mt-1 font-semibold">{hotel.name}</h3>{hotel.source && <p className="mt-1 text-xs text-muted-foreground">{hotel.source === "booking_com" ? "Booking.com" : hotel.source === "airbnb" ? "Airbnb" : hotel.source}{hotel.property_type ? ` · ${hotel.property_type}` : ""}</p>}<p className="mt-2 text-sm">{cad(hotel.nightly)} / night · {cad(hotel.total)} group{hotel.rating != null ? ` · ${hotel.original_rating ?? hotel.rating} / ${hotel.original_rating_scale ?? 10}` : ""}</p>{hotel.price_note && <p className="mt-2 text-xs text-muted-foreground">{hotel.price_note}</p>}{hotel.selected && hotel.reason && <p className="mt-2 text-xs leading-5 text-muted-foreground">{hotel.reason}</p>}<div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={busy || !trip.editable || hotel.selected} onClick={() => run({ action: "select_hotel", offer_id: hotel.offer_id, name: hotel.name || "", city: hotel.city || "", price: String(hotel.total || 0), ...(hotel.nightly ? { price_per_night: String(hotel.nightly) } : {}), ...(hotel.source ? { source: hotel.source } : {}), ...((hotel.booking_url || hotel.checkout_url || hotel.url) ? { checkout_url: hotel.booking_url || hotel.checkout_url || hotel.url } : {}) })} className="cursor-pointer rounded-full bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50">{hotel.selected ? "On the trip" : "Use this stay"}</button><OfferLink url={hotel.booking_url || hotel.checkout_url || hotel.url} label="View stay" /></div></div>
      </article>)}
      </div>
      </section></>}
      <BookedPair flights={chosenFlights} hotel={chosenHotel} nights={trip.nights} />
    </div>}

    {tab === "Chat" && <section className="mt-6 flex h-[32rem] flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div ref={transcript} onScroll={e => { const el = e.currentTarget; stickToLatest.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80 }} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-4">
        {(trip.messages ?? []).length === 0 && <p className="text-sm text-muted-foreground">Messages from the WhatsApp group show up here.</p>}
        {(trip.messages ?? []).map((msg, i) => <div key={`${msg.id || msg.at}-${i}`} className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.bot ? "bg-secondary" : "ml-auto bg-whatsapp/15"}`}><p className="text-xs font-medium text-muted-foreground">{msg.sender} · {when(msg.at)}</p><p className="mt-1 whitespace-pre-wrap leading-6">{msg.text}</p></div>)}
      </div>
      {error && <p role="alert" className="border-t border-border px-4 py-2 text-sm text-destructive">{error}</p>}
      <form className="flex gap-2 border-t border-border p-3" onSubmit={e => { e.preventDefault(); const text = chat.trim(); if (!text) return; setChat(""); void run({ action: "chat", text }) }}>
        <input value={chat} onChange={e => setChat(e.target.value)} placeholder="Message Fare — it also lands in the WhatsApp group" className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm" />
        <button type="submit" disabled={!chat.trim()} aria-label="Send" className="grid size-10 cursor-pointer place-items-center rounded-xl bg-primary text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"><IconSend className="size-4" /></button>
      </form>
    </section>}
  </div>
}
