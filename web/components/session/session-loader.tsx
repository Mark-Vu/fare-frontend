"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { getSessionSnapshot } from "@/lib/api/sessions"
import { subscribeGroupSocket } from "@/lib/api/group-socket"
import { mergeSessionSnapshot } from "@/lib/session-snapshot"
import type { SessionSnapshot } from "@/types/dashboard"
import { SessionDashboard } from "./session-dashboard"

export function SessionLoader({ groupId, sessionId }: { groupId: string; sessionId: string }) {
  const [snapshot, setSnapshot] = useState<SessionSnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    setSnapshot(null)
    setError(null)
    function receive(next: SessionSnapshot) {
      if (controller.signal.aborted || next.session.id !== sessionId) return
      setSnapshot(current => mergeSessionSnapshot(current, next))
      setError(null)
    }
    const unsubscribe = subscribeGroupSocket(groupId, event => {
      const next = event.type === "group.snapshot" ? event.sessions?.find(item => item.session.id === sessionId) : event.snapshot
      if (next) receive(next)
    })
    getSessionSnapshot(groupId, sessionId, controller.signal).then(receive).catch(reason => {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Could not load the session.")
    })
    return () => { controller.abort(); unsubscribe() }
  }, [groupId, sessionId])
  if (snapshot) return <SessionDashboard key={sessionId} snapshot={snapshot} />
  return <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card p-8"><p role="status" className="font-medium">{error ?? "Connecting to your planning session…"}</p><p className="mt-3 text-sm text-muted-foreground">{error ? "The dashboard will reconnect when your backend is available." : "Your group’s latest progress will appear here as soon as the connection opens."}</p><Link href={`/dashboard/${encodeURIComponent(groupId)}`} className="mt-5 inline-block text-sm text-primary">Back to group trips →</Link></div>
}
