import { apiClient } from '../client'
import type {
  Provider,
  ProvidersResponse,
  ProviderDeleteParams,
  StatusOkResponse,
} from '../types'

export const providersApi = {
  getAll: () => apiClient.get<ProvidersResponse>('/providers'),

  replaceAll: (providers: Provider[]) =>
    apiClient.put<StatusOkResponse>('/providers', providers),

  delete: (params: ProviderDeleteParams) =>
    apiClient.delete<StatusOkResponse>('/providers', { index: params.index }),
}
