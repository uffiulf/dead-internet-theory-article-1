import { useEffect, useMemo, useRef, useState } from 'react'

type Line = { who: 'journalist' | 'elias'; text: string; delay?: number; avatar?: 'journalist' | 'elias' | string }

export default function ChatInterface({
  lines,
  speed = 1,
  typingSound = false,
  autoscroll = true,
  bubbleMaxWidth = 640,
}: {
  lines: Line[]
  speed?: number
  typingSound?: boolean
  autoscroll?: boolean
  bubbleMaxWidth?: number
}) {
  const [index, setIndex] = useState(0)
  const [typing, setTyping] = useState(false)
  const reduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const logRef = useRef<HTMLDivElement>(null)

  const avatarSrc = (a: Line['avatar'] | undefined, who: Line['who']) => {
    if (typeof a === 'string' && a !== 'journalist' && a !== 'elias') return a
    const key = a ?? who
    return key === 'elias' ? '/avatars/elias.png' : '/avatars/journalist.png'
  }

  useEffect(() => {
    if (reduced) {
      setIndex(lines.length)
      setTyping(false)
      return
    }
    if (index >= lines.length) return
    // typing indicator 400-800ms
    setTyping(true)
    const typingDelay = Math.round(400 + Math.random() * 400) / speed
    const typingTimer = setTimeout(() => {
      setTyping(false)
      const d = Math.max(0, (lines[index].delay ?? 1200) / speed)
      const postTimer = setTimeout(() => {
        setIndex((i) => i + 1)
        if (typingSound && !reduced) playTick()
      }, d)
      return () => clearTimeout(postTimer)
    }, typingDelay)
    return () => clearTimeout(typingTimer)
  }, [index, lines, speed, reduced, typingSound])

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
            }`}
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
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'square'
    o.frequency.setValueAtTime(800, ctx.currentTime)
    g.gain.setValueAtTime(0.001, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08)
    o.connect(g).connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + 0.08)
  } catch {}
}


