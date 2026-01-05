import { cn } from '../../lib/cn'

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <header className={cn(
      'flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8',
      className
    )}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-(--text-primary)">
          {title}
        </h1>
        {description && (
          <p className="text-(--text-secondary) mt-1 text-sm">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </header>
  )
}
