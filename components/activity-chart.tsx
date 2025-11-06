"use client"

interface ActivityChartProps {
  data: Array<{ date: string; count: number }>
  maxValue?: number
}

export function ActivityChart({ data, maxValue = 5 }: ActivityChartProps) {
  const max = Math.max(maxValue, ...data.map((d) => d.count))

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-1 h-24">
        {data.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div
              className="w-full bg-gradient-to-t from-primary to-primary/50 rounded-t transition-all hover:from-primary/90"
              style={{ height: `${(item.count / max) * 100}%`, minHeight: item.count > 0 ? "4px" : "0px" }}
              title={`${item.date}: ${item.count}회`}
            />
            <span className="text-xs text-muted-foreground">{item.date}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
