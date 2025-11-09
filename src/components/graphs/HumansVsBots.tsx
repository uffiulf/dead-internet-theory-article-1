import { useEffect, useRef, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function HumansVsBots({ data }: { data: Array<{ year: number; humans: number; bots: number }> }) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const [animatedData, setAnimatedData] = useState(data.map(d => ({ ...d, humans: 0, bots: 0 })))

  useEffect(() => {
    const el = ref.current
    if (!el) return
    
    const onEnter = () => {
      setActive(true)
      // Animate count-up effect
      const duration = 2000
      const startTime = Date.now()
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(1, elapsed / duration)
        const easeProgress = 1 - Math.pow(1 - progress, 3) // easeOutCubic
        
        setAnimatedData(
          data.map(d => ({
            ...d,
            humans: Math.round(d.humans * easeProgress),
            bots: Math.round(d.bots * easeProgress),
          }))
        )
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setAnimatedData(data) // Final state
        }
      }
      
      requestAnimationFrame(animate)
    }
    
    el.addEventListener('graph:enter', onEnter as EventListener)
    
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
      el.removeEventListener('graph:enter', onEnter as EventListener)
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars?.trigger === el) st.kill()
      })
    }
  }, [data])

  return (
    <div ref={ref} className="my-6 w-full">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={animatedData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="year" stroke="#6b7280" />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="#6b7280" />
          <Tooltip 
            formatter={(v: number | string) => `${v}%`}
            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
          />
          <Line 
            type="monotone" 
            dataKey="humans" 
            stroke={active ? '#2563eb' : '#3b82f6'} 
            strokeWidth={active ? 3 : 2} 
            dot={{ fill: active ? '#2563eb' : '#3b82f6', r: active ? 4 : 3 }}
            animationDuration={active ? 500 : 0}
          />
          <Line 
            type="monotone" 
            dataKey="bots" 
            stroke={active ? '#dc2626' : '#ef4444'} 
            strokeWidth={active ? 3 : 2} 
            dot={{ fill: active ? '#dc2626' : '#ef4444', r: active ? 4 : 3 }}
            animationDuration={active ? 500 : 0}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}


