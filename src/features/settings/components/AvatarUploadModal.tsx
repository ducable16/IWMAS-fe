import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { ImagePlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { Modal } from '@/components/ui/Modal'
import ModalFormActions from '@/components/ui/ModalFormActions'
import { ERR_AVATAR_PREPARE } from '@/utils/errorMessages'

const OUTPUT_SIZE = 512
const FRAME_SIZE = 320
const CROP_SIZE = 280

interface Position {
  x: number
  y: number
}

interface DragState {
  pointerId: number
  startX: number
  startY: number
  origin: Position
}

interface AvatarUploadModalProps {
  open: boolean
  file: File | null
  previewUrl: string | null
  isUploading: boolean
  onClose: () => void
  onSubmit: (file: File) => void
}

function getOutputType(file: File) {
  return file.type === 'image/jpeg' || file.type === 'image/jpg' ? 'image/jpeg' : 'image/png'
}

function getOutputName(file: File, type: string) {
  const base = file.name.replace(/\.[^.]+$/, '') || 'avatar'
  return `${base}.${type === 'image/jpeg' ? 'jpg' : 'png'}`
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, type, type === 'image/jpeg' ? 0.92 : undefined)
  })
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getRenderedSize(image: HTMLImageElement, zoom: number) {
  const { naturalWidth, naturalHeight } = image

  if (naturalWidth >= naturalHeight) {
    return {
      width: FRAME_SIZE * (naturalWidth / naturalHeight) * zoom,
      height: FRAME_SIZE * zoom,
    }
  }

  return {
    width: FRAME_SIZE * zoom,
    height: FRAME_SIZE * (naturalHeight / naturalWidth) * zoom,
  }
}

function clampPosition(position: Position, image: HTMLImageElement | null, zoom: number): Position {
  if (!image) return { x: 0, y: 0 }

  const rendered = getRenderedSize(image, zoom)
  const maxX = Math.max(0, (rendered.width - CROP_SIZE) / 2)
  const maxY = Math.max(0, (rendered.height - CROP_SIZE) / 2)

  return {
    x: clamp(position.x, -maxX, maxX),
    y: clamp(position.y, -maxY, maxY),
  }
}

function getCropRect(image: HTMLImageElement, zoom: number, position: Position) {
  const { naturalWidth, naturalHeight } = image
  const rendered = getRenderedSize(image, zoom)
  const sourcePxPerPreviewPx = naturalWidth / rendered.width
  const cropSize = CROP_SIZE * sourcePxPerPreviewPx
  const centerX = naturalWidth / 2 - position.x * sourcePxPerPreviewPx
  const centerY = naturalHeight / 2 - position.y * sourcePxPerPreviewPx

  return {
    sourceX: clamp(centerX - cropSize / 2, 0, naturalWidth - cropSize),
    sourceY: clamp(centerY - cropSize / 2, 0, naturalHeight - cropSize),
    cropSize,
  }
}

async function createCroppedAvatarFile(
  file: File,
  image: HTMLImageElement,
  zoom: number,
  position: Position,
) {
  const canvas = document.createElement('canvas')
  canvas.width = OUTPUT_SIZE
  canvas.height = OUTPUT_SIZE

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available')

  const { sourceX, sourceY, cropSize } = getCropRect(image, zoom, position)

  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    cropSize,
    cropSize,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE,
  )

  const outputType = getOutputType(file)
  const blob = await canvasToBlob(canvas, outputType)
  if (!blob) throw new Error('Could not prepare avatar image')

  return new File([blob], getOutputName(file, outputType), {
    type: outputType,
    lastModified: Date.now(),
  })
}

export default function AvatarUploadModal({
  open,
  file,
  previewUrl,
  isUploading,
  onClose,
  onSubmit,
}: AvatarUploadModalProps) {
  const previewRef = useRef<HTMLDivElement | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 })
  const [imageReady, setImageReady] = useState(false)
  const renderedSize = imageReady && imageRef.current
    ? getRenderedSize(imageRef.current, zoom)
    : { width: FRAME_SIZE, height: FRAME_SIZE }

  useEffect(() => {
    if (!open) {
      setZoom(1)
      setPosition({ x: 0, y: 0 })
      setImageReady(false)
      dragRef.current = null
    }
  }, [open])

  const handleClose = () => {
    if (!isUploading) onClose()
  }

  const handleSubmit = async () => {
    if (!file || !imageRef.current || !imageReady || isUploading) return

    try {
      const cropped = await createCroppedAvatarFile(file, imageRef.current, zoom, position)
      onSubmit(cropped)
    } catch {
      toast.error(ERR_AVATAR_PREPARE)
    }
  }

  const handleImageLoad = () => {
    setPosition({ x: 0, y: 0 })
    setImageReady(true)
  }

  const handleZoomChange = (nextZoom: number) => {
    setZoom(nextZoom)
    setPosition((current) => clampPosition(current, imageRef.current, nextZoom))
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!imageReady || isUploading || !imageRef.current) return

    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin: position,
    }
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    const next = {
      x: drag.origin.x + event.clientX - drag.startX,
      y: drag.origin.y + event.clientY - drag.startY,
    }
    setPosition(clampPosition(next, imageRef.current, zoom))
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    dragRef.current = null
    if (previewRef.current?.hasPointerCapture(event.pointerId)) {
      previewRef.current.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Update avatar"
      maxWidth="max-w-[420px]"
      persistent={isUploading}
    >
      <Modal.Body className="space-y-4">
        <div className="flex flex-col items-center gap-4">
          <div
            ref={previewRef}
            className="relative h-80 w-full max-w-[320px] touch-none overflow-hidden border border-border bg-bg-subtle"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {previewUrl ? (
              <img
                ref={imageRef}
                src={previewUrl}
                alt="Avatar preview"
                onLoad={handleImageLoad}
                draggable={false}
                className="absolute left-1/2 top-1/2 max-w-none select-none"
                style={{
                  cursor: imageReady && !isUploading ? 'grab' : 'default',
                  width: renderedSize.width,
                  height: renderedSize.height,
                  transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-text-muted">
                <ImagePlus className="h-8 w-8" strokeWidth={1.75} />
              </div>
            )}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle 140px at center, transparent 0 139px, rgba(0, 0, 0, 0.38) 140px)',
              }}
            />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.2)]" />
          </div>

          <div className="w-full">
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="avatar-zoom" className="text-[12.5px] font-medium text-text-secondary">
                Zoom
              </label>
              <span className="text-[11.5px] text-text-muted">{Math.round(zoom * 100)}%</span>
            </div>
            <input
              id="avatar-zoom"
              type="range"
              min="1"
              max="2"
              step="0.01"
              value={zoom}
              onChange={(event) => handleZoomChange(Number(event.target.value))}
              disabled={isUploading || !previewUrl}
              className="w-full accent-accent disabled:opacity-50"
            />
          </div>
        </div>

        <p className="text-center text-[12px] text-text-muted">
          Drag to reposition and preview how your avatar will appear across IWMAS.
        </p>
      </Modal.Body>

      <ModalFormActions
        onCancel={handleClose}
        cancelDisabled={isUploading}
        submitType="button"
        onSubmitClick={handleSubmit}
        submitLabel="Set new avatar"
        pendingLabel="Uploading..."
        isPending={isUploading}
        disabled={!file || !previewUrl || !imageReady}
      />
    </Modal>
  )
}
