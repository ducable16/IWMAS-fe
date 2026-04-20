import { Loader2 } from 'lucide-react'

export default function FullPageSpinner() {
  return (
    <div className="min-h-screen bg-bg-canvas flex items-center justify-center">
      <div className="text-center space-y-3">
        <Loader2 className="w-5 h-5 text-text-muted animate-spin mx-auto" strokeWidth={1.75} />
        <p className="text-text-muted text-xs">Loading…</p>
      </div>
    </div>
  )
}
