export interface ApiKeysResponse {
  'api-keys': string[]
}

export interface ApiKeyPatchRequest {
  old?: string
  new?: string
  index?: number
  value?: string
}

export interface OAuthExcludedModelsResponse {
  'oauth-excluded-models': Record<string, string[]>
}

export interface OAuthExcludedModelsPatchRequest {
  provider: string
  models?: string[]
}
