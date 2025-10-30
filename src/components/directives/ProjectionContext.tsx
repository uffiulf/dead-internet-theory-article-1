import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

type ProjectionState = {
  value: number
  setValue: (v: number) => void
}

const Ctx = createContext<ProjectionState | null>(null)

export function useProjection() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useProjection must be used within <ProjectionProvider>')
  return ctx
}

export function ProjectionProvider({ children, initial = 0.5 }: { children: ReactNode; initial?: number }) {
  const [value, setValue] = useState(initial)
  const api = useMemo<ProjectionState>(() => ({ value, setValue }), [value])
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}


