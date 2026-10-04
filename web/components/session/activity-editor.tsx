"use client"

import { useState } from "react"
import { actOnTrip, getTrip, TripActionError, type TripView } from "@/lib/api/live-trip"
import type { ItineraryActivity } from "@/types/session"

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
    undo: (revision: number) => run({ action: "undo_activity_edit", expected_revision: String(revision) }),
  }
}

export function ActivityEditor({ activity, revision, editable, busy, onSave }: {
  activity: ItineraryActivity
  revision: number
  editable: boolean
  busy: boolean
  onSave: (activity: ItineraryActivity, revision: number) => Promise<boolean>
}) {
  const [draft, setDraft] = useState<ItineraryActivity | null>(null)
  const [baseRevision, setBaseRevision] = useState(revision)
  if (!draft || !editable) return <div>
    <h6 className="text-sm font-medium">{activity.title}</h6>
    <p className="mt-1 text-xs leading-5 text-muted-foreground whitespace-pre-wrap">{activity.description}</p>
    {editable && activity.id && <button type="button" disabled={busy} onClick={() => { setDraft({ ...activity }); setBaseRevision(revision) }} className="mt-2 rounded-full border border-border px-3 py-1 text-xs text-primary disabled:opacity-50">Edit activity</button>}
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
