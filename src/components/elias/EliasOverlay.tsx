import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function EliasOverlay({ text, visible, onClose }: { text: string; visible: boolean; onClose?: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 24, y: 24 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let startX = 0, startY = 0, baseX = pos.x, baseY = pos.y
    const onDown = (e: PointerEvent) => {
      el.setPointerCapture(e.pointerId)
      startX = e.clientX
      startY = e.clientY
      baseX = pos.x
      baseY = pos.y
    }
    const onMove = (e: PointerEvent) => {
      if (e.pressure === 0) return
      setPos({ x: Math.max(8, baseX + (startX - e.clientX)), y: Math.max(8, baseY + (startY - e.clientY)) })
    }
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
    }
  }, [pos])

  if (!visible) return null
  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-label="Elias chat overlay"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-6 right-6 z-50 max-w-xs select-none"
      style={{ transform: `translate(${-pos.x}px, ${-pos.y}px)`, willChange: 'transform' }}
    >
      <motion.div
        className="rounded-lg bg-gray-900/90 p-3 text-gray-100 shadow-lg ring-1 ring-white/10"
        animate={{ boxShadow: ["0 10px 15px rgba(0,0,0,0.2)", "0 20px 30px rgba(0,0,0,0.3)", "0 10px 15px rgba(0,0,0,0.2)"] }}
        transition={{ duration: 8, repeat: Infinity }}
      >
        <div className="text-sm leading-relaxed">{text}</div>
        <div className="mt-2 flex justify-end">
          <button className="rounded px-2 py-1 text-xs text-gray-300 hover:text-white" onClick={onClose} aria-label="Lukk">Lukk</button>
        </div>
      </motion.div>
    </motion.div>
  )
}


