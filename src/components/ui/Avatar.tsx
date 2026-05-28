import clsx from 'clsx'
import { useState } from 'react'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface AvatarProps {
  name?: string | null | undefined
  avatarUrl?: string | null | undefined
  size?: AvatarSize
  className?: string
}

const SIZE_MAP: Record<AvatarSize, { box: string; text: string }> = {
  xs: { box: 'w-5 h-5',   text: 'text-[9px]'  },
  sm: { box: 'w-6 h-6',   text: 'text-[10px]' },
  md: { box: 'w-8 h-8',   text: 'text-[12px]' },
  lg: { box: 'w-10 h-10', text: 'text-[14px]' },
  xl: { box: 'w-16 h-16', text: 'text-[22px]' },
}

export function Avatar({ name, avatarUrl, size = 'sm', className }: AvatarProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const initials = name
    ? name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
    : '?'
  const { box, text } = SIZE_MAP[size]
  const imageSrc = avatarUrl?.trim() || null

  if (imageSrc && imageSrc !== failedUrl) {
    return (
      <img
        src={imageSrc}
        alt={name || 'User'}
        loading="lazy"
        decoding="async"
        onError={() => setFailedUrl(imageSrc)}
        className={clsx('rounded-full object-cover border border-border-subtle shrink-0', box, className)}
      />
    )
  }

  return (
    <div
      className={clsx(
        'rounded-full bg-accent flex items-center justify-center font-semibold text-white shrink-0',
        box,
        text,
        className,
      )}
    >
      {initials}
    </div>
  )
}
