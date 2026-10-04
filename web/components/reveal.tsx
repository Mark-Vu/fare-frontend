"use client"

import { memo, useRef, type HTMLAttributes } from "react"
import { useGSAP } from "@gsap/react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import { cn } from "@/lib/utils"

gsap.registerPlugin(useGSAP, ScrollTrigger)

export const Reveal = memo(function Reveal({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const container = containerRef.current
      if (!container) {
        return
      }

      const items = gsap.utils.toArray<HTMLElement>(
        "[data-reveal-item]",
        container
      )
      const media = gsap.matchMedia()

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(items, {
          opacity: 0,
          y: 18,
          duration: 0.55,
          stagger: 0.07,
          ease: "power3.out",
          scrollTrigger: {
            trigger: container,
            start: "top 88%",
            once: true,
          },
        })
      })

      media.add("(prefers-reduced-motion: reduce)", () => {
        gsap.from(items, {
          opacity: 0,
          duration: 0.12,
          stagger: 0,
          scrollTrigger: {
            trigger: container,
            start: "top 92%",
            once: true,
          },
        })
      })

      return () => media.revert()
    },
    { scope: containerRef }
  )

  return (
    <div ref={containerRef} className={className} {...props}>
      {children}
    </div>
  )
})

export const RevealItem = memo(function RevealItem({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-reveal-item className={cn(className)} {...props}>
      {children}
    </div>
  )
})
