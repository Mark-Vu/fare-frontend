import type { ActivityEvent, PlanningTaskId } from "./events"
import type { TripSession, StepStatus, FinalPlan } from "./session"
import type { Flight } from "./flight"
import type { Hotel } from "./hotel"
import type { BrowserPreview, SearchAgent, TravelSearchEvent } from "./travel-search"

export type SessionSnapshot = {
  session: TripSession
  revision: number
  flight: StepStatus
  hotel: StepStatus
  planning: StepStatus
  planningTasks: Record<PlanningTaskId, StepStatus>
  flightMessage: string
  hotelMessage: string
  flights: Flight[]
  hotels: Hotel[]
  plan: FinalPlan | null
  activity: ActivityEvent[]
  error: string | null
  previews: Record<SearchAgent, Record<string, BrowserPreview>>
}
export type DashboardEvent = { version: 1; type: string; groupId: string; revision?: number; sessionId?: string; session?: TripSession; snapshot?: SessionSnapshot; sessions?: SessionSnapshot[]; agentType?: SearchAgent; event?: TravelSearchEvent; message?: string }
export type ConnectionStatus = "connecting" | "connected" | "reconnecting"
