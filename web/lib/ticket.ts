function hashString(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export function seededGate(id: string) {
  const h = hashString(`${id}gate`)
  return String((h % 42) + 1).padStart(2, "0")
}

export function seededSeat(id: string) {
  const h = hashString(`${id}seat`)
  const row = (h % 28) + 1
  const letter = "ABCDEF"[Math.floor(h / 28) % 6]
  return `${row}${letter}`
}

export function seededAccent(id: string) {
  const h = hashString(`${id}accent`)
  return `oklch(0.55 0.14 ${h % 360})`
}

export function barcodeBars(id: string, count = 22) {
  const h = hashString(id)
  return Array.from({ length: count }, (_, i) => {
    const v = (h >> (i % 24)) ^ (h * (i + 7) + i)
    return 2 + (Math.abs(v) % 5)
  })
}
