import { Badge } from '../../ui/Badge'
import { Icon } from '../../ui/Icon'
import type { AuthFile } from '../../../api/types'
import type { ProviderWithUsage } from './useDashboardStats'
import { formatNumber } from '../../../lib/utils'

export interface ProviderStatusCardProps {
  provider: ProviderWithUsage
  onRefresh?: () => void
}

export function ProviderStatusCard({ provider, onRefresh }: ProviderStatusCardProps) {
  // Map API status to badge variant
  const getStatusConfig = (status: string) => {
    const normalized = status.toLowerCase()

    if (normalized === 'ok' || normalized === 'active' || normalized === 'operational') {
      return { variant: 'success' as const, label: 'Operational', dot: true }
    }

    if (normalized === 'refreshing' || normalized === 'pending') {
      return { variant: 'warning' as const, label: 'Refreshing', dot: true }
    }

    if (normalized === 'error' || normalized === 'failed' || normalized === 'expired') {
      return { variant: 'danger' as const, label: 'Error', dot: true, pulse: true }
    }

    return { variant: 'default' as const, label: status, dot: false }
  }

  const statusConfig = getStatusConfig(provider.status)

  // Get provider icon/initial
  const getProviderInitial = (providerName: string) => {
    const name = providerName.toLowerCase()
    if (name.includes('openai')) return 'O'
    if (name.includes('anthropic') || name.includes('claude')) return 'A'
    if (name.includes('gemini') || name.includes('google')) return 'G'
    if (name.includes('mistral')) return 'M'
    if (name.includes('cohere')) return 'C'
    if (name.includes('vertex')) return 'V'
    return providerName.charAt(0).toUpperCase()
  }

  // Format timestamp
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return 'Never'

    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays < 7) return `${diffDays}d ago`

      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch {
      return 'Unknown'
    }
  }

  return (
    <div className="group">
      <div className="flex items-center justify-between">
        {/* Left side: Provider info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="size-9 rounded-lg bg-(--bg-hover) flex items-center justify-center flex-shrink-0 border border-(--border-color)/30">
            <span className="text-sm font-bold text-(--text-secondary)">
              {getProviderInitial(provider.provider)}
            </span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-medium text-(--text-primary) truncate">
              {provider.label || provider.name}
            </span>
            <span className="text-xs text-(--text-secondary) truncate">
              {provider.email || provider.account || provider.provider}
            </span>
          </div>
        </div>

        {/* Right side: Status and actions */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {provider.disabled && (
            <Badge variant="default" className="text-xs">
              Disabled
            </Badge>
          )}
          <Badge variant={statusConfig.variant} dot={statusConfig.dot} pulse={statusConfig.pulse}>
            {statusConfig.label}
          </Badge>
          {onRefresh && !provider.disabled && (
            <button
              type="button"
              onClick={onRefresh}
              className="p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-(--bg-hover) text-(--text-secondary) hover:text-(--text-primary)"
              title="Refresh provider"
            >
              <Icon name="refresh" size="sm" />
            </button>
          )}
        </div>
      </div>

      {/* Additional info */}
      <div className="mt-2 flex items-center gap-4 text-xs text-(--text-tertiary) ml-12">
        {provider.usage && (
          <>
            <span className="flex items-center gap-1">
              <Icon name="data_usage" size="sm" />
              {formatNumber(provider.usage.requests)} req
            </span>
            <span className="flex items-center gap-1">
              <Icon name="token" size="sm" />
              {formatNumber(provider.usage.tokens)}
            </span>
          </>
        )}
        {provider.last_refresh && (
          <span className="flex items-center gap-1">
            <Icon name="schedule" size="sm" />
            {formatTimestamp(provider.last_refresh)}
          </span>
        )}
        {provider.status_message && (
          <span className="truncate flex-1" title={provider.status_message}>
            {provider.status_message}
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-(--border-color) mt-4 last:hidden" />
    </div>
  )
}

// Group providers by type/provider name
export function groupProviders(providers: AuthFile[]): Record<string, AuthFile[]> {
  const grouped: Record<string, AuthFile[]> = {}

  providers.forEach((provider) => {
    const key = provider.provider || 'unknown'
    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(provider)
  })

  return grouped
}
