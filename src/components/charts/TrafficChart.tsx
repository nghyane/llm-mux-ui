import { AreaChart } from '@tremor/react'
import { useMemo } from 'react'
import { formatNumber } from '../../lib/utils'

export interface TrafficChartProps {
  data: Record<string, number>
  title?: string
  className?: string
}

export function TrafficChart({ data, title, className = '' }: TrafficChartProps) {
  const chartData = useMemo(() => {
    return Object.entries(data)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => ({
        label: formatLabel(key),
        requests: value
      }))
  }, [data])

  if (chartData.length === 0) {
    return (
      <div className={`h-64 flex items-center justify-center ${className}`}>
        <div className="text-center text-(--text-tertiary)">
          <p className="text-sm">No traffic data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {title && (
        <h4 className="text-sm font-medium text-(--text-secondary) mb-3">{title}</h4>
      )}
      <AreaChart
        className="h-64"
        data={chartData}
        index="label"
        categories={["requests"]}
        colors={["indigo"]}
        showLegend={false}
        showGridLines={false}
        curveType="monotone"
        valueFormatter={formatNumber}
        yAxisWidth={48}
        showAnimation={true}
      />
    </div>
  )
}

function formatLabel(key: string): string {
  if (key.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const date = new Date(key)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  if (key.match(/^\d{1,2}$/)) {
    const hour = parseInt(key, 10)
    return `${hour}:00`
  }
  if (key.includes('T') || key.includes(' ')) {
    const date = new Date(key)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }
  return key
}
