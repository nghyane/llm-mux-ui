import { Icon } from './Icon'

interface SettingToggleProps {
  label: string
  description: string
  checked: boolean
  isLoading?: boolean
  onChange: (value: boolean) => void
  isPending?: boolean
  error?: string
  isError?: boolean
}

export function SettingToggle({ label, description, checked, isLoading, onChange, isPending, error, isError }: SettingToggleProps) {
  const isDisabledFeature = error?.includes('disabled') || error?.includes('not enabled')
  const hasRealError = (isError || !!error) && !isDisabledFeature

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-(--text-primary)">{label}</p>
        <p className="text-xs text-(--text-secondary)">{description}</p>
        {isDisabledFeature && (
          <p className="text-xs text-(--text-tertiary) mt-1">
            Feature not available
          </p>
        )}
        {hasRealError && (
          <p className="text-xs text-(--warning-text) mt-1">
            <Icon name="warning" size="sm" className="inline mr-1" />
            {error || 'Unable to fetch setting'}
          </p>
        )}
      </div>
      {isLoading ? (
        <div className="w-9 h-5 bg-(--bg-hover) rounded-full animate-pulse" />
      ) : (
        <button
          type="button"
          onClick={() => onChange(!checked)}
          disabled={isPending || isDisabledFeature || hasRealError}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out
            ${checked ? 'bg-(--success-text)' : 'bg-(--text-tertiary)'}
            ${isPending || isDisabledFeature || hasRealError ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          role="switch"
          aria-checked={checked}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-(--bg-card) shadow-sm ring-0 transition duration-200 ease-in-out
              ${checked ? 'translate-x-4' : 'translate-x-0.5'}
              mt-0.5
            `}
          />
        </button>
      )}
    </div>
  )
}
