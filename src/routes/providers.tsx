import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

import { useAuthFiles, useDeleteAuthFile } from '../api/hooks/useAuthFiles'
import { useProviders } from '../api/hooks/useProviders'
import { useUsageStats } from '../api/hooks/useUsage'
import type { AuthFile } from '../api/types'
import { AddProviderModal } from '../components/features/providers/AddProviderModal'
import { ProviderCard } from '../components/features/providers/ProviderCard'
import { ProviderCardSkeleton } from '../components/features/providers/ProviderCardSkeleton'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Icon } from '../components/ui/Icon'
import { Input } from '../components/ui/Input'
import { Tabs } from '../components/ui/Tabs'
import { useToast } from '../context/ToastContext'
import { formatNumber } from '../lib/utils'

export const Route = createFileRoute('/providers')({
  component: ProvidersPage,
})

function ProvidersPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'providers' | 'oauth'>('oauth')
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshingAll, setIsRefreshingAll] = useState(false)
  const [refreshingCardId, setRefreshingCardId] = useState<string | null>(null)

  const toast = useToast()

  // Fetch auth files and usage stats
  const { data: authFilesData, isLoading, error: authError, refetch } = useAuthFiles()
  const { data: providersData, isLoading: providersLoading } = useProviders()
  const { data: usageData } = useUsageStats()
  const deleteAuthFile = useDeleteAuthFile()

  // Group providers by status
  const groupedProviders = useMemo(() => {
    const files = authFilesData?.files || []

    // Filter by search query
    const filtered = searchQuery
      ? files.filter((file) => {
          const query = searchQuery.toLowerCase()
          return (
            file.name.toLowerCase().includes(query) ||
            file.provider.toLowerCase().includes(query) ||
            file.email?.toLowerCase().includes(query) ||
            file.label?.toLowerCase().includes(query)
          )
        })
      : files

    // Group by status
    const active: AuthFile[] = []
    const disabled: AuthFile[] = []
    const errors: AuthFile[] = []

    filtered.forEach((file) => {
      if (file.disabled) {
        disabled.push(file)
      } else if (file.status === 'error' || file.unavailable) {
        errors.push(file)
      } else {
        active.push(file)
      }
    })

    return { active, disabled, errors, all: filtered }
  }, [authFilesData, searchQuery])

  const handleRefreshAll = async () => {
    if (isRefreshingAll) return

    setIsRefreshingAll(true)
    try {
      await refetch()
      toast.success('All providers refreshed successfully')
    } catch (err) {
      toast.error(`Failed to refresh providers: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsRefreshingAll(false)
    }
  }

  const handleRefreshCard = async (provider: AuthFile) => {
    if (refreshingCardId) return

    setRefreshingCardId(provider.id)
    try {
      // In a real implementation, you'd call a refresh endpoint for specific provider
      await refetch()
      toast.success(`${provider.name} refreshed successfully`)
    } catch (err) {
      toast.error(`Failed to refresh ${provider.name}: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setRefreshingCardId(null)
    }
  }

  const handleDisconnect = async (provider: AuthFile) => {
    // Confirmation is now handled within ProviderCard component
    try {
      await deleteAuthFile.mutateAsync(provider.name)
      toast.success(`${provider.name} removed successfully`)
    } catch (err) {
      toast.error(`Failed to remove provider: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleToggleDisabled = async (_provider: AuthFile) => {
    // This would require an API endpoint to toggle the disabled status
    toast.warning('Toggle disabled status - API endpoint needed')
  }

  const handleAddSuccess = () => {
    refetch()
    toast.success('Provider added successfully')
  }

  const getProviderUsageByAccount = (provider: AuthFile) => {
    if (!usageData?.by_account) return undefined

    const accountKey = `${provider.provider}:${provider.name}`
    const accountUsage = usageData.by_account[accountKey]
    if (!accountUsage) return undefined

    return {
      total_requests: accountUsage.requests,
      total_tokens: accountUsage.tokens.total,
    }
  }

  const getApiProviderUsage = (providerType: string) => {
    if (!usageData?.by_provider) return undefined
    const usage = usageData.by_provider[providerType.toLowerCase()]
    if (!usage) return undefined
    return {
      requests: usage.requests,
      tokens: usage.tokens.total,
      success_rate: usage.requests > 0 ? (usage.success / usage.requests) * 100 : 0,
    }
  }

  const totalProviders = authFilesData?.files.length || 0
  const activeCount = groupedProviders.active.length
  const errorCount = groupedProviders.errors.length

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-(--text-primary)">
            Providers Management
          </h2>
          <p className="text-(--text-secondary) mt-1 text-sm">
            Manage API connections, monitor status, and configure provider settings.
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
          <Icon name="add" size="sm" />
          Add Provider
        </Button>
      </div>

      <Tabs
        tabs={[
          { id: 'oauth', label: 'OAuth Accounts', icon: 'account_circle' },
          { id: 'providers', label: 'API Providers', icon: 'key' },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as 'providers' | 'oauth')}
      />

      {activeTab === 'providers' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Icon name="info" className="text-(--text-tertiary)" />
              <p className="text-sm text-(--text-secondary)">
                Configure API key-based providers. These are direct API connections without OAuth.
              </p>
            </div>
            {providersLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <ProviderCardSkeleton key={i} />
                ))}
              </div>
            ) : !providersData?.providers?.length ? (
              <EmptyState
                icon="key"
                title="No API providers configured"
                description="Add providers with API keys in your configuration."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providersData.providers.map((provider, idx) => (
                  <Card key={provider.name || idx} className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="size-10 rounded-lg bg-(--bg-hover) flex items-center justify-center">
                        <Icon name="key" className="text-(--text-secondary)" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-(--text-primary)">{provider.name}</p>
                        <p className="text-xs text-(--text-tertiary)">{provider.type}</p>
                      </div>
                      <Badge
                        variant={provider.enabled !== false ? 'success' : 'default'}
                      >
                        {provider.enabled !== false ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>
                    {(() => {
                      const usage = getApiProviderUsage(provider.type)
                      if (!usage) return null
                      return (
                        <div className="flex items-center gap-4 pt-3 border-t border-(--border-color)">
                          <div className="flex items-center gap-1.5">
                            <Icon name="data_usage" size="sm" className="text-(--text-tertiary)" />
                            <span className="text-xs text-(--text-secondary)">
                              {formatNumber(usage.requests)} requests
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Icon name="token" size="sm" className="text-(--text-tertiary)" />
                            <span className="text-xs text-(--text-secondary)">
                              {formatNumber(usage.tokens)} tokens
                            </span>
                          </div>
                          {usage.success_rate > 0 && (
                            <div className="flex items-center gap-1.5 ml-auto">
                              <Icon
                                name="check_circle"
                                size="sm"
                                className={
                                  usage.success_rate >= 99
                                    ? 'text-(--success-text)'
                                    : 'text-(--text-tertiary)'
                                }
                              />
                              <span className="text-xs text-(--text-secondary)">
                                {usage.success_rate.toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'oauth' && (
        <div className="space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-(--text-secondary) uppercase tracking-wider">
                Total Providers
              </p>
              {isLoading ? (
                  <div className="h-8 w-16 bg-(--bg-hover) rounded animate-pulse mt-1" />
              ) : (
                <p className="text-2xl font-bold text-(--text-primary) mt-1">
                  {totalProviders}
                </p>
              )}
            </div>
            <div className="size-10 rounded-lg bg-(--bg-hover) flex items-center justify-center">
              <Icon name="cloud" size="md" className="text-(--text-secondary)" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-(--text-secondary) uppercase tracking-wider">
                Active
              </p>
              {isLoading ? (
                  <div className="h-8 w-16 bg-(--bg-hover) rounded animate-pulse mt-1" />
              ) : (
                <p className="text-2xl font-bold text-(--success-text) mt-1">
                  {activeCount}
                </p>
              )}
            </div>
            <div className="size-10 rounded-lg bg-(--success-bg) flex items-center justify-center">
              <Icon name="check_circle" size="md" className="text-(--success-text)" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-(--text-secondary) uppercase tracking-wider">
                Issues
              </p>
              {isLoading ? (
                  <div className="h-8 w-16 bg-(--bg-hover) rounded animate-pulse mt-1" />
              ) : (
                <p className="text-2xl font-bold text-(--danger-text) mt-1">
                  {errorCount}
                </p>
              )}
            </div>
            <div className="size-10 rounded-lg bg-(--danger-bg) flex items-center justify-center">
              <Icon name="error" size="md" className="text-(--danger-text)" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            icon="search"
            placeholder="Search providers by name, email, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          variant="ghost"
          onClick={handleRefreshAll}
          disabled={isRefreshingAll || isLoading}
        >
          <Icon
            name="refresh"
            size="sm"
            className={isRefreshingAll ? 'animate-spin' : ''}
          />
          {isRefreshingAll ? 'Refreshing...' : 'Refresh All'}
        </Button>
      </div>

      {/* Error State */}
      {authError && (
        <Card className="p-4 border-l-4 border-(--danger-text) bg-(--danger-bg)">
          <div className="flex items-start gap-3">
            <Icon name="error" className="text-(--danger-text) mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-(--danger-text)">
                Failed to load providers
              </p>
              <p className="text-xs text-(--text-secondary) mt-1">
                {authError.message || 'An error occurred while fetching providers'}
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
                Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {['a', 'b', 'c', 'd', 'e', 'f'].map((id) => (
                <ProviderCardSkeleton key={id} />
            ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !authError && totalProviders === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="size-16 rounded-full bg-(--bg-hover) flex items-center justify-center mb-4">
            <Icon name="cloud_off" size="xl" className="text-(--text-secondary)" />
          </div>
          <h3 className="text-lg font-semibold text-(--text-primary) mb-2">
            No providers connected
          </h3>
          <p className="text-sm text-(--text-secondary) mb-6 text-center max-w-md">
            Get started by connecting your first provider. Choose from OAuth, API keys, or file upload.
          </p>
          <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
            <Icon name="add" size="sm" />
            Add Your First Provider
          </Button>
        </div>
      )}

      {/* Active Providers */}
      {!isLoading && !authError && groupedProviders.active.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-(--text-primary) flex items-center gap-2">
              <Icon name="check_circle" size="sm" className="text-(--success-text)" />
              Active Connections
              <Badge variant="success">{groupedProviders.active.length}</Badge>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {groupedProviders.active.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                usage={getProviderUsageByAccount(provider)}
                onRefresh={() => handleRefreshCard(provider)}
                onDisconnect={() => handleDisconnect(provider)}
                onToggleDisabled={() => handleToggleDisabled(provider)}
                isRefreshing={refreshingCardId === provider.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Error Providers */}
      {!isLoading && !authError && groupedProviders.errors.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-(--text-primary) flex items-center gap-2">
              <Icon name="error" size="sm" className="text-(--danger-text)" />
              Issues & Errors
              <Badge variant="danger">{groupedProviders.errors.length}</Badge>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {groupedProviders.errors.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                usage={getProviderUsageByAccount(provider)}
                onRefresh={() => handleRefreshCard(provider)}
                onDisconnect={() => handleDisconnect(provider)}
                onToggleDisabled={() => handleToggleDisabled(provider)}
                isRefreshing={refreshingCardId === provider.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Disabled Providers */}
      {!isLoading && !authError && groupedProviders.disabled.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-(--text-primary) flex items-center gap-2">
              <Icon name="block" size="sm" />
              Disabled Providers
              <Badge variant="default">{groupedProviders.disabled.length}</Badge>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {groupedProviders.disabled.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                usage={getProviderUsageByAccount(provider)}
                onRefresh={() => handleRefreshCard(provider)}
                onDisconnect={() => handleDisconnect(provider)}
                onToggleDisabled={() => handleToggleDisabled(provider)}
                isRefreshing={refreshingCardId === provider.id}
              />
            ))}
          </div>
        </section>
      )}

          {/* No Search Results */}
          {!isLoading && !authError && totalProviders > 0 && groupedProviders.all.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <Icon name="search_off" size="xl" className="text-(--text-secondary) mb-3" />
              <h3 className="text-lg font-semibold text-(--text-primary) mb-2">
                No providers found
              </h3>
              <p className="text-sm text-(--text-secondary) mb-4">
                Try adjusting your search query
              </p>
              <Button variant="ghost" onClick={() => setSearchQuery('')}>
                <Icon name="clear" size="sm" />
                Clear Search
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Add Provider Modal */}
      <AddProviderModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  )
}
