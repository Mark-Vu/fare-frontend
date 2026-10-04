"use client"
import { useEffect, useState } from "react"
import { subscribeGroupSocket } from "@/lib/api/group-socket"
import type { ConnectionStatus, SessionSnapshot } from "@/types/dashboard"
import type { BrowserPreview } from "@/types/travel-search"

export function useSessionEvents(initial: SessionSnapshot) {
  const [snapshot, setSnapshot] = useState(initial)
  const [connection, setConnection] = useState<ConnectionStatus>("connecting")
  useEffect(() => {
    setSnapshot(initial)
    return subscribeGroupSocket(initial.session.groupId, event => {
      const next = event.type === "group.snapshot" ? event.sessions?.find(item => item.session.id === initial.session.id) : event.snapshot
      if (next && next.session.id === initial.session.id) {
        setSnapshot(current => next.revision >= current.revision ? next : current)
        return
      }
      if (event.sessionId !== initial.session.id || !event.agentType || !event.event || !event.type.startsWith("agent.browser.")) return
      const agent = event.agentType
      const wire = event.event
      if (wire.type !== "browser.frame" && wire.type !== "browser.stream" && wire.type !== "browser.live_view") return
      const origin = wire.type === "browser.live_view" ? wire.origin ?? wire.website ?? "browser" : wire.origin
      if (!origin || !wire.browser_session_id) return
      setSnapshot(current => {
        const old = current.previews[agent]?.[origin]
        const preview: BrowserPreview = old?.browserSessionId === wire.browser_session_id ? old : { browserSessionId: wire.browser_session_id, status: "starting" }
        const next: BrowserPreview = wire.type === "browser.frame" ? { ...preview, src: `data:image/jpeg;base64,${wire.data}`, status: "live" } : wire.type === "browser.stream" ? { ...preview, status: wire.status } : { ...preview, liveViewUrl: wire.url ?? undefined }
        return { ...current, previews: { ...current.previews, [agent]: { ...current.previews[agent], [origin]: next } } }
      })
    }, status => {
      setConnection(status)
      if (status === "reconnecting") setSnapshot(current => ({ ...current, previews: {
        flight: Object.fromEntries(Object.entries(current.previews.flight).map(([origin, preview]) => [origin, { ...preview, status: preview.status === "live" || preview.status === "starting" ? "disconnected" : preview.status }])),
        hotel: Object.fromEntries(Object.entries(current.previews.hotel).map(([origin, preview]) => [origin, { ...preview, status: preview.status === "live" || preview.status === "starting" ? "disconnected" : preview.status }])),
      } }))
    })
  }, [initial])
  return { ...snapshot, status: snapshot.session.status, connection }
}
