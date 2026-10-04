export type SearchAgent = "flight" | "hotel"
export type SearchError = { code: string; message: string }
export type BrowserMetadata = { skyvern_browser_session_id?: string | null; live_view_url?: string | null; replay_url?: string | null; recordings?: { url: string; filename: string }[] }
export type FlightRecord = { session_id: string; search_id: string; status: "complete" | "partially_complete" | "failed"; error?: SearchError | null; flights: { airline: string; origin: string; destination: string; price: number; currency: string; source?: string; website?: string; booking_url?: string; link_type?: "flight_selection" | "search"; outbound_duration_text?: string; outbound_stops?: number; outbound_departure_time_text?: string; outbound_arrival_time_text?: string }[]; origins?: (BrowserMetadata & { origin: string; website?: string; status: string; warning?: string | null; results_complete?: boolean; error?: SearchError | null; recording_url?: string | null; recording_error?: SearchError | null })[] }
export type HotelRecord = BrowserMetadata & { session_id: string; search_id: string; status: "complete" | "partially_complete" | "failed"; error?: SearchError | null; request: { check_in: string; check_out: string; adults: number; destination: string }; hotels: { name: string; url?: string; booking_url?: string; checkout_url?: string; total_price: number; currency: string; rating: number | null; review_count?: number | null; price_note?: string | null; source?: string; property_type?: string; original_rating?: number | null; original_rating_scale?: number | null }[]; origins?: (BrowserMetadata & { website: string; status: string; error?: SearchError | null; recording_url?: string | null; recording_error?: SearchError | null })[] }
type Envelope = { version: 1; session_id: string | null; search_id: string | null; timestamp: string }
export type TravelSearchEvent = Envelope & (
  | { type: "search.status"; status: string; origin?: string; error?: SearchError | null }
  | { type: "browser.live_view"; browser_session_id: string; url: string | null; origin?: string; website?: string }
  | { type: "browser.stream"; origin: string; website?: string; browser_session_id: string; status: "starting" | "live" | "ended" | "unavailable" }
  | { type: "browser.frame"; origin: string; website?: string; browser_session_id: string; mime_type: "image/jpeg"; data: string }
  | { type: "search.result"; result: FlightRecord | HotelRecord }
  | { type: "search.error"; error: SearchError }
)
export type BrowserPreview = { browserSessionId: string; website?: string; origin?: string; src?: string; liveViewUrl?: string; status: "starting" | "live" | "ended" | "unavailable" | "disconnected" }
