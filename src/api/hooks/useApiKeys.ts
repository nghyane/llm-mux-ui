import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../queryKeys'
import { apiKeysApi, oauthExcludedModelsApi } from '../endpoints'
import type { ApiKeyPatchRequest, OAuthExcludedModelsPatchRequest } from '../types'

export const useApiKeys = () =>
  useQuery({
    queryKey: queryKeys.accessKeys(),
    queryFn: () => apiKeysApi.get(),
  })

export const useReplaceApiKeys = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (keys: string[]) => apiKeysApi.replaceAll(keys),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accessKeys() })
    },
  })
}

export const useUpdateApiKey = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ApiKeyPatchRequest) => apiKeysApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accessKeys() })
    },
  })
}

export const useDeleteApiKey = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: { index?: number; value?: string }) => apiKeysApi.delete(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accessKeys() })
    },
  })
}

export const useOAuthExcludedModels = () =>
  useQuery({
    queryKey: queryKeys.oauthExcludedModels(),
    queryFn: () => oauthExcludedModelsApi.get(),
  })

export const useReplaceOAuthExcludedModels = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (models: Record<string, string[]>) => oauthExcludedModelsApi.replaceAll(models),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.oauthExcludedModels() })
    },
  })
}

export const useUpdateOAuthExcludedModels = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: OAuthExcludedModelsPatchRequest) => oauthExcludedModelsApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.oauthExcludedModels() })
    },
  })
}

export const useDeleteOAuthExcludedModels = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (provider: string) => oauthExcludedModelsApi.delete(provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.oauthExcludedModels() })
    },
  })
}
