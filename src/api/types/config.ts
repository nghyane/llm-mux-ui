import type { Provider } from './providers'

export interface Config {
  port?: number
  'auth-dir'?: string
  debug?: boolean
  'logging-to-file'?: boolean
  'usage-statistics-enabled'?: boolean
  'proxy-url'?: string
  'request-retry'?: number
  'max-retry-interval'?: number
  'ws-auth'?: boolean
  'request-log'?: boolean
  providers?: Provider[]
  [key: string]: unknown
}

export interface LatestVersionResponse {
  'latest-version': string
  cached?: boolean
  stale?: boolean
}

export interface ConfigUpdateResponse {
  ok: boolean
  changed: string[]
}
