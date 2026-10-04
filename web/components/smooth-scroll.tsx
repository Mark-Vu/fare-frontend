"use client"

import { useRef } from "react"
import gsap from "gsap"
import { ScrollSmoother } from "gsap/ScrollSmoother"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger, ScrollSmoother)

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const smoother = ScrollSmoother.create({
      wrapper: wrapperRef.current!,
      content: contentRef.current!,
      smooth: 1.2,
      smoothTouch: 0.1,
      normalizeScroll: { allowNestedScroll: true, debounce: true },
      effects: false,
    })
    return () => smoother.kill()
  }, [])

  return <div id="smooth-wrapper" ref={wrapperRef}>
    <div id="smooth-content" ref={contentRef}>{children}</div>
  </div>
}
