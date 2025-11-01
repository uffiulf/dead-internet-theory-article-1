import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

type ScrollApi = { lenis: Lenis | null }
const Ctx = createContext<ScrollApi>({ lenis: null })
export const useScroll = () => useContext(Ctx)

export function ScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      console.info('[ScrollProvider] reduced motion – disabling Lenis')
      return
    }
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true })
    lenisRef.current = lenis

    const onScroll = () => ScrollTrigger.update()
    lenis.on('scroll', onScroll)

    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (arguments.length && typeof value === 'number') {
          lenis.scrollTo(value, { immediate: true })
        }
        return lenis.scroll
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }
      },
      // Add scrollHeight for proper calculation
      scrollHeight() {
        return document.documentElement.scrollHeight
      },
    })

    ScrollTrigger.defaults({ scroller: document.body })

    // Wait for DOM to be ready, then refresh ScrollTrigger
    const refreshScrollTrigger = () => {
      // Wait a bit for all components to mount
      setTimeout(() => {
        ScrollTrigger.refresh()
      }, 200)
    }
    
    // Initial refresh after setup
    refreshScrollTrigger()
    
    // Also refresh when DOM is ready
    if (document.readyState === 'complete') {
      refreshScrollTrigger()
    } else {
      window.addEventListener('load', refreshScrollTrigger)
    }

    // RAF loop for Lenis
    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    // Also use GSAP ticker for integration
    const tickerFn = (t: number) => lenis.raf(t * 1000)
    gsap.ticker.add(tickerFn)
    gsap.ticker.lagSmoothing(0)

    // Refresh ScrollTrigger on window resize
    const handleResize = () => {
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
      window.removeEventListener('load', refreshScrollTrigger)
      lenis.off('scroll', onScroll)
      gsap.ticker.remove(tickerFn)
      lenis.destroy()
      ScrollTrigger.getAll().forEach((st) => st.kill())
    }
  }, [])

  const api = useMemo<ScrollApi>(() => ({ lenis: lenisRef.current }), [])
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}


