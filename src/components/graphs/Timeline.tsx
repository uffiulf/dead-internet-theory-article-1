import { useEffect, useRef, useState } from 'react'

type Milestone = { year: number; label: string }

export default function Timeline({ items }: { items: Milestone[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onProg = (e: Event) => {
      const detail = (e as CustomEvent).detail as any
      if (detail && typeof detail.progress === 'number') setProgress(detail.progress)
    }
    el.addEventListener('anim:progress', onProg as any)
    return () => el.removeEventListener('anim:progress', onProg as any)
  }, [])

  return (
    <div ref={ref} className="relative my-6 w-full" data-hscroll>
      <div className="h-1 bg-gray-200 dark:bg-gray-700" />
      <div className="absolute left-0 top-0 h-1 bg-blue-500" style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }} />
      <div className="mt-4 flex gap-8">
        {items.map((m) => (
          <div key={m.year} className="min-w-[220px]">
            <div className="text-sm text-gray-500">{m.year}</div>
            <div className="font-medium">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}


