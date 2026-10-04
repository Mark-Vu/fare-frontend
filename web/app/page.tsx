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

const heroPhrases = [
  "Plan the group trip inside WhatsApp.",
  "No one becomes the trip spreadsheet.",
  "Different people. One place that works.",
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
            className="flex min-h-11 items-center gap-2 text-lg font-semibold tracking-tight text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Compass aria-hidden="true" className="size-5" strokeWidth={1.8} />
            Fare
          </a>
          <div className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
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
            className="h-10 bg-forest px-4 text-primary-foreground hover:bg-forest/90"
          >
            Open dashboard
          </Button>
        </nav>
      </header>

      <section id="top" className="relative min-h-[100dvh] overflow-hidden">
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-globe" aria-hidden="true">
          <div className="hero-globe-spin">
            <Image
              src="/images/paper_ball.png"
              alt=""
              fill
              sizes="94vw"
              className="hero-globe-layer"
            />
          </div>
          <div className="hero-globe-seam">
            <div className="hero-globe-spin">
              <Image
                src="/images/earth_ball.png"
                alt=""
                fill
                sizes="94vw"
                className="hero-globe-layer"
              />
            </div>
          </div>
          <div className="hero-globe-walker">
            <div className="hero-globe-walker-frame ryan-walk-1">
              <Image src="/images/ryanWalk1.svg" alt="" fill className="object-contain" />
            </div>
            <div className="hero-globe-walker-frame ryan-walk-2">
              <Image src="/images/ryanWalk2.svg" alt="" fill className="object-contain" />
            </div>
            <div className="hero-globe-walker-frame ryan-walk-3">
              <Image src="/images/ryanWalk3.svg" alt="" fill className="object-contain" />
            </div>
          </div>
        </div>

        <h1 className="sr-only">{heroPhrases[0]}</h1>
        <div className="hero-content">
          <div className="hero-text-cycle" aria-hidden="true">
            <p className="hero-text-cycle-item hero-text-cycle-1">
              {heroPhrases[0]}
            </p>
            <p className="hero-text-cycle-item hero-text-cycle-2">
              {heroPhrases[1]}
            </p>
            <p className="hero-text-cycle-item hero-text-cycle-3">
              {heroPhrases[2]}
            </p>
          </div>

          <p className="hero-subline">
            Fare reads each person&apos;s dates, budget, and preferences, then
            brings one best-fit trip back to the chat.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
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
              className="h-12 border-border bg-card/70 px-5 text-foreground backdrop-blur-md hover:bg-card"
            >
              See trip ideas
            </Button>
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
