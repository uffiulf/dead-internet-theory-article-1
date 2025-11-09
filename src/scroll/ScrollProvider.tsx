/* eslint-disable react-refresh/only-export-components */
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

    // Configure ScrollTrigger to work with Lenis
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (arguments.length && typeof value === 'number') {
          lenis.scrollTo(value, { immediate: true })
        }
        return lenis.scroll
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        }
      },
      scrollHeight() {
        return document.documentElement.scrollHeight
      },
    })

    // Set default scroller for ScrollTrigger
    ScrollTrigger.defaults({ scroller: document.body })
    
    // Important: Refresh ScrollTrigger after setting up the proxy
    ScrollTrigger.refresh()

    // Wait for DOM to be ready, then refresh ScrollTrigger
    const refreshScrollTrigger = () => {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        ScrollTrigger.refresh()
      })
    }
    
    const handleLoad = () => refreshScrollTrigger()
    const handleDOMContentLoaded = () => refreshScrollTrigger()
    
    // Initial refresh after setup
    setTimeout(refreshScrollTrigger, 100)
    
    // Also refresh when DOM is ready
    if (document.readyState === 'complete') {
      refreshScrollTrigger()
    } else {
      window.addEventListener('load', handleLoad)
      document.addEventListener('DOMContentLoaded', handleDOMContentLoaded)
    }

    // RAF loop for Lenis - integrated with GSAP ticker
    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    // Use GSAP ticker for better integration with ScrollTrigger
    const tickerFn = (t: number) => {
      lenis.raf(t * 1000)
      ScrollTrigger.update()
    }
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
      window.removeEventListener('load', handleLoad)
      document.removeEventListener('DOMContentLoaded', handleDOMContentLoaded)
      lenis.off('scroll', onScroll)
      gsap.ticker.remove(tickerFn)
      lenis.destroy()
      // Clean up ScrollTrigger instances
      ScrollTrigger.getAll().forEach((st) => st.kill())
      ScrollTrigger.clearScrollMemory()
    }
  }, [])

  const api = useMemo<ScrollApi>(() => ({ lenis: lenisRef.current }), [])
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}


