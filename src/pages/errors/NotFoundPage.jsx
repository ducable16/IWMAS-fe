import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg-canvas flex items-center justify-center">
      <div className="text-center space-y-6 px-6 max-w-sm">
        <p className="text-display-hero text-text-primary">404</p>
        <div>
          <h1 className="text-card-title text-text-primary">Page not found</h1>
          <p className="text-text-secondary text-caption-light mt-2 leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <Link to="/dashboard" className="btn-secondary inline-flex">
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
