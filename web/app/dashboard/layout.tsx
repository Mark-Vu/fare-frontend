import Link from "next/link"
import { IconCompass, IconBrandWhatsapp, IconArrowUpRight } from "@tabler/icons-react"
import { SmoothScroll } from "@/components/smooth-scroll"
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <SmoothScroll>
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border bg-card">
        <nav aria-label="Dashboard navigation" className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2 text-xl font-semibold tracking-tight"><IconCompass className="size-6 text-primary" />Fare<span className="ml-4 hidden border-l border-border pl-5 text-sm font-normal text-muted-foreground sm:inline">Group travel, in motion</span></Link>
          <Link href="/dashboard" className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-xs font-medium sm:text-sm"><IconBrandWhatsapp className="size-4" />Your trips<IconArrowUpRight className="size-4" /></Link>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-12">{children}</main>
      <footer className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 px-5 py-8 text-xs text-muted-foreground sm:px-8"><span>Fare · Plan together. Go somewhere good.</span><span>Fare · Live group planning</span></footer>
    </div>
  </SmoothScroll>
}
