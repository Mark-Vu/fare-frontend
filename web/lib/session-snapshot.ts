import type { DashboardEvent, SessionSnapshot } from "@/types/dashboard"
import type { BrowserPreview, SearchAgent } from "@/types/travel-search"
import { planningTaskStatuses } from "@/lib/planning-tasks"

function normalizePlanningSnapshot(snapshot: SessionSnapshot): SessionSnapshot {
  const planningTasks = { ...planningTaskStatuses("pending"), ...snapshot.planningTasks }
  const statuses = Object.values(planningTasks)
  const hasProgress = statuses.some(status => status !== "pending")
  const planning = snapshot.planning === "pending" && hasProgress
    ? snapshot.session.status === "failed" ? "failed" : statuses.every(status => status === "completed") ? "completed" : "running"
    : snapshot.planning
  const status = planning !== "pending" && (snapshot.session.status === "created" || snapshot.session.status === "searching") ? "planning" : snapshot.session.status
  return { ...snapshot, planningTasks, planning, session: { ...snapshot.session, status } }
}

export function mergeSessionSnapshot(current: SessionSnapshot | null, next: SessionSnapshot): SessionSnapshot {
  next = normalizePlanningSnapshot(next)
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
  return { ...next, previews, planningTaskMessages: { ...current.planningTaskMessages, ...next.planningTaskMessages } }
}

// Apply individual progress events as they arrive, including events without a snapshot.
export function applySessionEvent(current: SessionSnapshot, event: DashboardEvent): SessionSnapshot {
  const snapshot = event.type === "group.snapshot" ? event.sessions?.find(item => item.session.id === current.session.id) : event.snapshot
  if (snapshot?.session.id === current.session.id) return mergeSessionSnapshot(current, snapshot)
  if (event.sessionId !== current.session.id || (event.revision !== undefined && event.revision < current.revision)) return current
  if (event.type.startsWith("agent.browser.")) return applyBrowserEvent(current, event)
  const next = { ...current, revision: event.revision ?? current.revision, session: { ...current.session, ...event.session } }
  switch (event.type) {
    case "planning.started":
      next.planning = "running"
      next.session.status = "planning"
      break
    case "planning.task.updated":
      if (!event.taskId || !event.status || !(event.taskId in planningTaskStatuses("pending"))) return current
      next.planningTasks = { ...current.planningTasks, [event.taskId]: event.status }
      if (event.message) next.planningTaskMessages = { ...current.planningTaskMessages, [event.taskId]: event.message }
      if (event.status === "running") {
        next.planning = "running"
        next.session.status = "planning"
      }
      break
    case "planning.completed":
      next.planning = "completed"
      next.plan = event.plan ?? current.plan
      break
    case "session.completed":
      next.session.status = "completed"
      break
    case "session.failed":
      next.session.status = "failed"
      next.error = event.message ?? "Trip planning was interrupted."
      if (next.planning === "running") next.planning = "failed"
      next.planningTasks = Object.fromEntries(Object.entries(current.planningTasks).map(([task, status]) => [task, status === "running" ? "failed" : status])) as SessionSnapshot["planningTasks"]
      break
    default:
      return current
  }
  if (event.message) next.session.message = event.message
  return normalizePlanningSnapshot(next)
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
  const website = wire.website ?? (agent === "flight" ? "google_flights" : origin)
  const previewKey = agent === "flight" ? `${website}:${origin}` : website
  const old = current.previews[agent]?.[previewKey]
  const preview: BrowserPreview = old?.browserSessionId === wire.browser_session_id ? old : { browserSessionId: wire.browser_session_id, status: "starting", website, origin }
  const next: BrowserPreview = wire.type === "browser.frame"
    ? { ...preview, src: `data:image/jpeg;base64,${wire.data}`, status: "live" }
    : wire.type === "browser.stream"
      ? { ...preview, status: wire.status }
      : { ...preview, liveViewUrl: wire.url ?? undefined }
  return { ...current, revision: event.revision ?? current.revision, previews: { ...current.previews, [agent]: { ...current.previews[agent], [previewKey]: next } } }
}
