import type { ReactNode } from "react"
import { IconCheck, IconAlertCircle, IconLoader2 } from "@tabler/icons-react"
import type { StepStatus } from "@/types/session"
import { StepStatusBadge, stepStatusStyles } from "./step-status-badge"
import styles from "./step-status.module.css"
export function AgentStep({ title, description, status, icon, timestamp }: { title: string; description?: string; status: StepStatus; icon?: ReactNode; timestamp?: string }) {
  return <div className="flex gap-3 py-4">
    <span key={status} className={`${styles.change} mt-0.5 grid size-9 shrink-0 place-items-center rounded-full border ${stepStatusStyles[status].icon}`}>{status === "completed" ? <IconCheck className="size-4" /> : status === "failed" ? <IconAlertCircle className="size-4" /> : status === "running" ? <IconLoader2 className="size-4 motion-safe:animate-spin" /> : icon ?? <span className="size-2 rounded-full bg-current" />}</span>
    <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-medium">{title}</h3><StepStatusBadge status={status} /></div>{description && <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>}{timestamp && <time className="text-xs text-muted-foreground">{timestamp}</time>}</div>
  </div>
}
