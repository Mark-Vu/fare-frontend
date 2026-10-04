import { orchestratorUrl } from "./group-socket"

export type ExpenseMember = { id: string; name: string }
export type Expense = {
  id: string
  description: string
  amount_cents: number
  currency: "CAD"
  payer_id: string
  shares: { member_id: string; amount_cents: number }[]
  created_by: string
  created_at: string
  deleted: boolean
}
export type LedgerView = {
  group_id: string
  session_id: string
  revision: number
  writable: boolean
  members: ExpenseMember[]
  expenses: Expense[]
  balances: { member_id: string; name: string; balance_cents: number }[]
  notification_warning?: string
}
export type ExpenseAction = { action: "add"; actor_id: string; amount: string; description: string; payer_id: string; member_ids: string[] } | { action: "delete"; actor_id: string; expense_id: string }
export type ExpenseRequest = ExpenseAction & { operation_id: string; expected_revision: number }

export class ExpenseError extends Error {
  constructor(message: string, public status: number) { super(message) }
}

function ledgerUrl(groupId: string, sessionId: string) {
  return `${orchestratorUrl}/groups/${encodeURIComponent(groupId)}/sessions/${encodeURIComponent(sessionId)}/expenses`
}
async function readLedger(response: Response): Promise<LedgerView> {
  if (!response.ok) {
    const raw = await response.text()
    let message = `Could not load or save expenses (${response.status}).`
    try {
      const body = JSON.parse(raw) as { error?: string }
      message = body.error || message
    } catch {
      if (raw.trim()) message = `${message} ${raw.trim().slice(0, 180)}`
    }
    throw new ExpenseError(message, response.status)
  }
  return response.json() as Promise<LedgerView>
}
export async function getExpenses(groupId: string, sessionId: string, signal?: AbortSignal) {
  return readLedger(await fetch(ledgerUrl(groupId, sessionId), { cache: "no-store", signal }))
}
export async function actOnExpenses(groupId: string, sessionId: string, body: ExpenseRequest) {
  return readLedger(await fetch(ledgerUrl(groupId, sessionId), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }))
}
