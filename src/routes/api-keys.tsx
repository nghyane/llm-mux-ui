import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { useApiKeys, useDeleteApiKey, useReplaceApiKeys } from '../api/hooks/useApiKeys'
import { ApiKeyTable, CreateApiKeyModal } from '../components/features/api-keys'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'
import { useToast } from '../context/ToastContext'

export const Route = createFileRoute('/api-keys')({
  component: ApiKeysPage,
})

function ApiKeysPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  
  const toast = useToast()
  
  const { data, isLoading, error, refetch } = useApiKeys()
  const replaceApiKeys = useReplaceApiKeys()
  const deleteApiKey = useDeleteApiKey()
  
  const keys = data?.['api-keys'] || []

  const handleCreate = async (newKey: string) => {
    try {
      if (keys.includes(newKey)) {
        toast.error('This API key already exists')
        return
      }
      
      const newKeys = [...keys, newKey]
      await replaceApiKeys.mutateAsync(newKeys)
      toast.success('API key created successfully')
    } catch (err) {
      toast.error(`Failed to create API key: ${err instanceof Error ? err.message : 'Unknown error'}`)
      throw err
    }
  }

  const handleDelete = async (key: string) => {
    try {
      await deleteApiKey.mutateAsync({ value: key })
      toast.success('API key revoked successfully')
    } catch (err) {
      toast.error(`Failed to revoke API key: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-(--text-primary)">
            API Keys
          </h2>
          <p className="text-(--text-secondary) mt-1 text-sm">
            Manage access keys for authenticating to the LLM-Mux proxy.
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
          <Icon name="add" size="sm" />
          Create New Key
        </Button>
      </div>

      <Card className="p-4 bg-(--bg-hover)/50 border-dashed">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-(--bg-card) rounded-lg border border-(--border-color)">
            <Icon name="info" className="text-(--text-secondary)" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-(--text-primary)">
              Authentication
            </h3>
            <p className="text-xs text-(--text-secondary) mt-1 leading-relaxed max-w-2xl">
              These keys are used to authenticate requests to the LLM-Mux proxy itself. 
              Include the key in the <code>Authorization</code> header as <code>Bearer YOUR_KEY</code> or in the <code>X-Management-Key</code> header.
            </p>
          </div>
        </div>
      </Card>

      {error && (
        <Card className="p-4 border-l-4 border-(--danger-text) bg-(--danger-bg)">
          <div className="flex items-start gap-3">
            <Icon name="error" className="text-(--danger-text) mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-(--danger-text)">
                Failed to load API keys
              </p>
              <p className="text-xs text-(--text-secondary) mt-1">
                {error.message || 'An error occurred while fetching API keys'}
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </Card>
      )}

      {!error && (
        <ApiKeyTable 
          keys={keys} 
          isLoading={isLoading} 
          onDelete={handleDelete}
          isDeleting={deleteApiKey.isPending}
        />
      )}

      <CreateApiKeyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  )
}
