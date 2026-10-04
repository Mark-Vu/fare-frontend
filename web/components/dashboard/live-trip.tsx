"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { IconBrandWhatsapp, IconMapPin, IconSend } from "@tabler/icons-react"
import { actOnTrip, getTrip, type TripView } from "@/lib/api/live-trip"
import { travelSourceLabel } from "@/lib/travel-source-label"

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

export function LiveTrip({ groupId, embed = false }: { groupId: string; embed?: boolean }) {
  const [trip, setTrip] = useState<TripView | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [tab, setTab] = useState<Tab>("Itinerary")
  const [actor, setActor] = useState("")
  const [budget, setBudget] = useState("")
  const [chat, setChat] = useState("")
  const [traveler, setTraveler] = useState({ name: "", legal_name: "", date_of_birth: "", passport_number: "" })

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
          setTrip(next)
          setError(null)
          setBudget(current => current || next.budget_note || "")
        }
      } catch (err) {
        if (!stop && !(err instanceof DOMException)) setError(err instanceof Error ? err.message : "Could not load this trip.")
      }
    }
    void load()
    const timer = setInterval(load, 4000)
    return () => { stop = true; controller.abort(); clearInterval(timer) }
  }, [groupId])

  const names = useMemo(() => trip?.people?.map(p => p.name).filter(Boolean) ?? [], [trip])

  async function run(body: Record<string, string>) {
    setBusy(true)
    setError(null)
    try {
      const next = await actOnTrip(groupId, { actor: actor || "Someone", ...body })
      setTrip(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : "That didn’t go through.")
    } finally {
      setBusy(false)
    }
  }

  if (!trip && !error) {
    return <p className="text-sm text-muted-foreground">Loading the WhatsApp trip…</p>
  }
  if (!trip) {
    if (embed) return <p className="text-sm text-muted-foreground">{error || "The shared WhatsApp plan appears here once Fare is tagged in the group."}</p>
    return <div className="max-w-lg"><p className="text-sm text-destructive">{error}</p><Link href="/dashboard" className="mt-4 inline-block text-sm text-primary">Back to trips</Link></div>
  }

  return <div>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {!embed && <p className="mb-2 flex items-center gap-2 text-xs font-medium tracking-widest text-primary uppercase"><IconBrandWhatsapp className="size-4" />{trip.group_name}</p>}
        <h1 className={embed ? "text-2xl font-semibold tracking-tight" : "text-4xl font-semibold tracking-[-0.04em]"}>{embed ? "Shared plan · WhatsApp" : trip.destination || "Trip in progress"}</h1>
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
    {!trip.editable && <p className="mt-4 rounded-xl border border-border bg-secondary/60 px-4 py-3 text-sm">This trip is booked. The plan is locked; chat still stays in sync with WhatsApp.</p>}

    <div className="mt-6 flex gap-2 overflow-x-auto">
      {tabs.map(item => <button key={item} type="button" onClick={() => setTab(item)} className={`rounded-full px-4 py-2 text-sm ${tab === item ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{item}</button>)}
    </div>

    {tab === "Itinerary" && <section className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
      <div className="space-y-3">
        {(trip.days ?? []).length === 0 && <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">No day-by-day yet. Tag Fare in WhatsApp and ask for the plan — it will show up here.</div>}
        {(trip.days ?? []).map((day, i) => <article key={`${day.title}-${i}`} className="rounded-2xl border border-border bg-card p-5"><h2 className="font-semibold">{day.title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground whitespace-pre-wrap">{day.body}</p>{day.food_cad != null && <p className="mt-3 text-xs text-primary">Meals about {cad(day.food_cad)} each, not booked.</p>}</article>)}
      </div>
      <aside className="space-y-3">
        <div className="rounded-2xl bg-forest p-5 text-primary-foreground"><p className="text-xs tracking-widest uppercase text-sun">Stay</p><p className="mt-2 text-2xl font-semibold">{(trip.hotels ?? []).find(h => h.selected)?.name || "Not chosen"}</p><p className="mt-2 text-sm opacity-80">{trip.nights ? `${trip.nights} nights` : "Dates come from the chat"}</p></div>
        {(trip.places ?? []).map((place, i) => <a key={`${place.name}-${place.neighborhood}-${i}`} href={place.map} target="_blank" rel="noreferrer" className="block rounded-2xl border border-border bg-card p-4"><p className="flex items-center gap-2 font-medium"><IconMapPin className="size-4 text-primary" />{place.name}</p><p className="mt-1 text-xs text-muted-foreground">{place.neighborhood}</p><p className="mt-2 text-sm leading-5">{place.why}</p>{place.est_cad != null && <p className="mt-2 text-xs">{cad(place.est_cad)} a person, rough</p>}</a>)}
      </aside>
    </section>}

    {tab === "Money" && <section className="mt-6 grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Flights + hotel</h2>
        <p className="mt-1 text-xs text-muted-foreground">Food is not in these numbers.</p>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between"><dt>Flights each</dt><dd>{cad(trip.spend.flight_each)}</dd></div>
          <div className="flex justify-between"><dt>Hotel, group</dt><dd>{cad(trip.spend.hotel_group)}</dd></div>
          <div className="flex justify-between"><dt>Hotel each</dt><dd>{cad(trip.spend.hotel_each)}</dd></div>
          <div className="flex justify-between border-t border-border pt-3 font-semibold"><dt>Total each</dt><dd>{cad(trip.spend.travel_each)}</dd></div>
          <div className="flex justify-between font-semibold"><dt>Group total</dt><dd>{cad(trip.spend.travel_group)}</dd></div>
        </dl>
        {(trip.spend.food_per_day || trip.spend.food_trip) && <div className="mt-5 rounded-xl bg-secondary p-4 text-sm"><p className="font-medium">Food estimate</p><p className="mt-1 text-muted-foreground">{trip.spend.food_note}</p><p className="mt-2">{cad(trip.spend.food_per_day)} / day · {cad(trip.spend.food_trip)} for the trip, per person. Not booked.</p></div>}
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Who owes whom</h2>
          <p className="mt-1 text-sm text-muted-foreground">Card: {trip.payer_name || "not chosen"}</p>
          <ul className="mt-4 space-y-2 text-sm">{(trip.owes ?? []).length ? trip.owes.map(row => <li key={row.from}>{row.from} owes {row.to} {cad(row.amount)}</li>) : <li className="text-muted-foreground">Pick who is paying to split the locked quote.</li>}</ul>
          <div className="mt-4 flex flex-wrap gap-2">{names.map(name => <button key={name} type="button" disabled={busy} onClick={() => run({ action: "set_payer", name })} className={`rounded-full px-3 py-1 text-xs ${trip.payer_name === name ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{name}</button>)}</div>
        </div>
        <form className="rounded-2xl border border-border bg-card p-6" onSubmit={e => { e.preventDefault(); void run({ action: "set_budget", budget }) }}>
          <h2 className="font-semibold">Planning budget</h2>
          <p className="mt-1 text-sm text-muted-foreground">One number for the group, in CAD. It guides food and options. It does not change the locked fare.</p>
          <div className="mt-4 flex gap-2"><input value={budget} onChange={e => setBudget(e.target.value)} placeholder="2500" className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm" /><button disabled={busy} className="rounded-xl bg-primary px-4 text-sm text-primary-foreground">Save</button></div>
        </form>
      </div>
    </section>}

    {tab === "Flights & stays" && <section className="mt-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">Picks here update the shared trip and get announced in WhatsApp. Live Skyvern searches start from the group chat, not from this page.</p><button type="button" disabled={busy || !trip.editable} onClick={() => run({ action: "chat", text: "show flight and hotel options on the dashboard" })} className="rounded-full bg-secondary px-4 py-2 text-sm">Ask Fare for options</button></div>
      <div className="grid gap-3 md:grid-cols-3">{(trip.flights ?? []).map(flight => <button key={flight.offer_id} type="button" disabled={busy || !trip.editable} onClick={() => run({ action: "select_flight", offer_id: flight.offer_id })} className={`rounded-2xl border p-4 text-left ${flight.selected ? "border-primary bg-secondary" : "border-border bg-card"}`}><p className="text-xs uppercase tracking-wide text-muted-foreground">{flight.selected ? "Chosen" : "Fare"}</p><p className="mt-2 font-semibold">{flight.airline || "Flight"}</p>{flight.source && <p className="mt-1 text-xs text-muted-foreground">{travelSourceLabel(flight.source)}</p>}<p className="text-sm">{flight.origin} → {flight.destination}</p><p className="mt-2 text-sm text-muted-foreground">{flight.summary}</p><p className="mt-3 font-medium">{cad(flight.price)} round trip each</p></button>)}</div>
      <div className="grid gap-4 md:grid-cols-3">{(trip.hotels ?? []).map(hotel => <article key={hotel.offer_id} className={`overflow-hidden rounded-2xl border ${hotel.selected ? "border-primary" : "border-border"}`}>
        {hotel.image && <img src={hotel.image} alt="" className="h-36 w-full object-cover" />}
        <div className="bg-card p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">{hotel.selected ? "Chosen stay" : hotel.city}</p><h3 className="mt-1 font-semibold">{hotel.name}</h3>{hotel.source && <p className="mt-1 text-xs text-muted-foreground">{hotel.source === "booking_com" ? "Booking.com" : hotel.source === "airbnb" ? "Airbnb" : hotel.source}{hotel.property_type ? ` · ${hotel.property_type}` : ""}</p>}<p className="mt-2 text-sm">{cad(hotel.nightly)} / night · {cad(hotel.total)} group{hotel.rating != null ? ` · ${hotel.original_rating ?? hotel.rating} / ${hotel.original_rating_scale ?? 10}` : ""}</p>{hotel.price_note && <p className="mt-2 text-xs text-muted-foreground">{hotel.price_note}</p>}<button type="button" disabled={busy || !trip.editable} onClick={() => run({ action: "select_hotel", offer_id: hotel.offer_id })} className="mt-4 rounded-full bg-primary px-4 py-2 text-xs text-primary-foreground">Use this stay</button></div>
      </article>)}
      </div>
      <form className="rounded-2xl border border-border bg-card p-6" onSubmit={e => { e.preventDefault(); void run({ action: "save_traveler", name: traveler.name, legal_name: traveler.legal_name, date_of_birth: traveler.date_of_birth, passport_number: traveler.passport_number }).then(() => setTraveler(t => ({ ...t, passport_number: "" }))) }}>
        <h2 className="font-semibold">Travel documents</h2>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">Legal name, date of birth, and passport stay on the trip for booking. WhatsApp only hears that they were saved — never the number.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <select className="rounded-xl border border-border bg-background px-3 py-2 text-sm" value={traveler.name} onChange={e => setTraveler({ ...traveler, name: e.target.value })}><option value="">Traveler</option>{names.map(name => <option key={name}>{name}</option>)}</select>
          <input placeholder="Legal name" className="rounded-xl border border-border bg-background px-3 py-2 text-sm" value={traveler.legal_name} onChange={e => setTraveler({ ...traveler, legal_name: e.target.value })} />
          <input type="date" className="rounded-xl border border-border bg-background px-3 py-2 text-sm" value={traveler.date_of_birth} onChange={e => setTraveler({ ...traveler, date_of_birth: e.target.value })} />
          <input placeholder="Passport number" autoComplete="off" className="rounded-xl border border-border bg-background px-3 py-2 text-sm" value={traveler.passport_number} onChange={e => setTraveler({ ...traveler, passport_number: e.target.value })} />
        </div>
        <ul className="mt-4 space-y-1 text-xs text-muted-foreground">{(trip.people ?? []).map(p => <li key={p.name}>{p.name}: {p.legal_name || "no legal name"}{p.has_passport ? ` · passport ••••${p.passport_last4}` : " · no passport yet"}{p.date_of_birth ? ` · ${p.date_of_birth}` : ""}</li>)}</ul>
        <button disabled={busy} className="mt-4 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">Save documents</button>
      </form>
    </section>}

    {tab === "Chat" && <section className="mt-6 flex h-[32rem] flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {(trip.messages ?? []).map(msg => <div key={msg.id || msg.at + msg.text} className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.bot ? "bg-secondary" : "ml-auto bg-whatsapp/15"}`}><p className="text-xs font-medium text-muted-foreground">{msg.sender} · {when(msg.at)}</p><p className="mt-1 whitespace-pre-wrap leading-6">{msg.text}</p></div>)}
      </div>
      <form className="flex gap-2 border-t border-border p-3" onSubmit={e => { e.preventDefault(); const text = chat.trim(); if (!text) return; setChat(""); void run({ action: "chat", text }) }}>
        <input value={chat} onChange={e => setChat(e.target.value)} placeholder="Message Fare — it also lands in the WhatsApp group" className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm" />
        <button disabled={busy || !chat.trim()} aria-label="Send" className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground"><IconSend className="size-4" /></button>
      </form>
    </section>}
  </div>
}
