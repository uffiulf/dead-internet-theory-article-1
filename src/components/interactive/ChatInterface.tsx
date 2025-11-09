import { useEffect, useMemo, useRef, useState } from 'react'
import type { AnimProgressEventDetail } from '../../types/events'

type Line = { who: 'journalist' | 'elias'; text: string; delay?: number; avatar?: 'journalist' | 'elias' | string }

export default function ChatInterface({
  lines,
  speed = 1,
  typingSound = false,
  autoscroll = true,
  bubbleMaxWidth = 640,
  glitchOnLast = false,
}: {
  lines: Line[]
  speed?: number
  typingSound?: boolean
  autoscroll?: boolean
  bubbleMaxWidth?: number
  glitchOnLast?: boolean
}) {
  const [index, setIndex] = useState(0)
  const [typing, setTyping] = useState(false)
  const [popIndex, setPopIndex] = useState<number | null>(null)
  const reduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const logRef = useRef<HTMLDivElement>(null)

  const avatarSrc = (a: Line['avatar'] | undefined, who: Line['who']) => {
    if (typeof a === 'string' && a !== 'journalist' && a !== 'elias') return a
    const key = a ?? who
    // Try PNG first, fallback to SVG
    const basePath = key === 'elias' ? '/avatars/elias' : '/avatars/journalist'
    return `${basePath}.svg`
  }

  useEffect(() => {
    // Scroll-triggered progress from Anim: listen globally to ensure delivery even if wrapper differs
    if (reduced) {
      setIndex(lines.length)
      setTyping(false)
      return
    }
    const totals = lines.map((l) => Math.max(0, (l.delay ?? 1200) / speed))
    const sum = totals.reduce((a, b) => a + b, 0) || 1
    const cumulative: number[] = []
    totals.reduce((acc, cur, i) => {
      const v = acc + cur
      cumulative[i] = v
      return v
    }, 0)
    
    let lastProgress = -1
    const onProgress = (event: CustomEvent<AnimProgressEventDetail>) => {
      const detail = event.detail
      const p = Math.max(0, Math.min(1, detail?.progress ?? 0))
      if (p === lastProgress) return
      lastProgress = p
      
      const t = p * sum
      let k = 0
      while (k < cumulative.length && cumulative[k] <= t) k++
      // Ensure at least first message shows when progress > 0
      if (p > 0 && k === 0) k = 1
      if (k !== index && k <= lines.length) {
        setTyping(false)
        setIndex(k)
        if (k > 0) setPopIndex(k - 1)
        if (typingSound && k > 0) playTick()
      }
    }
    const handler = onProgress as EventListener
    window.addEventListener('anim:progress', handler, { passive: true })
    
    // Initial check: if we're already past start, show first message
    const checkInit = () => {
      const evt = new CustomEvent<AnimProgressEventDetail>('anim:progress', { detail: { progress: 0 } })
      onProgress(evt)
    }
    checkInit()
    
    return () => {
      window.removeEventListener('anim:progress', handler)
    }
  }, [lines, speed, reduced, typingSound, index])

  useEffect(() => {
    if (!autoscroll) return
    const el = logRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: reduced ? 'auto' : 'smooth' })
  }, [index, typing, autoscroll, reduced])

  const shown = useMemo(() => lines.slice(0, index), [lines, index])

  return (
    <div ref={logRef} role="log" aria-live="polite" className="mx-auto max-w-3xl space-y-3 overflow-y-auto">
      {shown.map((l, i) => (
        <div key={i} className={`flex items-start gap-2 ${l.who === 'journalist' ? 'justify-start' : 'justify-end'}`}>
          {l.who === 'journalist' && (
            <img alt="Journalist" src={avatarSrc(l.avatar, l.who)} className="h-8 w-8 rounded-full ring-1 ring-gray-300 object-cover" />
          )}
          <div
            role="article"
            aria-label={`${l.who === 'elias' ? 'Elias sier' : 'Journalist sier'} ${l.text}`}
            className={`rounded-lg px-3 py-2 text-sm ${
              l.who === 'journalist' ? 'bg-white/60 text-gray-900 dark:bg-white/10 dark:text-gray-100' : 'bg-blue-600 text-white ring-1 ring-blue-300/30'
            } ${glitchOnLast && i === lines.length - 1 ? 'animate-[glitch_0.5s_linear_1]' : ''} ${popIndex === i ? 'animate-[chatPop_0.25s_ease-out_1]' : ''}`}
            style={{ maxWidth: bubbleMaxWidth }}
          >
            {l.text}
          </div>
          {l.who === 'elias' && (
            <img alt="Elias" src={avatarSrc(l.avatar, l.who)} className="h-8 w-8 rounded-full ring-2 ring-blue-400/60 object-cover" />
          )}
        </div>
      ))}
      {!reduced && typing && (
        <div className="flex items-center gap-2 justify-end opacity-70">
          <div className="h-8 w-8 rounded-full ring-2 ring-blue-400/60 bg-blue-500/30" />
          <div className="rounded-lg bg-blue-600/60 px-3 py-2 text-xs text-white">
            <span className="inline-block animate-pulse">…</span>
          </div>
        </div>
      )}
    </div>
  )
}

function playTick() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioContextClass()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'square'
    o.frequency.setValueAtTime(800, ctx.currentTime)
    g.gain.setValueAtTime(0.001, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08)
    o.connect(g).connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + 0.08)
  } catch (error) {
    console.warn('[ChatInterface] Failed to play tick sound:', error)
  }
}


