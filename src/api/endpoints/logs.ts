import { apiClient } from '../client'
import type {
  LogsResponse,
  ClearLogsResponse,
  ErrorLogFilesResponse,
  LogsQueryParams,
} from '../types'

export const logsApi = {
  get: (params?: LogsQueryParams) =>
    apiClient.get<LogsResponse>('/logs', params as Record<string, number | undefined>),

  clear: () => apiClient.delete<ClearLogsResponse>('/logs'),
}

export const errorLogsApi = {
  list: () => apiClient.get<ErrorLogFilesResponse>('/request-error-logs'),

  download: (name: string) => apiClient.get<Blob>(`/request-error-logs/${name}`),
}
