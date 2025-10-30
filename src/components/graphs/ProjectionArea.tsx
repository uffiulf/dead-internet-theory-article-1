import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useProjection } from '../directives/ProjectionContext'

export default function ProjectionArea() {
  const { value } = useProjection()
  const base = [
    { year: 2025, bots: 50.5 },
    { year: 2026, bots: 52 + value * 2 },
    { year: 2027, bots: 54 + value * 3 },
    { year: 2028, bots: 56 + value * 3.5 },
    { year: 2029, bots: 57 + value * 3.8 },
    { year: 2030, bots: 58 + value * 4 },
  ]
  return (
    <div className="my-6 w-full">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={base} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
          <XAxis dataKey="year" />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <Tooltip formatter={(v: any) => `${v}%`} />
          <Area type="monotone" dataKey="bots" stroke="#ef4444" fill="#fecaca" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}


