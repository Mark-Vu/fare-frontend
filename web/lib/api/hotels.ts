import type { HotelSearch } from "@/types/hotel"
import type { HotelRecord } from "@/types/travel-search"
export function mapHotelSearch(result: HotelRecord): HotelSearch {
  const nights = Math.round((new Date(`${result.request.check_out}T00:00:00Z`).getTime() - new Date(`${result.request.check_in}T00:00:00Z`).getTime()) / 86400000)
  return { id: result.search_id, hotels: result.hotels.map((hotel, index) => ({ id: `${result.search_id}-${index}`, name: hotel.name, neighborhood: result.request.destination, rating: hotel.rating, price: hotel.total_price, nights, adults: result.request.adults, currency: hotel.currency, url: hotel.booking_url || hotel.checkout_url || hotel.url, priceNote: hotel.price_note, reviewCount: hotel.review_count })).filter(hotel => Number.isFinite(hotel.price)).sort((a, b) => a.price - b.price) }
}
