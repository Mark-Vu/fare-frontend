import Link from "next/link"
import { IconArrowUpRight, IconBrandWhatsapp, IconCalendar, IconCheck, IconCompass, IconPlane, IconAlertCircle } from "@tabler/icons-react"
import { destinationCover } from "@/lib/destination-image"
import { groupPathId } from "@/lib/group-id"
import { sessionDates, sessionDestination, sessionGroup, sessionIsLive, sessionStatus } from "@/lib/session-display"
import type { TripSession } from "@/types/session"

export function SessionCard({ session }: { session: TripSession }) {
  const live = sessionIsLive(session)
  const failed = session.status === "failed"
  const destination = sessionDestination(session)
  const cover = destinationCover(session.destination)
  const created = new Date(session.createdAt)
  const createdLabel = Number.isFinite(created.getTime()) ? created.toLocaleString("en-CA", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : null

  return <Link href={`/dashboard/${groupPathId(session.groupId)}/${encodeURIComponent(session.id)}`} className={`group flex h-full flex-col overflow-hidden rounded-3xl border bg-card transition-[border-color,box-shadow,transform] duration-200 motion-safe:hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring ${live ? "border-primary/30 hover:border-primary/60" : "border-border hover:border-primary/40"} hover:shadow-[0_12px_32px_rgba(20,55,38,0.08)]`}>
    <div className="relative isolate flex min-h-52 flex-col justify-between overflow-hidden bg-forest p-6 text-white">
      {cover ? <div aria-hidden="true" className="absolute inset-0 -z-10 bg-cover bg-center transition-transform duration-500 motion-safe:group-hover:scale-105" style={{ backgroundImage: `url(${cover})` }} /> : <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(237,208,126,0.22),transparent_65%)]"><div className="absolute -top-16 -right-10 size-64 rounded-full border border-sun/15" /><div className="absolute -top-8 -right-2 size-48 rounded-full border border-sun/15" /><IconCompass className="absolute top-8 right-8 size-20 -rotate-12 text-sun/15" /></div>}
      {cover && <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-forest via-forest/35 to-forest/20" />}
      <div className="flex items-center justify-between gap-3">
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-medium backdrop-blur-md ${failed ? "bg-white/95 text-destructive" : live ? "bg-sun text-forest" : "bg-white/95 text-primary"}`}>
          {live ? <span className="size-1.5 rounded-full bg-forest motion-safe:animate-pulse" /> : failed ? <IconAlertCircle className="size-3.5" /> : <IconCheck className="size-3.5" />}
          {sessionStatus(session)}
        </span>
        <span className="grid size-9 shrink-0 place-items-center rounded-full border border-white/25 bg-white/10 transition-colors group-hover:bg-white/20"><IconArrowUpRight className="size-4" /></span>
      </div>
      <div className="mt-10"><p className="mb-1 text-[10px] font-medium tracking-[0.18em] text-white/65 uppercase">Your destination</p><h3 className="text-3xl leading-tight font-semibold tracking-[-0.04em] sm:text-4xl">{destination}</h3></div>
    </div>
    <div className="flex flex-1 flex-col p-6">
      <p className="flex items-center gap-2.5 text-sm font-medium"><IconCalendar className="size-4 shrink-0 text-primary" />{sessionDates(session)}</p>
      <p className="mt-3 flex min-w-0 items-center gap-2.5 text-sm text-muted-foreground"><IconBrandWhatsapp className="size-4 shrink-0" /><span className="truncate" title={sessionGroup(session)}>{sessionGroup(session)}</span></p>
      {session.origin && <p className="mt-3 flex items-center gap-2.5 text-xs text-muted-foreground"><IconPlane className="size-4 shrink-0" />From {session.origin}</p>}
      <div className="mt-auto pt-5"><div className="flex items-center justify-between gap-3 border-t border-border/70 pt-4"><span className="text-[10px] text-muted-foreground">{createdLabel ? `Started ${createdLabel}` : "Planning session"}</span><span className="shrink-0 text-xs font-semibold text-primary">{failed ? "View session" : live ? "Follow live" : "View itinerary"} →</span></div></div>
    </div>
  </Link>
}
