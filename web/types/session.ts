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
export type ActivityReplacement = { id: string; activityId: string; time: string; title: string; description: string; reason: string; revision: number }
export type ItineraryActivity = { id?: string; time: string; title: string; description: string }
export type ItineraryDay = { date: string; title: string; description: string; activities: ItineraryActivity[] }
export type FinalPlan = { pendingActivityReplacement?: ActivityReplacement | null; itineraryRevision?: number; itineraryEditable?: boolean; canUndoActivityEdit?: boolean; isSampleSchedule?: boolean; flight: string; route: string; flightPrice: number; flightSource?: string; flightReason?: string; hotel: string; nights: number; hotelPrice: number; hotelSource?: string; hotelReason?: string; hotelPropertyType?: string; hotelOriginalRating?: number | null; hotelOriginalRatingScale?: number | null; hotelPriceNote?: string; explanation: string; days: ItineraryDay[] }
