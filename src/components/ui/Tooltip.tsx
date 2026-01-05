import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface TooltipProps {
  content: string
  children: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  return (
    <div className="group relative inline-flex">
      {children}
      
      <div
        className={cn(
          'absolute z-50 px-2 py-1 text-xs font-medium text-(--accent-primary-fg) bg-(--text-primary) rounded shadow-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none',
          side === 'top' && 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
          side === 'bottom' && 'top-full left-1/2 -translate-x-1/2 mt-1.5',
          side === 'left' && 'right-full top-1/2 -translate-y-1/2 mr-1.5',
          side === 'right' && 'left-full top-1/2 -translate-y-1/2 ml-1.5',
          side === 'top' && 'group-hover:translate-y-[-2px]',
          side === 'bottom' && 'group-hover:translate-y-[2px]',
          side === 'left' && 'group-hover:translate-x-[-2px]',
          side === 'right' && 'group-hover:translate-x-[2px]',
          className
        )}
        role="tooltip"
      >
        {content}
        <div
            className={cn(
                'absolute w-2 h-2 bg-(--text-primary) rotate-45',
                side === 'top' && 'bottom-[-3px] left-1/2 -translate-x-1/2',
                side === 'bottom' && 'top-[-3px] left-1/2 -translate-x-1/2',
                side === 'left' && 'right-[-3px] top-1/2 -translate-y-1/2',
                side === 'right' && 'left-[-3px] top-1/2 -translate-y-1/2',
            )}
        />
      </div>
    </div>
  )
}
