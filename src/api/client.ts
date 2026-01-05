import type { AuthConfig, ApiError, ApiEnvelope } from './types/common'

export class ApiClientError extends Error {
  statusCode: number
  error: string

  constructor(statusCode: number, error: string, message?: string) {
    super(message || error)
    this.name = 'ApiClientError'
    this.statusCode = statusCode
    this.error = error
  }
}

export interface ApiClientConfig {
  baseUrl?: string
  auth?: AuthConfig
}

export class ApiClient {
  private baseUrl: string
  private auth?: AuthConfig

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl =
      config.baseUrl ||
      import.meta.env.VITE_API_BASE_URL ||
      'http://localhost:8317/v1/management'
    this.auth = config.auth
  }

  setAuth(auth: AuthConfig) {
    this.auth = auth
  }

  setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  getBaseUrl(): string {
    return this.baseUrl
  }

  private getAuthHeaders(): Record<string, string> {
    if (!this.auth) {
      return {}
    }

    if (this.auth.bearerToken) {
      return {
        Authorization: `Bearer ${this.auth.bearerToken}`,
      }
    }

    if (this.auth.managementKey) {
      return {
        'X-Management-Key': this.auth.managementKey,
      }
    }

    return {}
  }

  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    const base = this.baseUrl.endsWith('/') ? this.baseUrl : `${this.baseUrl}/`
    const path = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
    const url = new URL(path, base)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    return url.toString()
  }

  private unwrapEnvelope<T>(data: unknown): T {
    if (
      data &&
      typeof data === 'object' &&
      'data' in data &&
      'meta' in data
    ) {
      return (data as ApiEnvelope<T>).data
    }
    return data as T
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type')

    if (contentType && !contentType.includes('application/json')) {
      if (contentType.includes('application/octet-stream')) {
        return (await response.blob()) as T
      }
      if (contentType.includes('application/yaml') || contentType.includes('text/yaml')) {
        return (await response.text()) as T
      }
      return (await response.text()) as T
    }

    const data = await response.json()

    if (!response.ok) {
      const error: ApiError = data
      throw new ApiClientError(
        response.status,
        error.error || 'Unknown error',
        error.message
      )
    }

    return this.unwrapEnvelope<T>(data)
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    const url = this.buildUrl(endpoint, params)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders(),
      },
    })

    return this.handleResponse<T>(response)
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    const url = this.buildUrl(endpoint, params)

    const isFormData = body instanceof FormData
    const headers: Record<string, string> = {
      ...this.getAuthHeaders(),
    }

    if (!isFormData) {
      headers['Content-Type'] = 'application/json'
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: isFormData ? body : JSON.stringify(body),
    })

    return this.handleResponse<T>(response)
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    params?: Record<string, string | number | boolean | undefined>,
    contentType?: string
  ): Promise<T> {
    const url = this.buildUrl(endpoint, params)

    const headers: Record<string, string> = {
      ...this.getAuthHeaders(),
      'Content-Type': contentType || 'application/json',
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: contentType === 'application/yaml' ? (body as string) : JSON.stringify(body),
    })

    return this.handleResponse<T>(response)
  }

  async patch<T>(
    endpoint: string,
    body?: unknown,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    const url = this.buildUrl(endpoint, params)

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    return this.handleResponse<T>(response)
  }

  async delete<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    const url = this.buildUrl(endpoint, params)

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        ...this.getAuthHeaders(),
      },
    })

    return this.handleResponse<T>(response)
  }
}

export const apiClient = new ApiClient()
