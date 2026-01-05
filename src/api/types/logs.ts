export interface LogsResponse {
  lines: string[]
  line_count: number
  latest_timestamp: number
}

export interface ClearLogsResponse {
  success: boolean
  message: string
  removed: number
}

export interface ErrorLogFile {
  name: string
  size: number
  modified: number
}

export interface ErrorLogFilesResponse {
  files: ErrorLogFile[]
}

export interface LogsQueryParams {
  after?: number
  limit?: number
}
