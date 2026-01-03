import { cn } from '../../lib/cn'

type BadgeVariant = 'success' | 'danger' | 'warning' | 'default' | 'info'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
  dot?: boolean
  pulse?: boolean
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-(--success-bg) text-(--success-text)',
  danger: 'bg-(--danger-bg) text-(--danger-text)',
  warning: 'bg-(--warning-bg) text-(--warning-text)',
  default: 'bg-(--bg-hover) text-(--text-secondary) border border-(--border-color)/50',
  info: 'bg-(--info-bg) text-(--info-text)',
}

const dotStyles: Record<BadgeVariant, string> = {
  success: 'bg-(--success-text)',
  danger: 'bg-(--danger-text)',
  warning: 'bg-(--warning-text)',
  default: 'bg-(--text-secondary)',
  info: 'bg-(--info-text)',
}

export function Badge({ variant = 'default', children, className, dot = false, pulse = false }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'size-2 rounded-full',
            dotStyles[variant],
            pulse && 'animate-pulse'
          )}
        />
      )}
      {children}
    </span>
  )
}

// Status-specific badges for common use cases
export function StatusBadge({ status }: { status: 'connected' | 'error' | 'expired' | 'degraded' | 'active' }) {
  const config: Record<string, { variant: BadgeVariant; label: string; dot?: boolean; pulse?: boolean }> = {
    connected: { variant: 'success', label: 'Connected', dot: true },
    active: { variant: 'success', label: 'Active', dot: true },
    error: { variant: 'danger', label: 'Error', dot: true, pulse: true },
    expired: { variant: 'warning', label: 'Expired', dot: true },
    degraded: { variant: 'warning', label: 'Degraded', dot: true },
  }

  const { variant, label, dot, pulse } = config[status]

  return (
    <Badge variant={variant} dot={dot} pulse={pulse}>
      {label}
    </Badge>
  )
}

// HTTP Method badges
export function MethodBadge({ method }: { method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' }) {
  const styles: Record<string, string> = {
    GET: 'bg-(--success-bg) text-(--success-text) border-(--success-bg)',
    POST: 'bg-(--info-bg) text-(--info-text) border-(--info-bg)',
    PUT: 'bg-(--warning-bg) text-(--warning-text) border-(--warning-bg)',
    PATCH: 'bg-(--warning-bg) text-(--warning-text) border-(--warning-bg)',
    DELETE: 'bg-(--danger-bg) text-(--danger-text) border-(--danger-bg)',
  }

  return (
    <span className={cn('px-1.5 py-0.5 rounded-md text-[10px] font-bold border', styles[method])}>
      {method}
    </span>
  )
}
