export default function GraphSSBContrast() {
  const items = [
    { label: 'Daglig bruk', value: 96, color: '#2563eb' },
    { label: 'Tillit', value: 70, color: '#10b981' },
    { label: 'Digital kompetanse', value: 65, color: '#f59e0b' },
  ]
  return (
    <div className="my-3 grid w-full max-w-md grid-cols-3 gap-3">
      {items.map((it) => (
        <div key={it.label} className="text-center">
          <div className="mx-auto h-24 w-6 rounded bg-gray-200 dark:bg-gray-700">
            <div className="w-6 rounded-b" style={{ background: it.color, height: `${it.value}%` }} />
          </div>
          <div className="mt-2 text-xs opacity-80">{it.label}</div>
        </div>
      ))}
    </div>
  )
}


