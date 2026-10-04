import type { ActivityReplacement, ItineraryActivity } from "@/types/session"
import { orchestratorUrl } from "./group-socket"

export type TripCard = {
  group_id: string
  group_name: string
  destination: string
  origin: string
  dates: string
  start_date: string
  end_date: string
  nights: number
  state: string
  updated_at: string
}

export type TripPerson = {
  name: string
  payer: boolean
  legal_name: string
  date_of_birth: string
  has_passport: boolean
  passport_last4: string
  origin: string
}

export type TripView = {
  group_id: string
  group_name: string
  state: string
  editable: boolean
  current_session_id?: string
  itinerary_revision?: number
  pending_activity_replacement?: ActivityReplacement | null
  can_undo_activity_edit?: boolean
  notification_warning?: string
  flight_reason?: string
  hotel_reason?: string
  destination: string
  origin: string
  dates: string
  nights: number
  budget_note: string
  payer_name: string
  updated_at: string
  spend: {
    flight_each: number
    hotel_group: number
    hotel_each: number
    travel_each: number
    travel_group: number
    people: number
    includes_food: boolean
    food_note: string
    food_per_day: number | null
    food_trip: number | null
  }
  owes: { from: string; to: string; amount: number }[]
  people: TripPerson[]
  days: { date?: string; activities?: ItineraryActivity[]; title: string; body: string; food_cad: number | null }[]
  places: { name: string; neighborhood: string; why: string; dish: string; est_cad: number | null; map: string }[]
  flights: { offer_id: string; airline: string; origin: string; destination: string; summary: string; price: number; selected: boolean; reason?: string; source?: string }[]
  hotels: { offer_id: string; name: string; city: string; nightly: number; total: number; rating: number | null; image: string; selected: boolean; reason?: string; source?: string; property_type?: string; original_rating?: number | null; original_rating_scale?: number | null; price_note?: string | null; checkout_url?: string }[]
  messages: { id: string; sender: string; text: string; bot: boolean; at: string }[]
}

async function readError(response: Response) {
  try {
    const body = await response.json() as { error?: string }
    return body.error || "Request failed."
  } catch {
    return "Request failed."
  }
}

export async function listTrips(signal?: AbortSignal) {
  const response = await fetch(`${orchestratorUrl}/dashboard/trips`, { cache: "no-store", signal })
  if (!response.ok) throw new Error(await readError(response))
  return response.json() as Promise<TripCard[]>
}

export async function getTrip(groupId: string, signal?: AbortSignal) {
  const response = await fetch(`${orchestratorUrl}/dashboard/trips/${encodeURIComponent(groupId)}`, { cache: "no-store", signal })
  if (!response.ok) throw new Error(await readError(response))
  return response.json() as Promise<TripView>
}

export class TripActionError extends Error {
  constructor(message: string, public status: number) {
    super(message)
  }
}

export async function actOnTrip(groupId: string, body: Record<string, string>) {
  const response = await fetch(`${orchestratorUrl}/dashboard/trips/${encodeURIComponent(groupId)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new TripActionError(await readError(response), response.status)
  return response.json() as Promise<TripView>
}
