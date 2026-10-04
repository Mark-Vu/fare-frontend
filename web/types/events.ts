import type { TripSession } from "./session"
export type GroupEvent = { type: "session.created" | "session.updated" | "session.completed"; session: TripSession }
export type PlanningTaskId = "flight-prices" | "hotel-location" | "group-budget" | "daily-schedule"
export type SessionEvent =
  | { type: "session.started" }
  | { type: "flight_search.started" }
  | { type: "flight_search.progress"; message: string }
  | { type: "flight_search.completed"; searchId: string }
  | { type: "hotel_search.started" }
  | { type: "hotel_search.progress"; message: string }
  | { type: "hotel_search.completed"; searchId: string }
  | { type: "planning.started" }
  | { type: "planning.task.updated"; taskId: PlanningTaskId; status: "running" | "completed" }
  | { type: "planning.completed" }
  | { type: "session.completed" }
  | { type: "session.failed"; message: string }
export type ActivityEvent = { id: number; timestamp: string; message: string }
