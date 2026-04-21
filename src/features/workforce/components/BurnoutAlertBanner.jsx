import { AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBurnoutAtRisk } from '../hooks/useWorkload'

export default function BurnoutAlertBanner({ compact = false }) {
  const [dismissed, setDismissed] = useState(false)
  const { data: atRisk } = useBurnoutAtRisk()
  const list = atRisk || []

  if (dismissed || list.length === 0) return null

  return (
    <div className="flex items-start gap-3 bg-danger-subtle border border-danger/20 rounded-xl px-4 py-3">
      <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center shrink-0 mt-px">
        <AlertTriangle className="w-3.5 h-3.5 text-danger" strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-text-primary leading-snug">
          <span className="text-danger font-semibold">Burnout risk: </span>
          {list.map((m, i) => (
            <span key={m.name}>
              <span className="font-medium">{m.name}</span>
              <span className="text-text-muted tabular-nums ml-1">({m.score}/100)</span>
              {i < list.length - 1 && <span className="text-text-muted">, </span>}
            </span>
          ))}{' '}
          {!compact && <span className="text-text-secondary">are approaching unsafe workload levels.</span>}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          to="/workforce"
          className="text-[12.5px] text-danger hover:text-danger/80 font-medium whitespace-nowrap"
        >
          Redistribute →
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="text-text-muted hover:text-text-primary transition-colors p-1 rounded -mr-1"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  )
}
