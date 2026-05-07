import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import Field from '@/components/ui/Field'
import { useForgotPassword } from '../hooks/useAuth'

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
})

export default function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = (data) => forgotPassword.mutate(data.email)

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-[32px] leading-[1.05] tracking-[-1px] font-bold text-text-primary">
          Forgot password
        </h1>
        <p className="text-text-secondary mt-2 text-caption-light">
          We will send a reset link to your email.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Email" id="forgot-email" error={errors.email?.message}>
          <input
            {...register('email')}
            id="forgot-email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            className={errors.email ? 'input-field-error' : 'input-field'}
          />
        </Field>

        <button
          type="submit"
          disabled={forgotPassword.isPending}
          className="btn-primary w-full py-2.5 mt-2"
        >
          {forgotPassword.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {forgotPassword.isPending ? 'Sending…' : 'Send reset link'}
        </button>

        <div className="text-center text-[12.5px] text-text-secondary">
          Remembered?{' '}
          <Link to="/login" className="text-accent hover:text-accent-hover transition-colors font-medium">
            Back to sign in
          </Link>
        </div>
      </form>
    </div>
  )
}
