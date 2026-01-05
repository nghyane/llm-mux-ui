/**
 * OAuth Button Component - Unified API
 */

import { Button } from '../../ui/Button'
import { Icon } from '../../ui/Icon'
import { useToast } from '../../../context/ToastContext'
import { useOAuthFlow } from '../../../api/hooks/useOAuth'
import { useDeviceFlow } from './useDeviceFlow'
import { DeviceFlowModal } from './DeviceFlowModal'
import { categorizeOAuthError } from '../../../lib/oauth-errors'
import type { OAuthProvider, DeviceFlowProvider } from '../../../api/types'

interface OAuthButtonProps {
  provider: OAuthProvider | DeviceFlowProvider
  onSuccess?: () => void
  onError?: (error: string) => void
  projectId?: string
  className?: string
  children?: React.ReactNode
}

const PROVIDER_LABELS: Record<OAuthProvider | DeviceFlowProvider, string> = {
  claude: 'Claude',
  anthropic: 'Anthropic',
  codex: 'OpenAI Codex',
  gemini: 'Google Gemini',
  'gemini-cli': 'Google Gemini',
  antigravity: 'Antigravity',
  iflow: 'iFlow',
  qwen: 'Qwen',
  copilot: 'GitHub Copilot',
  'github-copilot': 'GitHub Copilot',
}

const DEVICE_FLOW_PROVIDERS: DeviceFlowProvider[] = ['qwen', 'copilot', 'github-copilot']

function isDeviceFlowProvider(provider: string): provider is DeviceFlowProvider {
  return DEVICE_FLOW_PROVIDERS.includes(provider as DeviceFlowProvider)
}

export function OAuthButton({
  provider,
  onSuccess,
  onError,
  projectId,
  className,
  children,
}: OAuthButtonProps) {
  const toast = useToast()

  // OAuth flow hook
  const oauth = useOAuthFlow({
    onSuccess: (p) => {
      toast.success(`${PROVIDER_LABELS[p as OAuthProvider]} connected!`)
      onSuccess?.()
    },
    onError: (_, error) => {
      const categorized = categorizeOAuthError(error)
      toast.error(categorized.message)
      onError?.(error)
    },
  })

  // Device flow hook
  const deviceFlow = useDeviceFlow({
    onSuccess: () => {
      toast.success(`${PROVIDER_LABELS[provider]} connected!`)
      onSuccess?.()
    },
    onError: (error) => {
      const categorized = categorizeOAuthError(error)
      toast.error(categorized.message)
      onError?.(error)
    },
  })

  const handleClick = async () => {
    if (isDeviceFlowProvider(provider)) {
      await deviceFlow.startDeviceFlow(provider)
    } else {
      await oauth.startFlow(provider, projectId)
    }
  }

  const isLoading = oauth.isLoading || deviceFlow.status === 'polling'

  return (
    <>
      {children ? (
        <div
          onClick={!isLoading ? handleClick : undefined}
          className={className}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              if (!isLoading) handleClick()
            }
          }}
          aria-disabled={isLoading}
        >
          {children}
        </div>
      ) : (
        <Button
          variant="primary"
          onClick={handleClick}
          disabled={isLoading}
          className={className}
          aria-label={`Connect to ${PROVIDER_LABELS[provider]}${isLoading ? ' - Authenticating' : ''}`}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <Icon name="progress_activity" size="sm" className="animate-spin" />
              Authenticating...
            </>
          ) : (
            <>
              <Icon name="login" size="sm" />
              Connect {PROVIDER_LABELS[provider]}
            </>
          )}
        </Button>
      )}

      {/* Device Flow Modal */}
      {isDeviceFlowProvider(provider) && deviceFlow.provider && (
        <DeviceFlowModal
          isOpen={deviceFlow.isOpen}
          onClose={deviceFlow.reset}
          provider={deviceFlow.provider}
          userCode={deviceFlow.userCode || ''}
          verificationUrl={deviceFlow.verificationUrl || ''}
          expiresIn={deviceFlow.expiresIn}
          onCancel={deviceFlow.cancel}
          onRetry={deviceFlow.retry}
          status={deviceFlow.status === 'idle' ? 'polling' : deviceFlow.status}
          error={deviceFlow.error || undefined}
        />
      )}
    </>
  )
}
