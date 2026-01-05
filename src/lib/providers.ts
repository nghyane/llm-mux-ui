// Provider configuration and display utilities
import type { OAuthProvider, DeviceFlowProvider } from '../api/types/oauth'
import type { ProviderType } from '../api/types/providers'

export type AuthMethod = 
  | { type: 'oauth'; provider: OAuthProvider }
  | { type: 'device'; provider: DeviceFlowProvider }
  | { type: 'cookie'; endpoint: 'iflow' }
  | { type: 'apikey'; keyType: ProviderType | 'openai-compatible' }
  | { type: 'file'; fileType: 'vertex' | 'any' }

export interface ProviderDef {
  id: string
  name: string
  description: string
  icon: string
  providerIdForLogo: string
  color: string
  method: AuthMethod
  initial: string
  bgColor: string
}

const LOGO_BASE_URL = 'https://models.dev/logos'

export function getProviderLogoUrl(providerId: string): string {
  return `${LOGO_BASE_URL}/${providerId.toLowerCase()}.svg`
}

// Consolidated Provider Configuration
// This acts as the single source of truth for UI presentation and Auth logic
export const ALL_PROVIDERS: ProviderDef[] = [
  { 
    id: 'openai', 
    name: 'OpenAI', 
    description: 'GPT-4o, GPT-3.5 Turbo', 
    icon: 'psychology', 
    providerIdForLogo: 'openai', 
    color: '#10a37f', 
    initial: 'O',
    bgColor: 'rgba(16, 163, 127, 0.15)',
    method: { type: 'oauth', provider: 'codex' } 
  },
  { 
    id: 'anthropic', 
    name: 'Anthropic', 
    description: 'Claude 3.5 Sonnet, Opus', 
    icon: 'smart_toy', 
    providerIdForLogo: 'anthropic', 
    color: '#d97757', 
    initial: 'A',
    bgColor: 'rgba(217, 119, 87, 0.15)',
    method: { type: 'oauth', provider: 'claude' } 
  },
  { 
    id: 'google', 
    name: 'Google Gemini', 
    description: 'Gemini 1.5 Pro & Flash', 
    icon: 'auto_awesome', 
    providerIdForLogo: 'gemini', 
    color: '#4285f4', 
    initial: 'G',
    bgColor: 'rgba(66, 133, 244, 0.15)',
    method: { type: 'oauth', provider: 'gemini-cli' } 
  },
  { 
    id: 'google-cloud', 
    name: 'Google Cloud', 
    description: 'Vertex AI via Antigravity', 
    icon: 'cloud', 
    providerIdForLogo: 'antigravity', 
    color: '#4285f4', 
    initial: 'V',
    bgColor: 'rgba(66, 133, 244, 0.15)',
    method: { type: 'oauth', provider: 'antigravity' } 
  },
  { 
    id: 'github', 
    name: 'GitHub Copilot', 
    description: 'Code completion & Chat', 
    icon: 'code', 
    providerIdForLogo: 'copilot', 
    color: '#24292e', 
    initial: 'GH',
    bgColor: 'rgba(36, 41, 46, 0.15)',
    method: { type: 'device', provider: 'copilot' } 
  },
  { 
    id: 'alibaba', 
    name: 'Alibaba Qwen', 
    description: 'Qwen 2.5 via Device Flow', 
    icon: 'translate', 
    providerIdForLogo: 'qwen', 
    color: '#615ced', 
    initial: 'Q',
    bgColor: 'rgba(97, 92, 237, 0.15)',
    method: { type: 'device', provider: 'qwen' } 
  },
  { 
    id: 'iflow', 
    name: 'iFlow', 
    description: 'Platform Integration', 
    icon: 'hub', 
    providerIdForLogo: 'iflow', 
    color: '#06b6d4', 
    initial: 'I',
    bgColor: 'rgba(6, 182, 212, 0.15)',
    method: { type: 'cookie', endpoint: 'iflow' } 
  },
  { 
    id: 'mistral',
    name: 'Mistral AI',
    description: 'Mistral Large, Small',
    icon: 'wind_power',
    providerIdForLogo: 'mistral',
    color: '#6366f1',
    initial: 'M',
    bgColor: 'rgba(99, 102, 241, 0.15)',
    method: { type: 'apikey', keyType: 'openai-compatible' }
  },
  { 
    id: 'groq',
    name: 'Groq',
    description: 'LPU Inference Engine',
    icon: 'bolt',
    providerIdForLogo: 'groq',
    color: '#f97316',
    initial: 'G',
    bgColor: 'rgba(249, 115, 22, 0.15)',
    method: { type: 'apikey', keyType: 'openai-compatible' }
  },
  { 
    id: 'cohere',
    name: 'Cohere',
    description: 'Command R+, Embed',
    icon: 'chat_bubble',
    providerIdForLogo: 'cohere',
    color: '#14b8a6',
    initial: 'C',
    bgColor: 'rgba(20, 184, 166, 0.15)',
    method: { type: 'apikey', keyType: 'openai-compatible' }
  },
  { 
    id: 'custom', 
    name: 'Custom / Local', 
    description: 'Ollama, LM Studio, LocalAI', 
    icon: 'dns', 
    providerIdForLogo: 'custom', 
    color: '#8b5cf6', 
    initial: '?',
    bgColor: 'rgba(139, 92, 246, 0.15)',
    method: { type: 'apikey', keyType: 'openai-compatible' } 
  },
  { 
    id: 'file', 
    name: 'Import Config', 
    description: 'Upload auth.json files', 
    icon: 'folder_open', 
    providerIdForLogo: 'file', 
    color: '#71717a', 
    initial: 'F',
    bgColor: 'rgba(113, 113, 122, 0.15)',
    method: { type: 'file', fileType: 'any' } 
  }
]

// Default config for unknown providers
const DEFAULT_PROVIDER: ProviderDef = {
  id: 'unknown',
  name: 'Unknown Provider',
  description: '',
  icon: 'help',
  providerIdForLogo: 'unknown',
  color: '#6b7280',
  initial: '?',
  bgColor: 'rgba(107, 114, 128, 0.15)',
  method: { type: 'apikey', keyType: 'openai-compatible' }
}

/**
 * Get provider configuration by key (providerIdForLogo or id)
 */
export function getProviderConfig(key: string): ProviderDef {
  const normalizedKey = key.toLowerCase()
  
  // Try to match by providerIdForLogo or id first
  let match = ALL_PROVIDERS.find(p => 
    p.providerIdForLogo.toLowerCase() === normalizedKey || 
    p.id.toLowerCase() === normalizedKey
  )

  if (match) return match

  // Try to match by method.provider (for OAuth/Device flow providers)
  // This handles cases where API returns provider keys like "antigravity", "claude", "codex"
  match = ALL_PROVIDERS.find(p => {
    if (p.method.type === 'oauth' || p.method.type === 'device') {
      return p.method.provider.toLowerCase() === normalizedKey
    }
    return false
  })

  if (match) return match

  // Fallback for known legacy keys
  if (normalizedKey === 'gemini-api') return getProviderConfig('google')
  if (normalizedKey === 'vertex' || normalizedKey === 'vertex-ai') return getProviderConfig('google-cloud')
  
  return {
    ...DEFAULT_PROVIDER,
    name: key,
    initial: key.charAt(0).toUpperCase(),
  }
}

/**
 * Get display name for a provider
 */
export function getProviderDisplayName(providerKey: string): string {
  return getProviderConfig(providerKey).name
}

/**
 * Extract a meaningful initial from a model name
 * e.g., "gpt-4-turbo" -> "4", "claude-3-opus" -> "3", "gemini-pro" -> "P"
 */
export function getModelInitial(modelName: string): string {
  // Look for version numbers first
  const versionMatch = modelName.match(/(\d+(?:\.\d+)?)/)?.[1]
  if (versionMatch) {
    return versionMatch.split('.')[0]
  }

  // Look for common model identifiers
  const identifiers = ['pro', 'opus', 'sonnet', 'haiku', 'turbo', 'mini', 'ultra', 'flash']
  for (const id of identifiers) {
    if (modelName.toLowerCase().includes(id)) {
      return id.charAt(0).toUpperCase()
    }
  }

  // Fallback to first meaningful character
  const cleaned = modelName.replace(/^[^a-zA-Z0-9]+/, '')
  return cleaned.charAt(0).toUpperCase() || '?'
}

/**
 * Get all unique providers from a list of provider keys
 */
export function getUniqueProviders(providerKeys: string[]): Array<{ key: string; name: string }> {
  const seen = new Set<string>()
  const result: Array<{ key: string; name: string }> = []

  for (const key of providerKeys) {
    const normalizedKey = key.toLowerCase()
    if (!seen.has(normalizedKey)) {
      seen.add(normalizedKey)
      result.push({
        key: normalizedKey,
        name: getProviderDisplayName(normalizedKey),
      })
    }
  }

  return result.sort((a, b) => a.name.localeCompare(b.name))
}

// Chart color palette for consistent visualization
export const CHART_COLORS = [
  '#3b82f6', // blue-500
  '#f97316', // orange-500
  '#10b981', // emerald-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#f59e0b', // amber-500
  '#6366f1', // indigo-500
]

/**
 * Get a color from the chart palette by index (cycles if index exceeds palette length)
 */
export function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length]
}
