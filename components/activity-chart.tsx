"use client"

import { FireIcon as FireIconSolid } from "@heroicons/react/24/solid"
import { FireIcon as FireIconOutline } from "@heroicons/react/24/outline"

interface ActivityChartProps {
  data: Array<{ date: string; participated: boolean; isToday?: boolean }>
}

export function ActivityChart({ data }: ActivityChartProps) {
  return (
    <div className="flex items-center justify-between">
      {data.map((item, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5">
          <div
            className="w-10 h-10 flex items-center justify-center"
            title={`${item.date}: ${item.isToday ? "오늘" : ""} ${item.participated ? "참여" : "미참여"}`}
          >
            {item.participated ? (
              <FireIconSolid className="w-7 h-7 text-orange-500" />
            ) : item.isToday ? (
              <div className="w-8 h-8 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center">
                <span className="text-xs text-muted-foreground">?</span>
              </div>
            ) : (
              <FireIconOutline className="w-7 h-7 text-muted-foreground/30" />
            )}
          </div>
          <span className="text-xs text-muted-foreground">{item.date}</span>
        </div>
      ))}
    </div>
  )
}
