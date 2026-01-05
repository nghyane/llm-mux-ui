import { createFileRoute } from '@tanstack/react-router'
import { ConfigEditor } from '../components/features/config/ConfigEditor'

export const Route = createFileRoute('/config')({
  component: ConfigEditor,
})
