import { createPortal } from 'react-dom'
import { useEffect, useCallback } from 'react'
import { X, Download } from 'lucide-react'

interface ImageLightboxProps {
  src: string
  alt?: string
  onClose: () => void
}

export default function ImageLightbox({ src, alt = '', onClose }: ImageLightboxProps) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [handleKey])

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Image: ${alt}`}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div
        className="absolute top-4 right-4 flex items-center gap-2 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <a
          href={src}
          download={alt || 'image'}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[12px] transition-colors"
        >
          <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
          Download
        </a>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-4 h-4" strokeWidth={1.75} />
        </button>
      </div>

      <div
        className="relative z-10 max-w-[90vw] max-h-[85vh] flex flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
        />
        {alt && (
          <p className="text-white/70 text-[12px] text-center truncate max-w-[400px]">
            {alt}
          </p>
        )}
      </div>
    </div>,
    document.body,
  )
}
