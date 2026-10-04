import { IconCheck, IconPlane, IconBuilding, IconSparkles, IconChevronDown } from "@tabler/icons-react"
import { cad, tripDates } from "@/lib/trip-format"
import type { FinalPlan as Plan, TripSession } from "@/types/session"

function dayDate(date: string) {
  if (!date) return "To be confirmed"
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" })
}
function activityTime(time: string) {
  const [hour, minute] = time.split(":")
  const value = Number(hour)
  if (!Number.isFinite(value)) return time
  return `${value % 12 || 12}${minute === "00" ? "" : `:${minute}`} ${value >= 12 ? "PM" : "AM"}`
}

export function FinalPlan({ plan, session }: { plan: Plan; session: TripSession }) {
  return <section className="overflow-hidden rounded-2xl border border-primary/20 bg-card">
    <div className="bg-forest px-5 py-7 text-white sm:px-7">
      <p className="mb-3 flex items-center gap-2 text-xs text-sun"><IconCheck className="size-4" />{plan.isSampleSchedule ? "Live search selections · sample daily itinerary" : "Made for your group"}</p>
      <h3 className="text-3xl font-semibold tracking-tight">Your {session.destination} trip</h3>
      <p className="mt-2 text-sm text-white/65">{tripDates(session.startDate, session.endDate)} · {plan.days.length} days to explore</p>
      <div className="mt-6 border-t border-white/15 pt-5"><p className="text-xs text-white/65">Estimated total per person</p><p className="mt-1 text-3xl font-semibold tracking-tight text-sun">{cad(plan.flightPrice + plan.hotelPrice)}<span className="ml-2 text-xs font-normal">CAD</span></p><p className="mt-2 text-[11px] text-white/55">Flight + hotel · meals, transport, and activities extra</p></div>
    </div>

    <div className="px-5 py-6 sm:px-7">
      <div className="space-y-5">
        <div><p className="flex items-center gap-2 text-xs text-muted-foreground"><IconPlane className="size-4" />Flight</p><p className="mt-2 text-sm font-semibold">{plan.flight}</p><p className="mt-1 text-sm text-muted-foreground">{plan.route} · {cad(plan.flightPrice)} / person</p></div>
        <div className="border-t border-border pt-5"><p className="flex items-center gap-2 text-xs text-muted-foreground"><IconBuilding className="size-4" />Stay</p><p className="mt-2 text-sm font-semibold">{plan.hotel}</p><p className="mt-1 text-sm text-muted-foreground">{plan.nights} nights · {cad(plan.hotelPrice)} / person</p></div>
      </div>
      <div className="mt-6 border-t border-border pt-5"><h4 className="flex items-center gap-2 text-sm font-semibold"><IconSparkles className="size-4 text-primary" />Why this plan?</h4><p className="mt-2 text-sm leading-6 text-muted-foreground">{plan.explanation}</p></div>
    </div>

    <div className="border-t border-border px-5 pt-6 pb-5 sm:px-7">
      <h4 className="text-lg font-semibold tracking-tight">{plan.isSampleSchedule ? "Your sample day-by-day plan" : "Your day-by-day plan"}</h4>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">All times are local to {session.destination}. Open or close each day at your own pace.</p>
      <div className="mt-5 space-y-3">
        {plan.days.map((day, index) => <details key={day.date} open={index === 0} className="group/day overflow-hidden rounded-xl border border-border">
          <summary className="flex cursor-pointer list-none items-start gap-3 bg-secondary/30 px-4 py-5 outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">{String(index + 1).padStart(2, "0")}</span>
            <div className="min-w-0 flex-1"><p className="text-[10px] font-medium tracking-wide text-primary uppercase">Day {index + 1} · {dayDate(day.date)}</p><h5 className="mt-1 text-sm font-semibold">{day.title}</h5><p className="mt-1 text-xs leading-5 text-muted-foreground">{day.description}</p></div>
            <IconChevronDown className="mt-2 size-4 shrink-0 text-muted-foreground transition-transform group-open/day:rotate-180" />
          </summary>
          <ol aria-label={`Day ${index + 1} activities`} className="border-t border-border px-4 py-2">
            {day.activities.map((activity, activityIndex) => <li key={`${day.date}-${activity.time}`} className="flex gap-3 border-b border-border/50 py-4 last:border-b-0 sm:gap-5">
              <time dateTime={`${day.date}T${activity.time}`} className="w-12 shrink-0 pt-0.5 font-mono text-[10px] font-medium text-primary sm:w-14">{activityTime(activity.time)}</time>
              <div className="relative flex w-2 shrink-0 justify-center"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/40" />{activityIndex < day.activities.length - 1 && <span aria-hidden="true" className="absolute top-4 -bottom-5 w-px bg-border" />}</div>
              <div className="min-w-0"><h6 className="text-sm font-medium">{activity.title}</h6><p className="mt-1 text-xs leading-5 text-muted-foreground">{activity.description}</p></div>
            </li>)}
          </ol>
        </details>)}
      </div>
      <p className="mt-5 rounded-lg bg-secondary/40 px-4 py-3 text-xs leading-5 text-muted-foreground"><span className="font-medium text-foreground">Departure · {dayDate(session.endDate)}</span><br />Check out, travel to the airport, and head home. Keep the timing flexible around your return flight.</p>
    </div>
  </section>
}
