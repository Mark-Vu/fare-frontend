"use client"
import { useEffect, useState } from "react"
import { subscribeGroupSocket } from "@/lib/api/group-socket"
import { getGroupSessions } from "@/lib/api/sessions"
import type { ConnectionStatus } from "@/types/dashboard"
import type { TripSession } from "@/types/session"

export function useGroupEvents(groupId: string) {
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
    let revision = 0
    let loading = false
    let status: ConnectionStatus = "connecting"
    function receiveSessions(next: TripSession[]) {
      const active = next.find(session => !seen.has(session.id) && !["completed", "failed"].includes(session.status))
      const latestFailure = next[0]?.status === "failed" && !seen.has(next[0].id) ? next[0] : null
      next.forEach(session => seen.add(session.id))
      setSessions(next)
      if (active || latestFailure) setNewSession(active || latestFailure)
      else setNewSession(current => current ? next.find(session => session.id === current.id) ?? current : null)
    }
    async function loadSessions() {
      if (loading) return
      loading = true
      const startedAt = revision
      try {
        const next = await getGroupSessions(groupId, controller.signal)
        if (!controller.signal.aborted && startedAt === revision) {
          receiveSessions(next)
          setError(null)
        }
      } catch {
        if (!controller.signal.aborted && startedAt === revision) setError("Could not load sessions. Check that the orchestrator is running at the configured API URL.")
      } finally {
        loading = false
      }
    }
    const unsubscribe = subscribeGroupSocket(groupId, event => {
      if (event.type === "group.snapshot" && event.sessions) {
        revision++
        setError(null)
        receiveSessions(event.sessions.map(snapshot => snapshot.session))
      } else if (event.session && !event.type.startsWith("agent.")) {
        revision++
        setError(null)
        const session = event.session
        setSessions(current => [session, ...current.filter(item => item.id !== session.id)])
        if (!seen.has(session.id) && session.status !== "completed") setNewSession(session)
        else setNewSession(current => current?.id === session.id ? session : current)
        seen.add(session.id)
      } else if (event.type === "connection.error") {
        setError(event.message || "Could not load group sessions.")
      }
    }, next => {
      status = next
      setConnection(next)
    })
    void loadSessions()
    const fallback = setInterval(() => {
      if (status !== "connected") void loadSessions()
    }, 5000)
    return () => {
      controller.abort()
      clearInterval(fallback)
      unsubscribe()
    }
  }, [groupId])
  return { sessions, newSession, connection, error, dismissSession: () => setNewSession(null) }
}
