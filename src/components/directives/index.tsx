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
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none reverse' },
        },
      )
      if (media) {
        gsap.to(media, {
          yPercent: -25,
          scale: 1.05,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
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
            window.dispatchEvent(new CustomEvent('anim:progress', { detail: { progress: p } }))
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
        layer.style.willChange = 'transform'
        gsap.to(layer, {
          yPercent: -speed * 100,
          scale: 1 + speed * 0.1,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
      })
      // Also handle images without data-layer for gallery effects
      const images = Array.from(el.querySelectorAll<HTMLElement>('img:not([data-layer])'))
      images.forEach((img, i) => {
        const speed = 0.15 + (i % 3) * 0.1
        gsap.to(img, {
          yPercent: -speed * 100,
          scale: 1 + speed * 0.15,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
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
          const p = self.progress
          el.dispatchEvent(new CustomEvent('anim:progress', { detail: { progress: p }, bubbles: true }))
          window.dispatchEvent(new CustomEvent('anim:progress', { detail: { progress: p } }))
        },
      })
    }

    // fade-in-sequence+audio-on-hover: staggered fade-in for children, audio on hover
    if (preset.startsWith('fade-in-sequence+audio-on-hover')) {
      const children = Array.from(el.children) as HTMLElement[]
      children.forEach((child, i) => {
        gsap.fromTo(
          child,
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: child,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
            delay: i * 0.15,
          },
        )
        // Audio on hover
        const audio = child.querySelector('audio') as HTMLAudioElement | null
        if (audio) {
          child.addEventListener('mouseenter', () => {
            audio.volume = 0.3
            audio.play().catch(() => {})
          })
          child.addEventListener('mouseleave', () => {
            audio.pause()
          })
        }
      })
    }

    // interactive-slider+dynamic-projection
    if (preset.startsWith('interactive-slider+dynamic-projection')) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top center',
        end: 'bottom center',
        onUpdate: (self) => {
          const p = self.progress
          el.dispatchEvent(new CustomEvent('projection:change', { detail: { progress: p }, bubbles: true }))
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
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Scroll-triggered effects using GSAP
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion) return

    // slow zoom + ambient sound fade-in
    if (v.includes('slow zoom') && v.includes('ambient sound')) {
      const media = el.querySelector('img, video') as HTMLElement | null
      if (media) {
        gsap.fromTo(
          media,
          { scale: 1, opacity: 0.5 },
          {
            scale: 1.1,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        )
      }
    }

    // glitch effect on scroll
    if (v.includes('glitch') && v.includes('scroll')) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress
          if (p > 0.1 && p < 0.9) {
            const intensity = Math.sin(p * Math.PI * 4) * 0.5
            gsap.set(el, {
              x: intensity * 2,
              filter: `hue-rotate(${intensity * 10}deg)`,
            })
          } else {
            gsap.set(el, { x: 0, filter: 'none' })
          }
        },
      })
    }

    // text highlight on scroll
    if (v.includes('text highlight') && v.includes('scroll')) {
      el.style.backgroundImage = 'linear-gradient(90deg, rgba(250,204,21,0.4), rgba(250,204,21,0.4))'
      el.style.backgroundRepeat = 'no-repeat'
      el.style.backgroundSize = '0% 100%'
      ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress
          el.style.backgroundSize = `${p * 100}% 100%`
        },
      })
    }

    // surreal transition - images blend and morph
    if (v.includes('surreal transition') || v.includes('blend and morph')) {
      const images = Array.from(el.querySelectorAll('img')) as HTMLElement[]
      images.forEach((img, i) => {
        gsap.fromTo(
          img,
          { opacity: 0, scale: 0.8, filter: 'blur(10px)' },
          {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: 1.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: img,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
            delay: i * 0.3,
          },
        )
      })
    }

    // visual echo effect - images repeat and fade
    if (v.includes('visual echo') || v.includes('repeat and fade')) {
      const images = Array.from(el.querySelectorAll('img')) as HTMLElement[]
      images.forEach((img) => {
        ScrollTrigger.create({
          trigger: img,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: true,
          onUpdate: (self) => {
            const p = self.progress
            img.style.opacity = String(p)
            img.style.transform = `scale(${1 + p * 0.1})`
          },
        })
      })
    }

    // text overlay pulsates
    if (v.includes('pulsates') || v.includes('text overlay')) {
      gsap.to(el, {
        opacity: 0.7,
        scale: 1,
        duration: 1,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none pause reverse',
        },
      })
      gsap.to(el, {
        opacity: 1,
        scale: 1.05,
        duration: 1,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 0.5,
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none pause reverse',
        },
      })
    }

    // screen close animation, light dims
    if (v.includes('screen close') || v.includes('light dims')) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress
          gsap.set(el, {
            opacity: 1 - p * 0.8,
            filter: `brightness(${1 - p * 0.5})`,
          })
        },
      })
    }

    // subtle digital noise
    if (v.includes('digital noise') || v.includes('servers humming')) {
      const noiseOverlay = document.createElement('div')
      noiseOverlay.style.cssText = `
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: 0.03;
        background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px);
        mix-blend-mode: overlay;
      `
      el.style.position = 'relative'
      el.appendChild(noiseOverlay)
      gsap.to(noiseOverlay, {
        opacity: 0.06,
        duration: 1.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })
    }

    // screen fades to complete black
    if (v.includes('fades to complete black') || v.includes('fade to black')) {
      const overlay = document.createElement('div')
      overlay.style.cssText = `
        position: absolute;
        inset: 0;
        background: black;
        opacity: 0;
        pointer-events: none;
        z-index: 9999;
      `
      el.style.position = 'relative'
      el.appendChild(overlay)
      ScrollTrigger.create({
        trigger: el,
        start: 'top center',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          overlay.style.opacity = String(self.progress)
        },
      })
    }

    // final fade out
    if (v.includes('final fade out')) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top center',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          gsap.set(el, { opacity: 1 - self.progress })
        },
      })
    }
  }, [v, prefersReducedMotion])

  // Framer Motion effects (for non-scroll-triggered)
  if (v.startsWith('fade-in') && !v.includes('scroll')) {
    return (
      <motion.div ref={ref} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: speed }}>
        {children}
      </motion.div>
    )
  }

  if (v.startsWith('slide-in')) {
    return (
      <motion.div ref={ref} initial={{ opacity: 0, x: dir }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: speed }}>
        {children}
      </motion.div>
    )
  }

  if (v.startsWith('glitch') && !v.includes('scroll')) {
    return (
      <motion.div
        ref={ref}
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

  if (v.startsWith('text-highlight') && !v.includes('scroll')) {
    return (
      <motion.span
        ref={ref}
        initial={{ backgroundSize: '0% 100%' }}
        whileInView={{ backgroundSize: '100% 100%' }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        style={{ backgroundImage: 'linear-gradient(90deg, rgba(250,204,21,0.4), rgba(250,204,21,0.4))', backgroundRepeat: 'no-repeat' }}
      >
        {children}
      </motion.span>
    )
  }

  if (v.startsWith('visual-split')) {
    return (
      <motion.div ref={ref} initial={{ clipPath: 'inset(0 50% 0 0)' }} whileInView={{ clipPath: 'inset(0 0% 0 0)' }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
        {children}
      </motion.div>
    )
  }

  if (v.startsWith('typewriter-effect+reveal-sequence')) {
    return (
      <motion.div ref={ref} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.3 }}>
        {children}
      </motion.div>
    )
  }

  // Default wrapper for scroll-triggered effects
  return <div ref={ref}>{children}</div>
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
  if (v.startsWith('humans-vs-bots') || v.includes('line chart')) {
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
  if (v.startsWith('cascade') || v.includes('cascade model')) {
    return <Cascade />
  }
  if (v.startsWith('infobox')) {
    return <GraphInfobox title="Andel bots" value="49,6%" caption="Global trafikk 2023" />
  }
  if (v.startsWith('ssb-contrast')) {
    return <GraphSSBContrast />
  }
  if (v.startsWith('projection-slider') || v.includes('interactive timeline slider')) {
    return (
      <ProjectionProvider>
        <ProjectionSlider />
        <ProjectionArea />
      </ProjectionProvider>
    )
  }
  if (v.includes('d3') || v.includes('force-directed') || v.includes('information spread')) {
    return <Cascade />
  }
  if (v.includes('quote card')) {
    // Quote cards are handled by Media component, but we can show a placeholder here
    return (
      <div className="my-4 rounded border border-gray-300 bg-gray-50 p-4 text-center text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
        💬 Quote card
      </div>
    )
  }
  if (v.includes('projection visualization')) {
    return (
      <ProjectionProvider>
        <ProjectionArea />
      </ProjectionProvider>
    )
  }
  // Fallback for unsupported graphs
  return (
    <div className="my-6 rounded border border-dashed border-emerald-300/60 bg-emerald-50/40 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-400/40 dark:bg-emerald-400/10 dark:text-emerald-200">
      <strong>GRAPH</strong>: {value}
    </div>
  )
}

export function Media({ value }: CommonProps) {
  const v = (value ?? '')
  const lower = v.toLowerCase()
  if (lower.startsWith('photo')) {
    // Expecting: photo "Title" src:<url> OR photo "Title" - description (fallback to placeholder)
    const m = v.match(/src:(\S+)/)
    const src = m?.[1]
    const altMatch = v.match(/"([^"]+)"/)
    const alt = altMatch?.[1] ?? 'photo'
    if (src) {
      return (
        <img data-parallax alt={alt} src={src} loading="lazy" className="mx-auto my-4 w-full max-w-3xl rounded" />
      )
    } else {
      // Fallback: show placeholder with description
      return (
        <div className="mx-auto my-4 w-full max-w-3xl rounded border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-600 dark:bg-gray-800">
          <div className="text-sm text-gray-500 dark:text-gray-400">📷 {alt}</div>
          <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">{v.replace(/photo\s+"[^"]+"\s*/, '').trim()}</div>
        </div>
      )
    }
  }
  if (lower.startsWith('audio')) {
    const m = v.match(/src:(\S+)/)
    const src = m?.[1]
    return src ? <audio controls preload="none" src={src} className="my-3 w-full" /> : (
      <div className="my-3 rounded border border-gray-300 bg-gray-50 p-4 text-center text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
        🎵 {v.replace(/audio\s+/, '').trim()}
      </div>
    )
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
      <div className="my-3 rounded border border-gray-300 bg-gray-50 p-4 text-center text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
        🎬 {v.replace(/video\s+/, '').trim()}
      </div>
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
  // Fallback for unsupported media types
  return (
    <div className="my-4 rounded border border-dashed border-amber-300/60 bg-amber-50/40 px-3 py-2 text-sm text-amber-900 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-200">
      <strong>MEDIA</strong>: {value}
    </div>
  )
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
