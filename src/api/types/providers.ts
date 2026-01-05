export type ProviderType =
  | 'gemini'
  | 'anthropic'
  | 'openai'
  | 'vertex-compat'

export interface ProviderAPIKey {
  key: string
  'proxy-url'?: string
}

export interface ProviderModel {
  name: string
  alias?: string
}

export interface Provider {
  type: ProviderType
  name: string
  enabled?: boolean
  'api-key'?: string
  'api-keys'?: ProviderAPIKey[]
  'base-url'?: string
  'proxy-url'?: string
  headers?: Record<string, string>
  models?: ProviderModel[]
  'excluded-models'?: string[]
}

export interface ProvidersResponse {
  providers: Provider[]
}

export interface ProviderDeleteParams {
  index: number
}
