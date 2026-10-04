export function Bone({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`block rounded-lg bg-secondary motion-safe:animate-pulse ${className}`} />
}

export function TripSkeleton({ embed = false }: { embed?: boolean }) {
  const tabs = embed ? 3 : 4
  return <div role="status" aria-label="Loading the trip">
    <Bone className={embed ? "h-8 w-64" : "h-12 w-72"} />
    {!embed && <Bone className="mt-3 h-3 w-32" />}
    <Bone className="mt-3 h-4 w-56" />
    <div className="mt-6 flex gap-2">{Array.from({ length: tabs }, (_, index) => <Bone key={index} className="h-9 w-28 rounded-full" />)}</div>
    <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
      <div className="space-y-3">{[0, 1, 2].map(index => <div key={index} className="rounded-2xl border border-border bg-card p-5"><Bone className="h-5 w-48" /><Bone className="mt-4 h-3 w-full" /><Bone className="mt-2 h-3 w-4/5" /></div>)}</div>
      <div className="space-y-3">
        <div className="rounded-2xl border border-border bg-card p-5"><Bone className="h-3 w-24" /><Bone className="mt-4 h-4 w-full" /><Bone className="mt-3 h-4 w-full" /><Bone className="mt-3 h-4 w-2/3" /></div>
        <div className="rounded-2xl bg-secondary/70 p-5"><Bone className="h-3 w-16 bg-background/70" /><Bone className="mt-4 h-7 w-40 bg-background/70" /></div>
      </div>
    </div>
  </div>
}

export function SessionSkeleton() {
  return <div role="status" aria-label="Loading the planning session" className="mx-auto max-w-4xl">
    <Bone className="h-4 w-28" />
    <Bone className="mt-8 h-3 w-40" />
    <Bone className="mt-3 h-14 w-72 max-w-full" />
    <Bone className="mt-3 h-4 w-56" />
    <div className="mt-10 space-y-4">{[0, 1, 2].map(index => <div key={index} className="rounded-xl border border-border bg-card p-5"><div className="flex items-center gap-4"><Bone className="size-9 shrink-0 rounded-full" /><div className="min-w-0 flex-1"><Bone className="h-5 w-48" /><Bone className="mt-2 h-3 w-full max-w-md" /></div></div>{index === 0 && <Bone className="mt-5 h-64 w-full rounded-xl" />}</div>)}</div>
  </div>
}

export function FrameSkeleton() {
  return <div role="status" aria-label="Waiting for the live view" className="min-h-64 rounded-lg bg-secondary/40 p-4">
    <Bone className="h-52 w-full rounded-lg" />
    <div className="mt-4 flex justify-between gap-3"><Bone className="h-3 w-32" /><Bone className="h-3 w-20" /></div>
  </div>
}

export function PlanSkeleton() {
  return <div role="status" aria-label="Preparing your trip" className="space-y-3">{[0, 1, 2].map(index => <div key={index} className="rounded-2xl border border-border bg-card p-5"><Bone className="h-5 w-44" /><Bone className="mt-4 h-3 w-full" /><Bone className="mt-2 h-3 w-5/6" /><Bone className="mt-2 h-3 w-2/3" /></div>)}</div>
}

export function SearchCardSkeleton({ count = 1 }: { count?: number }) {
  return <div role="status" aria-label="Loading trips" className="flex flex-col gap-4">{Array.from({ length: count }, (_, index) => <div key={index} className="rounded-2xl border border-border bg-card p-6"><Bone className="h-3 w-24" /><Bone className="mt-4 h-8 w-52" /><Bone className="mt-3 h-4 w-64 max-w-full" /><Bone className="mt-6 h-20 w-full rounded-xl" /></div>)}</div>
}
