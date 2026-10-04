"use client"
import { useEffect, useRef, useState } from "react"
import { subscribeDashboardSocket, subscribeGroupSocket } from "@/lib/api/group-socket"
import { listTrips } from "@/lib/api/live-trip"
import { getDashboardSessions, getGroupSessions } from "@/lib/api/sessions"
import { canonicalGroupId } from "@/lib/group-id"
import type { DashboardEvent } from "@/types/dashboard"
import type { ConnectionStatus } from "@/types/dashboard"
import type { TripSession } from "@/types/session"

export function useGroupEvents(groupId: string) {
  return usePlanningEvents(groupId)
}

export type DashboardPageQuery = { limit: number; offset: number; filter: string; q: string }

export function useDashboardEvents(page: DashboardPageQuery) {
  return usePlanningEvents(null, page)
}

function usePlanningEvents(groupId: string | null, page?: DashboardPageQuery) {
  const [sessions, setSessions] = useState<TripSession[]>([])
  const [total, setTotal] = useState(0)
  const [counts, setCounts] = useState({ all: 0, live: 0, ready: 0, failed: 0 })
  const [newSession, setNewSession] = useState<TripSession | null>(null)
  const [connection, setConnection] = useState<ConnectionStatus>("connecting")
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [paging, setPaging] = useState(false)
  const groupNames = useRef(new Map<string, string>())
  const pageRef = useRef(page)
  pageRef.current = page
  const reloadRef = useRef<() => void>(() => {})
  useEffect(() => {
    if (groupId !== null) return
    reloadRef.current()
  }, [groupId, page?.limit, page?.offset, page?.filter, page?.q])
  useEffect(() => {
    setSessions([])
    setNewSession(null)
    setError(null)
    setLoaded(false)
    const controller = new AbortController()
    const seen = new Set<string>()
    const notified = new Set<string>()
    let receivedSessions = false
    let revision = 0
    let request = 0
    let status: ConnectionStatus = "connecting"
    function notify(session: TripSession) {
      if (notified.has(session.id)) return
      notified.add(session.id)
      setNewSession(session)
    }
    function withGroupName(session: TripSession) {
      if (session.groupName?.trim()) return session
      const name = groupNames.current.get(canonicalGroupId(session.groupId))
      return name ? { ...session, groupName: name } : session
    }
    async function loadGroupNames() {
      try {
        const trips = await listTrips(controller.signal)
        for (const trip of trips) {
          const name = trip.group_name?.trim()
          if (name) groupNames.current.set(canonicalGroupId(trip.group_id), name)
        }
        setSessions(current => current.map(withGroupName))
      } catch {
        // Cards still render if the trip list is briefly unavailable.
      }
    }
    function receiveSessions(next: TripSession[]) {
      next = next.map(withGroupName)
      const active = next.find(session => !seen.has(session.id) && !["completed", "failed"].includes(session.status))
      // A session may finish before the next snapshot arrives. Notify about new
      // sessions discovered after loading, including those already completed.
      const latestNew = receivedSessions ? next.find(session => !seen.has(session.id)) : null
      next.forEach(session => seen.add(session.id))
      receivedSessions = true
      setSessions(next)
      setLoaded(true)
      const notification = latestNew || active
      if (notification) notify(notification)
      else setNewSession(current => current ? next.find(session => session.id === current.id) ?? current : null)
    }
    async function loadSessions() {
      const id = ++request
      const startedAt = revision
      try {
        if (groupId === null) {
          const query = pageRef.current ?? { limit: 8, offset: 0, filter: "all", q: "" }
          setPaging(true)
          const next = await getDashboardSessions(query, controller.signal)
          if (!controller.signal.aborted && startedAt === revision && id === request) {
            next.sessions.forEach(session => seen.add(session.id))
            setSessions(next.sessions.map(withGroupName))
            setTotal(next.total)
            setCounts(next.counts)
            setLoaded(true)
            setError(null)
          }
        } else {
          await loadGroupNames()
          const next = await getGroupSessions(groupId, controller.signal)
          if (!controller.signal.aborted && startedAt === revision && id === request) {
            receiveSessions(next)
            setError(null)
          }
        }
      } catch {
        if (!controller.signal.aborted && startedAt === revision && id === request) {
          setLoaded(true)
          if (status !== "connected") setError("Could not load sessions. Check that the orchestrator is running at the configured API URL.")
        }
      } finally {
        if (!controller.signal.aborted && id === request) setPaging(false)
      }
    }
    function receiveEvent(event: DashboardEvent) {
      if (controller.signal.aborted) return
      if ((event.type === "group.snapshot" || event.type === "dashboard.snapshot") && event.sessions) {
        if (groupId === null) return
        revision++
        setError(null)
        receiveSessions(event.sessions.map(snapshot => snapshot.session).map(withGroupName))
      } else if (groupId === null && (event.session || event.snapshot?.session) && !event.type.startsWith("agent.")) {
        const session = withGroupName(event.session ?? event.snapshot!.session)
        if (event.type === "session.started" || !seen.has(session.id)) notify(session)
        else setNewSession(current => current?.id === session.id ? session : current)
        seen.add(session.id)
        void loadSessions()
      } else if ((event.session || event.snapshot?.session) && !event.type.startsWith("agent.")) {
        revision++
        setError(null)
        const session = withGroupName(event.session ?? event.snapshot!.session)
        setLoaded(true)
        setSessions(current => [session, ...current.filter(item => item.id !== session.id)])
        // Start events are authoritative even if an HTTP snapshot already
        // introduced the session. Receiving it and notifying are separate.
        if (event.type === "session.started" || !seen.has(session.id)) notify(session)
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
    reloadRef.current = () => { void loadSessions() }
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
  return { sessions, total, counts, paging, newSession, connection, error, loaded, dismissSession: () => setNewSession(null) }
}
