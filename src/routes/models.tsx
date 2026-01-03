import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { SearchInput } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Icon } from '../components/ui/Icon'
import { StatusBadge } from '../components/ui/Badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table'
import { useUsageStats } from '../api/hooks/useUsage'
import { useAuthFiles } from '../api/hooks/useAuthFiles'
import { getProviderConfig, getModelInitial, getUniqueProviders } from '../lib/providers'
import { formatNumber } from '../lib/utils'

export const Route = createFileRoute('/models')({
  component: ModelsPage,
})

// Model item type for display
interface ModelItem {
  id: string
  name: string
  provider: string
  providerDisplayName: string
  status: 'active' | 'degraded' | 'error'
  requests: number
  tokens: number
  failedRequests: number
}

const ITEMS_PER_PAGE = 10

function ModelsPage() {
  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [providerFilter, setProviderFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [page, setPage] = useState(1)

  // Data fetching
  const { data: usageData, isLoading: usageLoading, error: usageError, refetch } = useUsageStats()
  const { data: authData, isLoading: authLoading } = useAuthFiles()

  const isLoading = usageLoading || authLoading

  // Get provider status from auth files
  const providerStatuses = useMemo(() => {
    const statuses: Record<string, 'active' | 'degraded' | 'error'> = {}
    if (!authData?.files) return statuses

    for (const file of authData.files) {
      const providerKey = file.provider?.toLowerCase()
      if (!providerKey) continue

      // Use existing status or determine from auth status
      if (file.unavailable || file.status === 'error' || file.status === 'unavailable') {
        statuses[providerKey] = 'error'
      } else if (file.status === 'disabled' || file.status === 'cooling' || file.disabled) {
        if (!statuses[providerKey] || statuses[providerKey] === 'active') {
          statuses[providerKey] = 'degraded'
        }
      } else if (file.status === 'active') {
        if (!statuses[providerKey]) {
          statuses[providerKey] = 'active'
        }
      }
    }
    return statuses
  }, [authData])

  const allModels = useMemo((): ModelItem[] => {
    if (!usageData?.by_model) return []

    const models: ModelItem[] = []

    for (const [modelKey, modelUsage] of Object.entries(usageData.by_model)) {
      const providerKey = modelUsage.provider
      const providerConfig = getProviderConfig(providerKey)
      const providerStatus = providerStatuses[providerKey.toLowerCase()] || 'active'
      
      const modelStatus: 'active' | 'degraded' | 'error' = providerStatus

      models.push({
        id: `${providerKey}_${modelKey}`.replace(/[^a-zA-Z0-9_-]/g, '_'),
        name: modelKey,
        provider: providerKey,
        providerDisplayName: providerConfig.name,
        status: modelStatus,
        requests: modelUsage.requests,
        tokens: modelUsage.tokens.total,
        failedRequests: modelUsage.failure,
      })
    }

    return models.sort((a, b) => b.requests - a.requests)
  }, [usageData, providerStatuses])

  // Get unique providers for filter dropdown
  const providerOptions = useMemo(() => {
    const providers = getUniqueProviders(allModels.map(m => m.provider))
    return [
      { value: '', label: 'All Providers' },
      ...providers.map(p => ({ value: p.key, label: p.name })),
    ]
  }, [allModels])

  // Filter models
  const filteredModels = useMemo(() => {
    return allModels.filter(model => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!model.name.toLowerCase().includes(query) &&
            !model.providerDisplayName.toLowerCase().includes(query)) {
          return false
        }
      }

      // Provider filter
      if (providerFilter && model.provider.toLowerCase() !== providerFilter.toLowerCase()) {
        return false
      }

      // Status filter
      if (statusFilter && model.status !== statusFilter) {
        return false
      }

      return true
    })
  }, [allModels, searchQuery, providerFilter, statusFilter])

  // Pagination
  const totalPages = Math.ceil(filteredModels.length / ITEMS_PER_PAGE)
  const paginatedModels = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    return filteredModels.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredModels, page])

  // Reset page when filters change
  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setPage(1)
  }

  const handleProviderFilter = (value: string) => {
    setProviderFilter(value)
    setPage(1)
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    setPage(1)
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-(--text-primary)">
            Models Registry
          </h2>
          <p className="text-(--text-secondary) mt-1 text-sm">
            View all LLM models and their usage metrics from connected providers.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => refetch()}>
            <Icon name="sync" size="sm" />
            Refresh
          </Button>
          <Link to="/analytics">
            <Button variant="primary">
              <Icon name="analytics" size="sm" />
              View Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* Error State */}
      {usageError && (
        <Card className="p-4 border-l-4 border-(--danger-text) bg-(--danger-bg)">
          <div className="flex items-start gap-3">
            <Icon name="error" className="text-(--danger-text) mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-(--danger-text)">
                Failed to load usage data
              </p>
              <p className="text-xs text-(--text-secondary) mt-1">
                {usageError.message || 'An error occurred while fetching data'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="text-xs font-medium text-(--danger-text) hover:underline"
            >
              Retry
            </button>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full sm:w-96">
            <SearchInput
              placeholder="Search by model name..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Select
              options={providerOptions}
              value={providerFilter}
              onChange={(e) => handleProviderFilter(e.target.value)}
              className="w-40"
            />
            <Select
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'degraded', label: 'Degraded' },
                { value: 'error', label: 'Error' },
              ]}
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="w-36"
            />
            <div className="flex border border-(--border-color) rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-(--bg-card)' : 'hover:bg-(--bg-hover)'} border-r border-(--border-color)`}
              >
                <Icon name="view_list" size="md" className={viewMode === 'list' ? 'text-(--text-primary)' : 'text-(--text-tertiary)'} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-(--bg-card)' : 'hover:bg-(--bg-hover)'}`}
              >
                <Icon name="grid_view" size="md" className={viewMode === 'grid' ? 'text-(--text-primary)' : 'text-(--text-tertiary)'} />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center gap-3">
            <Icon name="progress_activity" size="xl" className="animate-spin text-(--text-tertiary)" />
            <p className="text-sm text-(--text-secondary)">Loading models...</p>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && filteredModels.length === 0 && (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center gap-3">
            <Icon name="model_training" size="xl" className="text-(--text-tertiary)" />
            <p className="text-sm text-(--text-secondary)">
              {searchQuery || providerFilter || statusFilter
                ? 'No models match your filters'
                : 'No model usage data available yet'}
            </p>
            {(searchQuery || providerFilter || statusFilter) && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setProviderFilter('')
                  setStatusFilter('')
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Models Table/Grid */}
      {!isLoading && filteredModels.length > 0 && (
        viewMode === 'list' ? (
          <Card>
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>Model Name</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requests</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead align="right">Actions</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {paginatedModels.map((model) => {
                  const providerConfig = getProviderConfig(model.provider)
                  return (
                    <TableRow key={model.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className="size-8 rounded-lg flex items-center justify-center text-xs font-bold"
                            style={{
                              backgroundColor: providerConfig.bgColor,
                              color: providerConfig.color,
                            }}
                          >
                            {getModelInitial(model.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-(--text-primary) truncate">{model.name}</p>
                            <p className="text-xs text-(--text-tertiary)">ID: {model.id.substring(0, 12)}...</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="size-6 rounded flex items-center justify-center"
                            style={{
                              backgroundColor: providerConfig.bgColor,
                              color: providerConfig.color,
                            }}
                          >
                            <span className="text-[10px] font-bold">
                              {providerConfig.initial}
                            </span>
                          </div>
                          <span className="text-(--text-primary)">{model.providerDisplayName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={model.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-(--text-primary) font-mono font-medium">
                            {formatNumber(model.requests)}
                          </span>
                          {model.failedRequests > 0 && (
                            <span className="text-xs text-(--danger-text)">
                              ({model.failedRequests} failed)
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-(--text-primary) font-mono font-medium">
                          {formatNumber(model.tokens)}
                        </span>
                      </TableCell>
                      <TableCell align="right">
                        <Link to="/analytics" search={{ model: model.name }}>
                          <button type="button" className="p-1 hover:bg-(--bg-hover) rounded text-(--text-tertiary) hover:text-(--text-primary)">
                            <Icon name="analytics" size="md" />
                          </button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="p-4 border-t border-(--border-color) flex items-center justify-between">
              <p className="text-sm text-(--text-secondary)">
                Showing{' '}
                <span className="font-medium text-(--text-primary)">
                  {Math.min((page - 1) * ITEMS_PER_PAGE + 1, filteredModels.length)}
                </span>{' '}
                to{' '}
                <span className="font-medium text-(--text-primary)">
                  {Math.min(page * ITEMS_PER_PAGE, filteredModels.length)}
                </span>{' '}
                of{' '}
                <span className="font-medium text-(--text-primary)">{filteredModels.length}</span> models
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedModels.map((model) => {
              const providerConfig = getProviderConfig(model.provider)
              return (
                <Card key={model.id} className="p-4" hover>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="size-10 rounded-lg flex items-center justify-center text-sm font-bold"
                        style={{
                          backgroundColor: providerConfig.bgColor,
                          color: providerConfig.color,
                        }}
                      >
                        {getModelInitial(model.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-(--text-primary) truncate" title={model.name}>
                          {model.name}
                        </p>
                        <p className="text-xs text-(--text-secondary)">{model.providerDisplayName}</p>
                      </div>
                    </div>
                    <StatusBadge status={model.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-(--text-secondary)">Requests</p>
                      <p className="text-lg font-mono font-bold text-(--text-primary)">
                        {formatNumber(model.requests)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-(--text-secondary)">Tokens</p>
                      <p className="text-lg font-mono font-bold text-(--text-primary)">
                        {formatNumber(model.tokens)}
                      </p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )
      )}

      {/* Grid Pagination */}
      {!isLoading && filteredModels.length > 0 && viewMode === 'grid' && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-(--text-secondary)">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

