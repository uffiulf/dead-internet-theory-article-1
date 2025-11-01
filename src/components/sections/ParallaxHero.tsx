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

  useLayoutEffect(() => {
    const section = sectionRef.current
    const title = titleRef.current
    const image = imageRef.current

    if (!section || !title || !image) return

    const ctx = gsap.context(() => {
      // Pin the section
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=200%',
        pin: true,
        anticipatePin: 1,
      })

      // Parallax title
      gsap.to(title, {
        y: -100,
        opacity: 0,
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      // Parallax image
      gsap.to(image, {
        y: -200,
        scale: 1.2,
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
      
      // Refresh ScrollTrigger after setting up animations
      ScrollTrigger.refresh()
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-900 to-black"
    >
      <div
        ref={imageRef}
        className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"
      />
      <h1
        ref={titleRef}
        className="relative z-10 text-6xl md:text-8xl font-bold text-white text-center"
      >
        Dead Internet Theory
      </h1>
    </section>
  )
}
