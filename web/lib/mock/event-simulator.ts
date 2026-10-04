import type { GroupEvent, SessionEvent } from "@/types/events"
import { mockTokyoSession } from "./sessions"
export function simulateEvents<T>(schedule: { delay: number; event: T }[], receive: (event: T) => void) {
  const timers = schedule.map(({ delay, event }) => setTimeout(() => receive(event), delay))
  return () => timers.forEach(clearTimeout)
}
export function subscribeMockGroup(groupId: string, receive: (event: GroupEvent) => void) {
  const session = mockTokyoSession(groupId)
  return simulateEvents<GroupEvent>([
    { delay: 3000, event: { type: "session.created", session } },
  ], receive)
}
export function subscribeMockSession(sessionId: string, receive: (event: SessionEvent) => void) {
  return simulateEvents<SessionEvent>([
    { delay: 0, event: { type: "session.started" } },
    { delay: 1000, event: { type: "flight_search.started" } },
    { delay: 1500, event: { type: "hotel_search.started" } },
    { delay: 3000, event: { type: "flight_search.progress", message: "Searching flights from YVR to Tokyo" } },
    { delay: 4000, event: { type: "hotel_search.progress", message: "Comparing stays in Shinjuku and Shibuya" } },
    { delay: 6000, event: { type: "flight_search.completed", searchId: `${sessionId}-flights` } },
    { delay: 8000, event: { type: "hotel_search.completed", searchId: `${sessionId}-hotels` } },
    { delay: 9000, event: { type: "planning.started" } },
    { delay: 9200, event: { type: "planning.task.updated", taskId: "flight-prices", status: "running" } },
    { delay: 10500, event: { type: "planning.task.updated", taskId: "flight-prices", status: "completed" } },
    { delay: 10600, event: { type: "planning.task.updated", taskId: "hotel-location", status: "running" } },
    { delay: 12000, event: { type: "planning.task.updated", taskId: "hotel-location", status: "completed" } },
    { delay: 12100, event: { type: "planning.task.updated", taskId: "group-budget", status: "running" } },
    { delay: 13500, event: { type: "planning.task.updated", taskId: "group-budget", status: "completed" } },
    { delay: 13600, event: { type: "planning.task.updated", taskId: "daily-schedule", status: "running" } },
    { delay: 15800, event: { type: "planning.task.updated", taskId: "daily-schedule", status: "completed" } },
    { delay: 16500, event: { type: "planning.completed" } },
    { delay: 17000, event: { type: "session.completed" } },
  ], receive)
}
