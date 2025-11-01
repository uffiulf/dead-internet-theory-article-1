import type { ReactNode } from 'react'
import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

type ScrollRevealProps = {
  children: ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}

export function ScrollReveal({ children, delay = 0, direction = 'up' }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      gsap.set(el, { autoAlpha: 1 })
      return
    }

    const offsets = {
      up: { y: 60, x: 0 },
      down: { y: -60, x: 0 },
      left: { x: 60, y: 0 },
      right: { x: -60, y: 0 },
    }

    const offset = offsets[direction]

    gsap.fromTo(
      el,
      {
        autoAlpha: 0,
        ...offset,
        scale: 0.95,
      },
      {
        autoAlpha: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration: 1,
        ease: 'power3.out',
        delay,
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
          markers: false,
        },
      },
    )

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars?.trigger === el) st.kill()
      })
    }
  }, [delay, direction])

  return <div ref={ref}>{children}</div>
}

