import { useState, useEffect, useId } from 'react'
import { Modal, ModalFooter } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { Icon } from '../../ui/Icon'
import { CopyButton } from '../../ui/CopyButton'

interface CreateApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (key: string) => Promise<void>
}

export function CreateApiKeyModal({ isOpen, onClose, onCreate }: CreateApiKeyModalProps) {
  const [key, setKey] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  const inputId = useId()
  const successInputId = useId()

  useEffect(() => {
    if (isOpen && !showSuccess) {
      setKey('')
      setIsCreating(false)
    }
  }, [isOpen, showSuccess])

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setShowSuccess(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const generateKey = () => {
    const random = crypto.randomUUID().replace(/-/g, '')
    setKey(`sk-llmmux-${random}`)
  }

  const handleCreate = async () => {
    if (!key) return
    setIsCreating(true)
    try {
      await onCreate(key)
      setShowSuccess(true)
    } catch (error) {
      console.error('Failed to create key:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    setShowSuccess(false)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={showSuccess ? 'API Key Created' : 'Create API Key'}
      size="md"
    >
      {showSuccess ? (
        <div className="space-y-6">
          <div className="bg-(--success-bg)/10 border border-(--success-bg) rounded-lg p-4 flex items-start gap-3">
            <Icon name="check_circle" className="text-(--success-text) mt-0.5" />
            <div>
              <p className="text-sm font-medium text-(--success-text)">
                API key created successfully
              </p>
              <p className="text-xs text-(--text-secondary) mt-1">
                Please copy this key now. You won't be able to see it again after you close this modal.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor={successInputId} className="text-sm font-medium text-(--text-secondary)">
              Your API Key
            </label>
            <div className="flex items-center gap-2">
              <code id={successInputId} className="flex-1 p-3 bg-(--bg-hover) rounded-lg border border-(--border-color) font-mono text-sm break-all">
                {key}
              </code>
              <CopyButton value={key} className="p-3 bg-(--bg-hover) border border-(--border-color)" />
            </div>
          </div>

          <ModalFooter className="px-0 pb-0">
            <Button variant="primary" onClick={handleClose}>
              Done
            </Button>
          </ModalFooter>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-2">
                <label htmlFor={inputId} className="text-sm font-medium text-(--text-secondary)">
                  API Key
                </label>
                <Input
                  id={inputId}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="Enter or generate a key"
                  className="font-mono"
                />
              </div>
              <Button
                variant="secondary"
                onClick={generateKey}
                type="button"
                className="mb-[2px]"
                title="Generate Random Key"
              >
                <Icon name="refresh" size="sm" />
                Generate
              </Button>
            </div>
            
            <p className="text-xs text-(--text-secondary)">
              Enter a custom key or generate a random one. Keys typically start with "sk-".
            </p>
          </div>

          <ModalFooter className="px-0 pb-0">
            <Button variant="ghost" onClick={onClose} disabled={isCreating}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={!key || isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Key'}
            </Button>
          </ModalFooter>
        </div>
      )}
    </Modal>
  )
}
