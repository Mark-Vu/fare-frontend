export type TripSession = {
  id: string
  groupId: string
  destination: string
  origin: string
  originAirport?: string
  destinationAirport?: string
  adults?: number
  startDate: string
  endDate: string
  status: "created" | "searching" | "planning" | "completed" | "failed"
  message?: string
  createdAt: string
}
export type StepStatus = "pending" | "running" | "completed" | "failed"
export type ItineraryActivity = { time: string; title: string; description: string }
export type ItineraryDay = { date: string; title: string; description: string; activities: ItineraryActivity[] }
export type FinalPlan = { isSampleSchedule?: boolean; flight: string; route: string; flightPrice: number; hotel: string; nights: number; hotelPrice: number; hotelSource?: string; hotelPropertyType?: string; hotelOriginalRating?: number | null; hotelOriginalRatingScale?: number | null; hotelPriceNote?: string; explanation: string; days: ItineraryDay[] }
