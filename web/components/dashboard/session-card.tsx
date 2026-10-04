import Link from "next/link"
import { IconArrowUpRight, IconCheck, IconPlane, IconAlertCircle } from "@tabler/icons-react"
import { tripDates } from "@/lib/trip-format"
import type { TripSession } from "@/types/session"
export function SessionCard({ session }: { session: TripSession }) {
  const running = !["completed", "failed"].includes(session.status)
  return <Link href={`/dashboard/${encodeURIComponent(session.groupId)}/${encodeURIComponent(session.id)}`} className={`group block overflow-hidden rounded-2xl border p-6 transition-colors focus-visible:outline-2 focus-visible:outline-ring sm:p-8 ${running ? "border-primary/25 bg-forest text-white hover:bg-primary" : "border-border bg-card hover:bg-secondary/40"}`}>
    <div className="flex items-center justify-between gap-4"><span className={`flex items-center gap-2 text-xs font-medium ${running ? "text-sun" : "text-muted-foreground"}`}>{running ? <span className="size-2 rounded-full bg-sun motion-safe:animate-pulse" /> : session.status === "failed" ? <IconAlertCircle className="size-4" /> : <IconCheck className="size-4" />}{running ? session.status === "created" ? "Understanding your group" : "Planning live" : session.status === "failed" ? "Needs attention" : "Completed"}</span><IconArrowUpRight className="size-5 transition-transform motion-safe:group-hover:translate-x-0.5" /></div>
    <h3 className="mt-9 text-3xl font-semibold tracking-tight">{session.destination}</h3>
    <p className={`mt-2 text-sm ${running ? "text-white/70" : "text-muted-foreground"}`}>{tripDates(session.startDate, session.endDate)}</p>
    <div className={`mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-5 text-sm ${running ? "border-white/15" : "border-border"}`}><span className="flex items-center gap-2"><IconPlane className="size-4" />{session.origin} → {session.destination}</span><span className={running ? "text-sun" : "text-primary"}>{running ? "View live →" : "View trip →"}</span></div>
    {running && <p className="mt-4 text-xs text-white/60">{session.message ?? (session.status === "planning" ? "Bringing your itinerary together…" : "Your agents are finding flights and stays…")}</p>}
  </Link>
}
