import { useEffect, useState } from 'react'

type Line = { who: 'journalist' | 'elias'; text: string; delay?: number }

export default function ChatInterface({ lines, speed = 1 }: { lines: Line[]; speed?: number }) {
  const [index, setIndex] = useState(0)
  const reduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (reduced) {
      setIndex(lines.length)
      return
    }
    if (index >= lines.length) return
    const d = Math.max(0, (lines[index].delay ?? 1200) / speed)
    const t = setTimeout(() => setIndex((i) => i + 1), d)
    return () => clearTimeout(t)
  }, [index, lines, speed, reduced])

  const shown = lines.slice(0, index)
  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {shown.map((l, i) => (
        <div key={i} className={`flex ${l.who === 'journalist' ? 'justify-start' : 'justify-end'}`}>
          <div className={`rounded-lg px-3 py-2 text-sm ${l.who === 'journalist' ? 'bg-white/60 text-gray-900 dark:bg-white/10 dark:text-gray-100' : 'bg-blue-600 text-white'}`}>
            {l.text}
          </div>
        </div>
      ))}
    </div>
  )
}


