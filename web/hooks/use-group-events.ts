"use client"
import { useEffect, useState } from "react"
import { subscribeGroupSocket } from "@/lib/api/group-socket"
import type { ConnectionStatus } from "@/types/dashboard"
import type { TripSession } from "@/types/session"

export function useGroupEvents(groupId: string) {
  const [sessions, setSessions] = useState<TripSession[]>([])
  const [newSession, setNewSession] = useState<TripSession | null>(null)
  const [connection, setConnection] = useState<ConnectionStatus>("connecting")
  useEffect(() => {
    setSessions([])
    setNewSession(null)
    return subscribeGroupSocket(groupId, event => {
      if (event.type === "group.snapshot" && event.sessions) {
        setSessions(event.sessions.map(snapshot => snapshot.session))
      } else if (event.session && !event.type.startsWith("agent.")) {
        const session = event.session
        setSessions(current => [session, ...current.filter(item => item.id !== session.id)])
        if (event.type === "session.started") setNewSession(session)
      }
    }, setConnection)
  }, [groupId])
  return { sessions, newSession, connection, dismissSession: () => setNewSession(null) }
}
