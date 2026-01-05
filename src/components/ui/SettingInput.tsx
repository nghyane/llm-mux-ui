import { useState } from 'react'
import { Button } from './Button'
import { Icon } from './Icon'
import { Input } from './Input'

interface SettingInputProps {
  label: string
  description: string
  placeholder?: string
  type?: string
  value: string
  isLoading?: boolean
  onSave: (value: string) => void
  isPending?: boolean
}

export function SettingInput({ label, description, placeholder, type = 'text', value, isLoading, onSave, isPending }: SettingInputProps) {
  const [localValue, setLocalValue] = useState(value)
  const [isDirty, setIsDirty] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value)
    setIsDirty(e.target.value !== value)
  }

  const handleSave = () => {
    if (isDirty) {
      onSave(localValue)
      setIsDirty(false)
    }
  }

  const handleReset = () => {
    setLocalValue(value)
    setIsDirty(false)
  }

  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-(--text-primary)">{label}</p>
        <p className="text-xs text-(--text-secondary)">{description}</p>
      </div>
      <div className="flex gap-2 max-w-md">
        {isLoading ? (
          <div className="flex-1 h-9 bg-(--bg-hover) rounded-lg animate-pulse" />
        ) : (
          <Input
            type={type}
            placeholder={placeholder}
            value={localValue}
            onChange={handleChange}
            className="flex-1"
          />
        )}
        {isDirty && (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReset}
              disabled={isPending}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={isPending}
            >
              {isPending ? (
                <Icon name="progress_activity" size="sm" className="animate-spin" />
              ) : (
                'Save'
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
