import { useEffect, useRef, useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Avatar } from '@/components/ui/Avatar'
import Field from '@/components/ui/Field'
import SelectField from '@/components/ui/SelectField'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useUploadAvatar } from '@/features/members/hooks/useMembers'
import { userService } from '@/features/members/services/memberService'
import { TIMEZONES } from '../settingsConfig'
import { getErrorMessage } from '../settingsUtils'
import type { ChangeEvent, FormEvent } from 'react'
import type { User } from '@/types'
import type { ProfileErrors, ProfileForm } from '../settingsTypes'
import AvatarUploadModal from './AvatarUploadModal'

export default function ProfileSection() {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const { mutate: uploadAvatar, isPending: isUploadingAvatar } = useUploadAvatar()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [form, setForm] = useState<ProfileForm>({
    name: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    position: user?.position || '',
  })
  const [errors, setErrors] = useState<ProfileErrors>({})
  const [saving, setSaving] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(avatarFile)
    setAvatarPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [avatarFile])

  const set = (key: keyof ProfileForm) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }))
  }

  const validate = () => {
    const next: ProfileErrors = {}
    if (!form.name.trim()) next.name = 'Full name is required.'
    if (!form.email.trim()) next.email = 'Email is required.'
    return next
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const next = validate()
    if (Object.keys(next).length) {
      setErrors(next)
      return
    }
    setSaving(true)
    try {
      const res = await userService.updateMe({
        name: form.name,
        email: form.email,
        phone: form.phone,
        position: form.position,
      })
      if (res.data) {
        updateUser(res.data)
      } else if (user) {
        updateUser({
          ...user,
          fullName: form.name,
          email: form.email,
          phone: form.phone,
          position: form.position,
        } as User)
      }
      toast.success('Profile updated')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to update profile'))
    } finally {
      setSaving(false)
    }
  }

  const handleChooseAvatar = () => fileInputRef.current?.click()

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type?.startsWith('image/')) {
      toast.error('File type not allowed')
      e.target.value = ''
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File is too large')
      e.target.value = ''
      return
    }

    setAvatarFile(file)
  }

  const resetAvatarInput = () => {
    setAvatarFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleUploadAvatar = (file: File) => {
    if (isUploadingAvatar) return
    uploadAvatar(file, {
      onSuccess: () => {
        resetAvatarInput()
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      <h3 className="section-title text-[15px]">Profile</h3>

      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <Avatar name={user?.fullName || user?.email} avatarUrl={user?.avatarUrl} size="xl" />
          <button
            type="button"
            onClick={handleChooseAvatar}
            className="absolute -bottom-1 -right-1 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-bg-surface text-text-secondary shadow-card hover:bg-bg-hover hover:text-text-primary transition-colors"
            aria-label="Edit avatar"
          >
            <Camera className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <button type="button" className="btn-secondary" onClick={handleChooseAvatar}>
              Edit avatar
            </button>
          </div>
          <p className="text-[11.5px] text-text-muted mt-1.5">PNG, JPG, GIF up to 2 MB</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full name" id="prof-name" required error={errors.name}>
          <input
            id="prof-name"
            name="name"
            value={form.name}
            onChange={set('name')}
            placeholder="Nguyen Van A"
            className={errors.name ? 'input-field-error' : 'input-field'}
          />
        </Field>

        <Field label="Email" id="prof-email" required error={errors.email}>
          <input
            id="prof-email"
            name="email"
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="you@company.com"
            className={errors.email ? 'input-field-error' : 'input-field'}
          />
        </Field>

        <Field label="Phone" id="prof-phone">
          <input
            id="prof-phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={set('phone')}
            placeholder="0901234567"
            maxLength={20}
            className="input-field"
          />
        </Field>

        <Field label="Position" id="prof-position">
          <input
            id="prof-position"
            name="position"
            value={form.position}
            onChange={set('position')}
            placeholder="e.g. Senior Developer"
            maxLength={100}
            className="input-field"
          />
        </Field>

        <Field label="Role" readOnly hint="Assigned by admin">
          <div className="input-readonly">{user?.role || 'Project Manager'}</div>
        </Field>

        <SelectField label="Timezone" id="prof-timezone">
          {TIMEZONES.map((tz) => (
            <option key={tz}>{tz}</option>
          ))}
        </SelectField>
      </div>

      <div className="pt-2">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>

      <AvatarUploadModal
        open={!!avatarFile && !!avatarPreviewUrl}
        file={avatarFile}
        previewUrl={avatarPreviewUrl}
        isUploading={isUploadingAvatar}
        onClose={resetAvatarInput}
        onSubmit={handleUploadAvatar}
      />
    </form>
  )
}
