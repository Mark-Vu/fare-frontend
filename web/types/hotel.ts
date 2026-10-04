export type Hotel = { id: string; name: string; neighborhood: string; rating: number | null; price: number; nights: number; adults?: number; currency?: string; url?: string; priceNote?: string | null; reviewCount?: number | null }
export type HotelSearch = { id: string; hotels: Hotel[] }
