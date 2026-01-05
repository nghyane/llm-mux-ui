import { useState, useEffect, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import { useConfigYaml, useUpdateConfigYaml } from '../../../api/hooks/useConfig'
import { Card } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { Icon } from '../../ui/Icon'
import { useToast } from '../../../context/ToastContext'

export function ConfigEditor() {
  const { data: yamlContent, isLoading, isError } = useConfigYaml()
  const updateConfig = useUpdateConfigYaml()
  const { success, error: toastError } = useToast()
  
  const [value, setValue] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  
  useEffect(() => {
    if (yamlContent) {
      setValue(yamlContent)
      setIsDirty(false)
    }
  }, [yamlContent])

  const handleEditorChange = (newValue: string | undefined) => {
    if (newValue !== undefined) {
      setValue(newValue)
      setIsDirty(newValue !== yamlContent)
    }
  }

  const handleSave = useCallback(async () => {
    try {
      await updateConfig.mutateAsync(value)
      success('Configuration saved successfully')
      setIsDirty(false)
    } catch (err) {
      toastError('Failed to save configuration')
      console.error(err)
    }
  }, [value, updateConfig, success, toastError])

  const handleReset = () => {
    if (yamlContent) {
      setValue(yamlContent)
      setIsDirty(false)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (isDirty) {
          handleSave()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDirty, handleSave])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div className="h-8 w-48 bg-(--bg-hover) rounded animate-pulse" />
            <div className="h-9 w-24 bg-(--bg-hover) rounded animate-pulse" />
        </div>
        <Card className="h-[600px] bg-(--bg-card) border-(--border-color) animate-pulse" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-4 rounded-lg bg-(--danger-bg) text-(--danger-text) border border-(--danger-text)/20">
        <div className="flex items-center gap-2">
            <Icon name="error" />
            <span className="font-medium">Failed to load configuration</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-(--text-primary)">Configuration Editor</h1>
          <p className="text-(--text-secondary) mt-1">
            Edit server configuration in YAML format.
          </p>
        </div>
        <div className="flex items-center gap-3">
             <Button 
                variant="ghost" 
                onClick={handleReset}
                disabled={!isDirty || updateConfig.isPending}
            >
                <Icon name="restart_alt" size="sm" />
                Reset
            </Button>
            <Button 
                variant="primary" 
                onClick={handleSave}
                disabled={!isDirty || updateConfig.isPending}
                className="min-w-[100px]"
            >
                {updateConfig.isPending ? (
                    <Icon name="progress_activity" className="animate-spin" size="sm" />
                ) : (
                    <Icon name="save" size="sm" />
                )}
                Save
            </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-(--border-color) shadow-md">
        <div className="bg-(--bg-muted) border-b border-(--border-color) px-4 py-2 flex justify-between items-center text-xs text-(--text-tertiary)">
            <span className="font-mono">config.yaml</span>
            <div className="flex items-center gap-2">
                 {isDirty && (
                    <span className="text-(--warning-text) flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-(--warning-text)"></span>
                        Unsaved changes
                    </span>
                 )}
            </div>
        </div>
        <div className="h-[600px] w-full bg-(--bg-muted)">
            <Editor
                height="100%"
                defaultLanguage="yaml"
                theme="vs-dark"
                value={value}
                onChange={handleEditorChange}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: 'on',
                    padding: { top: 16, bottom: 16 },
                    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                }}
            />
        </div>
      </Card>
      
      <div className="flex justify-end">
         <p className="text-xs text-(--text-tertiary) flex items-center gap-1">
            <Icon name="keyboard_command_key" size="sm" className="text-[10px]" />
            <span>+ S to save</span>
         </p>
      </div>
    </div>
  )
}
