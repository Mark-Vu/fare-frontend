"use client"
import { useEffect, useState } from "react"
import { subscribeGroupSocket } from "@/lib/api/group-socket"
import type { ConnectionStatus, SessionSnapshot } from "@/types/dashboard"
import { applyBrowserEvent, mergeSessionSnapshot } from "@/lib/session-snapshot"

export function useSessionEvents(initial: SessionSnapshot) {
  const [snapshot, setSnapshot] = useState(initial)
  const [connection, setConnection] = useState<ConnectionStatus>("connecting")
  useEffect(() => {
    setSnapshot(current => mergeSessionSnapshot(current, initial))
  }, [initial])
  const groupId = initial.session.groupId
  const sessionId = initial.session.id
  useEffect(() => {
    return subscribeGroupSocket(groupId, event => {
      const next = event.type === "group.snapshot" ? event.sessions?.find(item => item.session.id === sessionId) : event.snapshot
      if (next && next.session.id === sessionId) {
        setSnapshot(current => mergeSessionSnapshot(current, next))
        return
      }
      if (event.sessionId === sessionId && event.type.startsWith("agent.browser.")) setSnapshot(current => applyBrowserEvent(current, event))
    }, status => {
      setConnection(status)
      if (status === "reconnecting") setSnapshot(current => ({ ...current, previews: {
        flight: Object.fromEntries(Object.entries(current.previews.flight).map(([origin, preview]) => [origin, { ...preview, status: preview.status === "live" || preview.status === "starting" ? "disconnected" : preview.status }])),
        hotel: Object.fromEntries(Object.entries(current.previews.hotel).map(([origin, preview]) => [origin, { ...preview, status: preview.status === "live" || preview.status === "starting" ? "disconnected" : preview.status }])),
      } }))
    })
  }, [groupId, sessionId])
  return { ...snapshot, status: snapshot.session.status, connection }
}
