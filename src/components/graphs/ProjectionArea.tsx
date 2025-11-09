import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useProjection } from '../directives/ProjectionContext'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function ProjectionArea() {
  const { value } = useProjection()
  const ref = useRef<HTMLDivElement>(null)
  const base = [
    { year: 2025, bots: 50.5 },
    { year: 2026, bots: 52 + value * 2 },
    { year: 2027, bots: 54 + value * 3 },
    { year: 2028, bots: 56 + value * 3.5 },
    { year: 2029, bots: 57 + value * 3.8 },
    { year: 2030, bots: 58 + value * 4 },
  ]
  
  useEffect(() => {
    const el = ref.current
    if (!el) return
    
    // Fade in on scroll
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 30 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      },
    )
    
    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars?.trigger === el) st.kill()
      })
    }
  }, [])
  
  return (
    <div ref={ref} className="my-6 w-full">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={base} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
          <XAxis dataKey="year" stroke="#6b7280" />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="#6b7280" />
          <Tooltip 
            formatter={(v: number | string) => `${v}%`}
            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
          />
          <Area 
            type="monotone" 
            dataKey="bots" 
            stroke="#ef4444" 
            fill="#fecaca" 
            strokeWidth={2}
            animationDuration={300}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}


