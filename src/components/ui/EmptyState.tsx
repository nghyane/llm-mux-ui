import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Icon } from './Icon'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon = 'inbox',
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-6 py-12 text-center min-h-[300px]',
        className
      )}
    >
      <div className="p-4 rounded-full bg-(--bg-hover) mb-4">
        <Icon 
          name={icon} 
          size="xl" 
          className="text-(--text-tertiary) text-4xl" 
        />
      </div>
      
      <h3 className="text-lg font-semibold text-(--text-primary) mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-(--text-secondary) max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}
      
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  )
}
