"use client"

import { memo, useRef } from "react"
import { useGSAP } from "@gsap/react"
import {
  IconArrowUpRight as ArrowUpRight,
  IconCheck as Check,
  IconHotelService as Hotel,
  IconMapPin as MapPinned,
  IconMessageCircle as MessageCircle,
  IconPlane as Plane,
  IconSearch as Search,
} from "@tabler/icons-react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(useGSAP, ScrollTrigger)

const phases = [
  ["01", "Find the overlap"],
  ["02", "Compare the options"],
  ["03", "Bring back one plan"],
]

export const WhatsAppStory = memo(function WhatsAppStory() {
  const sectionRef = useRef<HTMLElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const section = sectionRef.current
      const viewport = viewportRef.current
      const track = trackRef.current
      if (!section || !viewport || !track) {
        return
      }

      const phaseItems = gsap.utils.toArray<HTMLElement>(
        "[data-story-phase]",
        section
      )
      const media = gsap.matchMedia()

      media.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(track, { clearProps: "transform" })
        gsap.set(phaseItems, { opacity: 1, x: 0 })
      })

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const opacitySetters = phaseItems.map((item) =>
          gsap.quickTo(item, "opacity", { duration: 0.2, ease: "power2.out" })
        )
        const xSetters = phaseItems.map((item) =>
          gsap.quickTo(item, "x", { duration: 0.2, ease: "power2.out" })
        )

        gsap.set(phaseItems, { opacity: 0.38, x: 0 })
        gsap.set(phaseItems[0], { opacity: 1, x: 6 })
        const story = gsap.to(track, {
          y: () =>
            -Math.max(0, track.scrollHeight - viewport.clientHeight + 24),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => {
              const travel = Math.max(
                0,
                track.scrollHeight - viewport.clientHeight
              )
              return `+=${Math.max(2100, travel * 4.25)}`
            },
            pin: true,
            pinSpacing: true,
            scrub: 0.75,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const activeIndex = Math.min(
                phaseItems.length - 1,
                Math.floor(self.progress * phaseItems.length)
              )

              phaseItems.forEach((_, index) => {
                opacitySetters[index](index === activeIndex ? 1 : 0.38)
                xSetters[index](index === activeIndex ? 6 : 0)
              })
            },
          },
        })

        return () => story.kill()
      })

      return () => media.revert()
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="whatsapp-story bg-background text-foreground"
      aria-labelledby="chat-story-title"
    >
      <div className="whatsapp-stage mx-auto grid min-h-[100dvh] max-w-[1180px] items-center gap-8 px-4 py-10 sm:px-6 md:grid-cols-12 md:gap-6 md:py-8 lg:px-8">
        <div className="story-copy md:col-span-6">
          <p className="story-kicker">A trip, planned in the chat</p>
          <h2
            id="chat-story-title"
            className="mt-3 max-w-[12ch] text-3xl leading-[1.03] font-semibold tracking-[-0.045em] sm:text-4xl lg:text-5xl"
          >
            The trip is already in the chat.
          </h2>
          <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
            Tag Fare once. It reads the dates, budgets, and preferences, then
            returns the best flight, stay, and things to do.
          </p>

          <div className="story-phases mt-10 hidden border-t border-border md:block">
            {phases.map(([number, label], index) => (
              <div
                key={number}
                data-story-phase
                className="grid grid-cols-[2.5rem_1fr] items-center gap-3 border-b border-border py-4"
              >
                <span className="font-mono text-xs text-accent-brand">
                  {number}
                </span>
                <span className="text-sm font-medium">{label}</span>
                {index === phases.length - 1 ? (
                  <ArrowUpRight
                    className="col-start-2 mt-1 size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                ) : null}
              </div>
            ))}
          </div>

          <p className="mt-6 max-w-sm text-xs leading-relaxed text-muted-foreground">
            The whole planning pass stays in one conversation.
          </p>
        </div>

        <div className="flex min-w-0 justify-center md:col-span-6">
          <div
            className="whatsapp-phone"
            aria-label="Example WhatsApp conversation with Fare"
          >
            <div className="dynamic-island" aria-hidden="true">
              <span />
            </div>
            <div className="whatsapp-header">
              <span className="grid size-10 place-items-center rounded-full bg-white/12">
                <MessageCircle
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
              <span className="ml-auto rounded-full border border-white/18 px-2.5 py-1 text-[0.65rem] font-medium tracking-wide text-white/70">
                PRODUCT DEMO
              </span>
            </div>

            <div ref={viewportRef} className="whatsapp-viewport">
              <div ref={trackRef} className="whatsapp-track">
                <p className="chat-date">Today</p>

                <div className="message-row message-in">
                  <span className="message-author">Mark</span>
                  <p>Tokyo in December. I can fly from Vancouver.</p>
                  <span className="message-time">9:12</span>
                </div>

                <div className="message-row message-in">
                  <span className="message-author">Kevin</span>
                  <p>I can only do Dec 17 to 24. Keep mine under $1,500.</p>
                  <span className="message-time">9:14</span>
                </div>

                <div className="message-row message-in">
                  <span className="message-author">Sarah</span>
                  <p>
                    Nightlife nearby, but I still want somewhere quiet to sleep.
                  </p>
                  <span className="message-time">9:17</span>
                </div>

                <div className="message-row message-out">
                  <p>
                    <strong>@fare</strong> plan our trip
                  </p>
                  <span className="message-time">9:18</span>
                </div>

                <div className="message-row message-fare">
                  <span className="message-author">Fare</span>
                  <p>
                    I found the overlap: Dec 17 to 24. I’m checking total trip
                    cost, not just the headline fare.
                  </p>
                  <div className="bot-working" aria-label="Fare is searching">
                    <Search
                      className="size-4"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                    Comparing live options
                  </div>
                  <span className="message-time">9:18</span>
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
                    <p className="result-label">Lowest fare option</p>
                    <p className="result-title">Vancouver to Tokyo</p>
                    <p className="result-meta">
                      One stop · bags included · Dec 17
                    </p>
                  </div>
                  <Check
                    className="ml-auto size-4 text-whatsapp"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </div>

                <div className="result-card">
                  <div className="result-icon">
                    <Hotel
                      className="size-4"
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="result-label">Best-value stay</p>
                    <p className="result-title">Ebisu apartment</p>
                    <p className="result-meta">
                      Quiet street · nightlife nearby · group fit
                    </p>
                  </div>
                  <Check
                    className="ml-auto size-4 text-whatsapp"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </div>

                <div className="result-card">
                  <div className="result-icon">
                    <MapPinned
                      className="size-4"
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="result-label">Activities that fit</p>
                    <p className="result-title">Three good days</p>
                    <p className="result-meta">
                      Night food walk · TeamLab · Kamakura
                    </p>
                  </div>
                  <Check
                    className="ml-auto size-4 text-whatsapp"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </div>

                <div className="message-row message-fare">
                  <span className="message-author">Fare</span>
                  <p>
                    This keeps Kevin under his cap and puts Sarah near
                    late-night spots without putting the apartment on the main
                    strip.
                  </p>
                  <span className="message-time">9:21</span>
                </div>

                <div className="message-row message-out">
                  <p>Save this one.</p>
                  <span className="message-time">9:22</span>
                </div>

                <div className="message-row message-fare message-final">
                  <span className="message-author">Fare</span>
                  <p>Done. The shared trip is ready for everyone to review.</p>
                  <div className="shared-plan-link">
                    <span>Open shared trip</span>
                    <ArrowUpRight
                      className="size-4"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </div>
                  <span className="message-time">9:22</span>
                </div>
              </div>
            </div>
            <span className="iphone-home-indicator" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  )
})
