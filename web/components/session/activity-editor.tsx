"use client"

import { useState } from "react"
import { actOnTrip, getTrip, TripActionError, type TripView } from "@/lib/api/live-trip"
import type { ActivityReplacement, ItineraryActivity } from "@/types/session"

export function useItineraryEdits(groupId: string, onUpdated: (trip: TripView) => void, sessionId?: string, onConflict?: () => Promise<void>) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function run(body: Record<string, string>) {
    setBusy(true)
    setError(null)
    try {
      const next = await actOnTrip(groupId, {
        actor: localStorage.getItem(`fare-actor:${groupId}`) || "Someone",
        ...(sessionId ? { session_id: sessionId } : {}),
        ...body,
      })
      onUpdated(next)
      if (next.notification_warning) setError(next.notification_warning)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update this activity.")
      if (err instanceof TripActionError && err.status === 409) {
        try {
          if (onConflict) await onConflict()
          else onUpdated(await getTrip(groupId))
        } catch {
          setError("The itinerary changed and could not be refreshed. Reload the page before trying again.")
        }
      }
      return false
    } finally {
      setBusy(false)
    }
  }
  return {
    busy, error,
    save: (activity: ItineraryActivity, revision: number) => run({ action: "update_activity", activity_id: activity.id || "", expected_revision: String(revision), time: activity.time, title: activity.title, description: activity.description }),
    propose: (activityId: string, request: string, revision: number) => run({ action: "propose_activity_replacement", activity_id: activityId, request, expected_revision: String(revision) }),
    accept: (proposalId: string, revision: number) => run({ action: "accept_activity_replacement", proposal_id: proposalId, expected_revision: String(revision) }),
    reject: (proposalId: string, revision: number) => run({ action: "reject_activity_replacement", proposal_id: proposalId, expected_revision: String(revision) }),
    undo: (revision: number) => run({ action: "undo_activity_edit", expected_revision: String(revision) }),
  }
}

type ReplacementActions = {
  propose: (activityId: string, request: string, revision: number) => Promise<boolean>
  accept: (proposalId: string, revision: number) => Promise<boolean>
  reject: (proposalId: string, revision: number) => Promise<boolean>
}

export function ActivityEditor({ activity, revision, editable, busy, onSave, pendingReplacement, replacementActions }: {
  activity: ItineraryActivity
  revision: number
  editable: boolean
  busy: boolean
  onSave: (activity: ItineraryActivity, revision: number) => Promise<boolean>
  pendingReplacement?: ActivityReplacement | null
  replacementActions: ReplacementActions
}) {
  const [draft, setDraft] = useState<ItineraryActivity | null>(null)
  const [baseRevision, setBaseRevision] = useState(revision)
  const [request, setRequest] = useState<string | null>(null)
  const [requestRevision, setRequestRevision] = useState(revision)
  const proposal = pendingReplacement?.activityId === activity.id ? pendingReplacement : null
  const canRespond = editable && !busy && proposal?.revision === revision
  if (!draft || !editable) return <div>
    <h6 className="text-sm font-medium">{activity.title}</h6>
    <p className="mt-1 text-xs leading-5 text-muted-foreground whitespace-pre-wrap">{activity.description}</p>
    {editable && activity.id && <div className="mt-2 flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={() => { setRequest(null); setDraft({ ...activity }); setBaseRevision(revision) }} className="rounded-full border border-border px-3 py-1 text-xs text-primary disabled:opacity-50">Edit activity</button><button type="button" disabled={busy} onClick={() => { setRequest(""); setRequestRevision(revision) }} className="rounded-full border border-border px-3 py-1 text-xs text-primary disabled:opacity-50">Suggest replacement</button></div>}
    {request !== null && editable && <form className="mt-3 space-y-3 rounded-xl border border-border bg-secondary/30 p-3" onSubmit={async e => {
      e.preventDefault()
      if (activity.id && await replacementActions.propose(activity.id, request.trim(), requestRevision)) setRequest(null)
    }}>
      <label className="block text-xs">What would you prefer?<textarea required maxLength={500} rows={2} placeholder="Something cheaper or quieter" value={request} disabled={busy} onChange={e => setRequest(e.target.value)} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></label>
      <p className="text-xs leading-5 text-muted-foreground">Fare will suggest an alternative for you to review. Details, prices, and opening hours are unverified; nothing is booked.</p>
      {requestRevision !== revision && <p role="status" className="text-xs text-destructive">The itinerary changed. Cancel and reopen to use the latest plan.</p>}
      <div className="flex gap-2"><button disabled={busy || !request.trim() || requestRevision !== revision} className="rounded-full bg-primary px-3 py-1.5 text-xs text-primary-foreground disabled:opacity-50">{busy ? "Thinking…" : "Get suggestion"}</button><button type="button" disabled={busy} onClick={() => setRequest(null)} className="rounded-full border border-border px-3 py-1.5 text-xs">Cancel</button></div>
    </form>}
    {proposal && <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
      <p className="text-xs font-medium text-primary">Suggested replacement · {proposal.time}</p><p className="mt-1 text-sm font-medium">{proposal.title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground whitespace-pre-wrap">{proposal.description}</p><p className="mt-2 text-xs leading-5">{proposal.reason}</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">Unverified suggestion. Check details, prices, and opening hours before going. Nothing is booked.</p>
      {proposal.revision !== revision && <p role="status" className="mt-2 text-xs text-destructive">This suggestion is out of date. Ask for a new one.</p>}
      <div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={!canRespond} onClick={() => void replacementActions.accept(proposal.id, revision)} className="rounded-full bg-primary px-3 py-1.5 text-xs text-primary-foreground disabled:opacity-50">Accept replacement</button><button type="button" disabled={!canRespond} onClick={() => void replacementActions.reject(proposal.id, revision)} className="rounded-full border border-border px-3 py-1.5 text-xs disabled:opacity-50">Keep original</button></div>
    </div>}
  </div>
  return <form className="space-y-3 rounded-xl border border-border bg-secondary/30 p-3" onSubmit={async e => {
    e.preventDefault()
    if (await onSave(draft, baseRevision)) setDraft(null)
  }}>
    <label className="block text-xs">Local time<input type="time" required value={draft.time} disabled={busy} onChange={e => setDraft({ ...draft, time: e.target.value })} className="mt-1 block rounded-lg border border-border bg-background px-3 py-2 text-sm" /></label>
    <label className="block text-xs">Activity<input required maxLength={200} value={draft.title} disabled={busy} onChange={e => setDraft({ ...draft, title: e.target.value })} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></label>
    <label className="block text-xs">Details<textarea maxLength={2000} rows={3} value={draft.description} disabled={busy} onChange={e => setDraft({ ...draft, description: e.target.value })} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></label>
    {revision !== baseRevision && <p role="status" className="text-xs text-destructive">The itinerary changed while you were editing. Cancel and reopen this activity to use the latest plan.</p>}
    <div className="flex gap-2"><button disabled={busy || revision !== baseRevision} className="rounded-full bg-primary px-3 py-1.5 text-xs text-primary-foreground disabled:opacity-50">{busy ? "Saving…" : "Save activity"}</button><button type="button" disabled={busy} onClick={() => setDraft(null)} className="rounded-full border border-border px-3 py-1.5 text-xs">Cancel</button></div>
  </form>
}
