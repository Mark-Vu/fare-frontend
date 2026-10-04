import type { TripSession } from "@/types/session"
import type { SearchAgent, TravelSearchEvent } from "@/types/travel-search"

export const travelSearchUrls = {
  flight: process.env.NEXT_PUBLIC_FLIGHT_WS_URL || "ws://127.0.0.1:8765",
  hotel: process.env.NEXT_PUBLIC_HOTEL_WS_URL || "ws://127.0.0.1:8766",
}
const airports: Record<string, string> = { Vancouver: "YVR", Tokyo: "NRT", "New York": "JFK", "Los Angeles": "LAX" }
export function createSearchRequest(agent: SearchAgent, session: TripSession, runId: string) {
  if (agent === "hotel") return { session_id: runId, destination: session.destination === "Tokyo" ? "Tokyo, Japan" : session.destination, check_in: session.startDate, check_out: session.endDate, adults: session.adults ?? 2, rooms: 1, currency: "CAD" }
  const origin = session.originAirport ?? airports[session.origin]
  const destination = session.destinationAirport ?? airports[session.destination]
  if (!origin || !destination) throw new Error("Set the trip’s origin and destination airport codes before searching.")
  return { session_id: runId, origins: [origin], destination, departure_date: session.startDate, return_date: session.endDate, trip_type: "round_trip", currency: "CAD" }
}

// Search requests are sent only from an explicit user action, never on mount or reconnect.
export function startTravelSearch(agent: SearchAgent, request: ReturnType<typeof createSearchRequest>, receive: (event: TravelSearchEvent) => void, fail: (message: string) => void) {
  let disposed = false
  let terminal = false
  let searchId: string | null = null
  let socket: WebSocket
  let connectionTimer: ReturnType<typeof setTimeout> | undefined
  function failure(message: string) {
    if (disposed || terminal) return
    terminal = true
    clearTimeout(connectionTimer)
    fail(message)
    socket?.close()
  }
  try {
    const url = travelSearchUrls[agent]
    if (!/^wss?:\/\//.test(url)) throw new Error("Search endpoint must use ws:// or wss://.")
    if (window.location.protocol === "https:" && url.startsWith("ws:")) throw new Error("Configure a public wss:// search endpoint for this HTTPS dashboard.")
    socket = new WebSocket(url)
    connectionTimer = setTimeout(() => failure(`${agent === "flight" ? "Flight" : "Hotel"} service connection timed out.`), 15000)
  } catch (error) {
    fail(error instanceof Error ? error.message : "Could not connect to the search service.")
    return () => { disposed = true }
  }
  socket.onopen = () => {
    if (disposed) return
    clearTimeout(connectionTimer)
    try { socket.send(JSON.stringify({ action: "search", request })) }
    catch { failure("Could not send the search request.") }
  }
  socket.onmessage = ({ data }) => {
    if (disposed || terminal || typeof data !== "string") return
    let event: TravelSearchEvent
    try { event = JSON.parse(data) } catch { return }
    if (!event || event.version !== 1 || typeof event.type !== "string") return
    if (event.session_id && event.session_id !== request.session_id) return
    if (event.search_id) {
      if (searchId && searchId !== event.search_id) return
      searchId = event.search_id
    }
    if (event.type === "search.result") {
      if (!event.result || event.result.session_id !== request.session_id || (searchId && event.result.search_id !== searchId)) return
      if (agent === "flight" ? !("flights" in event.result) || !Array.isArray(event.result.flights) : !("hotels" in event.result) || !Array.isArray(event.result.hotels)) { failure("The search service returned an invalid result."); return }
    }
    if (event.type === "browser.frame" && (event.mime_type !== "image/jpeg" || typeof event.data !== "string" || !event.browser_session_id || !event.origin)) return
    if (event.type === "search.error") {
      if (!event.error) return
      if (event.error.code === "SEARCH_BUSY") { receive(event); return }
      terminal = true
    }
    if (event.type === "search.result") terminal = true
    receive(event)
    if (terminal) socket.close()
  }
  socket.onerror = () => failure(`Could not connect to the ${agent} search service.`)
  socket.onclose = () => failure(`${agent === "flight" ? "Flight" : "Hotel"} stream disconnected before results arrived. The backend search may still be running; it has not been restarted.`)
  return () => { disposed = true; clearTimeout(connectionTimer); socket.close() }
}
