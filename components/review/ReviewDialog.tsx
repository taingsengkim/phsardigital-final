"use client"

import * as React from "react"
import Image from "next/image"
import {
  Camera,
  Check,
  Loader2,
  Package,
  Star,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { cn, getFileUrl } from "@/lib/utils"
import {
  useCreateProductReviewMutation,
  useUpdateProductReviewMutation,
} from "@/lib/redux/service/sellerCommentApi"
import type { ReviewResponse } from "@/lib/types/review"
import { Button } from "@/components/ui/button"

const RATING_LABELS: Record<number, string> = {
  1: "Terrible",
  2: "Poor",
  3: "Average",
  4: "Good",
  5: "Excellent",
}

interface ReviewDialogProps {
  isOpen: boolean
  onClose: () => void
  listingUuid: string
  listingTitle: string
  listingImage?: string | null
  existingReview?: ReviewResponse | null
  onSuccess?: () => void
}

export default function ReviewDialog({
  isOpen,
  onClose,
  listingUuid,
  listingTitle,
  listingImage,
  existingReview,
  onSuccess,
}: ReviewDialogProps) {
  const [rating, setRating] = React.useState<number>(existingReview?.rating ?? 5)
  const [hoveredRating, setHoveredRating] = React.useState<number | null>(null)
  const [comment, setComment] = React.useState<string>(existingReview?.comment ?? "")
  const [photoObjectName, setPhotoObjectName] = React.useState<string | undefined>(
    existingReview?.photo?.objectName,
  )
  const [photoPreviewUri, setPhotoPreviewUri] = React.useState<string | undefined>(
    existingReview?.photo?.uri,
  )
  const [isUploadingPhoto, setIsUploadingPhoto] = React.useState(false)

  const [createReview, { isLoading: isCreating }] = useCreateProductReviewMutation()
  const [updateReview, { isLoading: isUpdating }] = useUpdateProductReviewMutation()

  const isSubmitting = isCreating || isUpdating

  // Sync with existing review if supplied
  React.useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating || 5)
      setComment(existingReview.comment || "")
      setPhotoObjectName(existingReview.photo?.objectName)
      setPhotoPreviewUri(existingReview.photo?.uri)
    } else {
      setRating(5)
      setComment("")
      setPhotoObjectName(undefined)
      setPhotoPreviewUri(undefined)
    }
  }, [existingReview, isOpen])

  if (!isOpen) return null

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast.error("Please upload a supported image format (JPG, PNG, WebP, or GIF)")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file size must be under 10MB")
      return
    }

    setIsUploadingPhoto(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      })

      const text = await res.text()
      let data: any = null
      if (text) {
        try {
          data = JSON.parse(text)
        } catch {
          data = { message: text }
        }
      }

      if (!res.ok) {
        const errorMsg =
          data?.message ||
          (res.status === 415
            ? "Unsupported file format. Please upload JPG, PNG, WebP, or GIF."
            : "Failed to upload photo")
        toast.error(errorMsg)
        return
      }

      if (data?.objectName) {
        setPhotoObjectName(data.objectName)
        setPhotoPreviewUri(data.uri || URL.createObjectURL(file))
        toast.success("Photo uploaded successfully")
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload photo")
    } finally {
      setIsUploadingPhoto(false)
      // reset input
      e.target.value = ""
    }
  }

  const handleRemovePhoto = () => {
    setPhotoObjectName(undefined)
    setPhotoPreviewUri(undefined)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rating || rating < 1 || rating > 5) {
      toast.error("Please select a star rating (1-5 stars)")
      return
    }

    try {
      if (existingReview?.uuid) {
        await updateReview({
          reviewUuid: existingReview.uuid,
          rating,
          comment: comment.trim() || undefined,
          photoObjectName,
        }).unwrap()
        toast.success("Review updated successfully!")
      } else {
        await createReview({
          listingUuid,
          rating,
          comment: comment.trim() || undefined,
          photoObjectName,
        }).unwrap()
        toast.success("Review submitted successfully! Thank you for your feedback.")
      }
      onSuccess?.()
      onClose()
    } catch (err: any) {
      if (err?.status === 409) {
        toast.error("You have already reviewed this product. You can edit your existing review.")
      } else if (err?.status === 403) {
        toast.error(err?.data?.message || "Reviewing requires a completed purchase of this product.")
      } else {
        toast.error(err?.data?.message || err?.message || "Failed to submit review.")
      }
    }
  }

  const activeStars = hoveredRating ?? rating

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in-0 duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 sm:p-7 shadow-2xl space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-black text-slate-950">
              {existingReview ? "Edit Your Review" : "Write a Product Review"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Share your honest thoughts to help fellow shoppers.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Product preview */}
        <div className="flex items-center gap-3.5 rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {listingImage ? (
              <Image
                src={listingImage.startsWith("http") || listingImage.startsWith("/") ? listingImage : getFileUrl(listingImage)}
                alt={listingTitle}
                fill
                className="object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-slate-400">
                <Package className="size-6" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-slate-950 line-clamp-1">{listingTitle}</p>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Verified Order
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star rating picker */}
          <div className="space-y-2 text-center">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Overall Rating
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= activeStars
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(null)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                  >
                    <Star
                      className={cn(
                        "size-8 sm:size-9 transition-colors",
                        isFilled
                          ? "fill-amber-400 text-amber-400"
                          : "fill-slate-100 text-slate-300",
                      )}
                    />
                  </button>
                )
              })}
            </div>
            <p className="text-xs font-bold text-amber-700 min-h-4">
              {RATING_LABELS[activeStars] || ""}
            </p>
          </div>

          {/* Comment input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Your Review & Feedback <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike? How was the product quality, packing, and courier delivery?"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs sm:text-sm font-medium text-slate-900 outline-none transition focus:border-[#6C4CD8] focus:bg-white focus:ring-2 focus:ring-[#6C4CD8]/20 placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Single photo uploader (Supported by backend: 1 photo per review) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Add Photo <span className="text-slate-400 font-normal">(Optional, 1 photo)</span>
            </label>

            {photoPreviewUri ? (
              <div className="relative size-24 overflow-hidden rounded-2xl border-2 border-[#6C4CD8] shadow-xs group">
                <Image
                  src={photoPreviewUri.startsWith("http") || photoPreviewUri.startsWith("/") ? photoPreviewUri : getFileUrl(photoPreviewUri)}
                  alt="Uploaded review photo"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute inset-0 grid place-items-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity text-white"
                  title="Remove photo"
                >
                  <Trash2 className="size-5 text-rose-300" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-4 transition hover:border-[#6C4CD8] hover:bg-[#F1EFFA]/30 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploadingPhoto}
                  className="hidden"
                />
                {isUploadingPhoto ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#6C4CD8]">
                    <Loader2 className="size-4 animate-spin" /> Uploading photo...
                  </div>
                ) : (
                  <>
                    <Camera className="size-5 text-slate-400" />
                    <span className="text-xs font-bold text-slate-600">
                      Click to upload a photo of the product
                    </span>
                    <span className="text-[10px] text-slate-400">JPG, PNG, WebP up to 10MB</span>
                  </>
                )}
              </label>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl px-4 text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploadingPhoto}
              className="rounded-xl bg-[#6C4CD8] px-6 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#5B3DC0] cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-1.5" />
                  Submitting...
                </>
              ) : existingReview ? (
                "Update Review"
              ) : (
                "Post Review"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
