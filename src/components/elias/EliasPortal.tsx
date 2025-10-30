import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function EliasPortal({ open, onClose }: { open: boolean; onClose?: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      window.dispatchEvent(new CustomEvent('elias:open'))
      return () => {
        document.body.style.overflow = prev
        window.dispatchEvent(new CustomEvent('elias:close'))
      }
    }
  }, [open])

  if (!open) return null
  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-label="Elias chat portal" className="fixed inset-0 z-50 bg-black/95 text-gray-100">
      <div className="mx-auto flex h-full max-w-5xl flex-col gap-6 p-6 md:flex-row">
        <div className="flex-1">
          <h2 className="mb-4 text-xl font-semibold">Journalist</h2>
          <div className="space-y-3 text-lg leading-relaxed">
            <Typing>Ser du for deg at internett en dag blir 'overtatt' av AI?</Typing>
            <Typing delay={1200}>Hva er det mest negative du ser med en slik utvikling?</Typing>
            <Typing delay={2200}>Finnes det positive sider ved at mer innhold skapes av AI?</Typing>
          </div>
        </div>
        <div className="flex-1">
          <h2 className="mb-4 text-xl font-semibold">Elias</h2>
          <div className="space-y-3 text-lg leading-relaxed">
            <Typing delay={800}>Uten mennesker mister nettet mening. Men trenden er klar…</Typing>
            <Typing delay={1800}>Tap av tillit. Hvis du ikke vet om motparten er ekte…</Typing>
            <Typing delay={2800}>Rutineinnhold kan automatiseres. Mennesker kan fokusere på det unike.</Typing>
          </div>
        </div>
      </div>
      <div className="absolute right-4 top-4">
        <button onClick={onClose} className="rounded bg-white/10 px-3 py-2 text-sm hover:bg-white/20">Lukk</button>
      </div>
    </div>
  )
}

function Typing({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay, duration: 0.4 }} className="relative">
      {children}
      <span className="ml-1 inline-block h-5 w-1 animate-pulse bg-gray-300 align-middle" style={{ animationDuration: '1.2s' }} />
    </motion.div>
  )
}


