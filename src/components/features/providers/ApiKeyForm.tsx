import { useState } from 'react'
import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'
import { Icon } from '../../ui/Icon'
import type { Provider, ProviderType } from '../../../api/types'

type ApiKeyType = ProviderType | 'openai-compatible'

interface ApiKeyFormProps {
  type: ApiKeyType
  existingProvider?: Provider
  onSubmit: (data: Provider) => void
  onCancel: () => void
  isLoading?: boolean
}

export function ApiKeyForm({ type, existingProvider, onSubmit, onCancel, isLoading }: ApiKeyFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    if (existingProvider) {
      return {
        name: existingProvider.name || '',
        'api-key': existingProvider['api-key'] || '',
        'base-url': existingProvider['base-url'] || '',
        'proxy-url': existingProvider['proxy-url'] || '',
      }
    }

    return {
      'api-key': '',
      'base-url': '',
      'proxy-url': '',
      name: '',
    }
  })

  const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>(() => {
    if (existingProvider && existingProvider.headers) {
      return Object.entries(existingProvider.headers).map(([key, value]) => ({ key, value: value as string }))
    }
    return []
  })

  const [excludedModels, setExcludedModels] = useState<string>(() => {
    if (existingProvider && existingProvider['excluded-models']) {
      return existingProvider['excluded-models'].join(', ')
    }
    return ''
  })

  // Validation state
  const [validationWarning, setValidationWarning] = useState<string | null>(null)

  const validateApiKey = (type: ApiKeyType, key: string) => {
    if (!key) {
      setValidationWarning(null)
      return
    }
    
    if (type === 'openai' && !key.startsWith('sk-')) {
      setValidationWarning('OpenAI keys usually start with "sk-"')
      return
    }
    if (type === 'anthropic' && !key.startsWith('sk-ant-')) {
      setValidationWarning('Anthropic keys usually start with "sk-ant-"')
      return
    }
    // Gemini keys often start with AIza, but not always strictly enforced in docs, 
    // but it's a good heuristic.
    if (type === 'gemini' && !key.startsWith('AIza')) {
      setValidationWarning('Gemini keys usually start with "AIza"')
      return
    }

    setValidationWarning(null)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // Trigger validation on key change
    if (field === 'api-key') {
      validateApiKey(type, value)
    }
  }

  const handleAddHeader = () => {
    setHeaders([...headers, { key: '', value: '' }])
  }

  const handleRemoveHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index))
  }

  const handleHeaderChange = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers]
    newHeaders[index][field] = value
    setHeaders(newHeaders)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const headersObj = headers.reduce(
      (acc, h) => {
        if (h.key && h.value) {
          acc[h.key] = h.value
        }
        return acc
      },
      {} as Record<string, string>
    )

    const excludedModelsArray = excludedModels
      .split(',')
      .map((m) => m.trim())
      .filter((m) => m.length > 0)

    // Map 'openai-compatible' to appropriate ProviderType
    const providerType: ProviderType = type === 'openai-compatible' ? 'openai' : type

    const provider: Provider = {
      type: providerType,
      name: formData.name || `${providerType}-key`,
      enabled: true,
    }

    if (formData['api-key']) {
      provider['api-key'] = formData['api-key']
    }

    if (formData['base-url']) {
      provider['base-url'] = formData['base-url']
    }

    if (formData['proxy-url']) {
      provider['proxy-url'] = formData['proxy-url']
    }

    if (Object.keys(headersObj).length > 0) {
      provider.headers = headersObj
    }

    if (excludedModelsArray.length > 0) {
      provider['excluded-models'] = excludedModelsArray
    }

    onSubmit(provider)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Main fields */}
      {type === 'openai-compatible' && (
        <div>
          <label className="block text-sm font-medium text-(--text-primary) mb-1">
            Name *
          </label>
          <Input
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="e.g., My Custom API"
            required
          />
          <p className="text-xs text-(--text-secondary) mt-1">
            A unique name to identify this API configuration
          </p>
        </div>
      )}

      {type === 'openai-compatible' && (
        <div>
          <label className="block text-sm font-medium text-(--text-primary) mb-1">
            Base URL *
          </label>
          <Input
            value={formData['base-url']}
            onChange={(e) => handleInputChange('base-url', e.target.value)}
            placeholder="https://api.example.com/v1"
            required
          />
          <p className="text-xs text-(--text-secondary) mt-1">
            The base URL for the OpenAI-compatible API
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-(--text-primary) mb-1">
          {type === 'openai-compatible' ? 'API Key (Optional)' : 'API Key *'}
        </label>
        <Input
          type="password"
          value={formData['api-key']}
          onChange={(e) => handleInputChange('api-key', e.target.value)}
          placeholder="sk-..."
          required={type !== 'openai-compatible'}
          className={validationWarning ? 'border-(--warning-text)' : ''}
        />
        {validationWarning && (
          <p className="text-xs text-(--warning-text) mt-1 flex items-center gap-1">
            <Icon name="warning" size="sm" /> {validationWarning}
          </p>
        )}
      </div>

      {/* Advanced options */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-(--accent-primary) hover:underline flex items-center gap-1"
        >
          <Icon name={showAdvanced ? 'expand_less' : 'expand_more'} size="sm" />
          {showAdvanced ? 'Hide' : 'Show'} advanced options
        </button>
      </div>

      {showAdvanced && (
        <div className="space-y-4 pt-2 border-t border-(--border-color)">
          {type !== 'openai-compatible' && (
            <div>
              <label className="block text-sm font-medium text-(--text-primary) mb-1">
                Base URL
              </label>
              <Input
                value={formData['base-url']}
                onChange={(e) => handleInputChange('base-url', e.target.value)}
                placeholder={
                  type === 'gemini'
                    ? 'https://generativelanguage.googleapis.com'
                    : type === 'anthropic'
                      ? 'https://api.anthropic.com'
                      : 'https://api.openai.com'
                }
              />
              <p className="text-xs text-(--text-secondary) mt-1">
                Override the default API base URL
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-(--text-primary) mb-1">
              Proxy URL
            </label>
            <Input
              value={formData['proxy-url']}
              onChange={(e) => handleInputChange('proxy-url', e.target.value)}
              placeholder="https://proxy.example.com"
            />
            <p className="text-xs text-(--text-secondary) mt-1">
              Route requests through a proxy server
            </p>
          </div>

          {/* Headers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-(--text-primary)">
                Custom Headers
              </label>
              <Button type="button" size="sm" variant="ghost" onClick={handleAddHeader}>
                <Icon name="add" size="sm" />
                Add Header
              </Button>
            </div>

            {headers.length > 0 && (
              <div className="space-y-2">
                {headers.map((header, index) => (
                  <div key={`header-${header.key || index}`} className="flex items-center gap-2">
                    <Input
                      placeholder="Header name"
                      value={header.key}
                      onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Header value"
                      value={header.value}
                      onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() => handleRemoveHeader(index)}
                      className="px-3"
                    >
                      <Icon name="delete" size="sm" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Excluded models */}
          {type !== 'openai-compatible' && (
            <div>
              <label className="block text-sm font-medium text-(--text-primary) mb-1">
                Excluded Models
              </label>
              <Input
                value={excludedModels}
                onChange={(e) => setExcludedModels(e.target.value)}
                placeholder="model-1, model-2, model-3"
              />
              <p className="text-xs text-(--text-secondary) mt-1">
                Comma-separated list of models to exclude from this key
              </p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? (
            <>
              <Icon name="progress_activity" size="sm" className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Icon name="save" size="sm" />
              {existingProvider ? 'Update' : 'Add'} Key
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
