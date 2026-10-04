import type { DashboardEvent, SessionSnapshot } from "@/types/dashboard"
import type { BrowserPreview, SearchAgent } from "@/types/travel-search"

export function mergeSessionSnapshot(current: SessionSnapshot | null, next: SessionSnapshot): SessionSnapshot {
  if (!current || current.session.id !== next.session.id) return next
  if (next.revision < current.revision) return current
  const previews = { ...next.previews }
  for (const agent of ["flight", "hotel"] as const) {
    previews[agent] = Object.fromEntries(Object.entries(next.previews[agent] ?? {}).map(([origin, preview]) => {
      const previous = current.previews[agent]?.[origin]
      return [origin, previous?.browserSessionId === preview.browserSessionId
        ? { ...previous, ...preview, src: preview.src ?? previous.src }
        : preview]
    }))
  }
  return { ...next, previews }
}

export function applyBrowserEvent(current: SessionSnapshot, event: DashboardEvent): SessionSnapshot {
  if (event.sessionId !== current.session.id || !event.agentType || !event.event || !event.type.startsWith("agent.browser.")) return current
  if (event.revision !== undefined && event.revision < current.revision) return current
  const agent: SearchAgent = event.agentType
  if (agent !== "flight" && agent !== "hotel") return current
  const wire = event.event
  if (wire.type !== "browser.frame" && wire.type !== "browser.stream" && wire.type !== "browser.live_view") return current
  const origin = wire.type === "browser.live_view" ? wire.origin ?? wire.website ?? "browser" : wire.origin
  if (!origin || !wire.browser_session_id) return current
  if (wire.type === "browser.frame" && (wire.mime_type !== "image/jpeg" || typeof wire.data !== "string" || !wire.data)) return current
  const old = current.previews[agent]?.[origin]
  const preview: BrowserPreview = old?.browserSessionId === wire.browser_session_id ? old : { browserSessionId: wire.browser_session_id, status: "starting" }
  const next: BrowserPreview = wire.type === "browser.frame"
    ? { ...preview, src: `data:image/jpeg;base64,${wire.data}`, status: "live" }
    : wire.type === "browser.stream"
      ? { ...preview, status: wire.status }
      : { ...preview, liveViewUrl: wire.url ?? undefined }
  return { ...current, revision: event.revision ?? current.revision, previews: { ...current.previews, [agent]: { ...current.previews[agent], [origin]: next } } }
}
