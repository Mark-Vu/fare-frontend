"use client"

import { IconBrandWhatsapp, IconArrowRight, IconSparkles } from "@tabler/icons-react"
import { useGroupEvents } from "@/hooks/use-group-events"
import { SessionCard } from "./session-card"
import { TripHistory } from "./trip-history"
import { SessionNotification } from "./session-notification"

export function GroupDashboard({ groupId, compact = false }: { groupId: string; compact?: boolean }) {
  const { sessions, newSession, connection, error, dismissSession } = useGroupEvents(groupId)
  const active = sessions.filter(session => !["completed", "failed"].includes(session.status))
  const previous = sessions.filter(session => ["completed", "failed"].includes(session.status))
  const failureMessage = "Fare could not finish this planning session. Open the session for details, then try again in the group chat."

  return <>
    {!compact && <div className="flex flex-wrap items-end justify-between gap-6">
      <div><p className="mb-3 flex items-center gap-2 text-xs font-medium tracking-widest text-primary uppercase"><IconBrandWhatsapp className="size-4" />WhatsApp group · {groupId}</p><h1 className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Good trips start in the chat.</h1><p className="mt-4 max-w-xl text-muted-foreground">Your group’s plans, from the first idea to the final itinerary.</p></div>
      <span role="status" className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs"><span className={`size-1.5 rounded-full ${connection === "connected" ? "bg-whatsapp" : "bg-sun motion-safe:animate-pulse"}`} />{connection === "connected" ? "Connected to your group" : connection === "connecting" ? "Connecting to your group…" : "Reconnecting to your group…"}</span>
    </div>}
    {compact && <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold tracking-tight">Live search sessions</h2><span role="status" className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs"><span className={`size-1.5 rounded-full ${connection === "connected" ? "bg-whatsapp" : "bg-sun motion-safe:animate-pulse"}`} />{connection === "connected" ? "Live updates" : "Reconnecting…"}</span></div>}
    {error && <p role="alert" className="mt-6 rounded-xl border border-border bg-card px-5 py-4 text-sm text-destructive">{error}</p>}
    {!error && sessions[0]?.status === "failed" && <p role="alert" className="mt-6 rounded-xl border border-border bg-card px-5 py-4 text-sm text-destructive">{failureMessage}</p>}
    {!compact && <section className="mt-10 grid overflow-hidden rounded-2xl border border-border bg-secondary/40 md:grid-cols-[1fr_0.8fr]">
      <div className="p-6 sm:p-8"><IconSparkles className="mb-5 size-6 text-primary" /><h2 className="text-2xl font-semibold tracking-tight">You talk. Fare brings it together.</h2><p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">Tag Fare in your WhatsApp group to plan a trip. A new session appears here when the bot starts. Choose a destination in the chat, then follow your agents as they find flights, compare stays, and build the itinerary.</p><p className="mt-5 flex items-center gap-2 text-xs font-medium text-primary">Chat → Search → Shared itinerary<IconArrowRight className="size-4" /></p></div>
      <div className="relative min-h-48 bg-forest"><div className="absolute inset-0 bg-[url('/images/tokyo-evening.png')] bg-cover bg-center opacity-70" /><div className="absolute inset-0 bg-gradient-to-t from-forest to-transparent" /><div className="absolute bottom-6 left-6 text-white"><p className="text-xs tracking-widest text-sun uppercase">Next stop</p><p className="mt-2 text-3xl font-semibold tracking-tight">Somewhere good. Together.</p></div></div>
    </section>}
    <section className={compact ? "mt-6" : "mt-10"} aria-live="polite">
      {!compact && <div className="mb-5 flex items-center gap-3"><h2 className="text-xl font-semibold tracking-tight">Planning now</h2><span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{active.length}</span></div>}
      {compact && <p className="mb-4 text-xs text-muted-foreground">{active.length} live · searches start from WhatsApp, not from this page</p>}
      {active.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{active.map(session => <SessionCard key={session.id} session={session} />)}</div> : <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-dashed border-border px-6 py-8"><span className="grid size-10 place-items-center rounded-full bg-secondary"><IconBrandWhatsapp className="size-5 text-primary" /></span><div><p className="font-medium">Ready for your next idea</p><p className="mt-1 text-sm text-muted-foreground">Tag Fare in the group chat. New planning sessions appear here automatically.</p></div></div>}
    </section>
    <TripHistory sessions={previous} />

    <SessionNotification session={newSession} dismissSession={dismissSession} />
  </>
}
