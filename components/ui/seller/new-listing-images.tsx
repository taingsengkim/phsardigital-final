"use client"

import * as React from "react"
import Image from "next/image"
import {
  ChevronLeft,
  ChevronRight,
  GripVertical,
  ImagePlus,
  Star,
  X,
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

import { cn } from "@/lib/utils"

/**
 * Picks, orders and covers a new listing's photos before anything is saved.
 *
 * The editing view manages a live gallery through the API; here there is no
 * listing yet, so the same interactions run against local File objects and the
 * chosen order and cover are applied at submit time.
 *
 * Files are identified by a stable id rather than by index, so a reorder does
 * not make React reuse the wrong preview.
 */
export type PickedImage = {
  id: string
  file: File
  previewUrl: string
}

export function pickImages(files: File[]): PickedImage[] {
  return files.map((file) => ({
    id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
    file,
    previewUrl: URL.createObjectURL(file),
  }))
}

export function NewListingImages({
  images,
  coverId,
  max,
  onChange,
}: {
  images: PickedImage[]
  coverId: string
  max: number
  onChange: (images: PickedImage[], coverId: string) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isDraggingFiles, setIsDraggingFiles] = React.useState(false)
  const [announcement, setAnnouncement] = React.useState("")

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const canReorder = images.length > 1
  const remaining = max - images.length

  function addFiles(files: File[]) {
    const room = max - images.length
    if (room <= 0) return
    const picked = pickImages(files.slice(0, room))
    const next = [...images, ...picked]
    onChange(next, coverId || next[0]?.id || "")
  }

  function removeAt(index: number) {
    const removed = images[index]
    URL.revokeObjectURL(removed.previewUrl)
    const next = images.filter((_, i) => i !== index)
    // The cover cannot point at a photo that is gone.
    onChange(next, removed.id === coverId ? (next[0]?.id ?? "") : coverId)
  }

  function moveBy(index: number, delta: number) {
    const target = index + delta
    if (target < 0 || target >= images.length) return
    onChange(arrayMove(images, index, target), coverId)
    setAnnouncement(
      `Photo ${index + 1} of ${images.length}, moved to position ${target + 1}.`,
    )
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = images.findIndex((image) => image.id === active.id)
    const to = images.findIndex((image) => image.id === over.id)
    if (from < 0 || to < 0) return
    onChange(arrayMove(images, from, to), coverId)
  }

  const announcements: Announcements = {
    onDragStart: ({ active }) => {
      const index = images.findIndex((image) => image.id === active.id)
      return `Picked up photo ${index + 1} of ${images.length}.`
    },
    onDragOver: ({ active, over }) => {
      if (!over) return
      const from = images.findIndex((image) => image.id === active.id)
      const to = images.findIndex((image) => image.id === over.id)
      return `Photo ${from + 1} of ${images.length}, over position ${to + 1}.`
    },
    onDragEnd: ({ active, over }) => {
      const from = images.findIndex((image) => image.id === active.id)
      if (!over) return `Photo ${from + 1} returned to its position.`
      const to = images.findIndex((image) => image.id === over.id)
      return `Photo ${from + 1} of ${images.length}, moved to position ${to + 1}.`
    },
    onDragCancel: () => "Move cancelled.",
  }

  return (
    <div className="space-y-3">
      <p aria-live="polite" role="status" className="sr-only">
        {announcement}
      </p>

      {images.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToParentElement]}
          accessibility={{ announcements }}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={images.map((image) => image.id)}
            strategy={rectSortingStrategy}
            disabled={!canReorder}
          >
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {images.map((image, index) => (
                <PickedTile
                  key={image.id}
                  image={image}
                  index={index}
                  total={images.length}
                  isCover={image.id === coverId}
                  canReorder={canReorder}
                  onMove={moveBy}
                  onSetCover={() => onChange(images, image.id)}
                  onRemove={() => removeAt(index)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDraggingFiles(true)
        }}
        onDragLeave={() => setIsDraggingFiles(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDraggingFiles(false)
          addFiles(Array.from(event.dataTransfer.files))
        }}
        disabled={remaining <= 0}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-8 text-center transition-colors",
          remaining <= 0 && "cursor-not-allowed opacity-60",
          isDraggingFiles
            ? "border-violet-400 bg-violet-50"
            : "border-slate-200 bg-slate-50 hover:border-violet-300",
        )}
      >
        <span className="grid size-11 place-items-center rounded-xl bg-white text-violet-600 shadow-sm">
          <ImagePlus className="size-5" />
        </span>
        <span className="text-sm font-semibold text-slate-700">
          {images.length === 0
            ? "Drop photos here, or click to choose files"
            : remaining > 0
              ? `Add more photos (${remaining} left)`
              : `Maximum of ${max} photos reached`}
        </span>
        {images.length === 0 && (
          <span className="text-xs text-slate-500">
            The first photo becomes the cover — drag to reorder, or pick a
            different cover once they are added.
          </span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(event) => {
          addFiles(Array.from(event.target.files ?? []))
          event.target.value = ""
        }}
      />
    </div>
  )
}

function PickedTile({
  image,
  index,
  total,
  isCover,
  canReorder,
  onMove,
  onSetCover,
  onRemove,
}: {
  image: PickedImage
  index: number
  total: number
  isCover: boolean
  canReorder: boolean
  onMove: (index: number, delta: number) => void
  onSetCover: () => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: image.id, disabled: !canReorder })

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
          src={image.previewUrl}
          alt={image.file.name}
          fill
          unoptimized
          sizes="(max-width: 640px) 50vw, 200px"
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
          disabled={isCover}
          className={cn(
            "ml-auto inline-flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-bold transition",
            isCover
              ? "text-violet-600"
              : "text-slate-600 hover:bg-violet-50 hover:text-violet-700",
          )}
        >
          <Star className={cn("size-3.5", isCover && "fill-current")} />
          {isCover ? "Cover" : "Set as cover"}
        </button>

        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove photo ${index + 1}`}
          className="grid size-7 place-items-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600"
        >
          <X className="size-4" />
        </button>
      </div>
    </li>
  )
}
