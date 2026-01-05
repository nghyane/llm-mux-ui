export const queryKeys = {
  settings: ['settings'] as const,
  debug: () => [...queryKeys.settings, 'debug'] as const,
  loggingToFile: () => [...queryKeys.settings, 'logging-to-file'] as const,
  usageStatisticsEnabled: () => [...queryKeys.settings, 'usage-statistics-enabled'] as const,
  proxyUrl: () => [...queryKeys.settings, 'proxy-url'] as const,
  switchProject: () => [...queryKeys.settings, 'switch-project'] as const,
  switchPreviewModel: () => [...queryKeys.settings, 'switch-preview-model'] as const,
  requestLog: () => [...queryKeys.settings, 'request-log'] as const,
  wsAuth: () => [...queryKeys.settings, 'ws-auth'] as const,
  requestRetry: () => [...queryKeys.settings, 'request-retry'] as const,
  maxRetryInterval: () => [...queryKeys.settings, 'max-retry-interval'] as const,

  providers: ['providers'] as const,
  providersList: () => [...queryKeys.providers, 'list'] as const,

  apiKeys: ['api-keys'] as const,
  accessKeys: () => [...queryKeys.apiKeys, 'access'] as const,
  oauthExcludedModels: () => [...queryKeys.apiKeys, 'oauth-excluded-models'] as const,

  authFiles: ['auth-files'] as const,
  authFilesList: () => [...queryKeys.authFiles, 'list'] as const,
  authFileDownload: (name: string) => [...queryKeys.authFiles, 'download', name] as const,

  oauth: ['oauth'] as const,
  oauthStatus: (state: string) => [...queryKeys.oauth, 'status', state] as const,

  usage: ['usage'] as const,
  usageStats: (params?: { days?: number; from?: string; to?: string }) =>
    [...queryKeys.usage, 'stats', params] as const,

  logs: ['logs'] as const,
  serverLogs: (after?: number, limit?: number) =>
    [...queryKeys.logs, 'server', { after, limit }] as const,
  errorLogFiles: () => [...queryKeys.logs, 'error-files'] as const,
  errorLog: (name: string) => [...queryKeys.logs, 'error', name] as const,

  config: ['config'] as const,
  configJson: () => [...queryKeys.config, 'json'] as const,
  configYaml: () => [...queryKeys.config, 'yaml'] as const,
  latestVersion: () => [...queryKeys.config, 'latest-version'] as const,
} as const
