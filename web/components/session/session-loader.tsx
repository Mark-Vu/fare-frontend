"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { getSessionSnapshot } from "@/lib/api/sessions"
import { subscribeGroupSocket } from "@/lib/api/group-socket"
import { mergeSessionSnapshot } from "@/lib/session-snapshot"
import type { SessionSnapshot } from "@/types/dashboard"
import { SessionDashboard } from "./session-dashboard"
import { groupPathId } from "@/lib/group-id"
import { SessionSkeleton } from "@/components/ui/skeleton"

export function SessionLoader({ groupId, sessionId }: { groupId: string; sessionId: string }) {
  const [snapshot, setSnapshot] = useState<SessionSnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    setSnapshot(null)
    setError(null)
    let loading = false
    function receive(next: SessionSnapshot) {
      if (controller.signal.aborted || next.session.id !== sessionId) return
      setSnapshot(current => mergeSessionSnapshot(current, next))
      setError(null)
    }
    const unsubscribe = subscribeGroupSocket(groupId, event => {
      const next = event.type === "group.snapshot" ? event.sessions?.find(item => item.session.id === sessionId) : event.snapshot
      if (next) receive(next)
    })
    async function loadSnapshot() {
      if (loading || controller.signal.aborted) return
      loading = true
      try {
        receive(await getSessionSnapshot(groupId, sessionId, controller.signal))
      } catch (reason) {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Could not load the session.")
      } finally {
        loading = false
      }
    }
    void loadSnapshot()
    // Recover results and recording links even when the socket stays open but misses an update.
    const fallback = setInterval(() => { void loadSnapshot() }, 5000)
    return () => { controller.abort(); clearInterval(fallback); unsubscribe() }
  }, [groupId, sessionId])
  if (snapshot) return <SessionDashboard key={sessionId} snapshot={snapshot} />
  if (error) return <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card p-8"><p role="alert" className="font-medium">{error}</p><p className="mt-3 text-sm text-muted-foreground">The dashboard will reconnect when your backend is available.</p><Link href={`/dashboard/${groupPathId(groupId)}`} className="mt-5 inline-block text-sm text-primary">Back to group trips →</Link></div>
  return <SessionSkeleton />
}
