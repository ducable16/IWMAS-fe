import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import Field from '@/components/ui/Field'
import { useResetPassword } from '../hooks/useAuth'

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, 'Must include letters and numbers')

const schema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

type ResetPasswordFormValues = z.infer<typeof schema>

export default function ResetPasswordForm() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const resetPassword = useResetPassword()

  const hasToken = useMemo(() => token.trim().length > 0, [token])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(schema) })

  const onSubmit = (data: ResetPasswordFormValues) => {
    if (!hasToken) return
    resetPassword.mutate({ token, newPassword: data.password })
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-[32px] leading-[1.05] tracking-[-1px] font-bold text-text-primary">
          Reset password
        </h1>
        <p className="text-text-secondary mt-2 text-caption-light">
          Choose a new password for your account.
        </p>
      </div>

      {!hasToken && (
        <div className="mb-4 rounded-lg border border-border bg-bg-subtle px-3 py-2 text-[12.5px] text-text-secondary">
          Reset link is invalid or expired. Please request a new one.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="New password" id="reset-password" error={errors.password?.message}>
          <input
            {...register('password')}
            id="reset-password"
            type="password"
            placeholder="Min 8 characters"
            autoComplete="new-password"
            className={errors.password ? 'input-field-error' : 'input-field'}
          />
        </Field>

        <Field label="Confirm password" id="reset-confirm" error={errors.confirmPassword?.message}>
          <input
            {...register('confirmPassword')}
            id="reset-confirm"
            type="password"
            placeholder="Re-enter password"
            autoComplete="new-password"
            className={errors.confirmPassword ? 'input-field-error' : 'input-field'}
          />
        </Field>

        <button
          type="submit"
          disabled={resetPassword.isPending || !hasToken}
          className="btn-primary w-full py-2.5 mt-2"
        >
          {resetPassword.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {resetPassword.isPending ? 'Resetting…' : 'Reset password'}
        </button>

        <div className="text-center text-[12.5px] text-text-secondary">
          <Link to="/login" className="text-accent hover:text-accent-hover transition-colors font-medium">
            Back to sign in
          </Link>
        </div>
      </form>
    </div>
  )
}
