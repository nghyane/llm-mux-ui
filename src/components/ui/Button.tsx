import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring) focus-visible:ring-offset-2 focus-visible:ring-offset-(--ring-offset)',
          'disabled:opacity-50 disabled:pointer-events-none',
          // Sizes
          size === 'sm' && 'px-3 py-1.5 text-xs',
          size === 'md' && 'px-4 py-2 text-sm',
          size === 'lg' && 'px-6 py-3 text-base',
          // Variants
          variant === 'primary' && [
            'bg-(--accent-primary) text-(--accent-primary-fg)',
            'hover:opacity-90 active:opacity-80 active:scale-[0.98]',
          ],
          variant === 'secondary' && [
            'bg-(--bg-card) text-(--text-primary) border border-(--border-color)',
            'hover:bg-(--bg-hover) hover:border-(--border-hover) active:bg-(--bg-active)',
            'shadow-sm',
          ],
          variant === 'ghost' && [
            'text-(--text-secondary)',
            'hover:text-(--text-primary) hover:bg-(--bg-hover) active:bg-(--bg-active)',
          ],
          variant === 'danger' && [
            'text-(--danger-text)',
            'hover:bg-(--danger-bg) active:bg-(--danger-bg)/80',
          ],
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
