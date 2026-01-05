export type AuthFileStatus = 'active' | 'disabled' | 'error' | 'cooling' | 'unavailable'

export type AuthFileSource = 'file' | 'memory'

export interface QuotaState {
  active_requests: number
  total_tokens_used: number
  in_cooldown: boolean
  cooldown_until?: string
  cooldown_remaining_seconds?: number
  learned_limit?: number
  learned_cooldown_seconds?: number
  last_exhausted_at?: string
}

export interface AuthFile {
  id: string
  auth_index?: number
  name: string
  type: string
  provider: string
  label?: string
  email?: string
  account_type?: string
  account?: string
  status: AuthFileStatus
  status_message?: string
  disabled?: boolean
  unavailable?: boolean
  runtime_only?: boolean
  source: AuthFileSource
  path?: string
  size?: number
  modtime?: string
  created_at?: string
  updated_at?: string
  last_refresh?: string
  quota_state?: QuotaState
}

export interface AuthFilesResponse {
  files: AuthFile[]
}

export interface DeleteAuthFilesResponse {
  status: string
  deleted?: number
}

export interface VertexImportRequest {
  credentials: Record<string, unknown>
  project_id?: string
  location?: string
}

export interface VertexImportResponse {
  status: string
}
