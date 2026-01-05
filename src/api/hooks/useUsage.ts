import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../queryKeys'
import { usageApi } from '../endpoints'
import type { UsageQueryParams } from '../types'

export function useUsageStats(params?: UsageQueryParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.usageStats(params),
    queryFn: () => usageApi.get(params),
    enabled,
    staleTime: 30000,
    refetchInterval: 30000,
  })
}

export const useUsageSummary = (params?: UsageQueryParams) => {
  const { data, ...rest } = useUsageStats(params)
  return { ...rest, data: data?.summary }
}

export const useUsageTimeline = (params?: UsageQueryParams) => {
  const { data, ...rest } = useUsageStats(params)
  return { ...rest, data: data?.timeline }
}

export const useUsageByProvider = (params?: UsageQueryParams) => {
  const { data, ...rest } = useUsageStats(params)
  return { ...rest, data: data?.by_provider }
}

export const useUsageByModel = (params?: UsageQueryParams) => {
  const { data, ...rest } = useUsageStats(params)
  return { ...rest, data: data?.by_model }
}

export const useUsageByAccount = (params?: UsageQueryParams) => {
  const { data, ...rest } = useUsageStats(params)
  return { ...rest, data: data?.by_account }
}

export const useUsageCounters = (params?: UsageQueryParams) => {
  const { data, ...rest } = useUsageStats(params)
  return { ...rest, data: data?.summary }
}

export const useUsageByDay = (params?: UsageQueryParams) => {
  const { data, ...rest } = useUsageStats(params)
  return { ...rest, data: data?.timeline?.by_day }
}

export const useUsageByHour = (params?: UsageQueryParams) => {
  const { data, ...rest } = useUsageStats(params)
  return { ...rest, data: data?.timeline?.by_hour }
}

export const useUsageByApi = (params?: UsageQueryParams) => {
  const { data, ...rest } = useUsageStats(params)
  return { ...rest, data: data?.by_provider }
}
