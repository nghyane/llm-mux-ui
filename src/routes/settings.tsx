import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { SettingToggle } from '../components/ui/SettingToggle'
import { SettingInput } from '../components/ui/SettingInput'
import { ApiConfigModal } from '../components/features/settings/ApiConfigModal'
import { useApiConfigContext, DEFAULT_BASE_URL } from '../context/ApiConfigContext'
import { useToast } from '../context/ToastContext'
import { PageHeader, PageContent, PageSection } from '../components/layout'
import {
  useDebug,
  useUpdateDebug,
  useLoggingToFile,
  useUpdateLoggingToFile,
  useUsageStatisticsEnabled,
  useUpdateUsageStatisticsEnabled,
  useRequestLog,
  useUpdateRequestLog,
  useWsAuth,
  useUpdateWsAuth,
  useProxyUrl,
  useUpdateProxyUrl,
  useDeleteProxyUrl,
  useRequestRetry,
  useUpdateRequestRetry,
  useMaxRetryInterval,
  useUpdateMaxRetryInterval,
  useSwitchProject,
  useUpdateSwitchProject,
  useSwitchPreviewModel,
  useUpdateSwitchPreviewModel,
} from '../api/hooks/useSettings'
import { useLatestVersion } from '../api/hooks/useConfig'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const { config, isConfigured, saveConfig, clearConfig, testConnection } = useApiConfigContext()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showClearModal, setShowClearModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const toast = useToast()

  // Settings queries - include isError to handle API errors
  const { data: debugData, isLoading: debugLoading, isError: debugError } = useDebug()
  const { data: loggingData, isLoading: loggingLoading, isError: loggingError } = useLoggingToFile()
  const { data: usageStatsData, isLoading: usageStatsLoading, isError: usageStatsError } = useUsageStatisticsEnabled()
  const { data: requestLogData, isLoading: requestLogLoading, isError: requestLogError } = useRequestLog()
  const { data: wsAuthData, isLoading: wsAuthLoading, isError: wsAuthError } = useWsAuth()
  const { data: proxyData, isLoading: proxyLoading } = useProxyUrl()
  const { data: retryData, isLoading: retryLoading } = useRequestRetry()
  const { data: maxIntervalData, isLoading: maxIntervalLoading } = useMaxRetryInterval()
  const { data: switchProjectData, isLoading: switchProjectLoading, isError: switchProjectError } = useSwitchProject()
  const { data: switchPreviewData, isLoading: switchPreviewLoading, isError: switchPreviewError } = useSwitchPreviewModel()
  const { data: versionData } = useLatestVersion()

  // Helper to extract error from API response (API may return 200 with error field)
  const getApiError = (data: unknown): string | undefined => {
    if (data && typeof data === 'object' && 'error' in data) {
      return (data as { error: string }).error
    }
    return undefined
  }

  // Settings mutations
  const updateDebug = useUpdateDebug()
  const updateLogging = useUpdateLoggingToFile()
  const updateUsageStats = useUpdateUsageStatisticsEnabled()
  const updateRequestLog = useUpdateRequestLog()
  const updateWsAuth = useUpdateWsAuth()
  const updateProxyUrl = useUpdateProxyUrl()
  const deleteProxyUrl = useDeleteProxyUrl()
  const updateRetry = useUpdateRequestRetry()
  const updateMaxInterval = useUpdateMaxRetryInterval()
  const updateSwitchProject = useUpdateSwitchProject()
  const updateSwitchPreview = useUpdateSwitchPreviewModel()

  const maskKey = (key: string) => {
    if (key.length <= 8) return '********'
    return `${key.slice(0, 4)}****${key.slice(-4)}`
  }

  // Handle proxy URL update
  const handleProxyUpdate = async (value: string) => {
    try {
      if (value.trim() === '') {
        await deleteProxyUrl.mutateAsync()
        toast.success('Proxy URL removed')
      } else {
        await updateProxyUrl.mutateAsync(value)
        toast.success('Proxy URL updated')
      }
    } catch (err) {
      toast.error(`Failed to update proxy URL: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  // Handle retry count update
  const handleRetryUpdate = async (value: string) => {
    const numValue = parseInt(value)
    if (isNaN(numValue) || numValue < 0) {
      toast.error('Please enter a valid number')
      return
    }
    try {
      await updateRetry.mutateAsync(numValue)
      toast.success('Retry count updated')
    } catch (err) {
      toast.error(`Failed to update retry count: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  // Handle max interval update
  const handleMaxIntervalUpdate = async (value: string) => {
    const numValue = parseInt(value)
    if (isNaN(numValue) || numValue < 1) {
      toast.error('Please enter a valid number (minimum 1)')
      return
    }
    try {
      await updateMaxInterval.mutateAsync(numValue)
      toast.success('Max retry interval updated')
    } catch (err) {
      toast.error(`Failed to update max retry interval: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Configure server behavior, logging, and connection settings."
        action={versionData && <span className="text-xs text-(--text-tertiary)">v{versionData['latest-version']}</span>}
      />
      
      <PageContent variant="constrained">
        <PageSection>
          <Card>
            <div className="p-6 border-b border-(--border-color)">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-semibold text-(--text-primary)">
                    API Connection
                  </h3>
                  {isConfigured ? (
                    <Badge variant="success">Connected</Badge>
                  ) : (
                    <Badge variant="warning">Not Configured</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(true)}>
                    <Icon name="settings" size="sm" />
                    Reconfigure
                  </Button>
                  {isConfigured && (
                    <Button variant="danger" size="sm" onClick={clearConfig}>
                      <Icon name="power_settings_new" size="sm" />
                      Disconnect
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {isConfigured && config ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-(--text-secondary) mb-1">Base URL</p>
                      <p className="text-sm font-mono text-(--text-primary) bg-(--bg-hover) px-3 py-2 rounded-lg border border-(--border-color)">
                        {config.baseUrl}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-(--text-secondary) mb-1">Management Key</p>
                      <p className="text-sm font-mono text-(--text-primary) bg-(--bg-hover) px-3 py-2 rounded-lg border border-(--border-color)">
                        {maskKey(config.managementKey)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-(--text-secondary)">
                      <Icon name="check_circle" size="sm" className="text-(--success-text)" />
                      Connected and authenticated
                    </div>
                  </div>
                  <div className="pt-2 border-t border-(--border-color)">
                    <p className="text-xs text-(--text-secondary)">
                      <Icon name="info" size="sm" className="inline mr-1" />
                      To reconnect or change credentials, click "Reconfigure" above.
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex items-start gap-3 p-4 bg-(--warning-bg) border border-(--warning-text)/20 rounded-lg">
                  <Icon name="warning" size="sm" className="text-(--warning-text) mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-(--text-primary) mb-1">
                      API configuration required
                    </p>
                    <p className="text-xs text-(--text-secondary) mb-3">
                      You need to configure your API credentials to use this application.
                    </p>
                    <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
                      <Icon name="settings" size="sm" />
                      Configure Now
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </PageSection>

        <PageSection title="General Settings">
          <Card>
            <div className="p-6 space-y-6">
              <SettingToggle
                label="Debug Mode"
                description="Enable verbose logging for debugging purposes"
                checked={debugData?.debug ?? false}
                isLoading={debugLoading}
                isError={debugError}
                error={getApiError(debugData)}
                onChange={(value) => updateDebug.mutateAsync(value).catch((err) => {
                  toast.error(`Failed to update debug mode: ${err.message}`)
                })}
                isPending={updateDebug.isPending}
              />
              <SettingToggle
                label="Logging to File"
                description="Write logs to file instead of stdout"
                checked={loggingData?.['logging-to-file'] ?? false}
                isLoading={loggingLoading}
                isError={loggingError}
                error={getApiError(loggingData)}
                onChange={(value) => updateLogging.mutateAsync(value).catch((err) => {
                  toast.error(`Failed to update logging setting: ${err.message}`)
                })}
                isPending={updateLogging.isPending}
              />
              <SettingToggle
                label="Usage Statistics"
                description="Track and store usage statistics"
                checked={usageStatsData?.['usage-statistics-enabled'] ?? false}
                isLoading={usageStatsLoading}
                isError={usageStatsError}
                error={getApiError(usageStatsData)}
                onChange={(value) => updateUsageStats.mutateAsync(value).catch((err) => {
                  toast.error(`Failed to update usage statistics setting: ${err.message}`)
                })}
                isPending={updateUsageStats.isPending}
              />
              <SettingToggle
                label="Request Logging"
                description="Log detailed request/response data"
                checked={requestLogData?.['request-log'] ?? false}
                isLoading={requestLogLoading}
                isError={requestLogError}
                error={getApiError(requestLogData)}
                onChange={(value) => updateRequestLog.mutateAsync(value).catch((err) => {
                  toast.error(`Failed to update request logging setting: ${err.message}`)
                })}
                isPending={updateRequestLog.isPending}
              />
              <SettingToggle
                label="WebSocket Authentication"
                description="Require authentication for WebSocket connections"
                checked={wsAuthData?.['ws-auth'] ?? false}
                isLoading={wsAuthLoading}
                isError={wsAuthError}
                error={getApiError(wsAuthData)}
                onChange={(value) => updateWsAuth.mutateAsync(value).catch((err) => {
                  toast.error(`Failed to update WebSocket auth setting: ${err.message}`)
                })}
                isPending={updateWsAuth.isPending}
              />
            </div>
          </Card>
        </PageSection>

        <PageSection title="Connection Settings">
          <Card>
            <div className="p-6 space-y-6">
              <SettingInput
                label="Proxy URL"
                description="HTTP proxy for outgoing requests (optional)"
                placeholder="http://proxy.example.com:8080"
                value={proxyData?.['proxy-url'] ?? ''}
                isLoading={proxyLoading}
                onSave={handleProxyUpdate}
                isPending={updateProxyUrl.isPending || deleteProxyUrl.isPending}
              />
              <SettingInput
                label="Request Retry Count"
                description="Number of retries for failed requests"
                type="number"
                value={String(retryData?.['request-retry'] ?? 3)}
                isLoading={retryLoading}
                onSave={handleRetryUpdate}
                isPending={updateRetry.isPending}
              />
              <SettingInput
                label="Max Retry Interval"
                description="Maximum wait time between retries (seconds)"
                type="number"
                value={String(maxIntervalData?.['max-retry-interval'] ?? 30)}
                isLoading={maxIntervalLoading}
                onSave={handleMaxIntervalUpdate}
                isPending={updateMaxInterval.isPending}
              />
            </div>
          </Card>
        </PageSection>

        <PageSection title="Quota Exceeded Behavior">
          <Card>
            <div className="p-6 space-y-6">
              <SettingToggle
                label="Auto Switch Project"
                description="Automatically switch to another project when quota is exceeded"
                checked={switchProjectData?.['switch-project'] ?? false}
                isLoading={switchProjectLoading}
                isError={switchProjectError}
                error={getApiError(switchProjectData)}
                onChange={(value) => updateSwitchProject.mutateAsync(value).catch((err) => {
                  toast.error(`Failed to update switch project setting: ${err.message}`)
                })}
                isPending={updateSwitchProject.isPending}
              />
              <SettingToggle
                label="Use Preview Models"
                description="Fall back to preview models when quota is exceeded"
                checked={switchPreviewData?.['switch-preview-model'] ?? false}
                isLoading={switchPreviewLoading}
                isError={switchPreviewError}
                error={getApiError(switchPreviewData)}
                onChange={(value) => updateSwitchPreview.mutateAsync(value).catch((err) => {
                  toast.error(`Failed to update switch preview model setting: ${err.message}`)
                })}
                isPending={updateSwitchPreview.isPending}
              />
            </div>
          </Card>
        </PageSection>

        <PageSection title="Danger Zone">
          <Card className="border-(--danger-text)/30">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-(--text-primary)">Reset Configuration</p>
                  <p className="text-xs text-(--text-secondary)">
                    Reset all settings to default values
                  </p>
                </div>
                <Button variant="danger" size="sm" onClick={() => setShowResetModal(true)}>
                  <Icon name="restart_alt" size="sm" />
                  Reset
                </Button>
              </div>
              <div className="w-full h-px bg-(--border-color)" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-(--text-primary)">Clear All Data</p>
                  <p className="text-xs text-(--text-secondary)">
                    Remove all cached data and statistics
                  </p>
                </div>
                <Button variant="danger" size="sm" onClick={() => setShowClearModal(true)}>
                  <Icon name="delete_forever" size="sm" />
                  Clear
                </Button>
              </div>
            </div>
          </Card>
        </PageSection>
      </PageContent>

      <ApiConfigModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentConfig={config}
        defaultBaseUrl={DEFAULT_BASE_URL}
        onSave={saveConfig}
        onTest={testConnection}
      />

      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset Configuration"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-(--text-secondary)">
            Are you sure you want to reset all settings to their default values? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowResetModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => {
              toast.info('Reset functionality requires backend implementation')
              setShowResetModal(false)
            }}>
              <Icon name="restart_alt" size="sm" />
              Reset Settings
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Clear All Data"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-(--text-secondary)">
            Are you sure you want to clear all cached data and statistics? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowClearModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => {
              toast.info('Clear data functionality requires backend implementation')
              setShowClearModal(false)
            }}>
              <Icon name="delete_forever" size="sm" />
              Clear Data
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
