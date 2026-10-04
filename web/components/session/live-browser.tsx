"use client"

import { IconLock, IconPlane, IconBuilding, IconArrowUpRight } from "@tabler/icons-react"
import type { StepStatus } from "@/types/session"
import type { BrowserPreview, SearchAgent } from "@/types/travel-search"

export function LiveBrowser({ status, liveViewUrl, agentType, previews = {} }: { status: StepStatus; liveViewUrl?: string; agentType: SearchAgent; previews?: Record<string, BrowserPreview> }) {
  const flight = agentType === "flight"
  const frames = Object.entries(previews)
  const safeLink = (url?: string) => url && /^https?:\/\//i.test(url) ? url : undefined
  const dashboardUrl = safeLink(liveViewUrl ?? frames.find(([, preview]) => preview.liveViewUrl)?.[1].liveViewUrl)
  return <div className="overflow-hidden rounded-xl border border-border bg-background">
    <div className="flex items-center gap-4 border-b border-border bg-secondary/60 px-4 py-3">
      <div className="flex gap-1.5" aria-hidden="true"><span className="size-2 rounded-full bg-[#d6a296]" /><span className="size-2 rounded-full bg-[#dcca8d]" /><span className="size-2 rounded-full bg-[#9fb8a0]" /></div>
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-border/60 bg-card px-3 py-1.5 font-mono text-[10px] text-muted-foreground"><IconLock className="size-3 shrink-0" /><span className="truncate">{flight ? "google.com/travel/flights" : "booking.com"}</span></div>
      {dashboardUrl && <a href={dashboardUrl} target="_blank" rel="noopener noreferrer" className="flex shrink-0 items-center gap-1 text-[10px] text-primary">Skyvern<IconArrowUpRight className="size-3" /></a>}
    </div>
    {frames.length ? <div className="space-y-3 p-3">{frames.map(([origin, preview]) => <figure key={`${origin}-${preview.browserSessionId}`}>
      {preview.src ? <img src={preview.src} alt={`${flight ? `Flight agent from ${origin}` : "Hotel agent"} live browser preview`} className="block h-auto w-full rounded-lg bg-secondary" /> : <div className="grid min-h-64 place-items-center rounded-lg bg-secondary/30 px-5 text-center"><p className="text-sm text-muted-foreground">{preview.status === "unavailable" ? "Browser preview unavailable. The search is still progressing." : preview.status === "ended" ? "Browser session ended before a preview arrived." : preview.status === "disconnected" ? "Live browser disconnected." : "Waiting for the first browser frame…"}</p></div>}
      <figcaption className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1 text-[10px] text-muted-foreground"><span>{flight ? `${origin} · Flight agent` : "Booking.com · Hotel agent"}</span><span className="flex items-center gap-1.5"><span className={`size-1.5 rounded-full ${preview.status === "live" ? "bg-whatsapp motion-safe:animate-pulse" : "bg-border"}`} />{preview.status === "live" ? "Live · view only" : preview.src ? `Last frame · ${preview.status}` : preview.status}</span></figcaption>
    </figure>)}</div> : <div className="flex min-h-72 flex-col items-center justify-center gap-4 px-5 text-center"><span className={`grid size-12 place-items-center rounded-full bg-primary/10 text-primary ${status === "running" ? "motion-safe:animate-pulse" : ""}`}>{flight ? <IconPlane className="size-6" /> : <IconBuilding className="size-6" />}</span><div><p className="text-sm font-medium">{status === "running" ? "Connecting to the live browser…" : status === "completed" ? "Search complete" : status === "failed" ? "Search interrupted" : "Ready when you are"}</p><p className="mt-2 max-w-sm text-xs leading-5 text-muted-foreground">{status === "running" ? "Browser frames appear as soon as the agent opens its search session." : status === "pending" ? "Start live searches to watch the agent work." : "The flight and hotel results are shown below when available."}</p></div></div>}
  </div>
}
