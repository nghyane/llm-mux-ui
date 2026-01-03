/**
 * Device Flow Modal Component
 */

import { useEffect, useState } from 'react'
import { Modal, ModalFooter } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { Icon } from '../../ui/Icon'
import { cn } from '../../../lib/cn'
import { useToast } from '../../../context/ToastContext'
import type { DeviceFlowProvider } from '../../../api/types'

interface DeviceFlowModalProps {
  isOpen: boolean
  onClose: () => void
  provider: DeviceFlowProvider
  userCode: string
  verificationUrl: string
  expiresIn: number
  onCancel: () => void
  onRetry?: () => void
  status: 'polling' | 'success' | 'error' | 'expired'
  error?: string
}

const PROVIDER_INFO: Record<DeviceFlowProvider, { name: string; icon: string }> = {
  qwen: { name: 'Qwen', icon: 'smart_toy' },
  copilot: { name: 'GitHub Copilot', icon: 'code' },
  'github-copilot': { name: 'GitHub Copilot', icon: 'code' },
}

export function DeviceFlowModal({
  isOpen,
  onClose,
  provider,
  userCode,
  verificationUrl,
  expiresIn,
  onCancel,
  onRetry,
  status,
  error,
}: DeviceFlowModalProps) {
  const [copied, setCopied] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(expiresIn)
  const [lastAnnouncedTime, setLastAnnouncedTime] = useState<number | null>(null)
  const [previousStatus, setPreviousStatus] = useState(status)
  const toast = useToast()

  const providerInfo = PROVIDER_INFO[provider]

  // Countdown timer with accessibility announcements
  useEffect(() => {
    if (!isOpen || status !== 'polling') {
      setTimeRemaining(expiresIn)
      setLastAnnouncedTime(null)
      return
    }

    setTimeRemaining(expiresIn)
    const interval = setInterval(() => {
      setTimeRemaining((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [isOpen, expiresIn, status])

  // Track status changes for announcements
  useEffect(() => {
    if (status !== previousStatus) {
      setPreviousStatus(status)
    }
  }, [status, previousStatus])

  useEffect(() => {
    if (isOpen) setCopied(false)
  }, [isOpen])

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(userCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for clipboard API failure
      const textarea = document.createElement('textarea')
      textarea.value = userCode
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        // Show manual copy hint
        toast.warning('Please select and copy the code manually')
      } finally {
        document.body.removeChild(textarea)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTimerColor = () => {
    const percent = (timeRemaining / expiresIn) * 100
    if (percent < 10) return 'text-(--danger-text)'
    if (percent < 25) return 'text-(--warning-text)'
    if (percent < 50) return 'text-(--warning-text)'
    return 'text-(--text-primary)'
  }

  const handleCancel = () => {
    onCancel()
    onClose()
  }

  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    }
  }

  // Determine if we should announce time remaining (at key intervals)
  const shouldAnnounceTime = (seconds: number) => {
    const announceAt = [300, 120, 60, 30, 10] // 5 min, 2 min, 1 min, 30 sec, 10 sec
    return announceAt.includes(seconds) && lastAnnouncedTime !== seconds
  }

  // Get time announcement
  const getTimeAnnouncement = (seconds: number) => {
    if (shouldAnnounceTime(seconds)) {
      setLastAnnouncedTime(seconds)
      if (seconds >= 60) {
        const mins = Math.floor(seconds / 60)
        return `${mins} ${mins === 1 ? 'minute' : 'minutes'} remaining`
      }
      return `${seconds} seconds remaining`
    }
    return null
  }

  const timeAnnouncement = getTimeAnnouncement(timeRemaining)

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} size="md" showCloseButton={false}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-(--accent-primary)/10 rounded-lg">
            <Icon name={providerInfo.icon} size="xl" className="text-(--accent-primary)" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-(--text-primary)">
              Connect {providerInfo.name}
            </h2>
            <p className="text-sm text-(--text-secondary)">Device authorization</p>
          </div>
        </div>

        {status === 'polling' && (
          <>
            {/* Instructions */}
            <ol className="text-sm text-(--text-secondary) list-decimal list-inside space-y-1">
              <li>Copy the code below</li>
              <li>Open the verification page</li>
              <li>Enter the code when prompted</li>
            </ol>

            {/* User Code */}
            <div className="p-6 bg-(--bg-secondary) rounded-lg text-center">
              <p className="text-xs text-(--text-secondary) mb-2 uppercase tracking-wider">
                User Code
              </p>
              <div
                className="font-mono text-3xl font-bold text-(--text-primary) tracking-widest mb-4"
                role="status"
                aria-live="polite"
                aria-label={`Your authorization code is: ${userCode.split('').join(' ')}`}
              >
                {userCode}
              </div>
              <Button variant="secondary" size="sm" onClick={handleCopyCode}>
                <Icon name={copied ? 'check' : 'content_copy'} size="sm" />
                {copied ? 'Copied!' : 'Copy Code'}
              </Button>
            </div>

            {/* SR-only immediate code announcement */}
            {userCode && (
              <div className="sr-only" role="alert" aria-live="assertive">
                Authorization code ready: {userCode}
              </div>
            )}

            {/* Open Verification URL */}
            <Button
              variant="primary"
              onClick={() => window.open(verificationUrl, '_blank', 'noopener,noreferrer')}
              className="w-full"
            >
              <Icon name="open_in_new" size="sm" />
              Open Verification Page
            </Button>

            {/* Polling Indicator */}
            <div className="flex items-center justify-center gap-3 py-2">
              <Icon name="progress_activity" size="md" className="text-(--accent-primary) animate-spin" />
              <p className="text-sm text-(--text-secondary)">Waiting for authorization...</p>
            </div>

            {/* SR-only loading status */}
            <div className="sr-only" role="status" aria-live="polite">
              Authenticating, please wait
            </div>

            {/* Timer */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-center gap-2">
                <Icon name="schedule" size="sm" className="text-(--text-secondary)" />
                <p className="text-xs text-(--text-secondary)">
                  Code expires in{' '}
                  <span className={cn(
                    'font-mono font-semibold',
                    getTimerColor()
                  )}>
                    {formatTime(timeRemaining)}
                  </span>
                </p>
              </div>
              {/* Progress bar */}
              <div className="h-1 bg-(--bg-secondary) rounded-full overflow-hidden">
                <div
                  className="h-full bg-(--accent-primary) transition-all duration-1000"
                  style={{ width: `${(timeRemaining / expiresIn) * 100}%` }}
                />
              </div>
            </div>

            {/* SR-only timer announcements at key intervals */}
            {timeAnnouncement && (
              <div className="sr-only" role="status" aria-live="polite">
                {timeAnnouncement}
              </div>
            )}
          </>
        )}

        {status === 'success' && (
          <>
            <div className="py-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-(--success-bg) rounded-full mb-4">
                <Icon name="check_circle" size="xl" className="text-(--success-text)" />
              </div>
              <h3 className="text-lg font-semibold text-(--text-primary) mb-2">
                Authorization Successful!
              </h3>
              <p className="text-sm text-(--text-secondary)">
                {providerInfo.name} has been connected.
              </p>
            </div>

            {/* SR-only success announcement */}
            {previousStatus !== 'success' && (
              <div className="sr-only" role="alert" aria-live="assertive">
                Authorization successful! {providerInfo.name} has been connected.
              </div>
            )}
          </>
        )}

        {status === 'error' && (
          <>
            <div className="py-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-(--danger-bg) rounded-full mb-4">
                <Icon name="error" size="xl" className="text-(--danger-text)" />
              </div>
              <h3 className="text-lg font-semibold text-(--text-primary) mb-2">
                Authorization Failed
              </h3>
              <p className="text-sm text-(--text-secondary)">{error || 'An error occurred.'}</p>
            </div>

            {/* SR-only error announcement */}
            {previousStatus !== 'error' && (
              <div className="sr-only" role="alert" aria-live="assertive">
                Authorization failed. {error || 'An error occurred.'}
              </div>
            )}
          </>
        )}

        {status === 'expired' && (
          <>
            <div className="py-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-(--warning-bg) rounded-full mb-4">
                <Icon name="schedule" size="xl" className="text-(--warning-text)" />
              </div>
              <h3 className="text-lg font-semibold text-(--text-primary) mb-2">Code Expired</h3>
              <p className="text-sm text-(--text-secondary)">Please try again.</p>
            </div>

            {/* SR-only expiration announcement */}
            {previousStatus !== 'expired' && (
              <div className="sr-only" role="alert" aria-live="assertive">
                Authorization code has expired. Please try again.
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <ModalFooter className="px-0 py-0 border-0">
          {status === 'polling' ? (
            <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
          ) : status === 'expired' && onRetry ? (
            <>
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button variant="primary" onClick={handleRetry}>
                <Icon name="refresh" size="sm" />
                Try Again
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={onClose}>Close</Button>
          )}
        </ModalFooter>
      </div>
    </Modal>
  )
}
