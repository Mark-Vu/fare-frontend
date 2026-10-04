"use client"

import { useState } from "react"
import { IconLock, IconPlane, IconBuilding, IconArrowUpRight, IconPlayerPlay } from "@tabler/icons-react"
import type { SearchRecording, SearchRecordingSource } from "@/types/dashboard"
import type { StepStatus } from "@/types/session"
import type { BrowserPreview, SearchAgent } from "@/types/travel-search"
import { travelSourceLabel } from "@/lib/travel-source-label"
import { browserSourceKey } from "@/lib/session-snapshot"
import { FrameSkeleton } from "@/components/ui/skeleton"

type BrowserSource = { key: string; website: string; origin?: string; preview?: BrowserPreview; recording?: SearchRecordingSource }

export function LiveBrowser({ status, liveViewUrl, agentType, previews = {}, recording }: { status: StepStatus; liveViewUrl?: string; agentType: SearchAgent; previews?: Record<string, BrowserPreview>; recording?: SearchRecording }) {
  const [failedRecordingUrls, setFailedRecordingUrls] = useState<Set<string>>(() => new Set())
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const flight = agentType === "flight"
  const safeLink = (url?: string) => url && /^https?:\/\//i.test(url) ? url : undefined
  const websites = flight ? ["google_flights"] : ["booking_com", "airbnb"]
  const tabs = new Map<string, BrowserSource>()
  const sourceKey = browserSourceKey
  for (const [key, preview] of Object.entries(previews)) {
    const website = preview.website ?? (key.includes(":") ? key.split(":")[0] : flight ? "google_flights" : key)
    const origin = preview.origin ?? (key.includes(":") ? key.slice(key.indexOf(":") + 1) : flight ? key : undefined)
    const tabKey = sourceKey(website, origin)
    tabs.set(tabKey, { key: tabKey, website, origin, preview })
  }
  for (const source of recording?.sources ?? []) {
    const matching = source.browserSessionId ? [...tabs.values()].find(tab => tab.preview?.browserSessionId === source.browserSessionId) : undefined
    const website = source.website ?? matching?.website ?? (flight ? websites[0] : source.origin ?? websites[0])
    const origin = source.origin ?? matching?.origin
    const key = sourceKey(website, origin)
    const previous = tabs.get(key)
    // A retry can reuse the trip session while replacing its source browsers.
    const sourceRecording = previous?.preview && source.browserSessionId && previous.preview.browserSessionId !== source.browserSessionId ? undefined : source
    const sourcePreview = source.browserSessionId ? matching?.preview ?? previous?.preview : previous?.preview
    tabs.set(key, { ...previous, key, website, origin, preview: sourcePreview, recording: sourceRecording })
  }
  for (const website of websites) {
    if (![...tabs.values()].some(tab => tab.website === website)) tabs.set(website, { key: website, website })
  }
  const sources = [...tabs.values()].sort((a, b) => {
    const aOrder = websites.indexOf(a.website)
    const bOrder = websites.indexOf(b.website)
    return (aOrder < 0 ? websites.length : aOrder) - (bOrder < 0 ? websites.length : bOrder) || a.key.localeCompare(b.key)
  }).map(source => ({ ...source, label: `${travelSourceLabel(source.website)}${flight && source.origin && source.origin !== source.website ? ` · ${source.origin}` : ""}` }))
  const selected = sources.find(source => source.key === selectedSource)
    ?? sources.find(source => source.website === selectedSource?.split(":")[0])
    ?? sources[0]
  const preview = selected.preview
  const dashboardUrl = safeLink(preview?.liveViewUrl ?? (selected.website === websites[0] ? liveViewUrl : undefined))
  const replay = selected.recording ?? (!recording?.sources?.length && selected.website === websites[0] ? recording : undefined)
  const savedRecordingUrl = safeLink(replay?.recordingUrl ?? undefined)
  const providerRecordingUrl = safeLink(replay?.replayUrl ?? undefined)
  const candidates = [savedRecordingUrl, providerRecordingUrl, ...(selected.recording?.recordings?.map(item => safeLink(item.url)) ?? [])].filter((url): url is string => Boolean(url))
  const recordingUrl = candidates.find(url => !failedRecordingUrls.has(url)) ?? candidates[0]
  const poster = preview?.src
  const finished = status === "completed" || status === "failed"
  const showRecording = recordingUrl && (finished || !preview || preview.status === "ended" || preview.status === "unavailable")
  const recordingMessage = replay?.recordingError
    ? "The search recording could not be saved."
    : recording ? "No recording is available for this search." : "Saving the search recording…"

  return <div className="overflow-hidden rounded-xl border border-border bg-background">
    <div className="flex items-center gap-4 border-b border-border bg-secondary/60 px-4 py-3">
      <div className="flex gap-1.5" aria-hidden="true"><span className="size-2 rounded-full bg-[#d6a296]" /><span className="size-2 rounded-full bg-[#dcca8d]" /><span className="size-2 rounded-full bg-[#9fb8a0]" /></div>
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-border/60 bg-card px-3 py-1.5 font-mono text-[10px] text-muted-foreground"><IconLock className="size-3 shrink-0" /><span className="truncate">{selected.label}</span></div>
      {recordingUrl ? <a href={recordingUrl} target="_blank" rel="noopener noreferrer" className="flex shrink-0 items-center gap-1 text-[10px] text-primary">Open recording<IconArrowUpRight className="size-3" /></a> : dashboardUrl && <a href={dashboardUrl} target="_blank" rel="noopener noreferrer" className="flex shrink-0 items-center gap-1 text-[10px] text-primary">Skyvern<IconArrowUpRight className="size-3" /></a>}
    </div>
    <div role="group" aria-label="Select search website" className="flex flex-wrap gap-2 border-b border-border px-4 py-3">
      {sources.map(source => <button key={source.key} type="button" aria-pressed={source.key === selected?.key} onClick={() => setSelectedSource(source.key)} className={`rounded-full px-3 py-1.5 text-xs ${source.key === selected?.key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{source.label}</button>)}
    </div>
    {selected.recording?.status === "failed" && <p role="status" className="px-4 pt-3 text-xs text-muted-foreground">{selected.label} search couldn’t finish. Available results from the other searches were kept.</p>}
    {flight && selected.recording?.status !== "failed" && (selected.recording?.status === "partially_complete" || selected.recording?.resultsComplete === false || selected.recording?.warning) && <p role="status" className="px-4 pt-3 text-xs text-muted-foreground">{selected.recording?.warning || `${selected.label} returned incomplete results. Some options may be missing.`}</p>}
    {showRecording && recordingUrl ? <figure className="p-3">
      {failedRecordingUrls.has(recordingUrl) ? <div role="status" className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-lg bg-secondary/30 px-5 text-center"><p className="text-sm text-muted-foreground">The recording couldn’t be played here.</p><a href={recordingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary underline underline-offset-4">Open recording<IconArrowUpRight className="size-3" /></a></div> : <video
        key={recordingUrl}
        src={recordingUrl}
        controls
        playsInline
        preload="metadata"
        poster={poster}
        aria-label={`${selected?.label ?? (flight ? "Flight" : "Hotel")} search recording`}
        onError={() => setFailedRecordingUrls(current => new Set(current).add(recordingUrl))}
        className="block max-h-[36rem] w-full rounded-lg bg-black"
      />}
      <figcaption className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1 text-[10px] text-muted-foreground"><span>{selected?.label ?? (flight ? "Flight agent" : "Hotel agent")} · Search recording</span><span className="flex items-center gap-1.5 font-medium text-primary"><IconPlayerPlay className="size-3" />{recordingUrl === savedRecordingUrl ? "Saved recording" : "Provider recording"} · replay available</span></figcaption>
    </figure> : preview ? <div className="space-y-3 p-3"><figure key={`${selected.key}-${preview.browserSessionId}`}>
      {preview.src ? <img src={preview.src} alt={`${selected.label} live browser preview`} className="block h-auto w-full rounded-lg bg-secondary" /> : preview.status === "unavailable" || preview.status === "ended" || preview.status === "disconnected" ? <div className="grid min-h-64 place-items-center rounded-lg bg-secondary/30 px-5 text-center"><p className="text-sm text-muted-foreground">{preview.status === "unavailable" ? "Browser preview unavailable. The search is still progressing." : preview.status === "ended" ? "Browser session ended before a preview arrived." : "Live browser disconnected."}</p></div> : <FrameSkeleton />}
      <figcaption className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1 text-[10px] text-muted-foreground"><span>{selected.label} · {flight ? "Flight agent" : "Hotel agent"}</span><span className="flex items-center gap-1.5"><span className={`size-1.5 rounded-full ${preview.status === "live" && !finished ? "bg-whatsapp motion-safe:animate-pulse" : "bg-border"}`} />{finished || preview.status === "ended" ? "Stream ended" : preview.status === "live" ? "Live · view only" : preview.src ? `Last frame · ${preview.status}` : preview.status}</span></figcaption>
    </figure>{(finished || preview.status === "ended") && <p role="status" className="px-1 text-xs text-muted-foreground">{recordingMessage}</p>}</div> : status === "running" ? <div className="p-3"><FrameSkeleton /></div> : <div className="flex min-h-72 flex-col items-center justify-center gap-4 px-5 text-center"><span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">{flight ? <IconPlane className="size-6" /> : <IconBuilding className="size-6" />}</span><div><p className="text-sm font-medium">{status === "completed" ? "Search complete" : status === "failed" ? "Search interrupted" : "Ready when you are"}</p><p role={finished ? "status" : undefined} className="mt-2 max-w-sm text-xs leading-5 text-muted-foreground">{finished ? recordingMessage : "Start live searches to watch the agent work."}</p></div></div>}
  </div>
}
