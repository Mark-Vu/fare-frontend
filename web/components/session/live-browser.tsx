"use client"

import { useState } from "react"
import { IconLock, IconPlane, IconBuilding, IconArrowUpRight, IconPlayerPlay } from "@tabler/icons-react"
import type { SearchRecording } from "@/types/dashboard"
import type { StepStatus } from "@/types/session"
import type { BrowserPreview, SearchAgent } from "@/types/travel-search"
import { travelSourceLabel } from "@/lib/travel-source-label"

export function LiveBrowser({ status, liveViewUrl, agentType, previews = {}, recording }: { status: StepStatus; liveViewUrl?: string; agentType: SearchAgent; previews?: Record<string, BrowserPreview>; recording?: SearchRecording }) {
  const [failedRecordingUrl, setFailedRecordingUrl] = useState<string | null>(null)
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const flight = agentType === "flight"
  const frames = Object.entries(previews)
  const safeLink = (url?: string) => url && /^https?:\/\//i.test(url) ? url : undefined
  const dashboardUrl = safeLink(liveViewUrl ?? frames.find(([, preview]) => preview.liveViewUrl)?.[1].liveViewUrl)
  const sources = (recording?.sources ?? []).map((source, index) => ({
    ...source,
    key: `${recording?.searchId ?? "search"}:${source.website ?? ""}:${source.origin ?? ""}:${source.browserSessionId ?? ""}:${index}`,
    label: `${travelSourceLabel(source.website ?? source.origin)}${source.website && source.origin && source.origin !== source.website ? ` · ${source.origin}` : ""}`,
  }))
  const selected = sources.find(source => source.key === selectedSource)
    ?? sources.find(source => safeLink(source.recordingUrl ?? undefined))
    ?? sources.find(source => safeLink(source.replayUrl ?? undefined))
    ?? sources[0]
  const replay = selected ?? recording
  const recordingUrl = safeLink(replay?.recordingUrl ?? undefined) ?? safeLink(replay?.replayUrl ?? undefined)
  const poster = selected
    ? selected.browserSessionId
      ? frames.find(([, preview]) => preview.browserSessionId === selected.browserSessionId)?.[1].src
      : frames.find(([origin]) => origin === (selected.origin ?? selected.website))?.[1].src
    : frames.find(([, preview]) => preview.src)?.[1].src
  const finished = status === "completed" || status === "failed"
  const recordingMessage = replay?.recordingError
    ? "The search recording could not be saved."
    : recording ? "No recording is available for this search." : "Saving the search recording…"

  return <div className="overflow-hidden rounded-xl border border-border bg-background">
    <div className="flex items-center gap-4 border-b border-border bg-secondary/60 px-4 py-3">
      <div className="flex gap-1.5" aria-hidden="true"><span className="size-2 rounded-full bg-[#d6a296]" /><span className="size-2 rounded-full bg-[#dcca8d]" /><span className="size-2 rounded-full bg-[#9fb8a0]" /></div>
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-border/60 bg-card px-3 py-1.5 font-mono text-[10px] text-muted-foreground"><IconLock className="size-3 shrink-0" /><span className="truncate">{selected?.label ?? (flight ? "google.com/travel/flights" : "booking.com")}</span></div>
      {recordingUrl ? <a href={recordingUrl} target="_blank" rel="noopener noreferrer" className="flex shrink-0 items-center gap-1 text-[10px] text-primary">Open recording<IconArrowUpRight className="size-3" /></a> : dashboardUrl && <a href={dashboardUrl} target="_blank" rel="noopener noreferrer" className="flex shrink-0 items-center gap-1 text-[10px] text-primary">Skyvern<IconArrowUpRight className="size-3" /></a>}
    </div>
    {sources.length > 1 && <div role="group" aria-label="Search recordings" className="flex flex-wrap gap-2 border-b border-border px-4 py-3">
      {sources.map(source => <button key={source.key} type="button" aria-pressed={source.key === selected?.key} onClick={() => setSelectedSource(source.key)} className={`rounded-full px-3 py-1.5 text-xs ${source.key === selected?.key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{source.label}</button>)}
    </div>}
    {selected?.status === "failed" && <p role="status" className="px-4 pt-3 text-xs text-muted-foreground">{selected.label} search couldn’t finish. Available results from the other searches were kept.</p>}
    {flight && selected?.status !== "failed" && (selected?.status === "partially_complete" || selected?.resultsComplete === false || selected?.warning) && <p role="status" className="px-4 pt-3 text-xs text-muted-foreground">{selected.label} was still loading when these fares were saved. Some options may be missing.</p>}
    {recordingUrl ? <figure className="p-3">
      {failedRecordingUrl === recordingUrl ? <div role="status" className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-lg bg-secondary/30 px-5 text-center"><p className="text-sm text-muted-foreground">The recording couldn’t be played here.</p><a href={recordingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary underline underline-offset-4">Open recording<IconArrowUpRight className="size-3" /></a></div> : <video
        key={recordingUrl}
        src={recordingUrl}
        controls
        playsInline
        preload="metadata"
        poster={poster}
        aria-label={`${selected?.label ?? (flight ? "Flight" : "Hotel")} search recording`}
        onError={() => setFailedRecordingUrl(recordingUrl)}
        className="block max-h-[36rem] w-full rounded-lg bg-black"
      />}
      <figcaption className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1 text-[10px] text-muted-foreground"><span>{selected?.label ?? (flight ? "Flight agent" : "Hotel agent")} · Search recording</span><span className="flex items-center gap-1.5 font-medium text-primary"><IconPlayerPlay className="size-3" />{replay?.recordingUrl ? "Saved recording" : "Provider recording"} · replay available</span></figcaption>
    </figure> : frames.length && !selected ? <div className="space-y-3 p-3">{frames.map(([origin, preview]) => <figure key={`${origin}-${preview.browserSessionId}`}>
      {preview.src ? <img src={preview.src} alt={`${flight ? `Flight agent from ${origin}` : "Hotel agent"} live browser preview`} className="block h-auto w-full rounded-lg bg-secondary" /> : <div className="grid min-h-64 place-items-center rounded-lg bg-secondary/30 px-5 text-center"><p className="text-sm text-muted-foreground">{preview.status === "unavailable" ? "Browser preview unavailable. The search is still progressing." : preview.status === "ended" ? "Browser session ended before a preview arrived." : preview.status === "disconnected" ? "Live browser disconnected." : "Waiting for the first browser frame…"}</p></div>}
      <figcaption className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1 text-[10px] text-muted-foreground"><span>{flight ? `${origin} · Flight agent` : `${travelSourceLabel(origin)} · Hotel agent`}</span><span className="flex items-center gap-1.5"><span className={`size-1.5 rounded-full ${preview.status === "live" && !finished ? "bg-whatsapp motion-safe:animate-pulse" : "bg-border"}`} />{finished || preview.status === "ended" ? "Stream ended" : preview.status === "live" ? "Live · view only" : preview.src ? `Last frame · ${preview.status}` : preview.status}</span></figcaption>
    </figure>)}{(finished || frames.every(([, preview]) => preview.status === "ended")) && <p role="status" className="px-1 text-xs text-muted-foreground">{recordingMessage}</p>}</div> : <div className="flex min-h-72 flex-col items-center justify-center gap-4 px-5 text-center"><span className={`grid size-12 place-items-center rounded-full bg-primary/10 text-primary ${status === "running" ? "motion-safe:animate-pulse" : ""}`}>{flight ? <IconPlane className="size-6" /> : <IconBuilding className="size-6" />}</span><div><p className="text-sm font-medium">{status === "running" ? "Connecting to the live browser…" : status === "completed" ? "Search complete" : status === "failed" ? "Search interrupted" : "Ready when you are"}</p><p role={finished ? "status" : undefined} className="mt-2 max-w-sm text-xs leading-5 text-muted-foreground">{finished ? recordingMessage : status === "running" ? "Browser frames appear as soon as the agent opens its search session." : "Start live searches to watch the agent work."}</p></div></div>}
  </div>
}
