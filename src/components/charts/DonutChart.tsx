import { DonutChart as TremorDonutChart } from '@tremor/react'
import { useMemo } from 'react'
import { getChartColor } from '../../lib/providers'

export interface DonutChartDataItem {
  label: string
  value: number
  color?: string
}

export interface DonutChartProps {
  data: DonutChartDataItem[]
  title?: string
  centerLabel?: string
  centerValue?: string
  className?: string
  formatValue?: (value: number) => string
  showLegend?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function DonutChart({
  data,
  title,
  centerLabel,
  centerValue,
  className = '',
  formatValue = defaultFormatValue,
  showLegend = true,
  size = 'md',
}: DonutChartProps) {
  
  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center text-(--text-tertiary)">
          <p className="text-sm">No data available</p>
        </div>
      </div>
    )
  }

  const heightClass = {
    sm: 'h-32 w-32',
    md: 'h-48 w-48',
    lg: 'h-64 w-64',
  }[size]

  return (
    <div className={`relative ${className}`}>
      {title && (
        <h4 className="text-sm font-medium text-(--text-secondary) mb-4">{title}</h4>
      )}
      <div className="relative flex flex-col items-center">
        <div className="relative">
          <TremorDonutChart
            className={heightClass}
            data={data}
            index="label"
            category="value"
            colors={["blue", "cyan", "indigo", "violet", "fuchsia"]}
            showLabel={false}
            valueFormatter={formatValue}
            showAnimation={true}
          />
          {centerValue && (
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
              <span className="text-2xl font-bold text-(--text-primary)">{centerValue}</span>
              {centerLabel && <span className="text-xs text-(--text-secondary)">{centerLabel}</span>}
            </div>
          )}
        </div>
      </div>
      <div style={{ display: 'none' }}>{showLegend}</div> 
    </div>
  )
}

export function CompactDonut({
  data,
  size = 64,
  strokeWidth = 8,
  className = '',
}: {
  data: DonutChartDataItem[]
  size?: number
  strokeWidth?: number
  className?: string
}) {
  const chartData = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    if (total === 0) return { segments: [], total: 0 }

    const sorted = [...data].sort((a, b) => b.value - a.value)
    let currentPercentage = 0

    const segments = sorted.map((item, index) => {
      const percentage = (item.value / total) * 100
      const start = currentPercentage
      currentPercentage += percentage

      return {
        ...item,
        color: item.color || getChartColor(index),
        percentage,
        dashArray: `${percentage} ${100 - percentage}`,
        dashOffset: 25 - start,
      }
    })

    return { segments, total }
  }, [data])

  if (chartData.segments.length === 0) {
    return null
  }

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  return (
    <svg width={size} height={size} className={className} role="img" aria-label="Compact donut chart">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--border-color)"
        strokeWidth={strokeWidth}
      />
      {chartData.segments.map((segment) => (
        <circle
          key={segment.label}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={segment.color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${(segment.percentage / 100) * circumference} ${circumference}`}
          strokeDashoffset={((segment.dashOffset) / 100) * circumference}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all"
        >
          <title>{`${segment.label}: ${segment.percentage.toFixed(1)}%`}</title>
        </circle>
      ))}
    </svg>
  )
}

function defaultFormatValue(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toLocaleString()
}
