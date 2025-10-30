import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
// import { parse } from './presets'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

type CommonProps = { value?: string; children?: ReactNode }

export function Anim({ value, children }: CommonProps) {
  const preset = (value ?? '').trim()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !preset) return

    const killAll = () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }

    // parallax+fade-in hero
    if (preset.startsWith('parallax+fade-in')) {
      const media = el.querySelector('[data-parallax]') as HTMLElement | null
      gsap.fromTo(
        el,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 1.2, scrollTrigger: { trigger: el, start: 'top 80%' } },
      )
      if (media) {
        gsap.to(media, {
          yPercent: -20,
          ease: 'none',
          scrollTrigger: { trigger: el, scrub: true },
        })
      }
    }

    // sticky-graph+count-up
    if (preset.startsWith('sticky-graph+count-up')) {
      ScrollTrigger.create({
        trigger: ref.current!,
        start: 'top top',
        end: '+=120%',
        pin: true,
        onEnter: () => ref.current?.dispatchEvent(new CustomEvent('graph:enter', { bubbles: true })),
      })
    }

    return () => killAll()
  }, [preset])

  return (
    <div ref={ref} className="my-6">
      {children}
    </div>
  )
}

export function Fx({ value, children }: CommonProps) {
  const v = (value ?? '').toLowerCase()
  const speed = v.includes('slow') ? 1.0 : v.includes('fast') ? 0.3 : 0.6
  const dir = v.includes('left') ? -16 : v.includes('right') ? 16 : 0

  if (v.startsWith('fade-in')) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: speed }}>
        {children}
      </motion.div>
    )
  }

  if (v.startsWith('slide-in')) {
    return (
      <motion.div initial={{ opacity: 0, x: dir }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: speed }}>
        {children}
      </motion.div>
    )
  }

  // default
  return <div>{children}</div>
}

import HumansVsBots from '../graphs/HumansVsBots'

export function Graph({ value }: CommonProps) {
  const v = (value ?? '').toLowerCase()
  if (v.startsWith('humans-vs-bots')) {
    const data = [
      { year: 2013, humans: 60, bots: 40 },
      { year: 2018, humans: 56, bots: 44 },
      { year: 2021, humans: 57.7, bots: 42.3 },
      { year: 2023, humans: 50.4, bots: 49.6 },
      { year: 2025, humans: 49.5, bots: 50.5 },
    ]
    return <HumansVsBots data={data} />
  }
  return <div className="text-sm text-emerald-700">[GRAPH unsupported]: {value}</div>
}

export function Media({ value }: CommonProps) {
  const v = (value ?? '')
  const lower = v.toLowerCase()
  if (lower.startsWith('photo')) {
    // Expecting: photo "Title" src:<url>
    const m = v.match(/src:(\S+)/)
    const src = m?.[1]
    const altMatch = v.match(/"([^"]+)"/)
    const alt = altMatch?.[1] ?? 'photo'
    return src ? (
      <img data-parallax alt={alt} src={src} loading="lazy" className="mx-auto my-4 w-full max-w-3xl rounded" />
    ) : (
      <div className="text-amber-700 text-sm">[MEDIA photo] {alt}</div>
    )
  }
  if (lower.startsWith('audio')) {
    const m = v.match(/src:(\S+)/)
    const src = m?.[1]
    return src ? <audio controls preload="none" src={src} className="my-3 w-full" /> : <div className="text-amber-700 text-sm">[MEDIA audio]</div>
  }
  if (lower.startsWith('video')) {
    const m = v.match(/src:(\S+)/)
    const src = m?.[1]
    return src ? (
      <video className="my-3 w-full rounded" src={src} autoPlay muted playsInline controls />
    ) : (
      <div className="text-amber-700 text-sm">[MEDIA video]</div>
    )
  }
  if (lower.startsWith('quote-card')) {
    const authorMatch = v.match(/author:([^\s]+)/i)
    const textMatch = v.match(/text:(.+)$/i)
    return (
      <blockquote className="my-4 border-l-4 border-gray-400 pl-4 italic">
        <p>{textMatch?.[1]}</p>
        <footer className="mt-1 text-sm">— {authorMatch?.[1] ?? 'Ukjent'}</footer>
      </blockquote>
    )
  }
  return <div className="text-amber-700 text-sm">[MEDIA unsupported]: {value}</div>
}
