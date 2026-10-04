import type { ReactNode } from "react"
import { IconCheck, IconAlertCircle } from "@tabler/icons-react"
import type { StepStatus } from "@/types/session"
export function AgentStep({ title, description, status, icon, timestamp }: { title: string; description?: string; status: StepStatus; icon?: ReactNode; timestamp?: string }) {
  return <div className={`flex gap-3 py-4 ${status === "pending" ? "opacity-45" : ""}`}>
    <span className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-full ${status === "completed" ? "bg-primary/10 text-primary" : status === "running" ? "bg-sun/40 text-primary motion-safe:animate-pulse" : status === "failed" ? "bg-destructive/10 text-destructive" : "border border-border text-muted-foreground"}`}>{status === "completed" ? <IconCheck className="size-4" /> : status === "failed" ? <IconAlertCircle className="size-4" /> : icon ?? <span className="size-2 rounded-full bg-current" />}</span>
    <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><h3 className="text-sm font-medium">{title}</h3>{status === "running" && <span className="text-[10px] font-medium text-primary uppercase">Live</span>}</div>{description && <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>}{timestamp && <time className="text-xs text-muted-foreground">{timestamp}</time>}</div>
  </div>
}
