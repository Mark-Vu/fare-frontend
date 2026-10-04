export function tripDates(start: string, end: string) {
  if (!start || !end) return "Dates to be confirmed"
  const format = (date: string) => new Date(`${date}T12:00:00Z`).toLocaleDateString("en-CA", { month: "short", day: "numeric", timeZone: "UTC" })
  return `${format(start)} – ${format(end)}`
}
export const cad = (value: number) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(value)

export const money = (value: number, currency = "CAD") => new Intl.NumberFormat("en-CA", { style: "currency", currency: /^[A-Z]{3}$/.test(currency) ? currency : "CAD", maximumFractionDigits: 0 }).format(value)
