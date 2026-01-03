// Token breakdown
export interface TokenSummary {
  total: number
  input: number
  output: number
  reasoning?: number
}

// Main summary
export interface UsageSummary {
  total_requests: number
  success_count: number
  failure_count: number
  tokens: TokenSummary
}

// Per-provider stats
export interface UsageProviderStats {
  requests: number
  success: number
  failure: number
  tokens: TokenSummary
  accounts: number
  models: string[]
}

// Per-account stats
export interface UsageAccountStats {
  provider: string
  auth_id: string
  requests: number
  success: number
  failure: number
  tokens: TokenSummary
}

// Per-model stats
export interface UsageModelStats {
  provider: string
  requests: number
  success: number
  failure: number
  tokens: TokenSummary
}

// Timeline data
export interface UsageDayStats {
  day: string // YYYY-MM-DD format
  requests: number
  tokens: number
}

export interface UsageHourStats {
  hour: number // 0-23
  requests: number
  tokens: number
}

export interface UsageTimeline {
  by_day: UsageDayStats[]
  by_hour: UsageHourStats[]
}

// Period info
export interface UsagePeriod {
  from: string // ISO datetime
  to: string
  retention_days: number
}

// Main usage response
export interface UsageStats {
  summary: UsageSummary
  by_provider: Record<string, UsageProviderStats>
  by_account: Record<string, UsageAccountStats>
  by_model: Record<string, UsageModelStats>
  timeline: UsageTimeline
  period: UsagePeriod
}

// Query parameters
export interface UsageQueryParams {
  days?: number
  from?: string // YYYY-MM-DD or RFC3339
  to?: string // YYYY-MM-DD or RFC3339
}

// For backwards compat during migration
export type UsageResponse = UsageStats

// Legacy type aliases for migration (deprecated - will be removed in future)
/** @deprecated Use UsageSummary instead */
export type UsageCounters = UsageSummary
/** @deprecated Use UsageDayStats instead */
export type UsageByDay = UsageDayStats
/** @deprecated Use UsageHourStats instead */
export type UsageByHour = UsageHourStats
