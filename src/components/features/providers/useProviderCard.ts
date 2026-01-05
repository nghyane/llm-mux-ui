import { type AuthFile } from '../../../api/types'

interface ProviderCardProps {
  provider: AuthFile
  usage?: {
    total_requests: number
    total_tokens: number
  }
}

const providerDisplayNames: Record<string, string> = {
  anthropic: 'Anthropic',
  'gemini-cli': 'Google Gemini',
  'gemini-api': 'Gemini API',
  openai: 'OpenAI',
  codex: 'OpenAI Codex',
  vertex: 'Vertex AI',
  antigravity: 'Antigravity',
  qwen: 'Qwen',
  iflow: 'iFlow',
}

export function useProviderCard({ provider }: ProviderCardProps) {
  const displayName = providerDisplayNames[provider.provider] || provider.provider

  // Determine if provider is effectively "on" - connected and not disabled
  const isProviderOn = !provider.disabled && provider.status === 'active'

  // Determine if provider has error state
  const hasError = provider.status === 'error' || provider.unavailable

  // Badge variant based on status
  const getBadgeClasses = () => {
    if (provider.disabled) {
      return 'bg-(--text-tertiary)/10 text-(--text-secondary) border-(--text-tertiary)/20'
    }
    if (hasError) {
      return 'bg-(--danger-bg) text-(--danger-text) border-(--danger-text)/20'
    }
    if (isProviderOn) {
      return 'bg-(--success-bg) text-(--success-text) border-(--success-text)/20'
    }
    return 'bg-(--text-tertiary)/10 text-(--text-secondary) border-(--text-tertiary)/20'
  }

  const getBadgeText = () => {
    if (provider.disabled) return 'Disabled'
    if (provider.status === 'unavailable') return 'Unavailable'
    if (provider.status === 'error') return 'Error'
    if (provider.status === 'cooling') return 'Cooling Down'
    if (provider.status === 'active') return 'Connected'
    return provider.status || 'Unknown'
  }

  const shouldShowPulse = isProviderOn && !provider.disabled

  return {
    displayName,
    isProviderOn,
    hasError,
    getBadgeClasses,
    getBadgeText,
    shouldShowPulse
  }
}
