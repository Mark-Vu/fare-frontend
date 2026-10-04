import type { HotelSearch } from "@/types/hotel"
export function mockHotelSearch(id: string): HotelSearch {
  return { id, hotels: [{ id: "gracery", name: "Hotel Gracery Shinjuku", neighborhood: "Shinjuku", rating: 4.4, price: 610, nights: 7 }, { id: "stream", name: "Shibuya Stream Hotel", neighborhood: "Shibuya", rating: 4.5, price: 810, nights: 7 }] }
}
