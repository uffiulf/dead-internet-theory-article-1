import type { ReactNode } from 'react'
import { useLayoutEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

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

    const reduceMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      gsap.set(el, { autoAlpha: 1 })
      return
    }

    const triggers: ScrollTrigger[] = []

    // parallax+fade-in hero
    if (preset.startsWith('parallax+fade-in')) {
      const media = el.querySelector('[data-parallax]') as HTMLElement | null
      
      // Fade in container with scale
      const fadeIn = gsap.fromTo(
        el,
        { autoAlpha: 0, y: 50, scale: 0.95 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 1.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
            markers: false,
          },
        },
      )
      
      // Parallax image with stronger effect
      if (media) {
        media.style.willChange = 'transform'
        const parallax = gsap.to(media, {
          yPercent: -35,
          scale: 1.15,
          rotation: 0.5,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
            markers: false,
          },
        })
        triggers.push(parallax.scrollTrigger!)
      }
      triggers.push(fadeIn.scrollTrigger!)
    }

    // sticky-graph+count-up
    if (preset.startsWith('sticky-graph+count-up')) {
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: '+=150%',
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        markers: false,
        onEnter: () => {
          el.dispatchEvent(new CustomEvent('graph:enter', { bubbles: true }))
          window.dispatchEvent(new CustomEvent('graph:enter', { bubbles: true }))
        },
        onLeaveBack: () => {
          el.dispatchEvent(new CustomEvent('graph:leaveBack', { bubbles: true }))
        },
      })
      triggers.push(st)
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
          scrub: 1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          markers: false,
          onUpdate: (self) => {
            const p = self.progress
            el.dispatchEvent(new CustomEvent('anim:progress', { detail: { progress: p }, bubbles: true }))
            window.dispatchEvent(new CustomEvent('anim:progress', { detail: { progress: p } }))
          },
        })
        gsap.to(container, {
          x: () => -totalWidth,
          ease: 'none',
          scrollTrigger: st,
        })
        triggers.push(st)
      }
    }

    // parallax-layers+scroll-speed-variation
    if (preset.startsWith('parallax-layers+scroll-speed-variation')) {
      const layers = Array.from(el.querySelectorAll<HTMLElement>('[data-layer]'))
      layers.forEach((layer) => {
        const speed = Number(layer.dataset.speed || '0.2')
        layer.style.willChange = 'transform'
        const anim = gsap.to(layer, {
          yPercent: -speed * 200,
          scale: 1 + speed * 0.3,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
            markers: false,
          },
        })
        if (anim.scrollTrigger) triggers.push(anim.scrollTrigger)
      })
      
      // Auto-parallax for images with stronger effect
      const images = Array.from(el.querySelectorAll<HTMLElement>('img:not([data-layer])'))
      images.forEach((img, i) => {
        const speed = 0.25 + (i % 3) * 0.2
        img.style.willChange = 'transform'
        const anim = gsap.to(img, {
          yPercent: -speed * 200,
          scale: 1 + speed * 0.25,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
            markers: false,
          },
        })
        if (anim.scrollTrigger) triggers.push(anim.scrollTrigger)
      })
      
      // Also animate paragraphs with subtle parallax
      const paragraphs = Array.from(el.querySelectorAll<HTMLElement>('p'))
      paragraphs.forEach((p, i) => {
        if (i % 2 === 0) {
          p.style.willChange = 'transform'
          const anim = gsap.to(p, {
            y: -20 * (i % 3),
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
              markers: false,
            },
          })
          if (anim.scrollTrigger) triggers.push(anim.scrollTrigger)
        }
      })
    }

    // cascade-animation+auto-play-on-entry
    if (preset.startsWith('cascade-animation+auto-play-on-entry')) {
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top 75%',
        once: true,
        markers: false,
        onEnter: () => {
          el.dispatchEvent(new CustomEvent('graph:cascade', { bubbles: true }))
          window.dispatchEvent(new CustomEvent('graph:cascade', { bubbles: true }))
        },
      })
      triggers.push(st)
    }

    // slow-fade-to-black+ambient-sound-fade
    if (preset.startsWith('slow-fade-to-black+ambient-sound-fade')) {
      const overlay = el.querySelector('[data-overlay]') as HTMLElement | null
      const audio = el.querySelector('audio') as HTMLAudioElement | null
      
      if (overlay) {
        const anim = gsap.to(overlay, {
          autoAlpha: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
            markers: false,
          },
        })
        if (anim.scrollTrigger) triggers.push(anim.scrollTrigger)
      }
      
      if (audio) {
        const st = ScrollTrigger.create({
          trigger: el,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          markers: false,
          onUpdate: (self) => {
            audio.volume = Math.max(0, 1 - self.progress)
          },
        })
        triggers.push(st)
      }
    }

    // typewriter-effect+reveal-sequence
    if (preset.startsWith('typewriter-effect+reveal-sequence')) {
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        end: 'bottom 15%',
        scrub: 1,
        markers: false,
        onUpdate: (self) => {
          const p = self.progress
          el.dispatchEvent(new CustomEvent('anim:progress', { detail: { progress: p }, bubbles: true }))
          window.dispatchEvent(new CustomEvent('anim:progress', { detail: { progress: p } }))
        },
      })
      triggers.push(st)
    }

    // fade-in-sequence+audio-on-hover
    if (preset.startsWith('fade-in-sequence+audio-on-hover')) {
      const children = Array.from(el.children) as HTMLElement[]
      children.forEach((child, i) => {
        const anim = gsap.fromTo(
          child,
          { autoAlpha: 0, y: 40, scale: 0.95 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: child,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
              markers: false,
            },
            delay: i * 0.2,
          },
        )
        if (anim.scrollTrigger) triggers.push(anim.scrollTrigger)
        
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
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top center',
        end: 'bottom center',
        markers: false,
        onUpdate: (self) => {
          const p = self.progress
          el.dispatchEvent(new CustomEvent('projection:change', { detail: { progress: p }, bubbles: true }))
          window.dispatchEvent(new CustomEvent('projection:change', { detail: { progress: p } }))
        },
      })
      triggers.push(st)
    }

    // Refresh after all triggers are created
    setTimeout(() => {
      ScrollTrigger.refresh()
    }, 50)

    return () => {
      triggers.forEach((st) => st.kill())
    }
  }, [preset])

  return (
    <div ref={ref} className="my-6">
      {children}
    </div>
  )
}

export function Fx({ value, children }: CommonProps) {
  const v = (value ?? '').toLowerCase()
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion) return

    const triggers: ScrollTrigger[] = []

    // slow zoom + ambient sound fade-in
    if (v.includes('slow zoom') && v.includes('ambient sound')) {
      const media = el.querySelector('img, video') as HTMLElement | null
      if (media) {
        media.style.willChange = 'transform'
        const anim = gsap.fromTo(
          media,
          { scale: 0.9, opacity: 0.6 },
          {
            scale: 1.15,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
              markers: false,
            },
          },
        )
        if (anim.scrollTrigger) triggers.push(anim.scrollTrigger)
      }
    }

    // glitch effect on scroll
    if (v.includes('glitch') && v.includes('scroll')) {
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: 1,
        markers: false,
        onUpdate: (self) => {
          const p = self.progress
          if (p > 0.2 && p < 0.8) {
            const intensity = Math.sin(p * Math.PI * 6) * 0.5
            gsap.set(el, {
              x: intensity * 3,
              y: intensity * 2,
              filter: `hue-rotate(${intensity * 15}deg) contrast(${1 + intensity * 0.2})`,
            })
          } else {
            gsap.set(el, { x: 0, y: 0, filter: 'none' })
          }
        },
      })
      triggers.push(st)
    }

    // text highlight on scroll
    if (v.includes('text highlight') && v.includes('scroll')) {
      el.style.backgroundImage = 'linear-gradient(90deg, rgba(250,204,21,0.5), rgba(250,204,21,0.5))'
      el.style.backgroundRepeat = 'no-repeat'
      el.style.backgroundSize = '0% 100%'
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        end: 'bottom 15%',
        scrub: 1,
        markers: false,
        onUpdate: (self) => {
          const p = self.progress
          el.style.backgroundSize = `${p * 100}% 100%`
        },
      })
      triggers.push(st)
    }

    // surreal transition - images blend and morph
    if (v.includes('surreal transition') || v.includes('blend and morph')) {
      const images = Array.from(el.querySelectorAll('img')) as HTMLElement[]
      images.forEach((img, i) => {
        img.style.willChange = 'transform, filter, opacity'
        const anim = gsap.fromTo(
          img,
          { opacity: 0, scale: 0.7, filter: 'blur(15px)', y: 50 },
          {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            y: 0,
            duration: 1.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: img,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
              markers: false,
            },
            delay: i * 0.4,
          },
        )
        if (anim.scrollTrigger) triggers.push(anim.scrollTrigger)
      })
    }

    // visual echo effect - images repeat and fade
    if (v.includes('visual echo') || v.includes('repeat and fade')) {
      const images = Array.from(el.querySelectorAll('img')) as HTMLElement[]
      images.forEach((img) => {
        img.style.willChange = 'transform, opacity'
        const st = ScrollTrigger.create({
          trigger: img,
          start: 'top 85%',
          end: 'bottom 15%',
          scrub: 1,
          markers: false,
          onUpdate: (self) => {
            const p = self.progress
            img.style.opacity = String(p)
            img.style.transform = `scale(${1 + p * 0.15}) translateY(${-p * 20}px)`
          },
        })
        triggers.push(st)
      })
    }

    // text overlay pulsates
    if (v.includes('pulsates') || v.includes('text overlay')) {
      const anim = gsap.to(el, {
        scale: 1.05,
        duration: 1.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none pause reverse',
          markers: false,
        },
      })
      if (anim.scrollTrigger) triggers.push(anim.scrollTrigger)
    }

    // screen close animation, light dims
    if (v.includes('screen close') || v.includes('light dims')) {
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
        markers: false,
        onUpdate: (self) => {
          const p = self.progress
          gsap.set(el, {
            opacity: 1 - p * 0.9,
            filter: `brightness(${1 - p * 0.7})`,
          })
        },
      })
      triggers.push(st)
    }

    // subtle digital noise
    if (v.includes('digital noise') || v.includes('servers humming')) {
      const noiseOverlay = document.createElement('div')
      noiseOverlay.style.cssText = `
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: 0.04;
        background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.15) 2px, rgba(255,255,255,0.15) 4px),
                          repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px);
        mix-blend-mode: overlay;
        z-index: 1;
      `
      el.style.position = 'relative'
      el.appendChild(noiseOverlay)
      gsap.to(noiseOverlay, {
        opacity: 0.08,
        duration: 2,
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
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top center',
        end: 'bottom top',
        scrub: 1,
        markers: false,
        onUpdate: (self) => {
          overlay.style.opacity = String(self.progress)
        },
      })
      triggers.push(st)
    }

    // final fade out
    if (v.includes('final fade out')) {
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top center',
        end: 'bottom top',
        scrub: 1,
        markers: false,
        onUpdate: (self) => {
          gsap.set(el, { opacity: 1 - self.progress })
        },
      })
      triggers.push(st)
    }

    setTimeout(() => ScrollTrigger.refresh(), 50)

    return () => {
      triggers.forEach((st) => st.kill())
    }
  }, [v, prefersReducedMotion])

  // Framer Motion for simple animations
  if (v.startsWith('fade-in') && !v.includes('scroll')) {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '0px 0px -100px 0px' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    )
  }

  if (v.startsWith('slide-in')) {
    const dir = v.includes('left') ? -50 : v.includes('right') ? 50 : 0
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, x: dir }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '0px 0px -100px 0px' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    )
  }

  if (v.startsWith('glitch') && !v.includes('scroll')) {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        whileHover={{
          x: [0, -2, 2, 0],
          filter: ['hue-rotate(0deg)', 'hue-rotate(15deg)', 'hue-rotate(-15deg)', 'hue-rotate(0deg)'],
        }}
        transition={{ duration: 0.3 }}
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
        transition={{ duration: 1.2, ease: 'easeInOut' }}
        style={{
          backgroundImage: 'linear-gradient(90deg, rgba(250,204,21,0.5), rgba(250,204,21,0.5))',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {children}
      </motion.span>
    )
  }

  if (v.startsWith('visual-split')) {
    return (
      <motion.div
        ref={ref}
        initial={{ clipPath: 'inset(0 50% 0 0)' }}
        whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    )
  }

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
    const m = v.match(/src:(\S+)/)
    const src = m?.[1]
    const altMatch = v.match(/"([^"]+)"/)
    const alt = altMatch?.[1] ?? 'photo'
    if (src) {
      return (
        <img
          data-parallax
          alt={alt}
          src={src}
          loading="lazy"
          className="mx-auto my-6 w-full max-w-4xl rounded-lg shadow-lg"
          style={{ willChange: 'transform' }}
        />
      )
    } else {
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
    return src ? (
      <audio controls preload="none" src={src} className="my-3 w-full" />
    ) : (
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
