import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../queryKeys'
import { authFilesApi, vertexApi } from '../endpoints'
import type { VertexImportRequest } from '../types'

export const useAuthFiles = () =>
  useQuery({
    queryKey: queryKeys.authFilesList(),
    queryFn: () => authFilesApi.list(),
  })

export const useUploadAuthFile = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => authFilesApi.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.authFilesList() })
    },
  })
}

export const useDeleteAuthFile = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => authFilesApi.deleteByName(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.authFilesList() })
    },
  })
}

export const useDeleteAllAuthFiles = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => authFilesApi.deleteAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.authFilesList() })
    },
  })
}

export const useDownloadAuthFile = (name: string, enabled = false) =>
  useQuery({
    queryKey: queryKeys.authFileDownload(name),
    queryFn: () => authFilesApi.download(name),
    enabled,
  })

export const useImportVertex = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: VertexImportRequest) => vertexApi.import(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.authFilesList() })
    },
  })
}
