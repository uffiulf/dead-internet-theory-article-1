import { useEffect, useRef, useState } from 'react'
import type { AnimProgressEventDetail } from '../../types/events'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

type Milestone = { year: number; label: string }

export default function Timeline({ items }: { items: Milestone[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const milestonesRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    
    const onProg = (e: Event) => {
      const customEvent = e as CustomEvent<AnimProgressEventDetail>
      const detail = customEvent.detail
      if (detail && typeof detail.progress === 'number') setProgress(detail.progress)
    }
    el.addEventListener('anim:progress', onProg as EventListener)
    
    // Fade in timeline on scroll
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 30 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      },
    )
    
    // Animate milestones in sequence based on progress
    milestonesRef.current.forEach((milestone, i) => {
      if (milestone) {
        const threshold = (i + 1) / items.length
        const isVisible = progress >= threshold - 0.1
        
        gsap.to(milestone, {
          autoAlpha: isVisible ? 1 : 0.3,
          y: isVisible ? 0 : 10,
          duration: 0.5,
          ease: 'power2.out',
        })
      }
    })
    
    return () => {
      el.removeEventListener('anim:progress', onProg as EventListener)
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars?.trigger === el) st.kill()
      })
    }
  }, [progress, items.length])

  return (
    <div ref={ref} className="relative my-6 w-full" data-hscroll>
      <div className="h-1 bg-gray-200 dark:bg-gray-700" />
      <div className="absolute left-0 top-0 h-1 bg-blue-500 transition-all duration-300" style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }} />
      <div className="mt-4 flex gap-8">
        {items.map((m, i) => (
          <div 
            key={m.year} 
            ref={(el) => { if (el) milestonesRef.current[i] = el }}
            className="min-w-[220px]"
          >
            <div className="text-sm text-gray-500 dark:text-gray-400">{m.year}</div>
            <div className="font-medium text-gray-900 dark:text-gray-100">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}


