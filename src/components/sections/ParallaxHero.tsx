import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function ParallaxHero() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const title = titleRef.current
    const image = imageRef.current
    const particles = particlesRef.current

    if (!section || !title || !image) return

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      gsap.set([title, image], { opacity: 1 })
      return
    }

    const ctx = gsap.context(() => {
      // Pin the section with smooth pinning
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=250%',
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        markers: false,
      })

      // Title animation: fade and move up
      gsap.to(title, {
        y: -150,
        opacity: 0,
        scale: 0.8,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          markers: false,
        },
      })

      // Background parallax with scale
      gsap.to(image, {
        y: -250,
        scale: 1.4,
        opacity: 0.3,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          markers: false,
        },
      })

      // Particles animation if exists
      if (particles) {
        gsap.to(particles, {
          opacity: 0,
          y: -100,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
            markers: false,
          },
        })
      }

      // Refresh after setup
      setTimeout(() => ScrollTrigger.refresh(), 100)
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-900 via-black to-black"
    >
      {/* Animated background layers */}
      <div
        ref={imageRef}
        className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-purple-600/20 to-pink-600/30"
        style={{ willChange: 'transform' }}
      />
      
      {/* Particle effect */}
      <div
        ref={particlesRef}
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 1px, transparent 1px),
                             radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 1px, transparent 1px),
                             radial-gradient(circle at 40% 20%, rgba(255,255,255,0.08) 1px, transparent 1px)`,
          backgroundSize: '200px 200px, 300px 300px, 150px 150px',
          willChange: 'transform',
        }}
      />

      {/* Title */}
      <h1
        ref={titleRef}
        className="relative z-10 text-6xl md:text-8xl font-bold text-white text-center px-4"
        style={{ willChange: 'transform, opacity' }}
      >
        <span className="block mb-2">Dead Internet</span>
        <span className="block text-5xl md:text-7xl opacity-90">Theory</span>
      </h1>
    </section>
  )
}
