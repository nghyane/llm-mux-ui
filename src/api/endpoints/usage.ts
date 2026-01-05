import { apiClient } from '../client'
import type { UsageStats, UsageQueryParams } from '../types'

export const usageApi = {
  get: (params?: UsageQueryParams) =>
    apiClient.get<UsageStats>(
      '/usage',
      params as Record<string, string | number | boolean | undefined>
    ),
}
