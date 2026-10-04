export function travelSourceLabel(source?: string) {
  if (source === "google_flights") return "Google Flights"
  if (source === "trip_com") return "Trip.com"
  if (source === "kayak") return "KAYAK"
  if (source === "booking_com") return "Booking.com"
  if (source === "airbnb") return "Airbnb"
  return source || "Search"
}
