export type Flight = { id: string; airline: string; route: string; duration: string; stops: string; price: number; currency?: string; source?: string; bookingUrl?: string; linkType?: "flight_selection" | "search"; departureTime?: string; arrivalTime?: string }
export type FlightSearch = { id: string; flights: Flight[] }
