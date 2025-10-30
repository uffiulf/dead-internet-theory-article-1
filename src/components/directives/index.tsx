import type { ReactNode } from 'react'
import { useLayoutEffect, useRef } from 'react'
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

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || !preset) return

    const killAll = () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }

    const reduceMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      console.info('[ANIM] reduced-motion enabled, skipping heavy animations for:', preset)
      return
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

    // horizontal-scroll+pin timeline
    if (preset.startsWith('horizontal-scroll+pin')) {
      const container = el.querySelector('[data-hscroll]') as HTMLElement | null
      if (container) {
        const totalWidth = container.scrollWidth - container.clientWidth
        const st = ScrollTrigger.create({
          trigger: el,
          start: 'top top',
          end: () => `+=${totalWidth}`,
          scrub: true,
          pin: true,
          onUpdate: (self) => {
            const p = self.progress
            el.dispatchEvent(new CustomEvent('anim:progress', { detail: { progress: p }, bubbles: true }))
          },
        })
        gsap.to(container, { x: () => -totalWidth, ease: 'none', scrollTrigger: st })
      }
    }

    // parallax-layers+scroll-speed-variation
    if (preset.startsWith('parallax-layers+scroll-speed-variation')) {
      const layers = Array.from(el.querySelectorAll<HTMLElement>('[data-layer]'))
      layers.forEach((layer) => {
        const speed = Number(layer.dataset.speed || '0.2')
        gsap.to(layer, {
          yPercent: -speed * 100,
          ease: 'none',
          willChange: 'transform',
          scrollTrigger: { trigger: el, scrub: true },
        })
      })
    }

    // cascade-animation+auto-play-on-entry
    if (preset.startsWith('cascade-animation+auto-play-on-entry')) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 70%',
        once: true,
        onEnter: () => {
          console.info('[ANIM] firing graph:cascade')
          el.dispatchEvent(new CustomEvent('graph:cascade', { bubbles: true }))
        },
      })
    }

    // slow-fade-to-black+ambient-sound-fade
    if (preset.startsWith('slow-fade-to-black+ambient-sound-fade')) {
      const overlay = el.querySelector('[data-overlay]') as HTMLElement | null
      const audio = el.querySelector('audio') as HTMLAudioElement | null
      if (overlay) {
        gsap.to(overlay, {
          autoAlpha: 1,
          duration: 2.5,
          scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
        })
      }
      if (audio) {
        const updateVolume = (self: any) => {
          const v = Math.max(0, 1 - self.progress)
          audio.volume = v
        }
        ScrollTrigger.create({ trigger: el, start: 'top top', end: 'bottom top', scrub: true, onUpdate: updateVolume as any })
      }
    }

    // typewriter-effect+reveal-sequence: expose progress for children
    if (preset.startsWith('typewriter-effect+reveal-sequence')) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: true,
        onUpdate: (self) => {
          el.dispatchEvent(new CustomEvent('anim:progress', { detail: { progress: self.progress }, bubbles: true }))
        },
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

  if (v.startsWith('glitch')) {
    return (
      <motion.div
        style={{ willChange: 'transform, filter' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        whileHover={{ x: [0, -1, 1, 0], filter: ['hue-rotate(0deg)', 'hue-rotate(10deg)', 'hue-rotate(-10deg)', 'hue-rotate(0deg)'] }}
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.div>
    )
  }

  if (v.startsWith('text-highlight')) {
    return (
      <motion.span initial={{ backgroundSize: '0% 100%' }} whileInView={{ backgroundSize: '100% 100%' }} viewport={{ once: true }} transition={{ duration: 1 }}
        style={{ backgroundImage: 'linear-gradient(90deg, rgba(250,204,21,0.4), rgba(250,204,21,0.4))', backgroundRepeat: 'no-repeat' }}>
        {children}
      </motion.span>
    )
  }

  if (v.startsWith('visual-split')) {
    return (
      <motion.div initial={{ clipPath: 'inset(0 50% 0 0)' }} whileInView={{ clipPath: 'inset(0 0% 0 0)' }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
        {children}
      </motion.div>
    )
  }

  if (v.startsWith('typewriter-effect+reveal-sequence')) {
    return (
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.3 }}>
        {children}
      </motion.div>
    )
  }

  // default
  return <div>{children}</div>
}

import HumansVsBots from '../graphs/HumansVsBots'
import Timeline from '../graphs/Timeline'
import Flowchart from '../graphs/Flowchart'
import Cascade from '../graphs/Cascade'
import ProjectionArea from '../graphs/ProjectionArea'
import { ProjectionProvider, useProjection } from './ProjectionContext'
import GraphInfobox from '../graphs/GraphInfobox'
import GraphSSBContrast from '../graphs/GraphSSBContrast'
import AudioOnEnter from '../media/AudioOnEnter'

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
  if (v.startsWith('timeline')) {
    const items = [
      { year: 2021, label: 'Agora Road post' },
      { year: 2023, label: 'ChatGPT launch' },
      { year: 2024, label: 'Shrimp Jesus' },
      { year: 2025, label: 'Altman tweet' },
    ]
    return <Timeline items={items} />
  }
  if (v.startsWith('flowchart')) {
    return <Flowchart />
  }
  if (v.startsWith('cascade')) {
    return <Cascade />
  }
  if (v.startsWith('infobox')) {
    return <GraphInfobox title="Andel bots" value="49,6%" caption="Global trafikk 2023" />
  }
  if (v.startsWith('ssb-contrast')) {
    return <GraphSSBContrast />
  }
  if (v.startsWith('projection-slider')) {
    return (
      <ProjectionProvider>
        <ProjectionSlider />
        <ProjectionArea />
      </ProjectionProvider>
    )
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
  if (lower.startsWith('audio-on-enter')) {
    const idm = v.match(/id:(\S+)/i)
    const id = idm?.[1]
    return (
      <AudioOnEnter id={id}>
        <div />
      </AudioOnEnter>
    )
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

function ProjectionSlider() {
  const { value, setValue } = useProjection()
  return (
    <div className="my-4 flex items-center gap-3">
      <span className="text-sm text-gray-600">Projection</span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => {
          const v = parseFloat(e.target.value)
          setValue(v)
          window.dispatchEvent(new CustomEvent('projection:change', { detail: { value: v } }))
        }}
        className="w-full max-w-sm"
      />
      <span className="w-12 text-right text-sm tabular-nums">{Math.round(value * 100)}%</span>
    </div>
  )
}
