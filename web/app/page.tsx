import Image from "next/image"
import {
  IconArrowRight as ArrowRight,
  IconCheck as Check,
  IconCompass as Compass,
  IconCurrencyDollar as CircleDollarSign,
  IconMapPin as MapPin,
  IconPlane as Plane,
  IconSearch as Search,
  IconUsers as Users,
} from "@tabler/icons-react"

import { Reveal, RevealItem } from "@/components/reveal"
import { Button } from "@/components/ui/button"
import { WhatsAppStory } from "@/components/whatsapp-story"

// prefers-reduced-motion is enforced by the motion-reduce utility below and app/globals.css.

const travelers = [
  {
    name: "Mark",
    dates: "Dec 17 to 24",
    budget: "Around $1,800",
    preference: "Food and design",
  },
  {
    name: "Kevin",
    dates: "Dec 17 to 24",
    budget: "Under $1,500",
    preference: "Lowest total cost",
  },
  {
    name: "Sarah",
    dates: "Dec 18 to 24",
    budget: "Not shared yet",
    preference: "Nightlife, quiet sleep",
  },
]

const destinations = [
  {
    name: "Tokyo",
    note: "Late nights, quiet mornings",
    image: "/images/tokyo-evening.png",
    className: "md:col-span-5 md:row-span-2",
  },
  {
    name: "Lisbon",
    note: "Rooftops and long lunches",
    image: "/images/lisbon-rooftop.png",
    className: "md:col-span-7",
  },
  {
    name: "Costa Rica",
    note: "Rainforest, surf, reset",
    image: "/images/costa-rica-lodge.png",
    className: "md:col-span-7",
  },
]

const approvals = [
  ["Mark", "Flight option", "Looks good"],
  ["Kevin", "Ebisu stay", "Under my cap"],
  ["Sarah", "Neighborhood", "Exactly the vibe"],
]

export default function Page() {
  return (
    <main className="overflow-clip bg-background text-foreground">
      <header className="absolute inset-x-0 top-0 z-20 h-18">
        <nav
          aria-label="Primary navigation"
          className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-10"
        >
          <a
            href="#top"
            className="flex min-h-11 items-center gap-2 text-lg font-semibold tracking-tight text-white outline-none focus-visible:ring-3 focus-visible:ring-white/70"
          >
            <Compass aria-hidden="true" className="size-5" strokeWidth={1.8} />
            Fare
          </a>
          <div className="hidden items-center gap-7 text-sm text-white/82 md:flex">
            <a className="nav-link" href="#how-it-works">
              How it works
            </a>
            <a className="nav-link" href="#live-plan">
              Live plan
            </a>
            <a className="nav-link" href="#destinations">
              Destinations
            </a>
          </div>
          <Button
            render={<a href="/dashboard" />}
            nativeButton={false}
            className="h-10 bg-white px-4 text-forest hover:bg-white/90"
          >
            Open dashboard
          </Button>
        </nav>
      </header>

      <section id="top" className="relative min-h-[100dvh] overflow-hidden">
        <Image
          src="/images/hero-japan-cove.png"
          alt="A secluded tropical cove with turquoise water at sunset"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="hero-shade absolute inset-0" />
        <div className="relative mx-auto grid min-h-[100dvh] max-w-[1200px] items-center px-4 pt-18 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)] lg:gap-12 lg:px-10">
          <Reveal className="max-w-2xl py-20 text-white">
            <RevealItem>
              <p className="mb-4 text-sm font-medium tracking-[0.16em] text-white/68 uppercase">
                Fare lives in WhatsApp
              </p>
            </RevealItem>
            <RevealItem>
              <h1 className="max-w-[14ch] text-5xl leading-[1.01] font-semibold tracking-[-0.055em] sm:text-6xl lg:text-7xl">
                Plan the group trip inside WhatsApp.
              </h1>
            </RevealItem>
            <RevealItem>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">
                Fare reads each person&apos;s dates, budget, and preferences,
                then brings one best-fit trip back to the chat.
              </p>
            </RevealItem>
            <RevealItem className="mt-7 flex flex-wrap gap-3">
              <Button
                render={<a href="#how-it-works" />}
                nativeButton={false}
                size="lg"
                className="h-12 bg-sun px-5 text-forest hover:bg-sun/90"
              >
                Follow the chat
                <ArrowRight data-icon="inline-end" strokeWidth={1.8} />
              </Button>
              <Button
                render={<a href="#destinations" />}
                nativeButton={false}
                size="lg"
                variant="outline"
                className="h-12 border-white/35 bg-white/10 px-5 text-white backdrop-blur-md hover:bg-white/18 hover:text-white"
              >
                See trip ideas
              </Button>
            </RevealItem>
          </Reveal>

          <div className="hidden justify-end lg:flex">
            <div
              className="whatsapp-phone hero-phone"
              aria-label="Fare planning a Tokyo trip inside WhatsApp"
            >
              <div className="dynamic-island" aria-hidden="true">
                <span />
              </div>
              <div className="whatsapp-header">
                <span className="grid size-10 place-items-center rounded-full bg-white/12">
                  <Compass
                    className="size-5"
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">Tokyo crew</p>
                  <p className="truncate text-xs text-white/72">
                    Mark, Kevin, Sarah, Fare
                  </p>
                </div>
              </div>
              <div className="whatsapp-viewport">
                <div className="whatsapp-track">
                  <p className="chat-date">Today</p>
                  <div className="message-row message-in">
                    <span className="message-author">Mark</span>
                    <p>Tokyo in December. Keep it near $1,800.</p>
                    <span className="message-time">9:12</span>
                  </div>
                  <div className="message-row message-in">
                    <span className="message-author">Sarah</span>
                    <p>Good nightlife, but somewhere quiet to sleep.</p>
                    <span className="message-time">9:14</span>
                  </div>
                  <div className="message-row message-out">
                    <p>
                      <strong>@fare</strong> plan our trip
                    </p>
                    <span className="message-time">9:15</span>
                  </div>
                  <div className="message-row message-fare">
                    <span className="message-author">Fare</span>
                    <p>I found a seven-night overlap and one best-fit plan.</p>
                    <span className="message-time">9:16</span>
                  </div>
                  <div className="result-card">
                    <div className="result-icon">
                      <Plane
                        className="size-4"
                        strokeWidth={1.7}
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <p className="result-label">Best group option</p>
                      <p className="result-title">Vancouver to Tokyo</p>
                      <p className="result-meta">Dec 17 to 24 · bags included</p>
                    </div>
                    <Check
                      className="ml-auto size-4 text-whatsapp"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
              <span className="iphone-home-indicator" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      <WhatsAppStory />

      <section
        className="px-4 py-16 sm:px-6 md:py-20 lg:px-10 lg:py-24"
        aria-labelledby="ledger-title"
      >
        <div className="mx-auto grid max-w-[1400px] gap-10 md:grid-cols-12 md:items-start">
          <Reveal className="md:col-span-4">
            <RevealItem>
              <h2
                id="ledger-title"
                className="max-w-[13ch] text-3xl leading-[1.05] font-semibold tracking-[-0.04em] sm:text-4xl"
              >
                No one becomes the trip spreadsheet.
              </h2>
            </RevealItem>
            <RevealItem>
              <p className="mt-4 max-w-sm leading-relaxed text-muted-foreground">
                Fare keeps every constraint attached to the person who shared
                it.
              </p>
            </RevealItem>
          </Reveal>

          <Reveal className="constraint-ledger md:col-span-7 md:col-start-6">
            <RevealItem className="constraint-header">
              <span>Traveler</span>
              <span>Dates</span>
              <span>Budget</span>
              <span>Cares about</span>
            </RevealItem>
            {travelers.map((traveler) => (
              <RevealItem key={traveler.name} className="constraint-row">
                <strong>{traveler.name}</strong>
                <span data-label="Dates">{traveler.dates}</span>
                <span data-label="Budget">{traveler.budget}</span>
                <span data-label="Cares about">{traveler.preference}</span>
              </RevealItem>
            ))}
            <RevealItem className="overlap-row">
              <span className="grid size-8 place-items-center rounded-full bg-accent text-accent-foreground">
                <Check className="size-4" strokeWidth={2} aria-hidden="true" />
              </span>
              <div>
                <p className="font-semibold">Overlap found</p>
                <p className="text-sm text-muted-foreground">
                  Seven nights in Tokyo, Dec 17 to 24
                </p>
              </div>
            </RevealItem>
          </Reveal>
        </div>
      </section>

      <section
        className="px-4 py-16 sm:px-6 md:py-20 lg:px-10 lg:py-24"
        aria-labelledby="fit-title"
      >
        <div className="mx-auto grid max-w-[1400px] gap-8 md:grid-cols-12 md:items-center">
          <Reveal className="md:col-span-7">
            <RevealItem className="image-frame aspect-[5/4] min-h-[28rem]">
              <Image
                src="/images/tokyo-evening.png"
                alt="Friends exploring a lantern-lit Tokyo street in winter"
                fill
                sizes="(max-width: 768px) 100vw, 58vw"
                className="object-cover"
              />
              <div className="fit-note">
                <div className="flex items-center justify-between gap-4 border-b border-white/14 pb-4">
                  <div>
                    <p className="text-xs tracking-[0.12em] text-white/55 uppercase">
                      Example fit
                    </p>
                    <p className="mt-1 text-xl font-semibold">
                      Fare chose Ebisu
                    </p>
                  </div>
                  <MapPin
                    className="size-5 text-sun"
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-4 grid gap-3 text-sm">
                  <p>
                    <span>Mark</span> Easy airport transfer
                  </p>
                  <p>
                    <span>Kevin</span> Stay fits the budget cap
                  </p>
                  <p>
                    <span>Sarah</span> Nightlife close, quiet street
                  </p>
                </div>
              </div>
            </RevealItem>
          </Reveal>

          <Reveal className="md:col-span-4 md:col-start-9">
            <RevealItem>
              <h2
                id="fit-title"
                className="max-w-[12ch] text-3xl leading-[1.05] font-semibold tracking-[-0.04em] sm:text-4xl"
              >
                Different people. One place that works.
              </h2>
            </RevealItem>
            <RevealItem>
              <p className="mt-4 max-w-sm leading-relaxed text-muted-foreground">
                The recommendation comes with the reason, so the group can judge
                the tradeoffs together.
              </p>
            </RevealItem>
            <RevealItem className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 text-sm">
              <div className="border-b border-border pb-3">
                <CircleDollarSign
                  className="mb-3 size-5 text-accent-brand"
                  strokeWidth={1.6}
                />
                Budget fit
              </div>
              <div className="border-b border-border pb-3">
                <Users
                  className="mb-3 size-5 text-accent-brand"
                  strokeWidth={1.6}
                />
                Group fit
              </div>
            </RevealItem>
          </Reveal>
        </div>
      </section>

      <section
        id="live-plan"
        className="px-4 py-16 sm:px-6 md:py-20 lg:px-10 lg:py-24"
        aria-labelledby="live-plan-title"
      >
        <div className="mx-auto max-w-[1400px]">
          <Reveal className="mb-8 max-w-2xl">
            <RevealItem>
              <h2
                id="live-plan-title"
                className="max-w-[13ch] text-3xl leading-[1.05] font-semibold tracking-[-0.04em] sm:text-4xl"
              >
                Watch the trip take shape.
              </h2>
            </RevealItem>
            <RevealItem>
              <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
                The dashboard keeps the research visible without pulling the
                planning out of WhatsApp.
              </p>
            </RevealItem>
          </Reveal>

          <Reveal className="planner-surface grid overflow-hidden md:grid-cols-12">
            <RevealItem className="flex min-h-72 flex-col justify-between border-b border-border p-6 md:col-span-4 md:border-r md:border-b-0 md:p-8">
              <div>
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground">
                    <Plane
                      className="size-5"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </span>
                  <div>
                    <p className="font-semibold">Lisbon with friends</p>
                    <p className="text-sm text-muted-foreground">
                      Four-day city break
                    </p>
                  </div>
                </div>
                <div className="mt-8 flex flex-col gap-3 text-sm">
                  {[
                    [Check, "Calendars matched", "status-complete"],
                    [Check, "Budgets protected", "status-complete"],
                    [Search, "Comparing stays", "status-active"],
                  ].map(([Icon, label, className]) => {
                    const StatusIcon = Icon as typeof Check
                    return (
                      <div
                        key={label as string}
                        className="flex items-center gap-3"
                      >
                        <span className={className as string}>
                          <StatusIcon
                            className="size-3.5"
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                        </span>
                        <span>{label as string}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
                Fare is comparing walkability, late dinners, and quiet rooms
                near the old city.
              </p>
            </RevealItem>

            <RevealItem className="relative min-h-[27rem] md:col-span-8">
              <Image
                src="/images/lisbon-rooftop.png"
                alt="A sunny rooftop breakfast overlooking Lisbon"
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                className="object-cover"
              />
              <div className="live-note">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="font-semibold">Best neighborhood fit</p>
                    <p className="mt-1 text-sm leading-relaxed text-white/72">
                      Late dinner energy, quieter mornings, and direct tram
                      access.
                    </p>
                  </div>
                  <MapPin
                    className="size-5 shrink-0 text-sun"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </RevealItem>
          </Reveal>
        </div>
      </section>

      <section
        id="destinations"
        className="px-4 py-16 sm:px-6 md:py-20 lg:px-10 lg:py-24"
        aria-labelledby="destinations-title"
      >
        <div className="mx-auto max-w-[1400px]">
          <Reveal className="grid gap-4 md:grid-cols-12 md:items-start">
            <RevealItem className="md:col-span-5">
              <h2
                id="destinations-title"
                className="max-w-[13ch] text-3xl leading-[1.05] font-semibold tracking-[-0.04em] sm:text-4xl"
              >
                Wherever the chat goes.
              </h2>
            </RevealItem>
            <RevealItem className="md:col-span-7">
              <p className="max-w-lg leading-relaxed text-muted-foreground">
                City weekends, beach resets, and the big trip everyone keeps
                postponing.
              </p>
            </RevealItem>
          </Reveal>
          <Reveal className="mt-6 grid auto-rows-[20rem] gap-4 md:grid-cols-12">
            {destinations.map((destination) => (
              <RevealItem
                key={destination.name}
                className={`destination group ${destination.className}`}
              >
                <Image
                  src={destination.image}
                  alt={`${destination.name}: ${destination.note}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-cover transition-[transform] duration-300 ease-out motion-safe:group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none"
                />
                <div className="destination-shade absolute inset-0" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <h3 className="text-2xl font-semibold tracking-[-0.03em]">
                    {destination.name}
                  </h3>
                  <p className="mt-1 text-sm text-white/75">
                    {destination.note}
                  </p>
                </div>
              </RevealItem>
            ))}
          </Reveal>
        </div>
      </section>

      <section
        className="px-4 py-6 sm:px-6 md:py-8 lg:px-10 lg:py-10"
        aria-labelledby="consensus-title"
      >
        <div className="mx-auto grid max-w-[1400px] gap-8 border-y border-border py-8 md:grid-cols-12 md:items-center md:py-10">
          <Reveal className="md:col-span-5">
            <RevealItem>
              <h2
                id="consensus-title"
                className="max-w-[13ch] text-3xl leading-[1.05] font-semibold tracking-[-0.04em] sm:text-4xl"
              >
                Keep the debate where it belongs.
              </h2>
            </RevealItem>
            <RevealItem>
              <p className="mt-4 max-w-sm leading-relaxed text-muted-foreground">
                Fare brings the shortlist back to the group, records each
                decision, and updates the plan.
              </p>
            </RevealItem>
          </Reveal>

          <Reveal className="decision-list md:col-span-6 md:col-start-7">
            <RevealItem className="decision-heading">
              <span>Group check</span>
              <span>Tokyo · example</span>
            </RevealItem>
            {approvals.map(([name, item, response]) => (
              <RevealItem key={name} className="decision-row">
                <strong>{name}</strong>
                <span>{item}</span>
                <span className="decision-response">
                  <Check
                    className="size-3.5"
                    strokeWidth={2.2}
                    aria-hidden="true"
                  />
                  {response}
                </span>
              </RevealItem>
            ))}
            <RevealItem className="decision-ready">
              <span className="grid size-9 place-items-center rounded-full bg-sun text-forest">
                <Check
                  className="size-4"
                  strokeWidth={2.3}
                  aria-hidden="true"
                />
              </span>
              <div>
                <p className="font-semibold">Ready for the group</p>
                <p className="text-sm text-white/62">
                  Every decision stays attached to the plan.
                </p>
              </div>
            </RevealItem>
          </Reveal>
        </div>
      </section>

      <section
        id="join"
        className="px-4 py-16 sm:px-6 md:py-20 lg:px-10 lg:py-24"
      >
        <Reveal className="mx-auto max-w-[1400px] rounded-2xl bg-forest px-6 py-14 text-white sm:px-10 md:grid md:grid-cols-12 md:items-end md:px-14 md:py-16">
          <RevealItem className="md:col-span-8">
            <h2 className="max-w-[13ch] text-4xl leading-[1.03] font-semibold tracking-[-0.045em] sm:text-5xl">
              Your next trip is one tag away.
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-white/65">
              See the full planning flow again, from the first message to the
              shared itinerary.
            </p>
          </RevealItem>
          <RevealItem className="mt-7 md:col-span-3 md:col-start-10 md:mt-0 md:flex md:justify-end">
            <Button
              render={<a href="#how-it-works" />}
              nativeButton={false}
              size="lg"
              className="h-12 bg-sun px-5 text-forest hover:bg-sun/90"
            >
              Follow the chat
              <ArrowRight data-icon="inline-end" strokeWidth={1.8} />
            </Button>
          </RevealItem>
        </Reveal>
      </section>

      <footer className="px-4 pb-8 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-5 border-t border-border pt-7 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <a
            href="#top"
            className="flex min-h-11 items-center gap-2 font-semibold text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Compass aria-hidden="true" className="size-4" strokeWidth={1.8} />
            Fare
          </a>
          <p>Plan together. Go somewhere good.</p>
          <div className="flex gap-5">
            <a className="footer-link" href="#how-it-works">
              Product
            </a>
            <a className="footer-link" href="#destinations">
              Trips
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
