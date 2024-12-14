'use client'

import { Card } from '@/components/ui/card'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ContentType } from 'recharts/types/component/Tooltip'

interface DashboardChartsProps {
  expenseChartData: Array<{ name: string; amount: number }> | undefined
  timeSeriesData: Array<{ date: string; amount: number; type: string }> | undefined
}

export function DashboardCharts({ expenseChartData, timeSeriesData }: DashboardChartsProps) {
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active: boolean
    payload: { value: number; payload: { value: number; type: string } }[]
    label: string
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-4 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm">
            ${Math.abs(payload[0].value).toFixed(2)}
            <span className="ml-1 text-muted-foreground">({payload[0].payload.type})</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Expenses Bar Chart */}
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold">Expenses by Category</h2>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={expenseChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-sm text-muted-foreground" />
              <YAxis
                className="text-sm text-muted-foreground"
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-4 shadow-lg">
                        <p className="font-medium">{label}</p>
                        {/* @ts-expect-error bug related to payload */}
                        <p className="text-sm">${payload[0].value.toFixed(2)}</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Cash Flow Line Chart */}
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold">Cash Flow Over Time</h2>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-sm text-muted-foreground" />
              <YAxis
                className="text-sm text-muted-foreground"
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={CustomTooltip as ContentType<number, number>} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
