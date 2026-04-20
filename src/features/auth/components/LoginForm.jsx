import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function LoginForm() {
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    setAuth(
      { id: '1', name: 'Alex Johnson', email: data.email, role: 'Project Manager' },
      'demo-token-123',
    )
    toast.success('Welcome back, Alex')
    navigate('/dashboard')
    setLoading(false)
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-serif font-medium text-[32px] text-text-primary tracking-tight leading-tight">
          Sign in
        </h1>
        <p className="text-text-secondary mt-2 text-[14px]">
          Enter your credentials to access your workspace.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-[12px] font-medium text-text-secondary mb-1.5 block">Email</label>
          <input
            {...register('email')}
            type="email"
            placeholder="you@company.com"
            className="input-base"
            autoComplete="email"
          />
          {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="text-[12px] font-medium text-text-secondary mb-1.5 block">Password</label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              className="input-base pr-10"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors p-0.5"
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff className="w-4 h-4" strokeWidth={1.75} /> : <Eye className="w-4 h-4" strokeWidth={1.75} />}
            </button>
          </div>
          {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between text-[12.5px] pt-1">
          <label className="flex items-center gap-2 text-text-secondary cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-3.5 h-3.5 rounded border-border accent-accent"
            />
            Remember me
          </label>
          <a href="#" className="text-accent hover:text-accent-hover transition-colors font-medium">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-2.5 mt-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="mt-6 p-3 bg-bg-subtle border border-border-subtle rounded-lg">
        <p className="text-text-muted text-[12px] text-center">
          <span className="text-text-secondary font-medium">Demo mode</span> — use any email and password
        </p>
      </div>
    </div>
  )
}
