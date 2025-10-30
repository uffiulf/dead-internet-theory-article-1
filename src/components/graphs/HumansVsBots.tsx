import { useEffect, useRef, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function HumansVsBots({ data }: { data: Array<{ year: number; humans: number; bots: number }> }) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onEnter = () => setActive(true)
    el.addEventListener('graph:enter', onEnter as any)
    return () => el.removeEventListener('graph:enter', onEnter as any)
  }, [])

  return (
    <div ref={ref} className="my-6 w-full">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <Tooltip formatter={(v: any) => `${v}%`} />
          <Line type="monotone" dataKey="humans" stroke={active ? '#2563eb' : '#93c5fd'} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="bots" stroke={active ? '#dc2626' : '#fca5a5'} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}


