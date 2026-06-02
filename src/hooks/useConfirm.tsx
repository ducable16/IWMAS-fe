import { useCallback, useRef, useState } from 'react'
import { ConfirmDialog, type ConfirmDialogProps } from '@/components/ui/ConfirmDialog'

type ConfirmOptions = Omit<ConfirmDialogProps, 'open' | 'onConfirm' | 'onCancel'>

/**
 * useConfirm — drop-in async replacement for window.confirm.
 *
 * Usage:
 *   const { confirm, dialog } = useConfirm()
 *
 *   const ok = await confirm({ title: 'Delete?', description: 'This cannot be undone.' })
 *   if (!ok) return
 *   // proceed...
 *
 *   // In JSX:
 *   return <>{dialog}</>
 */
export function useConfirm() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve
      setOptions(opts)
    })
  }, [])

  const handleConfirm = useCallback(() => {
    resolveRef.current?.(true)
    resolveRef.current = null
    setOptions(null)
  }, [])

  const handleCancel = useCallback(() => {
    resolveRef.current?.(false)
    resolveRef.current = null
    setOptions(null)
  }, [])

  const dialog = (
    <ConfirmDialog
      {...(options ?? { title: '' })}
      open={options !== null}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  )

  return { confirm, dialog }
}
