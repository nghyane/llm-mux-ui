import { cn } from '../../lib/cn'

interface PageSectionProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function PageSection({ title, description, children, className }: PageSectionProps) {
  return (
    <section className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h2 className="text-lg font-semibold text-(--text-primary)">{title}</h2>
          )}
          {description && (
            <p className="text-sm text-(--text-secondary) mt-1">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  )
}
