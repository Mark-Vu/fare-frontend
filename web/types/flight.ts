export type Flight = { id: string; airline: string; route: string; duration: string; stops: string; price: number; currency?: string; departureTime?: string; arrivalTime?: string }
export type FlightSearch = { id: string; flights: Flight[] }
