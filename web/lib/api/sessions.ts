import { orchestratorUrl } from "./group-socket"
import type { SessionSnapshot } from "@/types/dashboard"

export async function getDashboardSessions(signal?: AbortSignal) {
  const response = await fetch(`${orchestratorUrl}/dashboard/sessions`, { cache: "no-store", signal })
  if (!response.ok) throw new Error("Could not load planning sessions.")
  const snapshots = await response.json() as SessionSnapshot[]
  return snapshots.map(snapshot => snapshot.session)
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
