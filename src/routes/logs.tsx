import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useClearLogs, useErrorLogFiles, useServerLogs } from '../api/hooks/useLogs'
import { LogSkeleton } from '../components/features/logs/LogSkeleton'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'
import { SearchInput } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { useToast } from '../context/ToastContext'
import { cn } from '../lib/cn'

export const Route = createFileRoute('/logs')({
  component: LogsPage,
})

type LogLevel = 'all' | 'info' | 'warning' | 'error'

// Parse log line to extract level and timestamp
function parseLogLine(line: string): { timestamp: string; level: LogLevel; message: string } {
  // Common log patterns:
  // [2024-01-15 14:23:01] [INFO] message
  // 2024-01-15T14:23:01 INFO message
  // [REQUEST] [INFO] message

  const timestampMatch = line.match(/^(?:\[)?(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2})(?:\])?/)
  const timestamp = timestampMatch ? formatTimestamp(timestampMatch[1]) : ''

  // Detect level from line content
  let level: LogLevel = 'info'
  const lowerLine = line.toLowerCase()
  if (lowerLine.includes('[error]') || lowerLine.includes('error') || lowerLine.includes('exception') || lowerLine.includes('failed')) {
    level = 'error'
  } else if (lowerLine.includes('[warn') || lowerLine.includes('warning') || lowerLine.includes('rate_limit') || lowerLine.includes('quota')) {
    level = 'warning'
  }

  return { timestamp, level, message: line }
}

function formatTimestamp(ts: string): string {
  try {
    const date = new Date(ts.replace(' ', 'T'))
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return ts.substring(11, 19) // Extract time portion
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function LogsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState<LogLevel>('all')
  const [isPaused, setIsPaused] = useState(false)
  const [showClearModal, setShowClearModal] = useState(false)
  const [showLoading, setShowLoading] = useState(false)
  const logContainerRef = useRef<HTMLDivElement>(null)
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout>>(null)
  const toast = useToast()

  // Fetch logs with auto-refresh (disabled when paused)
  const { data: logsData, isLoading, error, refetch } = useServerLogs(
    { limit: 500 },
    !isPaused
  )

  // Delay showing loading to prevent flash for fast responses
  useEffect(() => {
    if (isLoading && !logsData) {
      loadingTimerRef.current = setTimeout(() => setShowLoading(true), 300)
      return () => {
        if (loadingTimerRef.current) {
          clearTimeout(loadingTimerRef.current)
        }
      }
    } else {
      // Use setTimeout to avoid synchronous setState in effect
      const hideTimer = setTimeout(() => setShowLoading(false), 0)
      return () => clearTimeout(hideTimer)
    }
  }, [isLoading, logsData])

  // Fetch error log files
  const { data: errorFilesData } = useErrorLogFiles()

  // Clear logs mutation
  const clearLogsMutation = useClearLogs()

  // Parse and filter logs
  const filteredLogs = useMemo(() => {
    if (!logsData?.lines) return []

    return logsData.lines
      .map(parseLogLine)
      .filter(log => {
        // Level filter
        if (levelFilter !== 'all' && log.level !== levelFilter) {
          return false
        }

        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          if (!log.message.toLowerCase().includes(query)) {
            return false
          }
        }

        return true
      })
      .reverse() // Show newest first
  }, [logsData, levelFilter, searchQuery])

  // Auto-scroll to top when new logs arrive (if not paused)
  const prevLogsCountRef = useRef(0)
  useEffect(() => {
    const currentCount = filteredLogs.length
    if (currentCount !== prevLogsCountRef.current) {
      prevLogsCountRef.current = currentCount
      if (!isPaused && logContainerRef.current) {
        logContainerRef.current.scrollTop = 0
      }
    }
  })

  // Handle clear logs

  const handleClearLogs = async () => {
    try {
      await clearLogsMutation.mutateAsync()
      toast.success('Logs cleared successfully')
      setShowClearModal(false)
    } catch (err) {
      toast.error(`Failed to clear logs: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  // Handle export logs
  const handleExportLogs = useCallback(() => {
    if (!logsData?.lines) {
      toast.warning('No logs to export')
      return
    }

    const content = logsData.lines.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `llm-mux-logs-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Logs exported successfully')
  }, [logsData, toast])

  // Count logs by level
  const logCounts = useMemo(() => {
    if (!logsData?.lines) return { all: 0, info: 0, warning: 0, error: 0 }

    const counts = { all: logsData.lines.length, info: 0, warning: 0, error: 0 }
    for (const line of logsData.lines) {
      const { level } = parseLogLine(line)
      if (level === 'error') counts.error++
      else if (level === 'warning') counts.warning++
      else counts.info++
    }
    return counts
  }, [logsData])

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-(--text-primary)">
            Server Logs
          </h2>
          <p className="text-(--text-secondary) mt-1 text-sm">
            Monitor server activity and debug issues in real-time.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleExportLogs} disabled={!logsData?.lines?.length}>
            <Icon name="download" size="sm" />
            Export Logs
          </Button>
          <Button variant="danger" onClick={() => setShowClearModal(true)} disabled={!logsData?.lines?.length}>
            <Icon name="delete" size="sm" />
            Clear Logs
          </Button>
        </div>
      </div>

      {/* Error State - only show for real errors, not "disabled" states */}
      {error && !error.message?.includes('disabled') && (
        <Card className="p-4 border-l-4 border-(--danger-text) bg-(--danger-bg)">
          <div className="flex items-start gap-3">
            <Icon name="error" className="text-(--danger-text) mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-(--danger-text)">
                Failed to load logs
              </p>
              <p className="text-xs text-(--text-secondary) mt-1">
                {error.message || 'An error occurred while fetching logs'}
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
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <SearchInput
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <FilterButton
              active={levelFilter === 'all'}
              onClick={() => setLevelFilter('all')}
              count={logCounts.all}
            >
              All
            </FilterButton>
            <FilterButton
              active={levelFilter === 'info'}
              onClick={() => setLevelFilter('info')}
              count={logCounts.info}
              className="text-(--info-text)"
            >
              Info
            </FilterButton>
            <FilterButton
              active={levelFilter === 'warning'}
              onClick={() => setLevelFilter('warning')}
              count={logCounts.warning}
              className="text-(--warning-text)"
            >
              Warning
            </FilterButton>
            <FilterButton
              active={levelFilter === 'error'}
              onClick={() => setLevelFilter('error')}
              count={logCounts.error}
              className="text-(--danger-text)"
            >
              Error
            </FilterButton>
          </div>
        </div>
      </Card>

      {/* Log Viewer */}
      <Card>
        <div className="p-4 border-b border-(--border-color) flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isPaused && (
              <div className="size-2 rounded-full bg-(--success-text) animate-pulse" />
            )}
            <span className="text-sm text-(--text-secondary)">
              {isPaused ? 'Paused' : 'Live'} ({filteredLogs.length} entries)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <Icon name="refresh" size="sm" />
              Refresh
            </Button>
            <Button
              variant={isPaused ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
            >
              <Icon name={isPaused ? 'play_arrow' : 'pause'} size="sm" />
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
          </div>
        </div>
        <div
          ref={logContainerRef}
          className="p-4 font-mono text-xs bg-(--bg-muted) min-h-[400px] max-h-[600px] overflow-auto"
        >
          {showLoading ? (
            <LogSkeleton />
          ) : filteredLogs.length > 0 ? (
            filteredLogs.map((log, index) => (
              <LogLine key={`${log.timestamp}-${index}`} {...log} />
            ))
          ) : (
            <LogsEmptyState
              isDisabled={error?.message?.includes('disabled')}
              isLoading={showLoading}
              hasFilters={!!(searchQuery || levelFilter !== 'all')}
            />
          )}
        </div>
      </Card>

      {/* Error Log Files */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-(--text-primary)">
            Error Log Files
          </h3>
          <span className="text-xs text-(--text-tertiary)">
            Available when request-log is disabled
          </span>
        </div>
        {!errorFilesData?.files?.length ? (
          <div className="text-center py-8 text-(--text-tertiary)">
            <Icon name="folder_open" className="text-4xl mb-2" />
            <p className="text-sm">No error log files available</p>
          </div>
        ) : (
          <div className="space-y-2">
            {errorFilesData.files.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between p-3 bg-(--bg-hover) rounded-lg border border-(--border-color)"
              >
                <div className="flex items-center gap-3">
                  <Icon name="description" size="md" className="text-(--text-tertiary)" />
                  <div>
                    <p className="text-sm font-medium text-(--text-primary)">{file.name}</p>
                    <p className="text-xs text-(--text-secondary)">
                      {formatFileSize(file.size)} • Modified{' '}
                      {new Date(file.modified * 1000).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Icon name="download" size="sm" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Clear Logs Modal */}
      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Clear All Logs"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-(--text-secondary)">
            Are you sure you want to clear all server logs? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowClearModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleClearLogs}
              disabled={clearLogsMutation.isPending}
            >
              {clearLogsMutation.isPending ? (
                <>
                  <Icon name="progress_activity" size="sm" className="animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Icon name="delete" size="sm" />
                  Clear Logs
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

interface FilterButtonProps {
  active: boolean
  onClick: () => void
  count?: number
  className?: string
  children: React.ReactNode
}

function FilterButton({ active, onClick, count, className, children }: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-200',
        active ? '' : 'hover:bg-(--bg-hover) opacity-70 hover:opacity-100',
        className
      )}
    >
      {/* Sliding background pill */}
      {active && (
        <motion.span
          layoutId="log-filter-pill"
          className="absolute inset-0 bg-(--bg-card) border border-(--border-color) shadow-sm rounded-md"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      {/* Text content - always on top */}
      <span className="relative z-10">
        {children}
        {count !== undefined && count > 0 && (
          <span className="ml-1.5 text-(--text-tertiary)">({count})</span>
        )}
      </span>
    </button>
  )
}

interface LogLineProps {
  timestamp: string
  level: LogLevel
  message: string
}

function LogLine({ timestamp, level, message }: LogLineProps) {
  const levelColors = {
    all: 'text-(--text-secondary)',
    info: 'text-(--info-text)',
    warning: 'text-(--warning-text)',
    error: 'text-(--danger-text)',
  }

  const levelBgColors = {
    all: '',
    info: '',
    warning: 'bg-(--warning-bg)',
    error: 'bg-(--danger-bg)',
  }

  return (
    <div className={cn('flex gap-4 py-1 px-2 -mx-2 rounded hover:bg-(--bg-hover)', levelBgColors[level])}>
      {timestamp && (
        <span className="text-(--text-tertiary) shrink-0">{timestamp}</span>
      )}
      <span className={cn('uppercase shrink-0 w-16', levelColors[level])}>
        [{level === 'all' ? 'info' : level}]
      </span>
      <span className="text-(--text-secondary) break-all">{message}</span>
    </div>
  )
}

// Single empty state component - no layout shift
function LogsEmptyState({ isDisabled, isLoading, hasFilters }: {
  isDisabled?: boolean
  isLoading?: boolean
  hasFilters?: boolean
}) {
  const icon = isDisabled ? 'toggle_off' : isLoading ? 'progress_activity' : 'description'
  const title = isDisabled
    ? 'Logging is disabled'
    : isLoading
    ? 'Loading logs...'
    : hasFilters
    ? 'No logs match your filters'
    : 'No logs available'
  const subtitle = isDisabled ? 'Enable in Settings to view logs' : undefined

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center text-(--text-tertiary) w-48">
        <Icon name={icon} size="xl" className={cn('mb-3', isLoading && 'animate-spin')} />
        <p className="text-sm">{title}</p>
        {subtitle && <p className="text-xs mt-1">{subtitle}</p>}
      </div>
    </div>
  )
}
