"use client"

import * as React from "react"
import Image from "next/image"
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  ImagePlus,
  Loader2,
  Lock,
  Star,
  Trash2,
  WifiOff,
} from "lucide-react"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
} from "@dnd-kit/core"
import { restrictToParentElement } from "@dnd-kit/modifiers"
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { ModalPortal } from "@/components/ui/modal-portal"
import { uploadGalleryFile } from "@/lib/seller-gallery-upload"
import {
  useAddListingImageMutation,
  useRemoveListingImageMutation,
  useReorderListingImagesMutation,
  useUpdateListingThumbnailMutation,
} from "@/lib/redux/service/sellerProductApi"
import type { ApiImage, ApiListing } from "@/lib/types"

const MAX_FILE_BYTES = 5 * 1024 * 1024

type GalleryImage = {
  uuid: string
  uri: string
  objectName: string | null
}

type Upload = {
  id: string
  name: string
  previewUrl: string
  progress: number
  status: "uploading" | "attaching" | "failed"
  error?: string
  file: File
}

/**
 * Images predating a server-side fix can carry a null sortOrder, and the
 * numbers are not guaranteed dense. Rank null last and lean on sort stability
 * rather than assuming anything about the values; the first reorder writes a
 * clean 0..n-1 sequence back.
 */
function toGallery(images?: ApiImage[] | null): GalleryImage[] {
  const rank = (value?: number | null) =>
    typeof value === "number" ? value : Number.POSITIVE_INFINITY

  return [...(images ?? [])]
    .filter((image) => Boolean(image?.uuid && image?.uri))
    .sort((a, b) => rank(a.sortOrder) - rank(b.sortOrder))
    .map((image) => ({
      uuid: image.uuid as string,
      uri: image.uri as string,
      objectName: image.objectName ?? null,
    }))
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message
  const data = (error as { data?: { message?: string } } | undefined)?.data
  return data?.message || fallback
}

export function ListingGalleryManager({
  listing,
  listingUuid,
}: {
  listing?: ApiListing
  listingUuid: string
}) {
  const [reorderImages] = useReorderListingImagesMutation()
  const [addListingImage] = useAddListingImageMutation()
  const [removeListingImage] = useRemoveListingImageMutation()
  const [updateThumbnail] = useUpdateListingThumbnailMutation()

  const serverImages = React.useMemo(
    () => toGallery(listing?.images),
    [listing?.images],
  )
  /* Keyed on the membership of the gallery, not its order, so an optimistic
     reorder survives refetches but is dropped the moment a photo is added or
     removed and the server list is authoritative again. */
  const membershipKey = React.useMemo(
    () => [...serverImages.map((image) => image.uuid)].sort().join("|"),
    [serverImages],
  )
  const [override, setOverride] = React.useState<{
    key: string
    items: GalleryImage[]
  } | null>(null)
  const images = override?.key === membershipKey ? override.items : serverImages

  const [uploads, setUploads] = React.useState<Upload[]>([])
  const [pendingDelete, setPendingDelete] = React.useState<GalleryImage | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [announcement, setAnnouncement] = React.useState("")
  const [isDraggingFiles, setIsDraggingFiles] = React.useState(false)
  const [settingCover, setSettingCover] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  /* Each reorder carries the complete desired order, so a newer request simply
     wins — the older one's result is discarded rather than merged or queued. */
  const reorderToken = React.useRef(0)

  const isSuspended = (listing?.status ?? "").toUpperCase() === "SUSPENDED"
  const isOffline = useIsOffline()
  const readOnly = isSuspended
  const canReorder = !readOnly && images.length > 1

  const coverObjectName = listing?.thumbnailUri?.objectName ?? null
  const coverUri = listing?.thumbnailUri?.uri ?? null
  const isCover = (image: GalleryImage) =>
    (coverObjectName !== null && image.objectName === coverObjectName) ||
    (coverObjectName === null && coverUri !== null && image.uri === coverUri)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    // Long-press to lift, so a drag never fights the page scroll on touch.
    useSensor(TouchSensor, {
      activationConstraint: { delay: 220, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function commitOrder(next: GalleryImage[]) {
    setOverride({ key: membershipKey, items: next })
    const token = ++reorderToken.current

    reorderImages({ uuid: listingUuid, imageUuids: next.map((i) => i.uuid) })
      .unwrap()
      .catch((error) => {
        // A superseded request no longer owns the state; the newest one does.
        if (token !== reorderToken.current) return
        setOverride(null) // back to the server order, i.e. before the drag
        toast.error(errorMessage(error, "Could not save the new photo order."))
      })
  }

  function moveBy(index: number, delta: number) {
    const target = index + delta
    if (target < 0 || target >= images.length) return
    commitOrder(arrayMove(images, index, target))
    setAnnouncement(
      `Photo ${index + 1} of ${images.length}, moved to position ${target + 1}.`,
    )
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = images.findIndex((image) => image.uuid === active.id)
    const to = images.findIndex((image) => image.uuid === over.id)
    if (from < 0 || to < 0) return
    commitOrder(arrayMove(images, from, to))
  }

  const announcements: Announcements = {
    onDragStart: ({ active }) => {
      const index = images.findIndex((image) => image.uuid === active.id)
      return `Picked up photo ${index + 1} of ${images.length}.`
    },
    onDragOver: ({ active, over }) => {
      if (!over) return
      const from = images.findIndex((image) => image.uuid === active.id)
      const to = images.findIndex((image) => image.uuid === over.id)
      return `Photo ${from + 1} of ${images.length}, over position ${to + 1}.`
    },
    onDragEnd: ({ active, over }) => {
      const from = images.findIndex((image) => image.uuid === active.id)
      if (!over) return `Photo ${from + 1} returned to its position.`
      const to = images.findIndex((image) => image.uuid === over.id)
      return `Photo ${from + 1} of ${images.length}, moved to position ${to + 1}.`
    },
    onDragCancel: ({ active }) => {
      const index = images.findIndex((image) => image.uuid === active.id)
      return `Move cancelled. Photo ${index + 1} stayed in place.`
    },
  }

  /* ── uploads: preview immediately, upload, then attach ── */
  async function startUploads(files: File[]) {
    if (readOnly) return

    const accepted: File[] = []
    const rejected: string[] = []
    for (const file of files) {
      if (!file.type.startsWith("image/")) rejected.push(`${file.name} (not an image)`)
      else if (file.size > MAX_FILE_BYTES) rejected.push(`${file.name} (over 5 MB)`)
      else accepted.push(file)
    }
    if (rejected.length) {
      toast.error(`Skipped ${rejected.length} file(s): ${rejected.join(", ")}`)
    }
    if (accepted.length === 0) return

    const queued: Upload[] = accepted.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
      progress: 0,
      status: "uploading",
      file,
    }))
    setUploads((current) => [...current, ...queued])

    const failed: string[] = []
    // Sequential, so the append order matches the order the seller picked.
    for (const item of queued) {
      try {
        const uploaded = await uploadGalleryFile(item.file, (percent) =>
          setUploads((current) =>
            current.map((upload) =>
              upload.id === item.id ? { ...upload, progress: percent } : upload,
            ),
          ),
        )
        setUploads((current) =>
          current.map((upload) =>
            upload.id === item.id
              ? { ...upload, status: "attaching", progress: 100 }
              : upload,
          ),
        )
        // No sortOrder: the API appends to the end, which is what we want.
        await addListingImage({
          uuid: listingUuid,
          objectName: uploaded.objectName,
        }).unwrap()

        URL.revokeObjectURL(item.previewUrl)
        setUploads((current) => current.filter((upload) => upload.id !== item.id))
      } catch (error) {
        // A failure here is this photo's alone — the rest of the batch stands.
        failed.push(item.name)
        setUploads((current) =>
          current.map((upload) =>
            upload.id === item.id
              ? {
                  ...upload,
                  status: "failed",
                  error: errorMessage(error, "Upload failed"),
                }
              : upload,
          ),
        )
      }
    }

    if (failed.length) {
      toast.error(
        `${failed.length} photo(s) failed to upload: ${failed.join(", ")}`,
      )
    }
  }

  function dismissUpload(id: string) {
    setUploads((current) => {
      const item = current.find((upload) => upload.id === id)
      if (item) URL.revokeObjectURL(item.previewUrl)
      return current.filter((upload) => upload.id !== id)
    })
  }

  function retryUpload(id: string) {
    const item = uploads.find((upload) => upload.id === id)
    if (!item) return
    dismissUpload(id)
    void startUploads([item.file])
  }

  async function setAsCover(image: GalleryImage) {
    if (readOnly || !image.objectName) return
    setSettingCover(image.uuid)
    try {
      await updateThumbnail({
        uuid: listingUuid,
        objectName: image.objectName,
      }).unwrap()
      toast.success("Cover photo updated.")
    } catch (error) {
      toast.error(errorMessage(error, "Could not set the cover photo."))
    } finally {
      setSettingCover("")
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    setIsDeleting(true)
    try {
      await removeListingImage({
        uuid: listingUuid,
        imageUuid: pendingDelete.uuid,
      }).unwrap()
      setPendingDelete(null)
    } catch (error) {
      toast.error(errorMessage(error, "Could not delete the photo."))
    } finally {
      setIsDeleting(false)
    }
  }

  // Previews outlive their upload only if the component unmounts mid-flight.
  const uploadsRef = React.useRef(uploads)
  uploadsRef.current = uploads
  React.useEffect(
    () => () => {
      uploadsRef.current.forEach((upload) => URL.revokeObjectURL(upload.previewUrl))
    },
    [],
  )

  return (
    <section aria-labelledby="gallery-heading" className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 id="gallery-heading" className="text-base font-bold text-slate-900">
            Photo gallery
          </h3>
          <p className="mt-0.5 text-sm text-slate-500">
            {images.length === 0
              ? "No photos yet."
              : canReorder
                ? `${images.length} photos — drag to reorder, or focus one and use the arrow buttons.`
                : `${images.length} photo.`}
          </p>
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#6C4CD8] px-4 text-sm font-semibold text-white transition hover:bg-[#5B3DC0]"
          >
            <ImagePlus className="size-4" />
            Add photos
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(event) => {
            void startUploads(Array.from(event.target.files ?? []))
            event.target.value = ""
          }}
        />
      </header>

      {isSuspended && (
        <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-900">
          <Lock className="mt-0.5 size-4 shrink-0" />
          <span>
            This listing is suspended, so its gallery is read-only. Photos cannot
            be added, reordered or removed until the suspension is lifted.
          </span>
        </p>
      )}

      {isOffline && !isSuspended && (
        <p className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-700">
          <WifiOff className="mt-0.5 size-4 shrink-0" />
          <span>
            You appear to be offline. You can still rearrange photos, but the
            changes will not be saved until the connection is back.
          </span>
        </p>
      )}

      {/* Moves made with the buttons; dnd-kit narrates its own drags. */}
      <p aria-live="polite" role="status" className="sr-only">
        {announcement}
      </p>

      {images.length === 0 && uploads.length === 0 ? (
        <EmptyDropzone
          readOnly={readOnly}
          isDraggingFiles={isDraggingFiles}
          onOpenPicker={() => inputRef.current?.click()}
          onDragStateChange={setIsDraggingFiles}
          onFiles={(files) => void startUploads(files)}
        />
      ) : (
        <div
          onDragOver={(event) => {
            if (readOnly) return
            event.preventDefault()
            setIsDraggingFiles(true)
          }}
          onDragLeave={() => setIsDraggingFiles(false)}
          onDrop={(event) => {
            if (readOnly) return
            event.preventDefault()
            setIsDraggingFiles(false)
            void startUploads(Array.from(event.dataTransfer.files))
          }}
          className={cn(
            "rounded-2xl border-2 border-dashed p-3 transition-colors",
            isDraggingFiles && !readOnly
              ? "border-violet-400 bg-violet-50"
              : "border-transparent",
          )}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToParentElement]}
            accessibility={{ announcements }}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={images.map((image) => image.uuid)}
              strategy={rectSortingStrategy}
              disabled={!canReorder}
            >
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {images.map((image, index) => (
                  <SortableTile
                    key={image.uuid}
                    image={image}
                    index={index}
                    total={images.length}
                    isCover={isCover(image)}
                    canReorder={canReorder}
                    readOnly={readOnly}
                    isSettingCover={settingCover === image.uuid}
                    onMove={moveBy}
                    onSetCover={() => void setAsCover(image)}
                    onDelete={() => setPendingDelete(image)}
                  />
                ))}

                {uploads.map((upload) => (
                  <li key={upload.id}>
                    <UploadTile
                      upload={upload}
                      onDismiss={() => dismissUpload(upload.id)}
                      onRetry={() => retryUpload(upload.id)}
                    />
                  </li>
                ))}
              </ul>
            </SortableContext>
          </DndContext>

          {!readOnly && (
            <p className="mt-3 text-center text-xs text-slate-500">
              Drop image files here to add them to the end of the gallery.
            </p>
          )}
        </div>
      )}

      {pendingDelete && (
        <ModalPortal>
          <div
            className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/70 px-4"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !isDeleting) {
                setPendingDelete(null)
              }
            }}
          >
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-photo-title"
              aria-describedby="delete-photo-description"
              className="w-full max-w-md rounded-[28px] bg-white px-7 py-8 text-center shadow-[0_28px_80px_rgba(15,23,42,0.3)]"
            >
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-red-50 text-red-600">
                <AlertTriangle className="size-9" strokeWidth={2.2} />
              </span>
              <h2
                id="delete-photo-title"
                className="mt-5 text-2xl font-bold text-slate-900"
              >
                Delete this photo?
              </h2>
              <p
                id="delete-photo-description"
                className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500"
              >
                The file is destroyed on the server straight away. This cannot be
                undone — you would have to upload the photo again.
              </p>
              <div className="mt-7 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setPendingDelete(null)}
                  className="h-12 rounded-xl bg-slate-100 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
                >
                  Keep it
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => void confirmDelete()}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                >
                  {isDeleting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                  {isDeleting ? "Deleting…" : "Yes, delete"}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </section>
  )
}

/** Online/offline without a setState-in-effect cascade. */
function useIsOffline(): boolean {
  return React.useSyncExternalStore(
    (onChange) => {
      window.addEventListener("online", onChange)
      window.addEventListener("offline", onChange)
      return () => {
        window.removeEventListener("online", onChange)
        window.removeEventListener("offline", onChange)
      }
    },
    () => !navigator.onLine,
    () => false,
  )
}

function SortableTile({
  image,
  index,
  total,
  isCover,
  canReorder,
  readOnly,
  isSettingCover,
  onMove,
  onSetCover,
  onDelete,
}: {
  image: GalleryImage
  index: number
  total: number
  isCover: boolean
  canReorder: boolean
  readOnly: boolean
  isSettingCover: boolean
  onMove: (index: number, delta: number) => void
  onSetCover: () => void
  onDelete: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.uuid, disabled: !canReorder })

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50",
        isDragging && "z-10 opacity-80 ring-2 ring-violet-400",
      )}
    >
      <div className="relative aspect-square">
        <Image
          src={image.uri}
          alt={`Product photo ${index + 1} of ${total}`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
          quality={90}
          className="object-cover"
        />

        <span className="absolute left-1.5 top-1.5 rounded-md bg-slate-900/70 px-1.5 py-0.5 text-[11px] font-bold text-white">
          {index + 1}
        </span>

        {isCover && (
          <span className="absolute right-1.5 top-1.5 inline-flex items-center gap-1 rounded-md bg-violet-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
            <Star className="size-3 fill-current" />
            Cover
          </span>
        )}

        {canReorder && (
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label={`Reorder photo ${index + 1} of ${total}. Press space, then use the arrow keys.`}
            className="absolute inset-x-0 bottom-0 flex h-8 cursor-grab items-center justify-center bg-slate-900/60 text-white opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 active:cursor-grabbing"
          >
            <GripVertical className="size-4" />
          </button>
        )}
      </div>

      {!readOnly && (
        <div className="flex items-center gap-1 p-1.5">
          {canReorder && (
            <>
              <button
                type="button"
                onClick={() => onMove(index, -1)}
                disabled={index === 0}
                aria-label={`Move photo ${index + 1} earlier`}
                className="grid size-7 place-items-center rounded-lg text-slate-600 transition hover:bg-slate-100 disabled:opacity-30"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => onMove(index, 1)}
                disabled={index === total - 1}
                aria-label={`Move photo ${index + 1} later`}
                className="grid size-7 place-items-center rounded-lg text-slate-600 transition hover:bg-slate-100 disabled:opacity-30"
              >
                <ChevronRight className="size-4" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onSetCover}
            disabled={isCover || isSettingCover || !image.objectName}
            className={cn(
              "ml-auto inline-flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-bold transition",
              isCover
                ? "text-violet-600"
                : "text-slate-600 hover:bg-violet-50 hover:text-violet-700 disabled:opacity-40",
            )}
          >
            {isSettingCover ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Star className={cn("size-3.5", isCover && "fill-current")} />
            )}
            {isCover ? "Cover" : "Set as cover"}
          </button>

          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete photo ${index + 1}`}
            className="grid size-7 place-items-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      )}
    </li>
  )
}

function UploadTile({
  upload,
  onDismiss,
  onRetry,
}: {
  upload: Upload
  onDismiss: () => void
  onRetry: () => void
}) {
  const failed = upload.status === "failed"
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      <div className="relative aspect-square">
        <Image
          src={upload.previewUrl}
          alt=""
          fill
          unoptimized
          sizes="200px"
          className={cn("object-cover", !failed && "opacity-70")}
        />

        {failed ? (
          <div className="absolute inset-0 grid place-items-center bg-red-950/60 px-2 text-center">
            <div>
              <AlertTriangle className="mx-auto size-5 text-white" />
              <p className="mt-1 text-[11px] font-semibold text-white">
                {upload.error}
              </p>
            </div>
          </div>
        ) : (
          <div className="absolute inset-x-0 bottom-0 bg-slate-900/70 p-2">
            <div
              role="progressbar"
              aria-label={`Uploading ${upload.name}`}
              aria-valuenow={upload.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-1.5 overflow-hidden rounded-full bg-white/25"
            >
              <div
                className="h-full rounded-full bg-white transition-[width] duration-200"
                style={{ width: `${upload.progress}%` }}
              />
            </div>
            <p className="mt-1 truncate text-[10px] text-white/90">
              {upload.status === "attaching"
                ? "Adding to gallery…"
                : `${upload.progress}%`}
            </p>
          </div>
        )}
      </div>

      {failed && (
        <div className="flex items-center gap-1 p-1.5">
          <button
            type="button"
            onClick={onRetry}
            className="h-7 flex-1 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-700 transition hover:bg-slate-200"
          >
            Retry
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="h-7 flex-1 rounded-lg text-[11px] font-bold text-slate-500 transition hover:bg-slate-100"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}

function EmptyDropzone({
  readOnly,
  isDraggingFiles,
  onOpenPicker,
  onDragStateChange,
  onFiles,
}: {
  readOnly: boolean
  isDraggingFiles: boolean
  onOpenPicker: () => void
  onDragStateChange: (dragging: boolean) => void
  onFiles: (files: File[]) => void
}) {
  if (readOnly) {
    return (
      <div className="grid min-h-52 place-items-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 text-center">
        <p className="text-sm text-slate-500">
          This listing has no photos, and its gallery is read-only.
        </p>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onOpenPicker}
      onDragOver={(event) => {
        event.preventDefault()
        onDragStateChange(true)
      }}
      onDragLeave={() => onDragStateChange(false)}
      onDrop={(event) => {
        event.preventDefault()
        onDragStateChange(false)
        onFiles(Array.from(event.dataTransfer.files))
      }}
      className={cn(
        "flex min-h-52 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 text-center transition-colors",
        isDraggingFiles
          ? "border-violet-400 bg-violet-50"
          : "border-slate-200 bg-slate-50 hover:border-violet-300",
      )}
    >
      <span className="grid size-12 place-items-center rounded-2xl bg-white text-violet-600 shadow-sm">
        <ImagePlus className="size-6" />
      </span>
      <span className="text-sm font-semibold text-slate-700">
        Drop photos here, or click to choose files
      </span>
      <span className="text-xs text-slate-500">
        JPEG, PNG, WebP or GIF · up to 5 MB each. The first photo becomes the
        cover, and you can change that at any time.
      </span>
    </button>
  )
}
