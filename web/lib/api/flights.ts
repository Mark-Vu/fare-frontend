import type { FlightSearch } from "@/types/flight"
import type { FlightRecord } from "@/types/travel-search"
export function mapFlightSearch(result: FlightRecord): FlightSearch {
  return { id: result.search_id, flights: result.flights.filter(flight => Number.isFinite(flight.price)).map((flight, index) => ({ id: `${result.search_id}-${index}`, airline: flight.airline, route: `${flight.origin} → ${flight.destination}`, duration: flight.outbound_duration_text || "Duration unavailable", stops: flight.outbound_stops === 0 ? "Direct" : flight.outbound_stops == null ? "Stops unavailable" : `${flight.outbound_stops} stop${flight.outbound_stops === 1 ? "" : "s"}`, price: flight.price, currency: flight.currency, departureTime: flight.outbound_departure_time_text, arrivalTime: flight.outbound_arrival_time_text })).sort((a, b) => a.price - b.price) }
}
