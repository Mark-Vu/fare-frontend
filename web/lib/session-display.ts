import type { TripSession } from "@/types/session"

export function sessionDestination(session: TripSession) {
  const destination = session.destination.trim()
  return !destination || destination === "Planning your trip" ? "Your next adventure" : destination
}

export function sessionGroup(session: TripSession) {
  if (session.groupName?.trim()) return session.groupName.trim()
  const id = session.groupId.split("@")[0]
  return /^\d+$/.test(id) ? `WhatsApp group · ${id.slice(-4)}` : id || "WhatsApp group"
}

export function sessionDates(session: TripSession) {
  const start = new Date(`${session.startDate}T12:00:00Z`)
  const end = new Date(`${session.endDate}T12:00:00Z`)
  if (!session.startDate || !session.endDate || !Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) return "Dates to be confirmed"
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear()
  const format = (date: Date, withYear: boolean) => date.toLocaleDateString("en-CA", { month: "short", day: "numeric", ...(withYear ? { year: "numeric" } : {}), timeZone: "UTC" })
  return `${format(start, !sameYear)} – ${format(end, true)}`
}

export function sessionIsLive(session: TripSession) {
  return session.status !== "completed" && session.status !== "failed"
}

export function sessionStatus(session: TripSession) {
  switch (session.status) {
    case "created": return "Getting started"
    case "searching": return "Searching live"
    case "planning": return "Building itinerary"
    case "completed": return "Itinerary ready"
    case "failed": return "Needs attention"
  }
}
