import { Card } from './Card'
import { Icon } from './Icon'
import { cn } from '../../lib/cn'

interface StatCardProps {
  icon: string
  label: string
  value: string
  suffix?: string
  trend?: {
    value: number
    isPositive?: boolean
  }
  badge?: string
  isLoading?: boolean
}

export function StatCard({ icon, label, value, suffix, trend, badge, isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-24 bg-(--bg-hover) rounded animate-pulse" />
          <div className="h-4 w-4 bg-(--bg-hover) rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          <div className="h-8 w-32 bg-(--bg-hover) rounded animate-pulse" />
          <div className="h-4 w-16 bg-(--bg-hover) rounded animate-pulse" />
        </div>
      </Card>
    )
  }

  const isTrendPositive = trend ? (
    trend.value > 0 
      ? (trend.isPositive !== false)
      : (trend.isPositive === false)
  ) : false
  
  const trendColor = isTrendPositive ? 'text-(--success-text)' : 'text-(--danger-text)'
  const trendBg = isTrendPositive ? 'bg-(--success-bg)' : 'bg-(--danger-bg)'
  const TrendIcon = isTrendPositive ? 'trending_up' : 'trending_down'

  return (
    <Card className="p-6 relative overflow-hidden group">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-(--text-secondary)">{label}</p>
        <div className="text-(--text-tertiary) opacity-70 group-hover:opacity-100 transition-opacity">
          <Icon name={icon} size="sm" />
        </div>
      </div>
      
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold tracking-tight text-(--text-primary)">
          {value}
        </span>
        {suffix && (
          <span className="text-sm font-medium text-(--text-tertiary)">{suffix}</span>
        )}
      </div>

      {(trend || badge) && (
        <div className="flex items-center gap-3 mt-4">
          {trend && (
            <div className={cn("flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full", trendBg, trendColor)}>
              <Icon name={TrendIcon} size="sm" />
              <span>
                {trend.value > 0 ? '+' : ''}{trend.value.toFixed(1)}%
              </span>
            </div>
          )}
          
          {badge && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-(--bg-secondary) text-(--text-secondary) border border-(--border-color)">
              {badge}
            </span>
          )}
        </div>
      )}
    </Card>
  )
}
