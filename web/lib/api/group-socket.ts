import type { ConnectionStatus, DashboardEvent, SessionSnapshot } from "@/types/dashboard"

export const orchestratorUrl = (process.env.NEXT_PUBLIC_ORCHESTRATOR_URL || "http://localhost:8000").replace(/\/$/, "")
const socketBase = (process.env.NEXT_PUBLIC_ORCHESTRATOR_WS_URL || orchestratorUrl.replace(/^http/, "ws")).replace(/\/$/, "")
type Listener = { event: (event: DashboardEvent) => void; connection: (status: ConnectionStatus) => void }
type GroupConnection = { listeners: Set<Listener>; socket: WebSocket | null; retry?: ReturnType<typeof setTimeout>; release?: ReturnType<typeof setTimeout>; attempts: number; status: ConnectionStatus; disposed: boolean; snapshots: Map<string, SessionSnapshot>; hasSnapshot: boolean; revision: number }
const connections = new Map<string, GroupConnection>()

function closeSocket(socket: WebSocket | null) {
  if (!socket) return
  socket.onmessage = null
  socket.onerror = null
  socket.onclose = null
  if (socket.readyState === WebSocket.CONNECTING) socket.onopen = () => socket.close()
  else if (socket.readyState === WebSocket.OPEN) socket.close()
}

export function subscribeGroupSocket(groupId: string, event: Listener["event"], connection: Listener["connection"] = () => {}) {
  let entry = connections.get(groupId)
  if (!entry) {
    entry = { listeners: new Set(), socket: null, attempts: 0, status: "connecting", disposed: false, snapshots: new Map(), hasSnapshot: false, revision: 0 }
    connections.set(groupId, entry)
  }
  const current = entry
  clearTimeout(current.release)
  const listener = { event, connection }
  current.listeners.add(listener)
  connection(current.status)
  if (current.hasSnapshot) queueMicrotask(() => {
    if (current.listeners.has(listener)) event({ version: 1, type: "group.snapshot", groupId, sessions: [...current.snapshots.values()], revision: current.revision })
  })

  function setConnection(status: ConnectionStatus) {
    current.status = status
    current.listeners.forEach(item => item.connection(status))
  }
  function retry() {
    if (current.disposed || current.retry) return
    setConnection("reconnecting")
    const delay = Math.min(1000 * 2 ** current.attempts++, 10000)
    current.retry = setTimeout(() => { current.retry = undefined; connect() }, delay)
  }
  function connect() {
    if (current.disposed || current.socket) return
    let socket: WebSocket
    try { socket = new WebSocket(`${socketBase}/groups/${encodeURIComponent(groupId)}/events`) }
    catch { retry(); return }
    current.socket = socket
    socket.onopen = () => { if (current.disposed) { closeSocket(socket); return }; current.attempts = 0; setConnection("connected") }
    socket.onmessage = ({ data }) => {
      if (current.disposed || typeof data !== "string") return
      let message: DashboardEvent
      try { message = JSON.parse(data) } catch { return }
      if (!message || message.version !== 1 || message.groupId !== groupId || typeof message.type !== "string") return
      if (message.type === "group.snapshot" && message.sessions) {
        current.snapshots.clear()
        message.sessions.forEach(snapshot => current.snapshots.set(snapshot.session.id, snapshot))
        current.hasSnapshot = true
      } else if (message.snapshot) {
        current.snapshots.set(message.snapshot.session.id, message.snapshot)
      }
      current.revision = message.revision ?? current.revision
      current.listeners.forEach(item => item.event(message))
    }
    // Connection failures are displayed in the UI; never resubmit a search on reconnect.
    socket.onerror = () => { if (!current.disposed) setConnection("reconnecting") }
    socket.onclose = () => { if (current.socket === socket) current.socket = null; retry() }
  }
  if (!current.socket && !current.retry) connect()

  return () => {
    current.listeners.delete(listener)
    if (current.listeners.size) return
    current.release = setTimeout(() => {
      if (current.listeners.size) return
      current.disposed = true
      clearTimeout(current.retry)
      closeSocket(current.socket)
      connections.delete(groupId)
    }, 250)
  }
}
