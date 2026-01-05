import { apiClient } from '../client'
import type {
  OAuthStartRequest,
  OAuthStartResponse,
  OAuthStatusResponse,
  OAuthCancelResponse,
} from '../types'

export const oauthApi = {
  start: (data: OAuthStartRequest) =>
    apiClient.post<OAuthStartResponse>('/oauth/start', data),

  getStatus: (state: string) =>
    apiClient.get<OAuthStatusResponse>(`/oauth/status/${state}`),

  cancel: (state: string) =>
    apiClient.post<OAuthCancelResponse>(`/oauth/cancel/${state}`),
}
