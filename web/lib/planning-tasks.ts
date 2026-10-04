import type { PlanningTaskId } from "@/types/events"
import type { StepStatus } from "@/types/session"

export const planningTasks: { id: PlanningTaskId; title: string }[] = [
  { id: "flight-prices", title: "Comparing flight prices" },
  { id: "hotel-location", title: "Choosing a walkable hotel location" },
  { id: "group-budget", title: "Checking everyone’s budget" },
  { id: "daily-schedule", title: "Planning each day around your group’s interests" },
]

export function planningTaskStatuses(status: StepStatus): Record<PlanningTaskId, StepStatus> {
  return { "flight-prices": status, "hotel-location": status, "group-budget": status, "daily-schedule": status }
}
