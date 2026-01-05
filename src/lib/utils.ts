// Format large numbers (e.g., 2400000 -> "2.4M")
export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B'
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  }
  return num.toString()
}

// Format percentage
export function formatPercent(num: number, decimals = 1): string {
  return num.toFixed(decimals) + '%'
}

// Format milliseconds to readable latency
export function formatLatency(ms: number): string {
  if (ms >= 1000) {
    return (ms / 1000).toFixed(1) + 's'
  }
  return ms + 'ms'
}

// Format relative time (e.g., "2 hours ago", "Just now")
export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date()
  const target = new Date(date)
  const diffMs = now.getTime() - target.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'Just now'
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`

  return target.toLocaleDateString()
}

// Format timestamp for logs
export function formatTimestamp(date: Date | string | number): string {
  const d = new Date(date)
  return d.toISOString().replace('T', ' ').slice(0, 19)
}

// Format token counts with units
export function formatTokens(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(2)}M tokens`
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K tokens`
  }
  return `${tokens} tokens`
}

// Format byte sizes
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
