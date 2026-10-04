import type { TripSession } from "@/types/session"
import { SessionCard } from "./session-card"
export function TripHistory({ sessions }: { sessions: TripSession[] }) {
  return <section className="mt-12"><div className="mb-5 flex items-center gap-3"><h2 className="text-xl font-semibold tracking-tight">Previous trips</h2><span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{sessions.length}</span></div>{sessions.length ? <div className="flex flex-col gap-4">{sessions.map(session => <SessionCard key={session.id} session={session} />)}</div> : <p className="text-sm text-muted-foreground">Your completed trips will appear here.</p>}</section>
}
