import { type ReactNode, useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '../../lib/cn'
import { Icon } from './Icon'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
}

const sizeStyles = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  
  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Focus Trap & Escape Key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      // Focus trap logic
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    
    // Initial focus
    if (modalRef.current) {
      const firstFocusable = modalRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement
      firstFocusable?.focus()
    }

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 w-full h-full border-0 cursor-default"
        onClick={onClose}
        aria-label="Close modal"
        tabIndex={-1}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={cn(
          'relative w-full mx-4 surface-2 border border-(--border-color) rounded-xl',
          'animate-in zoom-in-95 duration-200',
          sizeStyles[size],
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-6 border-b border-(--border-color)">
            {title && (
              <h2 id={titleId} className="text-lg font-semibold text-(--text-primary)">{title}</h2>
            )}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="ml-auto text-(--text-secondary) hover:text-(--text-primary) transition-colors p-1 hover:bg-(--bg-hover) rounded-lg"
                aria-label="Close"
              >
                <Icon name="close" size="md" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>,
    document.body
  )
}

export function ModalFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 px-6 py-6 border-t border-(--border-color)',
        className
      )}
    >
      {children}
    </div>
  )
}
