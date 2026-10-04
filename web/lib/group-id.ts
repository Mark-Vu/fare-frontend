export function canonicalGroupId(id: string) {
  let value = id.trim()
  try {
    value = decodeURIComponent(value)
  } catch {
    /* already decoded */
  }
  if (value.includes("@")) return value
  const lower = value.toLowerCase()
  for (const suffix of [".g.us", ".c.us", ".lid", ".s.whatsapp.net"]) {
    if (lower.endsWith(suffix)) {
      return value.slice(0, -suffix.length) + "@" + suffix.slice(1)
    }
  }
  if (/^\d+$/.test(value)) return `${value}@g.us`
  return value
}

export function groupPathId(id: string) {
  return encodeURIComponent(canonicalGroupId(id))
}
