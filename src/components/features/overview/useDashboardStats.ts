import { useMemo } from 'react'
import type { UsageResponse, UsageHourStats, UsageDayStats, UsageAccountStats } from '../../../api/types/usage'
import type { AuthFile, AuthFilesResponse } from '../../../api/types/auth-files'

// Extended provider with usage stats
export interface ProviderWithUsage extends AuthFile {
  usage?: {
    requests: number
    success: number
    failure: number
    tokens: number
  }
}

// Build account key to match usage data format: "provider:auth_id"
function buildAccountKey(file: AuthFile): string {
  return `${file.provider}:${file.name}`
}

export function useDashboardStats(
  usageData: UsageResponse | undefined,
  authData: AuthFilesResponse | undefined
) {
  // Map usage by_account to auth files
  const providerUsageMap = useMemo(() => {
    const map = new Map<string, UsageAccountStats>()
    if (!usageData?.by_account) return map

    Object.entries(usageData.by_account).forEach(([key, stats]) => {
      // Key format: "provider:auth_id" e.g. "antigravity:antigravity-email.json"
      map.set(key, stats)
    })
    return map
  }, [usageData?.by_account])

  const stats = useMemo(() => {
    if (!usageData?.summary) {
      return {
        totalRequests: 0,
        successRate: 0,
        totalTokens: 0,
        activeProviders: 0,
      }
    }

    const { total_requests, success_count, tokens } = usageData.summary
    const successRate = total_requests > 0 ? (success_count / total_requests) * 100 : 0

    // Count active providers that have usage OR are active status
    const activeCount = authData?.files?.filter((f) => {
      const key = buildAccountKey(f)
      const hasUsage = providerUsageMap.has(key)
      const isActive = f.status === 'active' && !f.disabled && !f.unavailable
      return hasUsage || isActive
    }).length || 0

    return {
      totalRequests: total_requests,
      successRate,
      totalTokens: tokens.total,
      activeProviders: activeCount,
    }
  }, [usageData, authData, providerUsageMap])

  const getChartData = (period: 'hour' | 'day') => {
    if (!usageData?.timeline) return {}
    
    if (period === 'hour') {
      const data = usageData.timeline.by_hour
      if (!data) return {}
      return data.reduce((acc: Record<string, number>, item: UsageHourStats) => {
        acc[String(item.hour)] = item.requests
        return acc
      }, {} as Record<string, number>)
    } else {
      const data = usageData.timeline.by_day
      if (!data) return {}
      return data.reduce((acc: Record<string, number>, item: UsageDayStats) => {
        acc[item.day] = item.requests
        return acc
      }, {} as Record<string, number>)
    }
  }

  const topProviders = useMemo((): ProviderWithUsage[] => {
    if (!authData?.files) return []

    return authData.files
      .filter((f) => !f.runtime_only)
      .map((file): ProviderWithUsage => {
        const key = buildAccountKey(file)
        const usageStats = providerUsageMap.get(key)

        return {
          ...file,
          usage: usageStats ? {
            requests: usageStats.requests,
            success: usageStats.success,
            failure: usageStats.failure,
            tokens: usageStats.tokens.total,
          } : undefined,
        }
      })
      .sort((a, b) => {
        const aRequests = a.usage?.requests ?? 0
        const bRequests = b.usage?.requests ?? 0
        if (aRequests !== bRequests) return bRequests - aRequests

        if (a.status === 'active' && b.status !== 'active') return -1
        if (a.status !== 'active' && b.status === 'active') return 1

        return (b.last_refresh || '').localeCompare(a.last_refresh || '')
      })
      .slice(0, 4)
  }, [authData, providerUsageMap])

  return {
    stats,
    getChartData,
    topProviders,
  }
}
