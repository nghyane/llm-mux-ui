import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table'
import { Button } from '../../ui/Button'
import { Icon } from '../../ui/Icon'
import { CopyButton } from '../../ui/CopyButton'
import { ConfirmModal } from '../../ui/ConfirmModal'
import { useState } from 'react'
import { Badge } from '../../ui/Badge'

interface ApiKeyTableProps {
  keys: string[]
  isLoading: boolean
  onDelete: (key: string) => void
  isDeleting?: boolean
}

export function ApiKeyTable({ keys, isLoading, onDelete, isDeleting }: ApiKeyTableProps) {
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null)

  const maskKey = (key: string) => {
    if (key.length <= 8) return '********'
    return `${key.slice(0, 3)}...${key.slice(-4)}`
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-(--bg-hover) rounded w-full animate-pulse" />
        <div className="h-10 bg-(--bg-hover) rounded w-full animate-pulse" />
        <div className="h-10 bg-(--bg-hover) rounded w-full animate-pulse" />
      </div>
    )
  }

  if (keys.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-(--border-color) rounded-lg">
        <div className="mx-auto size-12 rounded-full bg-(--bg-hover) flex items-center justify-center mb-4">
          <Icon name="vpn_key" className="text-(--text-secondary)" size="lg" />
        </div>
        <h3 className="text-lg font-medium text-(--text-primary)">No API Keys</h3>
        <p className="text-(--text-secondary) mt-1">Create a new API key to authenticate requests.</p>
      </div>
    )
  }

  return (
    <>
      <div className="border border-(--border-color) rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>API Key</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.map((key) => (
              <TableRow key={key}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-sm text-(--text-primary)">
                      {maskKey(key)}
                    </div>
                    <Badge variant="default" className="font-normal text-xs">
                      {key.startsWith('sk-') ? 'Secret Key' : 'Key'}
                    </Badge>
                    <CopyButton value={key} />
                  </div>
                </TableCell>
                <TableCell align="right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-(--danger-text) hover:text-(--danger-text) hover:bg-(--danger-bg)/10"
                    onClick={() => setKeyToDelete(key)}
                    disabled={isDeleting}
                  >
                    <Icon name="delete" size="sm" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmModal
        isOpen={!!keyToDelete}
        onClose={() => setKeyToDelete(null)}
        onConfirm={() => {
          if (keyToDelete) {
            onDelete(keyToDelete)
            setKeyToDelete(null)
          }
        }}
        title="Revoke API Key"
        description="Are you sure you want to revoke this API key? This action cannot be undone and any applications using this key will stop working."
        confirmText="Revoke Key"
        variant="danger"
      />
    </>
  )
}
