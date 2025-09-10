export default function Loading() {
  return (
    <div className="p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
        <div className="grid grid-cols-4 gap-4 mt-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
