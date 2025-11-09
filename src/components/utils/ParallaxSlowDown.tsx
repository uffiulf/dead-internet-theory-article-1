import { useEffect } from 'react'

declare global {
  interface Window {
    __lenis_speed?: number
  }
}

export default function ParallaxSlowDown() {
  useEffect(() => {
    const original = window.__lenis_speed ?? 1
    window.__lenis_speed = 0.6
    return () => {
      window.__lenis_speed = original
    }
  }, [])
  return null
}


