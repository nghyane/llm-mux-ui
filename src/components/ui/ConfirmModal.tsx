import { Modal, ModalFooter } from './Modal'
import { Button } from './Button'
import { Icon } from './Icon'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'default'
  isLoading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      showCloseButton={!isLoading}
    >
      <div className="space-y-4">
        <p className="text-(--text-secondary)">{description}</p>
        
        {variant === 'danger' && (
          <div className="p-3 rounded-md bg-(--danger-bg) border border-(--danger-text)/20 flex gap-3">
             <Icon name="warning" className="text-(--danger-text) shrink-0" />
             <span className="text-sm text-(--danger-text) font-medium">This action cannot be undone.</span>
          </div>
        )}
      </div>

      <ModalFooter>
        <Button 
            variant="ghost" 
            onClick={onClose}
            disabled={isLoading}
        >
          {cancelText}
        </Button>
        <Button
          variant={variant === 'danger' ? 'danger' : 'primary'}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading && <Icon name="progress_activity" className="animate-spin" />}
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
