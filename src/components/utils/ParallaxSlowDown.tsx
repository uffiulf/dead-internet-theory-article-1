import { useEffect } from 'react'

export default function ParallaxSlowDown() {
  useEffect(() => {
    const original = (window as any).__lenis_speed || 1
    ;(window as any).__lenis_speed = 0.6
    return () => {
      ;(window as any).__lenis_speed = original
    }
  }, [])
  return null
}


