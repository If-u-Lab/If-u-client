"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Button } from "@/components/ui/button"
import { ArrowPathIcon } from "@heroicons/react/24/outline"

interface VotingResultsProps {
  question: {
    id: string
    title: string
    options: string[]
    totalVotes: number
    votes: number[]
  }
}

export function VotingResults({ question }: VotingResultsProps) {
  const chartData = question.options.map((option, i) => ({
    name: option,
    value: question.votes[i],
  }))

  const colors = ["#3b82f6", "#60a5fa"]

  return (
    <div className="bg-card rounded-lg border border-border p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg md:text-xl font-semibold text-foreground">투표 결과</h3>
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 active:bg-muted">
          <ArrowPathIcon className="w-5 h-5" />
        </Button>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => `${typeof value === 'number' ? value.toFixed(1) : value}%`} />
          <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {question.options.map((option, i) => (
          <div key={i} className="bg-muted rounded-lg p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold text-primary">{question.votes[i].toFixed(1)}%</div>
            <div className="text-xs md:text-sm text-muted-foreground mt-1.5 leading-relaxed">{option}</div>
          </div>
        ))}
      </div>

      <div className="text-sm md:text-base text-muted-foreground text-center border-t border-border pt-4">
        총 {question.totalVotes}명이 투표했습니다
      </div>
    </div>
  )
}
