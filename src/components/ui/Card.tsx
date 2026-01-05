import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  elevation?: 0 | 1 | 2 | 3
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = true, elevation = 1, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'border border-(--border-color) rounded-xl',
          elevation === 0 && 'bg-(--bg-page)',
          elevation === 1 && 'bg-(--bg-container) shadow-sm',
          elevation === 2 && 'bg-(--bg-container) shadow-md',
          elevation === 3 && 'bg-(--bg-container) shadow-lg',
          hover && 'hover:border-(--border-hover) transition-all',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('p-6 border-b border-(--border-color)', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardHeader.displayName = 'CardHeader'

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('p-6', className)} {...props}>
        {children}
      </div>
    )
  }
)

CardContent.displayName = 'CardContent'

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('p-6 border-t border-(--border-color)', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardFooter.displayName = 'CardFooter'
