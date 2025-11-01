import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function ParallaxHero() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const title = titleRef.current
    const subtitle = subtitleRef.current
    const image = imageRef.current
    const particles = particlesRef.current

    if (!section || !title || !image) return

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      gsap.set([title, image, subtitle], { opacity: 1 })
      return
    }

    const ctx = gsap.context(() => {
      // Pin the section with extended duration
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=300%',
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        markers: false,
      })

      // Title animation: dramatic fade and move up
      gsap.to(title, {
        y: -200,
        opacity: 0,
        scale: 0.7,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          markers: false,
        },
      })

      // Subtitle animation
      if (subtitle) {
        gsap.to(subtitle, {
          y: -100,
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
      }

      // Background parallax with dramatic scale and opacity
      gsap.to(image, {
        y: -300,
        scale: 1.6,
        opacity: 0.2,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          markers: false,
        },
      })

      // Particles fade out
      if (particles) {
        gsap.to(particles, {
          opacity: 0,
          y: -150,
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
      setTimeout(() => ScrollTrigger.refresh(), 150)
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
        className="absolute inset-0 bg-gradient-to-r from-blue-600/40 via-purple-600/30 to-pink-600/40"
        style={{ willChange: 'transform, opacity' }}
      />
      
      {/* Animated particle effect */}
      <div
        ref={particlesRef}
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 2px, transparent 2px),
                             radial-gradient(circle at 80% 80%, rgba(255,255,255,0.12) 2px, transparent 2px),
                             radial-gradient(circle at 40% 20%, rgba(255,255,255,0.1) 2px, transparent 2px),
                             radial-gradient(circle at 60% 70%, rgba(255,255,255,0.08) 1px, transparent 1px)`,
          backgroundSize: '250px 250px, 350px 350px, 200px 200px, 180px 180px',
          backgroundPosition: '0% 0%, 100% 100%, 50% 50%, 80% 20%',
          willChange: 'transform, opacity',
        }}
      />

      {/* Title with split animation */}
      <div className="relative z-10 text-center px-4">
        <h1
          ref={titleRef}
          className="text-7xl md:text-9xl font-bold text-white mb-4"
          style={{ willChange: 'transform, opacity' }}
        >
          <span className="block mb-2">Dead Internet</span>
        </h1>
        <div
          ref={subtitleRef}
          className="text-5xl md:text-7xl font-light text-white/90"
          style={{ willChange: 'transform, opacity' }}
        >
          Theory
        </div>
      </div>
    </section>
  )
}
