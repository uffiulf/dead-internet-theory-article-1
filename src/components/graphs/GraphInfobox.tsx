export default function GraphInfobox({ title, value, caption }: { title: string; value: string; caption?: string }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-lg border border-blue-300/40 bg-blue-50/50 px-3 py-2 text-blue-900 dark:border-blue-300/20 dark:bg-blue-400/10 dark:text-blue-100">
      <div className="text-xl font-bold tabular-nums">{value}</div>
      <div>
        <div className="text-sm font-medium">{title}</div>
        {caption ? <div className="text-xs opacity-80">{caption}</div> : null}
      </div>
    </div>
  )
}


