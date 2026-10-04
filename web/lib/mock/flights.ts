import type { FlightSearch } from "@/types/flight"
export function mockFlightSearch(id: string): FlightSearch {
  return { id, flights: [{ id: "ac", airline: "Air Canada", route: "YVR → NRT", duration: "10h 20m", stops: "Direct", price: 842 }, { id: "ana", airline: "ANA", route: "YVR → HND", duration: "10h 10m", stops: "Direct", price: 910 }] }
}
