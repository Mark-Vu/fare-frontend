import { orchestratorUrl } from "./group-socket"
import type { SessionSnapshot } from "@/types/dashboard"
import type { TripSession } from "@/types/session"

export type DashboardSessionPage = {
  sessions: TripSession[]
  total: number
  limit: number
  offset: number
  counts: { all: number; live: number; ready: number; failed: number }
}

export async function getDashboardSessions(query: { limit: number; offset: number; filter: string; q: string }, signal?: AbortSignal) {
  const params = new URLSearchParams({ limit: String(query.limit), offset: String(query.offset), filter: query.filter || "all" })
  if (query.q.trim()) params.set("q", query.q.trim())
  const response = await fetch(`${orchestratorUrl}/dashboard/sessions?${params}`, { cache: "no-store", signal })
  if (!response.ok) throw new Error("Could not load planning sessions.")
  const page = await response.json() as DashboardSessionPage
  return { ...page, sessions: page.sessions ?? [], counts: page.counts ?? { all: 0, live: 0, ready: 0, failed: 0 } }
}

export async function getGroupSessions(groupId: string, signal?: AbortSignal) {
  const response = await fetch(`${orchestratorUrl}/groups/${encodeURIComponent(groupId)}/sessions`, { cache: "no-store", signal })
  if (!response.ok) throw new Error("Could not load this group’s sessions.")
  const snapshots = await response.json() as SessionSnapshot[]
  return snapshots.map(snapshot => snapshot.session)
}
export async function getSessionSnapshot(groupId: string, sessionId: string, signal?: AbortSignal): Promise<SessionSnapshot> {
  const response = await fetch(`${orchestratorUrl}/groups/${encodeURIComponent(groupId)}/sessions/${encodeURIComponent(sessionId)}`, { cache: "no-store", signal })
  if (!response.ok) throw new Error(response.status === 404 ? "This session was not found in the group." : "Could not load this planning session.")
  return response.json()
}
