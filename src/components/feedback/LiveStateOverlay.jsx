import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'

export function LiveLoading({ label = 'Loading from API…' }) {
  return (
    <div className="card p-8 flex flex-col items-center justify-center gap-2 text-text-muted">
      <Loader2 className="w-5 h-5 animate-spin text-accent" strokeWidth={1.75} />
      <p className="text-[12.5px]">{label}</p>
    </div>
  )
}

export function LiveError({ error, onRetry }) {
  const msg = error?.response?.data?.message || error?.message || 'Failed to load data'
  return (
    <div className="card p-6 border-danger/20 bg-danger-subtle/40">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-danger mt-0.5 shrink-0" strokeWidth={1.75} />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-text-primary">Live API request failed</p>
          <p className="text-[12px] text-text-secondary mt-0.5 break-words">{msg}</p>
          <p className="text-[11.5px] text-text-muted mt-2">
            Switch to Mock mode in the topbar to preview the UI without a backend.
          </p>
          {onRetry && (
            <button
              onClick={() => onRetry()}
              className="btn-secondary mt-3 text-[12px]"
            >
              <RefreshCw className="w-3 h-3" strokeWidth={1.75} />
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function LiveEmpty({ label = 'No data returned by the API.' }) {
  return (
    <div className="card p-8 text-center text-text-muted text-[12.5px]">{label}</div>
  )
}
