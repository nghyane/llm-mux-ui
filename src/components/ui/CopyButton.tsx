import { useState } from 'react'
import { cn } from '../../lib/cn'
import { Icon } from './Icon'

interface CopyButtonProps {
  value: string
  className?: string
}

export function CopyButton({ value, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center justify-center p-1.5 rounded-md transition-colors',
        'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-hover)',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring) focus-visible:ring-offset-2 focus-visible:ring-offset-(--ring-offset)',
        className
      )}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      title="Copy to clipboard"
    >
      <Icon 
        name={copied ? 'check' : 'content_copy'} 
        size="sm" 
        className={cn(
          "transition-all duration-200",
          copied ? "text-(--success-text) scale-110" : ""
        )}
      />
    </button>
  )
}
