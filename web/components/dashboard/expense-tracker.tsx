"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { actOnExpenses, ExpenseError, getExpenses, type ExpenseAction, type ExpenseMember, type ExpenseRequest, type LedgerView } from "@/lib/api/expenses"

const money = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 2, maximumFractionDigits: 2 })
const field = "mt-1 block w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
const button = "rounded-full border border-border px-3 py-1.5 text-xs disabled:opacity-50"
function validAmount(amount: string) {
  if (!/^[0-9]+([.][0-9]{1,2})?$/.test(amount)) return false
  const [whole, fraction = ""] = amount.split(".")
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"))
  return Number.isSafeInteger(cents) && cents > 0 && cents <= 100000000
}
function cad(cents: number) { return money.format(cents / 100) }
function memberLabel(member: ExpenseMember, members: ExpenseMember[]) {
  return members.filter(row => row.name === member.name).length > 1 ? `${member.name} (${member.id})` : member.name
}

export function ExpenseTracker({ groupId, sessionId }: { groupId: string; sessionId: string }) {
  const [ledger, setLedger] = useState<LedgerView | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [uncertain, setUncertain] = useState(false)
  const [actor, setActor] = useState("")
  const [draft, setDraft] = useState({ description: "", amount: "", payer: "", members: [] as string[] })
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const initialized = useRef(false)
  const operation = useRef<{ key: string; action: ExpenseAction; body: ExpenseRequest } | null>(null)
  const mounted = useRef(true)
  const loading = useRef(false)

  const applyLedger = useCallback((next: LedgerView) => {
    if (!mounted.current) return
    setLedger(current => current && current.revision > next.revision ? current : next)
    if (!initialized.current && next.members.length) {
      initialized.current = true
      setDraft(current => ({ ...current, members: next.members.map(member => member.id) }))
    }
  }, [])
  const load = useCallback(async (signal?: AbortSignal) => {
    if (loading.current) return
    loading.current = true
    try {
      const next = await getExpenses(groupId, sessionId, signal)
      if (!signal?.aborted && mounted.current) { applyLedger(next); setLoadError(null) }
    } catch (err) {
      if (!signal?.aborted && mounted.current) setLoadError(err instanceof Error ? err.message : "Could not load expenses.")
    } finally { loading.current = false }
  }, [groupId, sessionId, applyLedger])
  useEffect(() => {
    mounted.current = true
    const controller = new AbortController()
    void load(controller.signal)
    const timer = setInterval(() => { void load(controller.signal) }, 4000)
    return () => { mounted.current = false; controller.abort(); clearInterval(timer) }
  }, [load])

  async function mutate(action: ExpenseAction) {
    if (!ledger || busy || (!ledger.writable && !uncertain)) return false
    const key = JSON.stringify(action)
    if (uncertain && operation.current?.key !== key) return false
    const pending = operation.current?.key === key ? operation.current : { key, action, body: { ...action, operation_id: crypto.randomUUID(), expected_revision: ledger.revision } }
    operation.current = pending
    setBusy(true); setError(null); setWarning(null)
    try {
      const next = await actOnExpenses(groupId, sessionId, pending.body)
      applyLedger(next)
      operation.current = null
      if (mounted.current) { setUncertain(false); setWarning(next.notification_warning || null) }
      return next
    } catch (err) {
      const unresolved = !(err instanceof ExpenseError) || ![400, 404, 409].includes(err.status)
      if (!unresolved) operation.current = null
      if (mounted.current) {
        setUncertain(unresolved)
        setError(unresolved ? "Couldn’t confirm whether this was saved. Retry this request before editing it." : err instanceof Error ? err.message : "Could not save this expense.")
      }
      if (err instanceof ExpenseError && err.status === 409) {
        try {
          const fresh = await getExpenses(groupId, sessionId)
          applyLedger(fresh)
          if (mounted.current) setLoadError(null)
        } catch {
          if (mounted.current) setLoadError("Could not refresh expenses. Retry loading before saving again.")
        }
      }
      return false
    } finally { if (mounted.current) setBusy(false) }
  }

  async function retryPending() {
    const pending = operation.current
    if (!pending) return
    const saved = await mutate(pending.action)
    if (saved && mounted.current) {
      if (pending.action.action === "add") setDraft({ description: "", amount: "", payer: "", members: saved.members.map(member => member.id) })
      setConfirmDelete(null)
    }
  }

  const locked = busy || uncertain
  const members = ledger?.members || []
  const validActor = members.some(member => member.id === actor)
  const writable = !!ledger?.writable
  function name(id: string) {
    const member = members.find(row => row.id === id)
    return member ? memberLabel(member, members) : id
  }
  function changeDraft(next: typeof draft) { operation.current = null; setDraft(next) }

  return <section className="rounded-2xl border border-border bg-card p-6">
    <h2 className="text-lg font-semibold">Recorded expenses</h2>
    <p className="mt-1 text-xs leading-5 text-muted-foreground">Only expenses added here count toward these balances. Travel quotes and estimates are separate. Repayments aren’t tracked yet.</p>
    {loadError && <div role="alert" className="mt-4 flex flex-wrap items-center gap-3 text-sm text-destructive">{loadError}<button type="button" onClick={() => void load()} className={button}>Retry loading</button></div>}
    {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
    {uncertain && <button type="button" disabled={busy} onClick={() => void retryPending()} className={`${button} mt-3`}>{busy ? "Retrying…" : "Retry request"}</button>}
    {warning && <p role="status" className="mt-4 text-sm text-muted-foreground">{warning}</p>}
    {!ledger && !loadError && <p className="mt-4 text-sm text-muted-foreground">Loading expenses…</p>}
    {ledger && <>
      {!writable && <p className="mt-4 text-sm text-muted-foreground">Expenses for this trip are read-only.</p>}
      {writable && <form className="mt-5 space-y-4" onSubmit={async e => {
        e.preventDefault()
        const saved = await mutate({ action: "add", actor_id: actor, description: draft.description.trim(), amount: draft.amount.trim(), payer_id: draft.payer, member_ids: draft.members })
        if (saved && mounted.current) setDraft({ description: "", amount: "", payer: "", members: saved.members.map(member => member.id) })
      }}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs">You are<select required value={actor} disabled={locked} onChange={e => { operation.current = null; setActor(e.target.value) }} className={field}><option value="">Pick your name</option>{members.map(member => <option key={member.id} value={member.id}>{memberLabel(member, members)}</option>)}</select></label>
          <label className="text-xs">Paid by<select required value={draft.payer} disabled={locked} onChange={e => changeDraft({ ...draft, payer: e.target.value })} className={field}><option value="">Pick who paid</option>{members.map(member => <option key={member.id} value={member.id}>{memberLabel(member, members)}</option>)}</select></label>
          <label className="text-xs">What was it for?<input required maxLength={200} value={draft.description} disabled={locked} onChange={e => changeDraft({ ...draft, description: e.target.value })} placeholder="Dinner" className={field} /></label>
          <label className="text-xs">Amount (CAD)<input required type="text" inputMode="decimal" pattern="[0-9]+([.][0-9]{1,2})?" maxLength={10} value={draft.amount} disabled={locked} onChange={e => changeDraft({ ...draft, amount: e.target.value })} placeholder="45.50" className={field} /></label>
        </div>
        <fieldset disabled={locked}><legend className="text-xs">Split equally between</legend><div className="mt-2 flex flex-wrap gap-4">{members.map(member => <label key={member.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.members.includes(member.id)} onChange={e => changeDraft({ ...draft, members: e.target.checked ? [...draft.members, member.id] : draft.members.filter(id => id !== member.id) })} />{memberLabel(member, members)}</label>)}</div></fieldset>
        <button disabled={locked || !validActor || !validAmount(draft.amount.trim()) || !draft.members.length || !members.some(member => member.id === draft.payer) || !draft.description.trim()} className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">{busy ? "Saving…" : "Add expense"}</button>
      </form>}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div><h3 className="font-medium">Expenses</h3><ul className="mt-3 space-y-3">{ledger.expenses.filter(expense => !expense.deleted).sort((a, b) => b.created_at.localeCompare(a.created_at)).map(expense => <li key={expense.id} className="rounded-xl border border-border p-4">
          <div className="flex justify-between gap-3 text-sm"><span className="font-medium">{expense.description}</span><span className="shrink-0">{cad(expense.amount_cents)}</span></div>
          <p className="mt-2 text-xs text-muted-foreground">Paid by {name(expense.payer_id)}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{expense.shares.map(share => `${name(share.member_id)} ${cad(share.amount_cents)}`).join(" · ")}</p>
          {writable && <div className="mt-3">{confirmDelete === expense.id ? <div className="flex flex-wrap items-center gap-2"><span className="text-xs">Delete this expense?</span><button type="button" disabled={locked || !validActor} onClick={async () => { if (await mutate({ action: "delete", actor_id: actor, expense_id: expense.id })) setConfirmDelete(null) }} className={`${button} text-destructive`}>Confirm delete</button><button type="button" disabled={locked} onClick={() => setConfirmDelete(null)} className={button}>Cancel</button></div> : <button type="button" disabled={locked || !validActor} onClick={() => setConfirmDelete(expense.id)} className={button}>Delete</button>}</div>}
        </li>)}</ul>{!ledger.expenses.some(expense => !expense.deleted) && <p className="mt-3 text-sm text-muted-foreground">No recorded expenses yet.</p>}</div>
        <div><h3 className="font-medium">Balances from recorded expenses</h3><ul className="mt-3 space-y-3 text-sm">{ledger.balances.map(balance => <li key={balance.member_id} className="flex justify-between gap-3"><span>{name(balance.member_id)}</span><span>{balance.balance_cents > 0 ? `Gets back ${cad(balance.balance_cents)}` : balance.balance_cents < 0 ? `Owes ${cad(-balance.balance_cents)}` : cad(0)}</span></li>)}</ul></div>
      </div>
    </>}
  </section>
}
