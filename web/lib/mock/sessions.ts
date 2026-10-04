import type { FinalPlan, TripSession } from "@/types/session"
import { mockItinerary } from "./itinerary"
export function mockSessions(groupId: string): TripSession[] {
  return [
    { id: "new-york", groupId, destination: "New York", origin: "Vancouver", startDate: "2026-09-10", endDate: "2026-09-15", status: "completed", createdAt: "2026-08-20T12:00:00Z" },
    { id: "los-angeles", groupId, destination: "Los Angeles", origin: "Vancouver", startDate: "2026-08-02", endDate: "2026-08-07", status: "completed", createdAt: "2026-07-10T12:00:00Z" },
  ]
}
export function mockTokyoSession(groupId: string): TripSession {
  return { id: "tokyo", groupId, destination: "Tokyo", origin: "Vancouver", startDate: "2026-12-17", endDate: "2026-12-24", status: "searching", createdAt: "2026-10-03T12:00:00Z" }
}
export function mockPlan(session: TripSession): FinalPlan {
  const tokyo = session.destination === "Tokyo"
  return { flight: "Air Canada", route: `YVR → ${tokyo ? "NRT" : session.destination === "New York" ? "JFK" : "LAX"}`, flightPrice: tokyo ? 842 : 420, hotel: tokyo ? "Hotel Gracery Shinjuku" : session.destination === "New York" ? "The Hoxton, Williamsburg" : "The LINE LA", nights: tokyo ? 7 : 5, hotelPrice: tokyo ? 610 : 550, explanation: "A balance of price, great food, nightlife, and walkable neighborhoods. Your group’s shared dates and budget shaped every choice.", days: mockItinerary(session) }
}
