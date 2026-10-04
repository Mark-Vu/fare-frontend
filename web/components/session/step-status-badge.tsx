import { IconAlertCircle, IconCheck, IconClock, IconLoader2 } from "@tabler/icons-react"
import type { StepStatus } from "@/types/session"
import styles from "./step-status.module.css"

export const stepStatusStyles: Record<StepStatus, { badge: string; icon: string; surface: string }> = {
  pending: {
    badge: "border-border bg-muted text-muted-foreground",
    icon: "border-border bg-muted text-muted-foreground",
    surface: "border-border bg-card",
  },
  running: {
    badge: "border-amber-300 bg-amber-100 text-amber-900",
    icon: "border-amber-400 bg-amber-400 text-amber-950 ring-4 ring-amber-400/20",
    surface: "border-amber-300 bg-amber-50/70",
  },
  completed: {
    badge: "border-emerald-300 bg-emerald-100 text-emerald-800",
    icon: "border-emerald-600 bg-emerald-600 text-white ring-4 ring-emerald-500/15",
    surface: "border-emerald-200 bg-emerald-50/60",
  },
  failed: {
    badge: "border-red-300 bg-red-100 text-red-800",
    icon: "border-red-600 bg-red-600 text-white ring-4 ring-red-500/15",
    surface: "border-red-200 bg-red-50/70",
  },
}

const statusLabels: Record<StepStatus, string> = {
  pending: "Queued",
  running: "In progress",
  completed: "Completed",
  failed: "Interrupted",
}

export function StepStatusBadge({ status, label }: { status: StepStatus; label?: string }) {
  const Icon = status === "completed" ? IconCheck : status === "running" ? IconLoader2 : status === "failed" ? IconAlertCircle : IconClock

  return <span role="status" aria-atomic="true" className="inline-flex shrink-0">
    <span key={status} className={`${styles.change} inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${stepStatusStyles[status].badge}`}>
      <Icon aria-hidden="true" className={`size-3.5 ${status === "running" ? "motion-safe:animate-spin" : ""}`} />
      {label ?? statusLabels[status]}
    </span>
  </span>
}
