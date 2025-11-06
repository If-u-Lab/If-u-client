"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

interface VotingResultsProps {
  question: {
    id: string
    text: string
    options: string[]
    totalVotes: number
    votes: number[]
    commentCount: number
  }
}

export function VotingResults({ question }: VotingResultsProps) {
  const chartData = question.options.map((option, i) => ({
    name: option,
    value: question.votes[i],
  }))

  const colors = ["#3b82f6", "#60a5fa"]

  return (
    <div className="bg-white rounded-lg border border-border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">투표 결과</h3>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
          <RotateCcw className="w-4 h-4" />
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

      <div className="grid grid-cols-2 gap-4">
        {question.options.map((option, i) => (
          <div key={i} className="bg-muted rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-primary">{question.votes[i].toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground mt-1">{option}</div>
          </div>
        ))}
      </div>

      <div className="text-sm text-muted-foreground text-center border-t border-border pt-4">
        총 {question.totalVotes}명이 투표했습니다
      </div>
    </div>
  )
}
