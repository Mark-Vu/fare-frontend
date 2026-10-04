import Link from "next/link"
import type { CSSProperties } from "react"
import { IconArrowRight, IconBrandWhatsapp, IconPlane, IconPlaneDeparture } from "@tabler/icons-react"
import { destinationImage } from "@/lib/destination-image"
import { groupPathId } from "@/lib/group-id"
import { sessionDates, sessionDestination, sessionGroup, sessionStatus } from "@/lib/session-display"
import { barcodeBars, seededAccent } from "@/lib/ticket"
import type { TripSession } from "@/types/session"

function nightsCount(session: TripSession) {
  const start = new Date(`${session.startDate}T12:00:00Z`)
  const end = new Date(`${session.endDate}T12:00:00Z`)
  if (!session.startDate || !session.endDate || !Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) return null
  const nights = Math.round((end.getTime() - start.getTime()) / 86400000)
  return nights > 0 ? nights : null
}

function daysUntilLabel(session: TripSession) {
  if (!session.startDate) return "—"
  const start = new Date(`${session.startDate}T00:00:00`)
  if (!Number.isFinite(start.getTime())) return "—"
  const days = Math.ceil((start.getTime() - Date.now()) / 86400000)
  return days <= 0 ? "Today" : `${days}d`
}

export function SessionCard({ session }: { session: TripSession }) {
  const originCity = session.origin || "Somewhere"
  const destination = sessionDestination(session)
  const destCity = session.destination.trim() && session.destination !== "Planning your trip" ? session.destination : sessionGroup(session)
  const bars = barcodeBars(session.id)
  const dates = sessionDates(session)
  const nights = nightsCount(session)
  const nightsLabel = nights ? `${nights}` : "—"
  const inLabel = daysUntilLabel(session)
  const accentTab = `flex h-16 flex-none items-center border-b-2 border-border px-8 transition-colors duration-500 ease-out [background-color:color-mix(in_oklch,var(--accent)_28%,var(--muted)_72%)] group-hover/card:border-transparent group-hover/card:[background-color:var(--accent)]`

  return <Link href={`/dashboard/${groupPathId(session.groupId)}/${encodeURIComponent(session.id)}`} className="group/card boarding-pass flex w-full shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
    <div className="relative flex w-full" style={{ "--accent": seededAccent(session.id), "--border": "oklch(0.18 0.015 158)" } as CSSProperties}>
      <div style={{ "--border": "oklch(0.18 0.015 158)" } as CSSProperties} className="ticket-notch relative z-10 flex w-[70%] flex-none flex-col overflow-hidden border-y-2 border-l-2 border-r-2 border-border bg-card transition-transform duration-300 ease-out [border-right-style:dashed] group-hover/card:-translate-x-1.5 group-hover/card:translate-y-0.5 group-hover/card:-rotate-1">
        <div className={accentTab}>
          <p className="flex min-w-0 items-center gap-2 truncate text-xl font-semibold text-foreground transition-colors duration-500 ease-out group-hover/card:text-white">{sessionGroup(session)} <IconBrandWhatsapp className="size-7 shrink-0" /> powered by Fare</p>
        </div>

        <div className="relative flex flex-1 flex-col items-center justify-center gap-4 overflow-hidden px-5 py-6 pl-30 text-center">
          <div className="absolute inset-y-4 left-8 flex w-12 flex-col justify-between gap-1">
            {bars.map((w, i) => <span key={i} className="block rounded-[1px] bg-foreground/70" style={{ height: `${w}px` }} />)}
          </div>

          <p className="flex items-center gap-2 text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase"><IconPlaneDeparture className="size-4" />Boarding pass</p>

          <div className="min-w-0 max-w-full">
            <h2 className="truncate text-2xl font-semibold">{destination}</h2>
            <p className="mt-1 truncate text-base text-muted-foreground">{dates}</p>
            <div className="mt-2 flex w-full min-w-0 items-center justify-center gap-4 font-mono text-2xl font-bold tracking-tight">
              <span className="min-w-0 truncate">{originCity}</span>
              <IconPlane className="size-7 shrink-0 -scale-y-100 rotate-90 text-primary" />
              <span className="min-w-0 truncate">{destCity}</span>
            </div>
          </div>

          <div className="flex items-center gap-10">
            <div>
              <p className="text-sm tracking-[0.15em] text-muted-foreground uppercase">In</p>
              <p className="font-mono text-lg font-semibold">{inLabel}</p>
            </div>
            <div>
              <p className="text-sm tracking-[0.15em] text-muted-foreground uppercase">Nights</p>
              <p className="font-mono text-lg font-semibold">{nightsLabel}</p>
            </div>
            <div>
              <p className="text-sm tracking-[0.15em] text-muted-foreground uppercase">Type</p>
              <p className="font-mono text-lg font-semibold">Group</p>
            </div>
          </div>

          <p className="flex items-center gap-2 text-base text-primary">Click to open trip details <IconArrowRight className="size-5" /></p>
        </div>
      </div>

      <div style={{ "--border": "oklch(0.18 0.015 158)" } as CSSProperties} className="ticket-notch relative z-10 flex w-[30%] flex-none flex-col overflow-hidden border-y-2 border-r-2 border-border bg-muted transition-transform duration-300 ease-out group-hover/card:translate-x-1.5 group-hover/card:translate-y-0.5 group-hover/card:rotate-1">
        <div className={`${accentTab} justify-end`}>
          <p className="min-w-0 truncate text-sm font-medium tracking-wide text-black uppercase transition-colors duration-500 ease-out group-hover/card:text-white">Status: {sessionStatus(session)}</p>
        </div>

        <div className="relative flex flex-1 flex-col items-center justify-center gap-5 overflow-hidden p-5 text-center">
          <div className="absolute inset-0">
            <div
              className="absolute inset-0 bg-cover opacity-5 transition-opacity duration-500 ease-out group-hover/card:opacity-30"
              style={{ backgroundImage: `url(${destinationImage(destination)})`, backgroundPosition: "right center" }}
            />
          </div>

          <div className="relative z-10 flex w-full min-w-0 flex-col items-center gap-2 px-1">
            <p className="w-full truncate text-center text-lg font-semibold">{destination}</p>
            <div className="flex w-full min-w-0 items-center justify-center gap-2 font-mono text-base font-bold tracking-tight">
              <span className="min-w-0 flex-1 truncate text-right">{originCity}</span>
              <IconPlane className="size-4 shrink-0 -scale-y-100 rotate-90 text-primary" />
              <span className="min-w-0 flex-1 truncate text-left">{destCity}</span>
            </div>
            <div className="flex gap-4 font-mono text-sm tracking-wide text-muted-foreground uppercase">
              <span>In {inLabel}</span>
              <span>{nightsLabel}n</span>
            </div>
          </div>

          <div className="relative z-10 flex h-10 items-stretch gap-1.5">
            {bars.map((w, i) => <span key={i} className="block h-full rounded-[1px] bg-foreground/70" style={{ width: `${w}px` }} />)}
          </div>
        </div>
      </div>
    </div>
  </Link>
}
