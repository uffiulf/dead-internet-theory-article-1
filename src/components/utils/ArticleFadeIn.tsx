import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function ArticleFadeIn({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    // Find all paragraphs, headings, and list items that aren't already inside Anim components
    const textElements = Array.from(
      container.querySelectorAll('p, h2, h3, h4, h5, h6, li, blockquote')
    ).filter((el) => {
      // Skip if inside an Anim component
      return !el.closest('[class*="my-6"]') && !el.closest('[data-anim]')
    }) as HTMLElement[]

    textElements.forEach((el, i) => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 92%',
            toggleActions: 'play none none reverse',
          },
          delay: i * 0.05, // Stagger effect
        },
      )
    })

    // Add subtle parallax to headings
    const headings = Array.from(container.querySelectorAll('h2, h3')) as HTMLElement[]
    headings.forEach((heading) => {
      gsap.to(heading, {
        y: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: heading,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      })
    })

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (textElements.includes(st.vars?.trigger as HTMLElement) || headings.includes(st.vars?.trigger as HTMLElement)) {
          st.kill()
        }
      })
    }
  }, [])

  return <div ref={ref}>{children}</div>
}

