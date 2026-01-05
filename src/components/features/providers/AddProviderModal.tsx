import { useState, useMemo, useRef, useEffect, useId } from 'react'
import { Modal } from '../../ui/Modal'
import { Icon } from '../../ui/Icon'
import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'
import { useToast } from '../../../context/ToastContext'
import { ALL_PROVIDERS, getProviderConfig, getProviderLogoUrl } from '../../../lib/providers'
import { cn } from '../../../lib/cn'

// API Hooks
import { useAddProvider } from '../../../api/hooks/useProviders'
import { useUploadAuthFile, useImportVertex } from '../../../api/hooks/useAuthFiles'
import type { Provider, OAuthProvider, DeviceFlowProvider } from '../../../api/types'

// OAuth Logic
import { useOAuthFlow } from '../../../api/hooks/useOAuth'
import { useDeviceFlow } from './useDeviceFlow'
import { categorizeOAuthError } from '../../../lib/oauth-errors'
import { ApiKeyForm } from './ApiKeyForm'

// --- Sub-Components ---

const ProviderLogo = ({ providerKey, fallbackIcon, className }: { providerKey: string, fallbackIcon: string, className?: string }) => {
  const config = getProviderConfig(providerKey)
  const [hasError, setHasError] = useState(false)
  const logoUrl = getProviderLogoUrl(config.providerIdForLogo)
  
  return (
    <div className={cn(
      "flex items-center justify-center overflow-hidden shrink-0 bg-(--bg-logo-container) border border-(--border-color)", 
      className || "size-10 rounded-lg"
    )}>
      {!hasError ? (
        <img 
          src={logoUrl} 
          alt={config.name} 
          className="h-2/3 w-2/3 object-contain"
          onError={() => setHasError(true)}
        />
      ) : (
        <Icon name={fallbackIcon} size="md" className="text-(--text-tertiary)" />
      )}
    </div>
  )
}

const OAuthView = ({ provider, onSuccess, brandColor }: { provider: OAuthProvider, onSuccess: () => void, brandColor: string }) => {
  const toast = useToast()
  const oauth = useOAuthFlow({
    onSuccess: () => onSuccess(),
    onError: (_, _err) => toast.error(categorizeOAuthError(_err).message)
  })

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div 
        className="size-16 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: `${brandColor}10`, color: brandColor }}
      >
        <Icon name="lock" size="lg" />
      </div>
      <h3 className="text-lg font-semibold text-(--text-primary) mb-2">Secure Connection</h3>
      <p className="text-sm text-(--text-secondary) mb-8 max-w-xs">
        You will be redirected to the provider's website to authorize access.
      </p>
      
      <Button 
        size="lg" 
        className="w-full max-w-xs text-(--accent-primary-fg) hover:opacity-90 transition-opacity"
        style={{ backgroundColor: brandColor }}
        onClick={() => oauth.startFlow(provider)}
        disabled={oauth.isLoading}
      >
        {oauth.isLoading ? (
          <>
            <div className="mr-2">
              <Icon name="progress_activity" className="animate-spin" />
            </div>
            Connecting...
          </>
        ) : (
          <>
            <div className="mr-2">
              <Icon name="login" />
            </div>
            Connect Account
          </>
        )}
      </Button>
    </div>
  )
}

const DeviceFlowView = ({ provider, onSuccess, brandColor }: { provider: DeviceFlowProvider, onSuccess: () => void, brandColor: string }) => {
  const toast = useToast()
  const deviceFlow = useDeviceFlow({
    onSuccess: () => onSuccess(),
    onError: (err) => toast.error(categorizeOAuthError(err).message)
  })

  useEffect(() => {
    if (deviceFlow.status === 'idle') {
      deviceFlow.startDeviceFlow(provider)
    }
  }, [deviceFlow.status, deviceFlow.startDeviceFlow, provider]) 

  if (deviceFlow.status === 'idle' || (deviceFlow.status === 'polling' && !deviceFlow.userCode)) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div style={{ color: brandColor }}>
          <Icon name="progress_activity" size="lg" className="animate-spin mb-4" />
        </div>
        <p className="text-(--text-secondary)">Initiating device flow...</p>
      </div>
    )
  }

  if (deviceFlow.status === 'error' || deviceFlow.status === 'expired') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="size-16 rounded-full bg-(--danger-bg) flex items-center justify-center mb-4">
          <Icon name="error" size="lg" className="text-(--danger-text)" />
        </div>
        <h3 className="text-lg font-semibold text-(--text-primary) mb-2">
          {deviceFlow.status === 'expired' ? 'Code Expired' : 'Connection Failed'}
        </h3>
        <p className="text-sm text-(--text-secondary) mb-6 max-w-xs">
          {deviceFlow.error || 'Something went wrong while connecting to the provider.'}
        </p>
        <Button 
          onClick={deviceFlow.retry}
          style={{ backgroundColor: brandColor, color: 'var(--accent-primary-fg)' }}
        >
          <Icon name="refresh" className="mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-(--text-primary)">Device Authorization</h3>
        <p className="text-sm text-(--text-secondary)">Follow steps to connect</p>
      </div>

      <div className="flex-1 space-y-6">
        <div className="p-5 rounded-xl border border-(--border-color)">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-(--text-secondary) uppercase tracking-wider">Step 1: Copy Code</span>
          </div>
          
          <button 
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(deviceFlow.userCode || '')
              toast.success('Code copied to clipboard!')
            }}
            className="w-full group relative flex items-center justify-between gap-4 bg-(--bg-card) p-4 rounded-xl border-2 border-(--border-color) hover:border-(--accent-primary) transition-all cursor-pointer"
          >
            <code className="text-2xl font-mono font-bold tracking-[0.2em] text-(--text-primary) group-hover:text-(--accent-primary) transition-colors">
              {deviceFlow.userCode}
            </code>
            <div className="flex items-center gap-2 text-xs font-medium text-(--text-secondary) group-hover:text-(--accent-primary)">
              <span>Tap to copy</span>
              <Icon name="content_copy" size="sm" />
            </div>
          </button>
        </div>

        <div className="p-5 rounded-xl border border-(--border-color)">
          <span className="text-xs font-bold text-(--text-secondary) uppercase tracking-wider block mb-3">Step 2: Authorize</span>
          <Button 
            className="w-full h-12 text-(--accent-primary-fg) shadow-md hover:shadow-lg hover:opacity-90 transition-all font-medium text-base"
            style={{ backgroundColor: brandColor }}
            onClick={() => window.open(deviceFlow.verificationUrl || '', '_blank')}
          >
            Open Verification Page 
            <Icon name="open_in_new" className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}

const CookieView = ({ onSuccess }: { onSuccess: () => void }) => {
  const [cookie, setCookie] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const inputId = useId()

  const handleSubmit = async () => {
    if (!cookie.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/v0/management/iflow-auth-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookie })
      })
      const data = await res.json()
      if (data.status !== 'ok') throw new Error(data.error)
      toast.success('iFlow connected successfully')
      onSuccess()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Auth failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-(--text-primary)">iFlow Authentication</h3>
        <p className="text-sm text-(--text-secondary)">Enter your platform cookie.</p>
      </div>

      <div className="space-y-4 flex-1">
        <div>
          <label htmlFor={inputId} className="text-xs font-medium text-(--text-secondary) mb-1.5 block">
            Platform Cookie
          </label>
          <textarea
            id={inputId}
            className="w-full h-32 p-3 rounded-lg bg-(--bg-card) border border-(--border-color) text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring) focus-visible:ring-offset-2 resize-none"
            placeholder="Paste cookie string..."
            value={cookie}
            onChange={(e) => setCookie(e.target.value)}
          />
        </div>
        
        <div className="bg-(--warning-bg) text-(--warning-text) p-3 rounded-lg text-xs flex gap-2 items-start">
          <div className="mt-0.5"><Icon name="info" size="sm" /></div>
          <p>
            Copy cookie from DevTools (F12) → Application → Cookies on iFlow platform.
          </p>
        </div>
      </div>

      <Button variant="primary" className="w-full mt-4" onClick={handleSubmit} disabled={loading || !cookie}>
        {loading ? 'Verifying...' : 'Connect'}
      </Button>
    </div>
  )
}

const FileUploadView = ({ onSuccess }: { onSuccess: () => void }) => {
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()
  const uploadAuthFile = useUploadAuthFile()
  const importVertex = useImportVertex()

  const handleFile = async (file: File) => {
    try {
      const fileName = file.name.toLowerCase()
      if (fileName.includes('vertex') || fileName.includes('service-account')) {
        const text = await file.text()
        const credentials = JSON.parse(text) as Record<string, unknown>
        await importVertex.mutateAsync({ credentials })
      } else {
        await uploadAuthFile.mutateAsync(file)
      }
      toast.success('Uploaded successfully')
      onSuccess()
    } catch (err) {
      toast.error('Upload failed')
    }
  }

  return (
    <div className="p-6 h-full flex flex-col items-center justify-center">
      <button 
        type="button"
        className={cn(
          "w-full max-w-sm aspect-square max-h-[300px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring) focus-visible:ring-offset-2",
          dragActive ? "border-(--accent-primary) bg-(--accent-primary)/5" : "border-(--border-color) hover:border-(--text-secondary) hover:bg-(--bg-hover)"
        )}
        onDragEnter={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false) }}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDrop={(e) => {
          e.preventDefault(); setDragActive(false);
          if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="size-16 rounded-full bg-(--bg-muted) flex items-center justify-center mb-4">
          <Icon name="upload_file" size="xl" className="text-(--text-tertiary)" />
        </div>
        <p className="text-sm font-medium text-(--text-primary)">Click to upload</p>
        <p className="text-xs text-(--text-secondary) mt-1">or drag and drop JSON</p>
      </button>
      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
    </div>
  )
}

// --- Main Modal Component ---

interface AddProviderModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function AddProviderModal({ isOpen, onClose, onSuccess }: AddProviderModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const toast = useToast()

  const addProvider = useAddProvider()
  const isLoading = addProvider.isPending

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      // Immediate reset for snappy feel next time
      setSelectedId(null)
      setSearchQuery('')
    }
  }, [isOpen])

  const filteredProviders = useMemo(() => {
    if (!searchQuery) return ALL_PROVIDERS
    return ALL_PROVIDERS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [searchQuery])

  const selectedProvider = useMemo(() => 
    ALL_PROVIDERS.find(p => p.id === selectedId), 
  [selectedId])

  const handleApiKeySubmit = async (provider: Provider) => {
    try {
      await addProvider.mutateAsync(provider)
      toast.success('Provider added successfully')
      onSuccess?.()
      onClose()
    } catch (err) {
      toast.error(`Failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Provider" size="xl" className="p-0 overflow-hidden">
      <div className="flex h-[550px] w-full bg-(--bg-container)">
        
        {/* LEFT SIDEBAR: LIST */}
        <div className="w-[40%] min-w-[280px] border-r border-(--border-color) flex flex-col bg-(--bg-nested)">
          <div className="p-4 border-b border-(--border-color)">
            <Input 
              placeholder="Search providers..." 
              icon="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-(--bg-container)"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredProviders.map(provider => (
              <button
                type="button"
                key={provider.id}
                onClick={() => setSelectedId(provider.id)}
                style={{
                  '--brand-color': provider.color
                } as React.CSSProperties}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors border-l-4 border-transparent",
                  selectedId === provider.id 
                    ? "bg-[var(--brand-color)]/10 border-l-[var(--brand-color)]" 
                    : "hover:bg-(--bg-hover) text-(--text-secondary)"
                )}
              >
                <ProviderLogo providerKey={provider.providerIdForLogo} fallbackIcon={provider.icon} className="size-8 rounded-md" />
                <div className="min-w-0">
                  <p className={cn("text-sm font-medium", selectedId === provider.id ? "text-(--text-primary)" : "")}>
                    {provider.name}
                  </p>
                  <p className="text-[10px] text-(--text-tertiary) truncate max-w-[140px]">
                    {provider.method.type.toUpperCase()}
                  </p>
                </div>
                {selectedId === provider.id && (
                  <span style={{ color: provider.color }} className="ml-auto flex items-center">
                    <Icon name="chevron_right" size="sm" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT CONTENT: CONTEXT AWARE */}
        <div className="flex-1 relative bg-(--bg-container)">
          {selectedProvider ? (
            <div className="absolute inset-0 flex flex-col animate-in fade-in duration-200">
              {/* Header */}
              <div className="p-6 border-b border-(--border-color) flex items-center justify-between bg-(--bg-container)">
                <div className="flex items-center gap-4">
                  <ProviderLogo providerKey={selectedProvider.providerIdForLogo} fallbackIcon={selectedProvider.icon} className="size-12 rounded-xl shadow-sm" />
                  <div>
                    <h2 className="text-xl font-bold text-(--text-primary)">{selectedProvider.name}</h2>
                    <p className="text-sm text-(--text-secondary)">{selectedProvider.description}</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto">
                {selectedProvider.method.type === 'oauth' && (
                  <OAuthView provider={selectedProvider.method.provider} onSuccess={() => onSuccess?.()} brandColor={selectedProvider.color} />
                )}
                
                {selectedProvider.method.type === 'device' && (
                  <DeviceFlowView provider={selectedProvider.method.provider} onSuccess={() => onSuccess?.()} brandColor={selectedProvider.color} />
                )}

                {selectedProvider.method.type === 'cookie' && (
                  <CookieView onSuccess={() => onSuccess?.()} />
                )}

                {selectedProvider.method.type === 'file' && (
                  <FileUploadView onSuccess={() => onSuccess?.()} />
                )}

                {selectedProvider.method.type === 'apikey' && (
                  <div className="p-6">
                    <div className="max-w-md mx-auto">
                      <div className="p-6 rounded-xl border border-(--border-color)">
                        <ApiKeyForm 
                          type={selectedProvider.method.keyType}
                          onSubmit={handleApiKeySubmit}
                          onCancel={() => {}}
                          isLoading={isLoading}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 text-(--text-tertiary)">
              <div className="size-24 rounded-full bg-(--bg-muted) flex items-center justify-center mb-4">
                <Icon name="hub" size="xl" className="opacity-20" />
              </div>
              <h3 className="text-lg font-medium text-(--text-secondary)">Select a Provider</h3>
              <p className="text-sm max-w-xs mt-2">Choose a service from the sidebar to configure authentication.</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
