import { IconArrowUpRight } from "@tabler/icons-react"

export function OfferLink({ url, label }: { url?: string; label: string }) {
  if (!url) return null
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null
  } catch {
    return null
  }
  return <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-current/20 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-current/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current">{label}<IconArrowUpRight aria-hidden="true" className="size-3" /></a>
}
