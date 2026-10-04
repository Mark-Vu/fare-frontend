import type { ActivityEvent, PlanningTaskId } from "./events"
import type { TripSession, StepStatus, FinalPlan } from "./session"
import type { Flight } from "./flight"
import type { Hotel } from "./hotel"
import type { BrowserPreview, SearchAgent, TravelSearchEvent } from "./travel-search"
import type { SearchError } from "./travel-search"

export type SearchRecordingSource = {
  website?: string
  origin?: string
  status?: string
  warning?: string | null
  resultsComplete?: boolean
  error?: SearchError | null
  recordingUrl?: string | null
  replayUrl?: string | null
  recordingError?: SearchError | null
  browserSessionId?: string | null
  recordings?: { url: string; filename: string }[]
}

export type SearchRecording = {
  agentType?: SearchAgent
  searchId?: string
  recordingUrl?: string | null
  replayUrl?: string | null
  recordingError?: SearchError | null
  deliveryError?: SearchError | null
  sources?: SearchRecordingSource[]
}

export type SessionSnapshot = {
  session: TripSession
  revision: number
  flight: StepStatus
  hotel: StepStatus
  planning: StepStatus
  planningTasks: Record<PlanningTaskId, StepStatus>
  planningTaskMessages?: Partial<Record<PlanningTaskId, string>>
  flightMessage: string
  hotelMessage: string
  flights: Flight[]
  hotels: Hotel[]
  plan: FinalPlan | null
  activity: ActivityEvent[]
  error: string | null
  previews: Record<SearchAgent, Record<string, BrowserPreview>>
  recordings?: Partial<Record<SearchAgent, SearchRecording>>
}
export type DashboardEvent = { version: 1; type: string; groupId: string; revision?: number; timestamp?: string; sessionId?: string; session?: TripSession; snapshot?: SessionSnapshot; sessions?: SessionSnapshot[]; agentType?: SearchAgent; event?: TravelSearchEvent; message?: string; taskId?: PlanningTaskId; status?: StepStatus; plan?: FinalPlan }
export type ConnectionStatus = "connecting" | "connected" | "reconnecting"
