import { cn } from '../../lib/cn'

interface PageContentProps {
  children: React.ReactNode
  variant?: 'default' | 'constrained' | 'full'
  className?: string
}

export function PageContent({ children, variant = 'default', className }: PageContentProps) {
  return (
    <div className={cn(
      'space-y-8',
      variant === 'constrained' && 'max-w-4xl',
      variant === 'full' && 'w-full',
      className
    )}>
      {children}
    </div>
  )
}
