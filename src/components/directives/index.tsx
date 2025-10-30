import type { ReactNode } from 'react'

type CommonProps = { value?: string; children?: ReactNode }

export function Anim({ value }: CommonProps) {
  return (
    <div className="my-6 rounded border border-dashed border-blue-300/60 bg-blue-50/40 px-3 py-2 text-sm text-blue-900 dark:border-blue-400/40 dark:bg-blue-400/10 dark:text-blue-200">
      <strong>ANIM</strong>: {value}
    </div>
  )
}

export function Fx({ value }: CommonProps) {
  return (
    <div className="my-4 rounded border border-dashed border-purple-300/60 bg-purple-50/40 px-3 py-2 text-sm text-purple-900 dark:border-purple-400/40 dark:bg-purple-400/10 dark:text-purple-200">
      <strong>FX</strong>: {value}
    </div>
  )
}

export function Graph({ value }: CommonProps) {
  return (
    <div className="my-6 rounded border border-dashed border-emerald-300/60 bg-emerald-50/40 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-400/40 dark:bg-emerald-400/10 dark:text-emerald-200">
      <strong>GRAPH</strong>: {value}
    </div>
  )
}

export function Media({ value }: CommonProps) {
  return (
    <div className="my-6 rounded border border-dashed border-amber-300/60 bg-amber-50/40 px-3 py-2 text-sm text-amber-900 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-200">
      <strong>MEDIA</strong>: {value}
    </div>
  )
}
