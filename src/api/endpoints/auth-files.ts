import { apiClient } from '../client'
import type {
  AuthFilesResponse,
  DeleteAuthFilesResponse,
  VertexImportRequest,
  VertexImportResponse,
  StatusOkResponse,
} from '../types'

export const authFilesApi = {
  list: (runtimeOnly?: boolean) =>
    apiClient.get<AuthFilesResponse>('/auth-files', { 'runtime-only': runtimeOnly }),

  upload: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post<StatusOkResponse>('/auth-files', formData)
  },

  deleteByName: (name: string) =>
    apiClient.delete<DeleteAuthFilesResponse>('/auth-files', { name }),

  deleteAll: () =>
    apiClient.delete<DeleteAuthFilesResponse>('/auth-files', { all: 'true' }),

  download: (name: string) =>
    apiClient.get<Record<string, unknown>>('/auth-files/download', { name }),
}

export const vertexApi = {
  import: (data: VertexImportRequest) =>
    apiClient.post<VertexImportResponse>('/vertex/import', data),
}
