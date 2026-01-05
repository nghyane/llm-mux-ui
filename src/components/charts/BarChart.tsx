import { BarChart as TremorBarChart } from '@tremor/react'
import { useMemo } from 'react'

export interface BarChartProps {
  data: Record<string, number>
  title?: string
  className?: string
  formatValue?: (value: number) => string
  color?: string
  showValues?: boolean
}

export function BarChart({
  data,
  title,
  className = '',
  formatValue = (value) => value.toString(),
  color = 'indigo',
}: BarChartProps) {
  
  const chartData = useMemo(() => {
    return Object.entries(data)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => ({
        label: formatLabel(key),
        value,
      }))
  }, [data])

  if (chartData.length === 0) {
    return (
      <div className={`h-64 flex items-center justify-center ${className}`}>
        <div className="text-center text-(--text-tertiary)">
          <p className="text-sm">No data available</p>
        </div>
      </div>
    )
  }

  const chartColor = color || 'indigo'

  return (
    <div className={className}>
      {title && (
        <h4 className="text-sm font-medium text-(--text-secondary) mb-3">{title}</h4>
      )}
      <TremorBarChart
        className="h-64"
        data={chartData}
        index="label"
        categories={["value"]}
        colors={[chartColor]}
        showLegend={false}
        valueFormatter={formatValue}
        yAxisWidth={48}
        showAnimation={true}
      />
    </div>
  )
}

function formatLabel(key: string): string {
  if (key.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const date = new Date(key)
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }
  if (key.match(/^\d{1,2}$/)) {
    const hour = parseInt(key, 10)
    if (hour === 0) return '12am'
    if (hour === 12) return '12pm'
    return hour > 12 ? `${hour - 12}pm` : `${hour}am`
  }
  if (key.includes('T') || key.includes(' ')) {
    const date = new Date(key)
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }
  return key.length > 8 ? key.substring(0, 8) : key
}
