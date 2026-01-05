import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../queryKeys'
import { providersApi } from '../endpoints'
import type { Provider, ProviderDeleteParams } from '../types'

export const useProviders = () =>
  useQuery({
    queryKey: queryKeys.providersList(),
    queryFn: () => providersApi.getAll(),
  })

export const useReplaceProviders = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (providers: Provider[]) => providersApi.replaceAll(providers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.providers })
    },
  })
}

export const useDeleteProvider = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: ProviderDeleteParams) => providersApi.delete(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.providers })
    },
  })
}

export const useAddProvider = () => {
  const { data: providersData } = useProviders()
  const replaceProviders = useReplaceProviders()

  return useMutation({
    mutationFn: async (newProvider: Provider) => {
      const existing = providersData?.providers || []
      return replaceProviders.mutateAsync([...existing, newProvider])
    },
  })
}

export const useUpdateProvider = () => {
  const { data: providersData } = useProviders()
  const replaceProviders = useReplaceProviders()

  return useMutation({
    mutationFn: async ({ index, provider }: { index: number; provider: Provider }) => {
      const existing = [...(providersData?.providers || [])]
      existing[index] = provider
      return replaceProviders.mutateAsync(existing)
    },
  })
}
