import { cn } from '../../lib/cn'

export const inputStyles = cn(
  'flex h-9 w-full rounded-md border border-(--border-color) bg-transparent px-3 py-1',
  'text-sm shadow-sm transition-colors',
  'file:border-0 file:bg-transparent file:text-sm file:font-medium',
  'placeholder:text-(--text-tertiary)',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring) focus-visible:ring-offset-2 focus-visible:ring-offset-(--ring-offset)',
  'disabled:cursor-not-allowed disabled:opacity-50'
)
