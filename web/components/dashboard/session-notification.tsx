"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { IconArrowRight, IconBrandWhatsapp, IconCalendar, IconCompass, IconX } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { destinationCover } from "@/lib/destination-image"
import { groupPathId } from "@/lib/group-id"
import { sessionDates, sessionDestination, sessionGroup, sessionStatus } from "@/lib/session-display"
import type { TripSession } from "@/types/session"

export function SessionNotification({ session, dismissSession }: { session: TripSession | null; dismissSession: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const showNotice = Boolean(session)

  useEffect(() => {
    const popup = dialog.current
    if (showNotice && popup && !popup.open) popup.showModal()
    if (!showNotice && popup?.open) popup.close()
    return () => { if (popup?.open) popup.close() }
  }, [showNotice])

  const failed = session?.status === "failed"
  const completed = session?.status === "completed"
  const cover = session ? destinationCover(session.destination) : undefined

  return <dialog ref={dialog} aria-labelledby="new-session-title" aria-describedby="new-session-description" onCancel={event => { event.preventDefault(); dismissSession() }} onClick={event => { if (event.target === event.currentTarget) dismissSession() }} className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-3xl border border-border bg-card p-0 text-foreground shadow-2xl backdrop:bg-forest/55 backdrop:backdrop-blur-sm">
    {session && <>
      <div className="relative isolate overflow-hidden bg-forest px-6 pt-6 pb-7 text-white sm:px-8 sm:pb-8">
        {cover ? <><div aria-hidden="true" className="absolute inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: `url(${cover})` }} /><div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-forest via-forest/65 to-forest/35" /></> : <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(237,208,126,0.22),transparent_65%)]"><div className="absolute -top-20 -right-14 size-80 rounded-full border border-sun/15" /><div className="absolute -top-10 -right-4 size-60 rounded-full border border-sun/15" /><IconCompass className="absolute top-20 right-8 size-24 text-sun/10" /></div>}
        <div className="flex items-center justify-between gap-4"><span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold ${failed ? "bg-white text-destructive" : "bg-sun text-forest"}`}>{!failed && !completed && <span className="size-1.5 rounded-full bg-forest motion-safe:animate-pulse" />}{sessionStatus(session)}</span><button type="button" aria-label="Dismiss trip notification" onClick={dismissSession} className="grid size-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun"><IconX className="size-5" /></button></div>
        <p className="mt-9 text-[10px] font-medium tracking-[0.18em] text-white/65 uppercase">{failed ? "A little change of plans" : completed ? "Your itinerary is ready" : "A new adventure is taking shape"}</p>
        <h2 id="new-session-title" className="mt-2 text-4xl leading-tight font-semibold tracking-[-0.045em] sm:text-5xl">{sessionDestination(session)}</h2>
        <p className="mt-3 flex items-center gap-2 text-sm text-white/80"><IconCalendar className="size-4 shrink-0" />{sessionDates(session)}</p>
      </div>
      <div className="p-6 sm:p-8">
        <p className="flex min-w-0 items-center gap-2.5 text-sm font-medium"><IconBrandWhatsapp className="size-4 shrink-0 text-primary" /><span className="truncate">{sessionGroup(session)}</span></p>
        <p id="new-session-description" className="mt-4 text-sm leading-6 text-muted-foreground">{failed ? "Planning paused before the itinerary was ready. Open this session to see what happened and pick up from there." : completed ? "Your flights, stay, and day-by-day plan are together. Open your itinerary and see where the trip takes you." : session.status === "created" ? "Fare is gathering your group’s ideas. Open the session to follow your trip from the first details to the final itinerary." : "Fare is working on your trip right now. Follow the search and watch your itinerary come together."}</p>
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">{<Button autoFocus render={<Link href={`/dashboard/${groupPathId(session.groupId)}/${encodeURIComponent(session.id)}`} />} nativeButton={false} onClick={dismissSession} className="h-12 flex-1 gap-3 rounded-full px-5">{failed ? "View session" : completed ? "Open itinerary" : "Follow live"}<IconArrowRight className="size-4" /></Button>}<Button variant="outline" onClick={dismissSession} className="h-12 rounded-full px-5">Keep browsing</Button></div>
      </div>
    </>}
  </dialog>
}
