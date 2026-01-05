export type OAuthProvider =
  | 'claude'
  | 'anthropic'
  | 'codex'
  | 'gemini'
  | 'gemini-cli'
  | 'antigravity'
  | 'iflow'

export type DeviceFlowProvider = 'qwen' | 'copilot' | 'github-copilot'

export type AllOAuthProvider = OAuthProvider | DeviceFlowProvider

export type OAuthFlowStatus = 'pending' | 'completed' | 'failed' | 'cancelled'

export interface OAuthStartRequest {
  provider: AllOAuthProvider
  project_id?: string
}

export interface OAuthStartResponse {
  status: 'ok' | 'error'
  flow_type?: 'oauth' | 'device'
  auth_url?: string
  state: string
  id: string
  error?: string
  code_verifier?: string
  code_challenge?: string
  user_code?: string
  verification_url?: string
  expires_in?: number
  interval?: number
}

export interface OAuthStatusResponse {
  status: OAuthFlowStatus
  error?: string
}

export interface OAuthCancelResponse {
  status: 'ok'
}

export interface OAuthCallbackMessage {
  type: 'oauth-callback'
  provider: string
  state: string
  status: 'success' | 'error'
  error?: string
}

export type OAuthErrorCode =
  | 'INVALID_PROVIDER'
  | 'STATE_NOT_FOUND'
  | 'CALLBACK_FAILED'
  | 'TOKEN_EXCHANGE_FAILED'
  | 'USER_DENIED'
  | 'TIMEOUT'
