"use client"
import { useEffect, useState } from "react"
import { subscribeDashboardSocket, subscribeGroupSocket } from "@/lib/api/group-socket"
import { getDashboardSessions, getGroupSessions } from "@/lib/api/sessions"
import type { DashboardEvent } from "@/types/dashboard"
import type { ConnectionStatus } from "@/types/dashboard"
import type { TripSession } from "@/types/session"

export function useGroupEvents(groupId: string) {
  return usePlanningEvents(groupId)
}

export function useDashboardEvents() {
  return usePlanningEvents(null)
}

function usePlanningEvents(groupId: string | null) {
  const [sessions, setSessions] = useState<TripSession[]>([])
  const [newSession, setNewSession] = useState<TripSession | null>(null)
  const [connection, setConnection] = useState<ConnectionStatus>("connecting")
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    setSessions([])
    setNewSession(null)
    setError(null)
    const controller = new AbortController()
    const seen = new Set<string>()
    const notified = new Set<string>()
    let receivedSessions = false
    let revision = 0
    let loading = false
    let status: ConnectionStatus = "connecting"
    function notify(session: TripSession) {
      if (notified.has(session.id)) return
      notified.add(session.id)
      setNewSession(session)
    }
    function receiveSessions(next: TripSession[]) {
      const active = next.find(session => !seen.has(session.id) && !["completed", "failed"].includes(session.status))
      const latestNew = receivedSessions ? next.find(session => !seen.has(session.id) && session.status !== "failed") : null
      next.forEach(session => seen.add(session.id))
      receivedSessions = true
      setSessions(next)
      const notification = latestNew || active
      if (notification) notify(notification)
      else setNewSession(current => current ? next.find(session => session.id === current.id) ?? current : null)
    }
    async function loadSessions() {
      if (loading) return
      loading = true
      const startedAt = revision
      try {
        const next = await (groupId === null ? getDashboardSessions(controller.signal) : getGroupSessions(groupId, controller.signal))
        if (!controller.signal.aborted && startedAt === revision) {
          receiveSessions(next)
          setError(null)
        }
      } catch {
        if (!controller.signal.aborted && startedAt === revision && status !== "connected") setError("Could not load sessions. Check that the orchestrator is running at the configured API URL.")
      } finally {
        loading = false
      }
    }
    function receiveEvent(event: DashboardEvent) {
      if (controller.signal.aborted) return
      if ((event.type === "group.snapshot" || event.type === "dashboard.snapshot") && event.sessions) {
        revision++
        setError(null)
        receiveSessions(event.sessions.map(snapshot => snapshot.session))
      } else if ((event.session || event.snapshot?.session) && !event.type.startsWith("agent.")) {
        revision++
        setError(null)
        const session = event.session ?? event.snapshot!.session
        setSessions(current => [session, ...current.filter(item => item.id !== session.id)])
        // Start events are authoritative even if an HTTP snapshot already
        // introduced the session. Receiving it and notifying are separate.
        if (event.type === "session.started" && session.status !== "failed" && !seen.has(session.id)) notify(session)
        else setNewSession(current => current?.id === session.id ? session : current)
        seen.add(session.id)
      } else if (event.type === "connection.error") {
        setError(event.message || "Could not load group sessions.")
      }
    }
    function receiveConnection(next: ConnectionStatus) {
      status = next
      setConnection(next)
    }
    const unsubscribe = groupId === null
      ? subscribeDashboardSocket(receiveEvent, receiveConnection)
      : subscribeGroupSocket(groupId, receiveEvent, receiveConnection)
    void loadSessions()
    const fallback = setInterval(() => {
      // An open socket alone does not guarantee that every update arrived.
      // Recover session notifications without submitting any new search.
      void loadSessions()
    }, 5000)
    return () => {
      controller.abort()
      clearInterval(fallback)
      unsubscribe()
    }
  }, [groupId])
  return { sessions, newSession, connection, error, dismissSession: () => setNewSession(null) }
}
