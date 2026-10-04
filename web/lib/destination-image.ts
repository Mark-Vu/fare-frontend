const DESTINATION_IMAGES: { match: RegExp; src: string }[] = [
  { match: /tokyo|japan|osaka|kyoto/i, src: "/images/tokyo-evening.png" },
  { match: /lisbon|portugal|porto/i, src: "/images/lisbon-rooftop.png" },
  { match: /costa rica|san jose/i, src: "/images/costa-rica-lodge.png" },
]

const FALLBACK_IMAGE = "/images/hero-japan-cove.png"

export function destinationImage(destination: string) {
  const hit = DESTINATION_IMAGES.find(({ match }) => match.test(destination))
  return hit?.src ?? FALLBACK_IMAGE
}
