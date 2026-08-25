"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import type { FieldErrors } from "react-hook-form"
import { z } from "zod"
import {
  ArrowLeft,
  ChevronDown,
  ImagePlus,
  Info,
  Upload,
  X,
} from "lucide-react"

import {
  useCreateSellerListingMutation,
  useAddListingImageMutation,
  useGetSellerCategoryTreeQuery,
  useGetSellerCategoryAttributesQuery,
  useGetSellerListingQuery,
  useRemoveListingDiscountMutation,
  useUpdateListingThumbnailMutation,
  useUpdateSellerListingMutation,
  useUploadProductFileMutation,
} from "@/lib/redux/service/sellerProductApi"
import { readSellerDrafts, writeSellerDrafts } from "@/lib/seller-drafts"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAppDispatch } from "@/lib/hooks"
import { sellerApi } from "@/lib/api/sellerApi"
import type { CategoryAttributeDefinition, SellerCategoryTree } from "@/lib/types/seller-product"
import { toast } from "sonner"

const productImageSchema = z.custom<File>(
  (value) => typeof File !== "undefined" && value instanceof File,
  "Please select a valid image file.",
).refine((file) => file.type.startsWith("image/"), "Only image files are allowed.")
  .refine((file) => file.size <= 5 * 1024 * 1024, "Each image must be 5 MB or smaller.")

const createProductSchema = z.object({
  title: z.string().trim().min(3, "Title must contain at least 3 characters.").max(120, "Title must not exceed 120 characters."),
  description: z.string().trim().min(10, "Description must contain at least 10 characters.").max(5000, "Description must not exceed 5,000 characters."),
  price: z.number({ error: "Enter a valid price." }).positive("Price must be greater than 0."),
  discountPrice: z.number({ error: "Enter a valid discount price." }).positive("Discount price must be greater than 0.").optional(),
  stockQty: z.number({ error: "Enter a valid stock quantity." }).int("Stock quantity must be a whole number.").min(0, "Stock quantity cannot be negative."),
  categoryUuid: z.string().min(1, "Please select a category."),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  images: z.array(productImageSchema).max(8, "You can upload up to 8 images."),
}).refine(
  (data) => data.discountPrice === undefined || data.discountPrice < data.price,
  { path: ["discountPrice"], message: "Discount price must be lower than the regular price." },
)

type CreateProductForm = z.infer<typeof createProductSchema>

type ApiFailure = {
  status?: number | string
  error?: string
  data?: string | {
    message?: string
    detail?: string
    title?: string
    error?: string
    errors?: Record<string, string | string[]> | Array<{ field?: string; message?: string; defaultMessage?: string }>
  }
}

function apiFailureMessage(error: unknown, fallback: string): string {
  const failure = error as ApiFailure
  if (typeof failure.data === "string" && failure.data.trim()) return failure.data
  const data = typeof failure.data === "object" && failure.data ? failure.data : undefined
  if (data?.message) return data.message
  if (data?.detail) return data.detail
  if (data?.error) return data.error
  if (Array.isArray(data?.errors)) {
    const messages = data.errors
      .map((item) => item.message ?? item.defaultMessage)
      .filter(Boolean)
    if (messages.length) return messages.join(" ")
  }
  if (data?.errors && typeof data.errors === "object") {
    const messages = Object.entries(data.errors).flatMap(([field, value]) =>
      (Array.isArray(value) ? value : [value]).map((message) => `${field}: ${message}`),
    )
    if (messages.length) return messages.join(" ")
  }
  if (data?.title && data.title.toLowerCase() !== "bad request") return data.title
  if (failure.error && failure.error !== "PARSING_ERROR") return failure.error
  return failure.status ? `${fallback} (API ${failure.status})` : fallback
}

function categoryPath(tree: SellerCategoryTree[], uuid?: string | null): SellerCategoryTree[] {
  if (!uuid) return []
  for (const category of tree) {
    if (category.uuid === uuid) return [category]
    const childPath = categoryPath(category.children ?? [], uuid)
    if (childPath.length) return [category, ...childPath]
  }
  return []
}

/**
 * ListingResponse.category is a CategorySummaryResponse — `{ name, slug }`
 * only, with no uuid — so an edit has to match the category back to the tree by
 * slug (name as a fallback for older rows). Reading `category.uuid` always
 * yielded undefined, which left the select empty on edit and, because the
 * attribute schema is fetched by the selected uuid, blanked every custom field
 * with it.
 */
function findCategoryBySummary(
  tree: SellerCategoryTree[],
  summary?: { slug?: string | null; name?: string | null } | null,
): SellerCategoryTree | undefined {
  const slug = summary?.slug?.trim().toLowerCase()
  const name = summary?.name?.trim().toLowerCase()
  if (!slug && !name) return undefined

  for (const category of tree) {
    if (slug && category.slug?.trim().toLowerCase() === slug) return category
    if (!slug && name && category.name.trim().toLowerCase() === name) return category
    const match = findCategoryBySummary(category.children ?? [], summary)
    if (match) return match
  }
  return undefined
}

function flattenCategoryTree(tree: SellerCategoryTree[], parents: string[] = []): SellerCategoryTree[] {
  return tree.flatMap((category) => {
    const path = [...parents, category.name]
    return [
      { ...category, name: path.join(" / ") },
      ...flattenCategoryTree(category.children ?? [], path),
    ]
  })
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-2 text-sm font-medium text-red-600">{message}</p> : null
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
      {children}
      <Info className="size-3.5 text-slate-400" />
    </label>
  )
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6 flex items-center gap-3">
        <span className={`h-7 w-2 rounded-full ${color}`} />
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function DropZone({
  accept,
  multiple,
  label,
  files,
  onFiles,
  onRemove,
  coverLabel,
}: {
  accept: string
  multiple?: boolean
  label: string
  files: File[]
  onFiles: (files: File[]) => void
  onRemove?: (index: number) => void
  /** Badge for the first pick, which is the one that becomes the cover. */
  coverLabel?: string
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = React.useState(false)

  /* A picked file is only viewable through an object URL, and every one of
     them has to be handed back or it leaks for the life of the page. */
  const previews = React.useMemo(
    () =>
      files.map((file) => ({
        key: `${file.name}-${file.size}-${file.lastModified}`,
        name: file.name,
        url: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
      })),
    [files],
  )
  React.useEffect(
    () => () =>
      previews.forEach((preview) => {
        if (preview.url) URL.revokeObjectURL(preview.url)
      }),
    [previews],
  )

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          onFiles(Array.from(event.dataTransfer.files))
        }}
        className={`flex min-h-44 w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed transition-colors ${dragging ? "border-violet-400 bg-violet-50" : "border-slate-200 bg-slate-50 hover:border-violet-300"}`}
      >
        <span className="grid size-11 place-items-center rounded-xl bg-white text-slate-500 shadow-sm">
          {accept.startsWith("image") ? <ImagePlus className="size-5" /> : <Upload className="size-5" />}
        </span>
        <span className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
          <Upload className="mr-2 inline size-4" />{label}
        </span>
        <span className="text-xs text-slate-400">or drag and drop here</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(event) => onFiles(Array.from(event.target.files ?? []))}
      />
      {previews.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-3">
          {previews.map((preview, index) => (
            <li key={preview.key} className="w-24">
              <figure className="group relative size-24 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {preview.url ? (
                  <Image
                    src={preview.url}
                    alt={preview.name}
                    fill
                    unoptimized
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <span className="grid size-full place-items-center px-1 text-center text-[10px] text-slate-500">
                    {preview.name}
                  </span>
                )}

                {coverLabel && index === 0 && (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-violet-600/85 py-0.5 text-center text-[10px] font-bold uppercase tracking-wide text-white">
                    {coverLabel}
                  </figcaption>
                )}

                {onRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    aria-label={`Remove ${preview.name}`}
                    className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-slate-900/70 text-white opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </figure>
              <p className="mt-1 truncate text-[11px] text-slate-500" title={preview.name}>
                {preview.name}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function CategoryAttributeField({ attribute, value, onChange }: { attribute: CategoryAttributeDefinition; value: string; onChange: (value: string) => void }) {
  const label = <FieldLabel>{attribute.label}{attribute.required ? " *" : ""}{attribute.unit ? ` (${attribute.unit})` : ""}</FieldLabel>
  const inputClass = "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"

  if (attribute.dataType === "BOOLEAN") return <div>{label}<select value={value} onChange={(event) => onChange(event.target.value)} className={inputClass}><option value="">Select an option</option><option value="true">Yes</option><option value="false">No</option></select></div>
  if (attribute.dataType === "SELECT") return <div>{label}<select value={value} onChange={(event) => onChange(event.target.value)} className={inputClass}><option value="">Select {attribute.label.toLowerCase()}</option>{(attribute.options ?? []).map((option) => <option key={option.uuid ?? option.value} value={option.value}>{option.label || option.value}</option>)}</select></div>
  if (attribute.dataType === "MULTI_SELECT") {
    const selected = new Set(value.split(",").filter(Boolean))
    return <fieldset><legend className="mb-2 text-sm font-semibold text-slate-700">{attribute.label}{attribute.required ? " *" : ""}</legend><div className="flex min-h-12 flex-wrap gap-2 rounded-xl border border-slate-200 p-2">{(attribute.options ?? []).map((option) => <label key={option.uuid ?? option.value} className={`cursor-pointer rounded-lg px-3 py-2 text-sm transition ${selected.has(option.value) ? "bg-primary text-primary-foreground" : "bg-slate-100 text-slate-700"}`}><input type="checkbox" checked={selected.has(option.value)} onChange={(event) => { const next = new Set(selected); if (event.target.checked) next.add(option.value); else next.delete(option.value); onChange([...next].join(",")) }} className="sr-only" />{option.label || option.value}</label>)}</div></fieldset>
  }
  return <div>{label}<input type={attribute.dataType === "NUMBER" ? "number" : "text"} value={value} onChange={(event) => onChange(event.target.value)} placeholder={`Enter ${attribute.label.toLowerCase()}`} className={inputClass} /></div>
}

function CategoryDropdown({ label, placeholder, options, value, disabled, onChange }: { label: string; placeholder: string; options: SellerCategoryTree[]; value?: string; disabled?: boolean; onChange: (uuid: string) => void }) {
  const selected = options.find((option) => option.uuid === value)
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={disabled}>
          <button type="button" className="flex h-12 w-full items-center rounded-xl border border-slate-200 bg-white px-4 text-left text-sm outline-none transition hover:bg-slate-50 focus-visible:border-violet-400 focus-visible:ring-4 focus-visible:ring-violet-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400">
            <span className={`truncate ${selected ? "text-slate-900" : "text-slate-400"}`}>{selected?.name || placeholder}</span>
            <ChevronDown className="ml-auto size-4 shrink-0 text-slate-400" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-72 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto p-1.5">
          {options.map((option) => (
            <DropdownMenuItem key={option.uuid} onSelect={() => onChange(option.uuid)} className="cursor-pointer rounded-lg px-3 py-2.5">
              <span className="truncate">{option.name}</span>
              {option.uuid === value && <span className="ml-auto font-bold text-primary">✓</span>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function CreateProduct({ editUuid = "" }: { editUuid?: string }) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const isEditing = Boolean(editUuid)
  const [formError, setFormError] = React.useState("")
  const [requiresSubscription, setRequiresSubscription] = React.useState(false)
  const [draftSaved, setDraftSaved] = React.useState(false)
  const { data: categoryTree = [], isLoading: categoriesLoading, isError: categoriesError } = useGetSellerCategoryTreeQuery()
  const { data: listing, error: listingError } = useGetSellerListingQuery(editUuid, { skip: !isEditing })
  const [uploadProductFile] = useUploadProductFileMutation()
  const [createSellerListing, { isLoading: isCreating }] = useCreateSellerListingMutation()
  const [updateSellerListing, { isLoading: isUpdating }] = useUpdateSellerListingMutation()
  const [updateListingThumbnail] = useUpdateListingThumbnailMutation()
  const [addListingImage] = useAddListingImageMutation()
  const [removeListingDiscount] = useRemoveListingDiscountMutation()
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    getValues,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateProductForm>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      title: "",
      description: "",
      price: undefined,
      discountPrice: undefined,
      stockQty: undefined,
      categoryUuid: "",
      status: "ACTIVE",
      images: [],
    },
  })
  const images = useWatch({ control, name: "images" })
  const categoryUuid = useWatch({ control, name: "categoryUuid" })
  const [attributeValues, setAttributeValues] = React.useState<Record<string, string>>({})
  const categoryOptions = React.useMemo(() => flattenCategoryTree(categoryTree), [categoryTree])
  const selectedCategory = categoryOptions.find((category) => category.uuid === categoryUuid)
  const attributeCategoryUuid = selectedCategory?.uuid ?? ""
  const { data: attributeSchema, isLoading: attributesLoading, isError: attributesError, refetch: refetchAttributes } = useGetSellerCategoryAttributesQuery(attributeCategoryUuid, { skip: !attributeCategoryUuid })
  const categoryAttributes = React.useMemo(() => {
    const grouped = attributeSchema?.groups?.flatMap((group) => group.attributes ?? []) ?? []
    const attributes = grouped.length ? grouped : (attributeSchema?.attributes ?? [])
    return [...attributes].sort((a, b) => (a.groupSortOrder ?? 0) - (b.groupSortOrder ?? 0) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  }, [attributeSchema])
  const isSubmitting = isCreating || isUpdating

  /* What the product already has, so an edit shows its photos instead of an
     empty drop zone. The thumbnail leads, then the gallery by sortOrder. */
  const existingImages = React.useMemo(() => {
    if (!isEditing || !listing) return []
    const thumbnail = listing.thumbnailUri?.uri
    const gallery = [...(listing.images ?? [])]
      .filter((image) => image?.uri)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))

    const seen = new Set<string>()
    const ordered: { key: string; uri: string; isCover: boolean }[] = []
    for (const uri of [thumbnail, ...gallery.map((image) => image.uri)]) {
      if (!uri || seen.has(uri)) continue
      seen.add(uri)
      ordered.push({ key: uri, uri, isCover: ordered.length === 0 })
    }
    return ordered
  }, [isEditing, listing])

  React.useEffect(() => {
    if (!listing || !isEditing) return
    /* The tree arrives on its own schedule; until it does there is nothing to
       match the category against, and resetting now would lock in a blank one. */
    if (categoryTree.length === 0) return
    const matched =
      categoryPath(categoryTree, listing.category?.uuid).at(-1) ??
      findCategoryBySummary(categoryTree, listing.category)
    reset({
      title: listing.title ?? "",
      description: listing.description ?? "",
      price: Number(listing.fullPrice ?? listing.price ?? 0),
      discountPrice: listing.discountPrice == null ? undefined : Number(listing.discountPrice),
      stockQty: Number(listing.stockQty ?? 0),
      categoryUuid: listing.category?.uuid ?? matched?.uuid ?? "",
      status: listing.status === "DRAFT" || listing.status === "ARCHIVED" ? listing.status : "ACTIVE",
      images: [],
    })
  }, [categoryTree, isEditing, listing, reset])

  React.useEffect(() => {
    if (!isEditing || !listing || categoryAttributes.length === 0) return
    const values: Record<string, string> = {}
    for (const value of listing.listingAttributes ?? []) {
      const definition = categoryAttributes.find((attribute) => attribute.code === value.key || attribute.label === value.key)
      values[definition?.code ?? value.key] = value.value ?? ""
    }
    // Populate dynamic category fields after their schema and listing are both available.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAttributeValues(values)
  }, [categoryAttributes, isEditing, listing])

  const saveDraft = () => {
    const data = getValues()
    const drafts = readSellerDrafts()
    drafts.unshift({
      id: crypto.randomUUID(),
      title: data.title.trim() || "Untitled product",
      description: data.description.trim(),
      categoryUuid: data.categoryUuid,
      price: Number.isFinite(data.price) ? String(data.price) : "",
      discountPrice: Number.isFinite(data.discountPrice) ? String(data.discountPrice) : "",
      stockQty: Number.isFinite(data.stockQty) ? String(data.stockQty) : "",
      imageNames: data.images.map((image) => image.name),
      updatedAt: new Date().toISOString(),
    })
    writeSellerDrafts(drafts)
    setDraftSaved(true)
    setFormError("")
    setRequiresSubscription(false)
  }

  const submitProduct = async (data: CreateProductForm) => {
    setFormError("")
    setRequiresSubscription(false)
    try {
      const missingAttribute = categoryAttributes.find((attribute) => attribute.required && !attributeValues[attribute.code]?.trim())
      if (missingAttribute) {
        setFormError(`${missingAttribute.label} is required for this category.`)
        return
      }
      if (!isEditing && data.images.length === 0) {
        setError("images", { type: "manual", message: "Please add at least one cover image." })
        return
      }
      const uploadedImages = await Promise.all(
        data.images.map((file) => uploadProductFile(file).unwrap()),
      )
      const listingAttributes = categoryAttributes
        .map((attribute, index) => ({ key: attribute.code, value: attributeValues[attribute.code]?.trim() ?? "", sortOrder: attribute.sortOrder ?? index }))
        .filter((attribute) => attribute.value)

      if (isEditing) {
        await updateSellerListing({
          uuid: editUuid,
          body: {
            categoryUuid: data.categoryUuid,
            title: data.title,
            description: data.description,
            fullPrice: data.price,
            ...(data.discountPrice !== undefined ? { discountPrice: data.discountPrice } : {}),
            stockQty: data.stockQty,
            status: data.status,
            listingAttributes,
          },
        }).unwrap()

        if (data.discountPrice === undefined && listing?.discountPrice != null) {
          await removeListingDiscount(editUuid).unwrap()
        }

        if (uploadedImages.length > 0) {
          await updateListingThumbnail({ uuid: editUuid, objectName: uploadedImages[0].objectName }).unwrap()
          await Promise.all(uploadedImages.map((image, index) => addListingImage({
            uuid: editUuid,
            objectName: image.objectName,
            sortOrder: (listing?.images?.length ?? 0) + index,
          }).unwrap()))
        }
      } else {
        await createSellerListing({
          categoryUuid: data.categoryUuid,
          title: data.title,
          description: data.description,
          fullPrice: data.price,
          discountPrice: data.discountPrice,
          stockQty: data.stockQty,
          isFeatured: false,
          thumbnailObjectName: uploadedImages[0]?.objectName,
          images: uploadedImages.map((image, index) => ({
            objectName: image.objectName,
            sortOrder: index,
            isPrimary: index === 0,
          })),
          listingAttributes,
        }).unwrap()
      }

      dispatch(sellerApi.util.invalidateTags(["SellerListings"]))
      toast.success(isEditing ? "Product updated successfully." : "Product created successfully.", {
        id: "product-save-success",
      })
      router.push(`/seller-dashboard/products/dashboard?success=${isEditing ? "updated" : "created"}`)
      router.refresh()
    } catch (error) {
      const apiError = error as ApiFailure
      const subscriptionRequired = apiError.status === 402
      setRequiresSubscription(subscriptionRequired)
      setFormError(apiFailureMessage(error, `Could not ${isEditing ? "update" : "create"} the product. Please try again.`))
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const showValidationError = (validationErrors: FieldErrors<CreateProductForm>) => {
    const firstError = Object.values(validationErrors).find((error) => error?.message)
    setFormError(typeof firstError?.message === "string" ? firstError.message : "Please check the highlighted fields before saving.")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <form className="mx-auto w-full max-w-5xl pb-10" noValidate onSubmit={handleSubmit(submitProduct, showValidationError)}>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-sm font-medium text-violet-600">Products / {isEditing ? "Edit" : "Create"}</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{isEditing ? "Edit product" : "New product"}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/seller-dashboard/products/dashboard" className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
            <ArrowLeft className="size-4" /> Back
          </Link>
          {!isEditing && (
            <button
              type="button"
              onClick={saveDraft}
              className="h-11 rounded-xl border border-violet-300 bg-white px-5 text-sm font-semibold text-violet-700 shadow-sm transition hover:bg-violet-50"
            >
              Save draft
            </button>
          )}
          <button disabled={isSubmitting} type="submit" className="h-11 rounded-xl bg-[#6C4CD8] px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#5d3fc4] disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? (isEditing ? "Saving..." : "Creating...") : (isEditing ? "Save changes" : "Create product")}
          </button>
        </div>
      </div>

      {draftSaved && (
        <div role="status" className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <span className="min-w-0 flex-1">Product saved as a draft.</span>
          <Link href="/seller-dashboard/products/drafts" className="font-semibold underline underline-offset-2">View drafts</Link>
        </div>
      )}

      {formError && (
        <div role="alert" className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <span className="min-w-0 flex-1">{formError}</span>
          {requiresSubscription && (
            <Link
              href="/subscriptions"
              className="inline-flex h-9 shrink-0 items-center rounded-lg bg-red-700 px-4 font-semibold text-white transition hover:bg-red-800"
            >
              View subscription plans
            </Link>
          )}
        </div>
      )}

      {isEditing && listingError && (
        <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">Could not load this product. Check that it still exists and belongs to your store.</div>
      )}

      <div className="space-y-4">
        <Section title="Name & description" color="bg-emerald-200">
          <div className="space-y-5">
            <div>
              <FieldLabel>Product title</FieldLabel>
              <input {...register("title")} aria-invalid={Boolean(errors.title)} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100 aria-invalid:border-red-400 aria-invalid:ring-red-100" placeholder="Enter a clear product title" />
              <FieldError message={errors.title?.message} />
            </div>
            <div>
              <FieldLabel>Description</FieldLabel>
              <div className="overflow-hidden rounded-xl border border-slate-200 focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-100">
                <textarea {...register("description")} aria-invalid={Boolean(errors.description)} rows={6} className="block w-full resize-y bg-white p-4 text-base outline-none" placeholder="Describe what buyers will receive..." />
              </div>
              <FieldError message={errors.description?.message} />
            </div>
          </div>
        </Section>

        <Section title="Images" color="bg-sky-200">
          <FieldLabel>{isEditing ? "Add new product images (optional)" : "Cover images"}</FieldLabel>
          {isEditing && existingImages.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-slate-600">
                Current images — kept as they are. New images are added after
                these, and the first new one becomes the cover.
              </p>
              <div className="flex flex-wrap gap-3">
                {existingImages.map((image) => (
                  <figure
                    key={image.key}
                    className="relative size-24 overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <Image
                      src={image.uri}
                      alt=""
                      fill
                      sizes="96px"
                      quality={90}
                      className="object-cover"
                    />
                    {image.isCover && (
                      <figcaption className="absolute inset-x-0 bottom-0 bg-slate-900/70 py-0.5 text-center text-[10px] font-bold uppercase tracking-wide text-white">
                        Cover
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </div>
          )}
          <DropZone
            accept="image/*"
            multiple
            label="Click to add images"
            files={images}
            coverLabel={isEditing ? "New cover" : "Cover"}
            onFiles={(files) => setValue("images", [...images, ...files], { shouldDirty: true, shouldValidate: true })}
            onRemove={(index) => setValue("images", images.filter((_, i) => i !== index), { shouldDirty: true, shouldValidate: true })}
          />
          <FieldError message={errors.images?.message} />
        </Section>

        <Section title="Price" color="bg-emerald-200">
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <FieldLabel>Amount</FieldLabel>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-slate-500">$</span>
                <input {...register("price", { valueAsNumber: true })} aria-invalid={Boolean(errors.price)} min="0" step="0.01" type="number" className="h-12 w-full rounded-xl border border-slate-200 pl-9 pr-4 text-base outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 aria-invalid:border-red-400 aria-invalid:ring-red-100" placeholder="0.00" />
              </div>
              <FieldError message={errors.price?.message} />
            </div>
            <div>
              <FieldLabel>Discount price (optional)</FieldLabel>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-slate-500">$</span>
                <input
                  {...register("discountPrice", { setValueAs: (value) => value === "" ? undefined : Number(value) })}
                  aria-invalid={Boolean(errors.discountPrice)}
                  min="0"
                  step="0.01"
                  type="number"
                  className="h-12 w-full rounded-xl border border-slate-200 pl-9 pr-4 text-base outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 aria-invalid:border-red-400 aria-invalid:ring-red-100"
                  placeholder="0.00"
                />
              </div>
              <FieldError message={errors.discountPrice?.message} />
            </div>
            <div>
              <FieldLabel>Stock quantity</FieldLabel>
              <input
                {...register("stockQty", { valueAsNumber: true })}
                aria-invalid={Boolean(errors.stockQty)}
                min="0"
                step="1"
                type="number"
                inputMode="numeric"
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-base outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 aria-invalid:border-red-400 aria-invalid:ring-red-100"
                placeholder="0"
              />
              <FieldError message={errors.stockQty?.message} />
            </div>
          </div>
        </Section>

        <Section title="Category" color="bg-violet-200">
          <CategoryDropdown label="Category" placeholder={categoriesLoading ? "Loading categories..." : categoriesError ? "Could not load categories" : "Select category"} options={categoryOptions} value={categoryUuid} disabled={categoriesLoading || categoriesError} onChange={(uuid) => { setAttributeValues({}); setValue("categoryUuid", uuid, { shouldDirty: true, shouldValidate: true }) }} />
          <p className="mt-3 text-xs text-slate-500">Choose the most specific category so the correct product attributes can load.</p>
          <FieldError message={errors.categoryUuid?.message} />
        </Section>

        {attributeCategoryUuid && (attributesLoading || attributesError || categoryAttributes.length > 0) && (
          <Section title={`${attributeSchema?.categoryName || "Category"} attributes`} color="bg-fuchsia-200">
            {attributesLoading ? (
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500"><span className="size-4 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />Loading category attributes...</div>
            ) : attributesError ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"><span>The category service is taking too long to respond.</span><button type="button" onClick={() => refetchAttributes()} className="rounded-lg bg-amber-700 px-4 py-2 font-semibold text-white hover:bg-amber-800">Try again</button></div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {categoryAttributes.map((attribute) => (
                  <CategoryAttributeField key={attribute.uuid || attribute.code} attribute={attribute} value={attributeValues[attribute.code] ?? ""} onChange={(value) => setAttributeValues((current) => ({ ...current, [attribute.code]: value }))} />
                ))}
              </div>
            )}
          </Section>
        )}

        {isEditing && (
          <Section title="Product status" color="bg-amber-200">
            <FieldLabel>Availability</FieldLabel>
            <select
              {...register("status")}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            >
              <option value="DRAFT">Draft — visible only to you</option>
              <option value="ACTIVE">Active — available and visible to buyers</option>
              <option value="ARCHIVED">Inactive — unavailable and hidden from buyers</option>
            </select>
            <p className="mt-2 text-xs text-slate-500">
              Active products are available in the marketplace. Inactive products remain in your inventory but buyers cannot see or purchase them.
            </p>
          </Section>
        )}

      </div>
    </form>
  )
}
