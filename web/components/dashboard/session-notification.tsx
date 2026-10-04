"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { IconArrowRight, IconSparkles, IconX } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { groupPathId } from "@/lib/group-id"
import type { TripSession } from "@/types/session"

export function SessionNotification({ session, dismissSession }: { session: TripSession | null; dismissSession: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const sessionFailed = session?.status === "failed"
  const sessionCompleted = session?.status === "completed"
  const failureMessage = "Fare could not finish this planning session. Open the session for details, then try again in the group chat."

  useEffect(() => {
    const popup = dialog.current
    if (session && popup && !popup.open) popup.showModal()
    if (!session && popup?.open) popup.close()
  }, [session])

  return (
    <dialog ref={dialog} aria-labelledby="new-session-title" onCancel={event => { event.preventDefault(); dismissSession() }} className="fixed inset-0 m-auto w-[calc(100%_-_2.5rem)] max-w-md rounded-2xl border border-border bg-card p-0 text-foreground shadow-xl backdrop:bg-forest/45 backdrop:backdrop-blur-sm">
      <div className="p-7">
        <div className="flex items-start justify-between gap-4"><span className="grid size-11 place-items-center rounded-full bg-sun/40 text-primary"><IconSparkles className="size-5" /></span><Button variant="ghost" size="icon" aria-label="Dismiss session notification" onClick={dismissSession}><IconX className="size-4" /></Button></div>
        <p className="mt-6 text-xs font-medium tracking-widest text-primary uppercase">{sessionFailed ? "Planning interrupted" : sessionCompleted ? "Your trip is ready" : "Your group is planning"}</p>
        <h2 id="new-session-title" className="mt-2 text-2xl font-semibold tracking-tight">{sessionFailed ? "Your trip needs another try." : sessionCompleted ? "Your shared plan is ready." : "A new trip is taking shape."}</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{session?.destination && session.destination !== "Planning your trip" ? `${session.destination} is on the horizon. ` : ""}{sessionFailed ? failureMessage : sessionCompleted ? "Fare has finished your group’s itinerary. Open the plan to see the flight, stay, and daily schedule." : "Fare has started a planning session. Follow the agents and your itinerary as they come together."}</p>
        <div className="mt-6 flex flex-wrap gap-3">{session && <Button render={<Link href={`/dashboard/${groupPathId(session.groupId)}/${encodeURIComponent(session.id)}`} />} nativeButton={false} onClick={dismissSession}>{sessionFailed ? "View session" : sessionCompleted ? "View plan" : "View live plan"}<IconArrowRight className="size-4" /></Button>}<Button variant="outline" onClick={dismissSession}>Stay here</Button></div>
      </div>
    </dialog>
  )
}
