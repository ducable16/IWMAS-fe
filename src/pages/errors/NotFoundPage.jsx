import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg-canvas flex items-center justify-center">
      <div className="text-center space-y-6 px-6 max-w-sm">
        <p className="font-serif text-[72px] text-text-primary tracking-tight leading-none">404</p>
        <div>
          <h1 className="font-serif font-medium text-2xl text-text-primary tracking-tight">Page not found</h1>
          <p className="text-text-secondary text-[14px] mt-2 leading-relaxed">
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
