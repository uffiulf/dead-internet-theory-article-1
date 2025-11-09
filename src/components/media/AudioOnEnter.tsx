import { useEffect, useRef } from 'react'

export default function AudioOnEnter({ id, children }: { id?: string; children?: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const host = ref.current
    if (!host) return
    const reduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const audio = (id ? document.getElementById(id) : host.querySelector('audio')) as HTMLAudioElement | null
    if (!audio) return

    const onEnter: EventListener = () => {
      if (reduced) return
      try {
        audio.volume = 0
        audio.play?.().catch((error) => {
          console.warn('[AudioOnEnter] Failed to play audio:', error)
        })
        const step = () => {
          audio.volume = Math.min(1, audio.volume + 0.05)
          if (audio.volume < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      } catch (error) {
        console.warn('[AudioOnEnter] Failed during fade-in sequence:', error)
      }
    }

    host.addEventListener('graph:enter', onEnter)
    return () => host.removeEventListener('graph:enter', onEnter)
  }, [id])
  return <div ref={ref}>{children}</div>
}


