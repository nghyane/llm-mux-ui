import { apiClient } from '../client'
import type {
  ApiKeysResponse,
  ApiKeyPatchRequest,
  OAuthExcludedModelsResponse,
  OAuthExcludedModelsPatchRequest,
  StatusOkResponse,
} from '../types'

export const apiKeysApi = {
  get: () => apiClient.get<ApiKeysResponse>('/api-keys'),

  replaceAll: (keys: string[]) =>
    apiClient.put<StatusOkResponse>('/api-keys', keys),

  update: (data: ApiKeyPatchRequest) =>
    apiClient.patch<StatusOkResponse>('/api-keys', data),

  delete: (params: { index?: number; value?: string }) =>
    apiClient.delete<StatusOkResponse>('/api-keys', params),
}

export const oauthExcludedModelsApi = {
  get: () => apiClient.get<OAuthExcludedModelsResponse>('/oauth-excluded-models'),

  replaceAll: (models: Record<string, string[]>) =>
    apiClient.put<StatusOkResponse>('/oauth-excluded-models', models),

  update: (data: OAuthExcludedModelsPatchRequest) =>
    apiClient.patch<StatusOkResponse>('/oauth-excluded-models', data),

  delete: (provider: string) =>
    apiClient.delete<StatusOkResponse>('/oauth-excluded-models', { provider }),
}
