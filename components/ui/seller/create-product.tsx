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
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Eye,
  EyeOff,
  ImagePlus,
  Info,
  Layers,
  Loader2,
  Minus,
  Package,
  Plus,
  Search,
  Sparkles,
  Star,
  Tag,
  Trash2,
  TrendingDown,
  Warehouse,
  X,
  Zap,
} from "lucide-react"
import { toast } from "sonner"
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
import { ListingGalleryManager } from "@/components/ui/seller/listing-gallery-manager"
import { NewListingImages, type PickedImage } from "@/components/ui/seller/new-listing-images"
import { useAppDispatch } from "@/lib/hooks"
import { sellerApi } from "@/lib/api/sellerApi"
import type { CategoryAttributeDefinition, SellerCategoryTree } from "@/lib/types/seller-product"
import { cn, getFileUrl } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ─── Schemas ────────────────────────────────────────────────────────────────
const productImageSchema = z
  .custom<File>(
    (value) => typeof File !== "undefined" && value instanceof File,
    "Please select a valid image file.",
  )
  .refine((file) => file.type.startsWith("image/"), "Only image files are allowed.")
  .refine((file) => file.size <= 8 * 1024 * 1024, "Each image must be 8 MB or smaller.")

const createProductSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters.")
      .max(120, "Title must not exceed 120 characters."),
    sku: z
      .string()
      .trim()
      .max(64, "SKU must not exceed 64 characters.")
      .optional(),
    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters.")
      .max(5000, "Description must not exceed 5,000 characters."),
    price: z
      .number({ error: "Enter a valid regular price." })
      .positive("Price must be greater than 0."),
    discountPrice: z
      .number({ error: "Enter a valid discount price." })
      .positive("Discount price must be greater than 0.")
      .optional(),
    stockQty: z
      .number({ error: "Enter a valid stock quantity." })
      .int("Must be a whole number.")
      .min(0, "Cannot be negative."),
    categoryUuid: z.string().min(1, "Please select a category."),
    status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
    isFeatured: z.boolean(),
    images: z.array(productImageSchema).max(8, "You can upload up to 8 images."),
  })
  .refine(
    (data) => data.discountPrice === undefined || data.discountPrice < data.price,
    {
      path: ["discountPrice"],
      message: "Discount price must be lower than the regular price.",
    },
  )

type CreateProductForm = z.infer<typeof createProductSchema>

type CustomSpec = {
  id: string
  key: string
  value: string
}

// ─── Tree Helpers ────────────────────────────────────────────────────────────
function categoryPath(tree: SellerCategoryTree[], uuid?: string | null): SellerCategoryTree[] {
  if (!uuid) return []
  for (const c of tree) {
    if (c.uuid === uuid) return [c]
    const p = categoryPath(c.children ?? [], uuid)
    if (p.length) return [c, ...p]
  }
  return []
}

function findCategoryBySummary(
  tree: SellerCategoryTree[],
  summary?: { slug?: string | null; name?: string | null } | null,
): SellerCategoryTree | undefined {
  const slug = summary?.slug?.trim().toLowerCase()
  const name = summary?.name?.trim().toLowerCase()
  if (!slug && !name) return undefined
  for (const c of tree) {
    if (slug && c.slug?.trim().toLowerCase() === slug) return c
    if (!slug && name && c.name.trim().toLowerCase() === name) return c
    const m = findCategoryBySummary(c.children ?? [], summary)
    if (m) return m
  }
  return undefined
}

function flattenCategoryTree(
  tree: SellerCategoryTree[],
  parents: string[] = [],
  depth = 0,
): (SellerCategoryTree & { depth: number; displayPath: string })[] {
  return tree.flatMap((c) => {
    const path = [...parents, c.name]
    return [
      { ...c, depth, displayPath: path.join(" › ") },
      ...flattenCategoryTree(c.children ?? [], path, depth + 1),
    ]
  })
}

// ─── Micro UI Primitives ─────────────────────────────────────────────────────
function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <div className="mt-2 flex items-center gap-1.5">
      <AlertCircle className="size-3.5 text-rose-500 shrink-0" />
      <p className="text-xs font-semibold text-rose-600">{message}</p>
    </div>
  )
}

function Label({
  children,
  required,
  htmlFor,
  hint,
}: {
  children: React.ReactNode
  required?: boolean
  htmlFor?: string
  hint?: string
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500"
    >
      {children}
      {required && <span className="text-rose-500">*</span>}
      {hint && (
        <span title={hint} className="ml-auto cursor-help">
          <Info className="size-3.5 text-slate-300 hover:text-slate-500 transition" />
        </span>
      )}
    </label>
  )
}

const INPUT_BASE =
  "w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-violet-400 focus:ring-3 focus:ring-violet-100"

const INPUT_ERROR =
  "border-rose-300 bg-rose-50/40 focus:border-rose-400 focus:ring-rose-100"

// ─── Section Card ────────────────────────────────────────────────────────────
function Card({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  )
}

function CardHeader({
  icon: Icon,
  label,
  title,
  badge,
}: {
  icon: React.ElementType
  label: string
  title: string
  badge?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-4 border-b border-slate-100 px-6 py-5">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <h2 className="text-base font-extrabold text-slate-900 leading-snug">{title}</h2>
      </div>
      {badge}
    </div>
  )
}

// ─── Category Attribute Fields ───────────────────────────────────────────────
function AttributeField({
  attribute,
  value,
  onChange,
}: {
  attribute: CategoryAttributeDefinition
  value: string
  onChange: (value: string) => void
}) {
  const id = `attr-${attribute.code}`
  const base = cn(INPUT_BASE, "h-11")

  const labelEl = (
    <Label htmlFor={id} required={attribute.required}>
      {attribute.label}
      {attribute.unit ? <span className="ml-1 text-slate-400 normal-case font-semibold">({attribute.unit})</span> : null}
    </Label>
  )

  if (attribute.dataType === "BOOLEAN") {
    return (
      <div>
        {labelEl}
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={base}>
          <option value="">Select…</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>
    )
  }

  if (attribute.dataType === "SELECT") {
    return (
      <div>
        {labelEl}
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={base}>
          <option value="">Select {attribute.label.toLowerCase()}…</option>
          {(attribute.options ?? []).map((o) => (
            <option key={o.uuid ?? o.value} value={o.value}>
              {o.label || o.value}
            </option>
          ))}
        </select>
      </div>
    )
  }

  if (attribute.dataType === "MULTI_SELECT") {
    const selected = new Set(value.split(",").filter(Boolean))
    return (
      <fieldset>
        <legend className="mb-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
          {attribute.label}
          {attribute.required && <span className="ml-1 text-rose-500">*</span>}
        </legend>
        <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50/40 p-3 min-h-11">
          {(attribute.options ?? []).map((o) => (
            <label
              key={o.uuid ?? o.value}
              className={cn(
                "cursor-pointer select-none rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                selected.has(o.value)
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-violet-300 hover:text-violet-700",
              )}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={selected.has(o.value)}
                onChange={(e) => {
                  const next = new Set(selected)
                  e.target.checked ? next.add(o.value) : next.delete(o.value)
                  onChange([...next].join(","))
                }}
              />
              {selected.has(o.value) && <Check className="inline mr-1 size-3" />}
              {o.label || o.value}
            </label>
          ))}
        </div>
      </fieldset>
    )
  }

  return (
    <div>
      {labelEl}
      <input
        id={id}
        type={attribute.dataType === "NUMBER" ? "number" : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${attribute.label.toLowerCase()}`}
        className={cn(base, "h-11")}
      />
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function CreateProduct({ editUuid = "" }: { editUuid?: string }) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const isEditing = Boolean(editUuid)

  const [formError, setFormError] = React.useState("")
  const [requiresSubscription, setRequiresSubscription] = React.useState(false)
  const [draftSaved, setDraftSaved] = React.useState(false)

  // Queries
  const { data: categoryTree = [], isLoading: categoriesLoading } = useGetSellerCategoryTreeQuery()
  const { data: listing, error: listingError } = useGetSellerListingQuery(editUuid, {
    skip: !isEditing,
  })

  // Mutations
  const [uploadProductFile] = useUploadProductFileMutation()
  const [createSellerListing, { isLoading: isCreating }] = useCreateSellerListingMutation()
  const [updateSellerListing, { isLoading: isUpdating }] = useUpdateSellerListingMutation()
  const [updateListingThumbnail] = useUpdateListingThumbnailMutation()
  const [addListingImage] = useAddListingImageMutation()
  const [removeListingDiscount] = useRemoveListingDiscountMutation()

  // Form
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    getValues,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<CreateProductForm>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      title: "",
      sku: "",
      description: "",
      price: undefined,
      discountPrice: undefined,
      stockQty: 10,
      categoryUuid: "",
      status: "ACTIVE",
      isFeatured: false,
      images: [],
    },
  })

  // Live-watched values
  const watchedTitle = useWatch({ control, name: "title" })
  const watchedPrice = useWatch({ control, name: "price" })
  const watchedDiscountPrice = useWatch({ control, name: "discountPrice" })
  const watchedStockQty = useWatch({ control, name: "stockQty" })
  const watchedCategoryUuid = useWatch({ control, name: "categoryUuid" })
  const watchedIsFeatured = useWatch({ control, name: "isFeatured" })
  const watchedStatus = useWatch({ control, name: "status" })

  // Gallery
  const [picked, setPicked] = React.useState<PickedImage[]>([])
  const [coverId, setCoverId] = React.useState("")

  // Dynamic attributes
  const [attrValues, setAttrValues] = React.useState<Record<string, string>>({})
  const [customSpecs, setCustomSpecs] = React.useState<CustomSpec[]>([])

  // Searchable category
  const [catSearch, setCatSearch] = React.useState("")
  const [catOpen, setCatOpen] = React.useState(false)
  const catDropRef = React.useRef<HTMLDivElement>(null)

  // Close category dropdown on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catDropRef.current && !catDropRef.current.contains(e.target as Node)) {
        setCatOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const flatCategories = React.useMemo(() => flattenCategoryTree(categoryTree), [categoryTree])
  const selectedCategory = flatCategories.find((c) => c.uuid === watchedCategoryUuid)
  const filteredCategories = React.useMemo(() => {
    if (!catSearch.trim()) return flatCategories
    const q = catSearch.toLowerCase()
    return flatCategories.filter((c) => c.displayPath.toLowerCase().includes(q))
  }, [flatCategories, catSearch])

  // Category attributes
  const {
    data: attributeSchema,
    isLoading: attrsLoading,
    isError: attrsError,
    refetch: refetchAttrs,
  } = useGetSellerCategoryAttributesQuery(watchedCategoryUuid, {
    skip: !watchedCategoryUuid,
  })

  const categoryAttributes = React.useMemo(() => {
    const grouped = attributeSchema?.groups?.flatMap((g) => g.attributes ?? []) ?? []
    const attrs = grouped.length ? grouped : (attributeSchema?.attributes ?? [])
    return [...attrs].sort(
      (a, b) =>
        (a.groupSortOrder ?? 0) - (b.groupSortOrder ?? 0) ||
        (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    )
  }, [attributeSchema])

  const isSubmitting = isCreating || isUpdating

  // Populate form on Edit
  React.useEffect(() => {
    if (!listing || !isEditing || categoryTree.length === 0) return
    const matched =
      categoryPath(categoryTree, listing.category?.uuid).at(-1) ??
      findCategoryBySummary(categoryTree, listing.category)

    reset({
      title: listing.title ?? "",
      sku: listing.sku ?? "",
      description: listing.description ?? "",
      price: Number(listing.fullPrice ?? listing.price ?? 0),
      discountPrice: listing.discountPrice == null ? undefined : Number(listing.discountPrice),
      stockQty: Number(listing.stockQty ?? 0),
      categoryUuid: listing.category?.uuid ?? matched?.uuid ?? "",
      status:
        listing.status === "DRAFT" || listing.status === "ARCHIVED" ? listing.status : "ACTIVE",
      isFeatured: Boolean(listing.isFeatured),
      images: [],
    })
  }, [categoryTree, isEditing, listing, reset])

  React.useEffect(() => {
    if (!isEditing || !listing || categoryAttributes.length === 0) return
    const vals: Record<string, string> = {}
    const extras: CustomSpec[] = []

    for (const attr of listing.listingAttributes ?? []) {
      const def = categoryAttributes.find((ca) => ca.code === attr.key || ca.label === attr.key)
      if (def) {
        vals[def.code] = attr.value ?? ""
      } else {
        extras.push({ id: crypto.randomUUID(), key: attr.key, value: attr.value })
      }
    }

    setAttrValues(vals)
    if (extras.length > 0 && customSpecs.length === 0) setCustomSpecs(extras)
  }, [categoryAttributes, isEditing, listing])

  // Discount percent helper
  const discountPct = React.useMemo(() => {
    if (watchedPrice > 0 && watchedDiscountPrice && watchedDiscountPrice < watchedPrice) {
      return Math.round(((watchedPrice - watchedDiscountPrice) / watchedPrice) * 100)
    }
    return null
  }, [watchedPrice, watchedDiscountPrice])

  // Preview thumbnail
  const previewThumb = React.useMemo(() => {
    if (picked.length > 0) {
      const c = picked.find((p) => p.id === coverId) || picked[0]
      return c?.previewUrl
    }
    if (!listing?.thumbnailUri) return null
    const uri =
      typeof listing.thumbnailUri === "string"
        ? listing.thumbnailUri
        : (listing.thumbnailUri as any)?.uri
    return uri ? getFileUrl(uri) : null
  }, [picked, coverId, listing])

  // Completeness tracking for progress bar
  const completeness = React.useMemo(() => {
    let score = 0
    const total = 5
    if (watchedTitle?.trim().length >= 3) score++
    if (watchedCategoryUuid) score++
    if (watchedPrice > 0) score++
    if (watchedStockQty >= 0) score++
    if (picked.length > 0 || isEditing) score++
    return Math.round((score / total) * 100)
  }, [watchedTitle, watchedCategoryUuid, watchedPrice, watchedStockQty, picked, isEditing])

  // Custom specs helpers
  const addSpec = () =>
    setCustomSpecs((prev) => [...prev, { id: crypto.randomUUID(), key: "", value: "" }])
  const updateSpec = (id: string, field: "key" | "value", text: string) =>
    setCustomSpecs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: text } : s)),
    )
  const removeSpec = (id: string) =>
    setCustomSpecs((prev) => prev.filter((s) => s.id !== id))

  // Save Draft
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
      imageNames: data.images.map((f) => f.name),
      updatedAt: new Date().toISOString(),
    })
    writeSellerDrafts(drafts)
    setDraftSaved(true)
    toast.success("Progress saved as a draft.")
  }

  // Submit
  const submitProduct = async (data: CreateProductForm) => {
    setFormError("")
    setRequiresSubscription(false)

    const missingAttr = categoryAttributes.find(
      (a) => a.required && !attrValues[a.code]?.trim(),
    )
    if (missingAttr) {
      setFormError(`"${missingAttr.label}" is required for this category.`)
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    if (!isEditing && data.images.length === 0) {
      setError("images", { type: "manual", message: "Upload at least one product photo." })
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    try {
      const uploadedImages = await Promise.all(
        data.images.map((file) => uploadProductFile(file).unwrap()),
      )
      const coverIdx = Math.max(picked.findIndex((p) => p.id === coverId), 0)
      const coverObjectName =
        uploadedImages[coverIdx]?.objectName ?? uploadedImages[0]?.objectName

      const predefined = categoryAttributes
        .map((a, i) => ({ key: a.code, value: attrValues[a.code]?.trim() ?? "", sortOrder: a.sortOrder ?? i }))
        .filter((a) => a.value)

      const extras = customSpecs
        .filter((s) => s.key.trim() && s.value.trim())
        .map((s, i) => ({ key: s.key.trim(), value: s.value.trim(), sortOrder: predefined.length + i }))

      const allAttributes = [...predefined, ...extras]

      if (isEditing) {
        await updateSellerListing({
          uuid: editUuid,
          body: {
            categoryUuid: data.categoryUuid,
            title: data.title,
            sku: data.sku !== undefined ? (data.sku.trim() === "" ? "" : data.sku.trim()) : undefined,
            description: data.description,
            fullPrice: data.price,
            ...(data.discountPrice !== undefined ? { discountPrice: data.discountPrice } : {}),
            stockQty: data.stockQty,
            status: data.status,
            listingAttributes: allAttributes,
          },
        }).unwrap()

        if (data.discountPrice === undefined && listing?.discountPrice != null) {
          await removeListingDiscount(editUuid).unwrap()
        }

        if (uploadedImages.length > 0) {
          await updateListingThumbnail({
            uuid: editUuid,
            objectName: uploadedImages[0].objectName,
          }).unwrap()
          await Promise.all(
            uploadedImages.map((img, i) =>
              addListingImage({
                uuid: editUuid,
                objectName: img.objectName,
                sortOrder: (listing?.images?.length ?? 0) + i,
              }).unwrap(),
            ),
          )
        }
      } else {
        const galleryImages = uploadedImages.map((img, i) => ({
          objectName: img.objectName,
          sortOrder: i,
        }))
        const created = await createSellerListing({
          categoryUuid: data.categoryUuid,
          title: data.title,
          sku: data.sku?.trim() ? data.sku.trim() : undefined,
          description: data.description,
          fullPrice: data.price,
          discountPrice: data.discountPrice,
          stockQty: data.stockQty,
          isFeatured: data.isFeatured,
          thumbnailObjectName: coverObjectName,
          images: galleryImages,
          listingAttributes: allAttributes,
        }).unwrap()

        if (created?.uuid) {
          const persisted = new Set((created.images ?? []).map((i) => i.objectName).filter(Boolean))
          for (const img of galleryImages.filter((i) => !persisted.has(i.objectName))) {
            await addListingImage({ uuid: created.uuid, objectName: img.objectName, sortOrder: img.sortOrder }).unwrap()
          }
        }
      }

      dispatch(sellerApi.util.invalidateTags(["SellerListings"]))
      toast.success(isEditing ? "Product updated!" : "Product published to marketplace!")
      router.push(`/seller-dashboard/products/dashboard?success=${isEditing ? "updated" : "created"}`)
      router.refresh()
    } catch (err: any) {
      const status = err?.status
      const msg = err?.data?.message || err?.message || ""
      if (status === 409) {
        if (msg.toLowerCase().includes("sku") || msg.toLowerCase().includes("barcode") || msg.toLowerCase().includes("code") || msg.toLowerCase().includes("already uses")) {
          setError("sku", { type: "manual", message: msg })
          setFormError(msg)
          return
        }
        setRequiresSubscription(true)
        setFormError(msg || "Listing quota reached. Archive an item or upgrade your plan.")
      } else if (status === 402) {
        setRequiresSubscription(true)
        setFormError(msg || "An active subscription is required to publish listings.")
      } else {
        setFormError(msg || `Unable to ${isEditing ? "update" : "create"} the product.`)
      }
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const showValidationError = (errs: FieldErrors<CreateProductForm>) => {
    const first = Object.values(errs).find((e) => e?.message)
    setFormError(
      typeof first?.message === "string" ? first.message : "Please fill in all required fields.",
    )
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      {/* ── Sticky Top Bar ── */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-5 py-3.5 sm:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 min-w-0">
            <Link
              href="/seller-dashboard/products/dashboard"
              className="flex items-center gap-1.5 text-slate-500 hover:text-violet-600 transition"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Inventory</span>
            </Link>
            <ChevronRight className="size-3.5 text-slate-300 shrink-0" />
            <span className="text-slate-900 font-extrabold truncate">
              {isEditing ? "Edit Product" : "New Listing"}
            </span>
          </div>

          {/* Completeness Bar (new only) */}
          {!isEditing && (
            <div className="hidden sm:flex flex-1 items-center gap-3 max-w-xs mx-auto">
              <div className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-700 transition-all duration-500"
                  style={{ width: `${completeness}%` }}
                />
              </div>
              <span className="text-[11px] font-black tabular-nums text-slate-400">
                {completeness}%
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="ml-auto flex items-center gap-2 shrink-0">
            {!isEditing && (
              <button
                type="button"
                onClick={saveDraft}
                className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 shadow-xs hover:border-violet-200 hover:text-violet-700 transition"
              >
                Save Draft
              </button>
            )}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(submitProduct, showValidationError)()}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-violet-600 px-5 text-xs font-extrabold text-white shadow-sm shadow-violet-200 hover:bg-violet-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Zap className="size-4" />
              )}
              {isSubmitting ? "Saving…" : isEditing ? "Save Changes" : "Publish Now"}
            </button>
          </div>
        </div>

        {/* Mobile Progress Bar */}
        {!isEditing && (
          <div className="h-0.5 bg-slate-100 sm:hidden">
            <div
              className="h-full bg-violet-600 transition-all duration-500"
              style={{ width: `${completeness}%` }}
            />
          </div>
        )}
      </div>

      {/* ── Page Body ── */}
      <form
        noValidate
        onSubmit={handleSubmit(submitProduct, showValidationError)}
        className="mx-auto max-w-[1600px] px-4 py-6 sm:px-8 sm:py-8"
      >
        {/* Alert banners */}
        {draftSaved && (
          <div className="mb-5 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-800 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" />
              Saved as draft — no progress lost.
            </div>
            <Link
              href="/seller-dashboard/products/drafts"
              className="shrink-0 text-xs font-black text-emerald-700 underline hover:text-emerald-900"
            >
              View Drafts →
            </Link>
          </div>
        )}

        {formError && (
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-extrabold text-rose-700">{formError}</p>
              </div>
            </div>
            {requiresSubscription && (
              <Link
                href="/subscriptions"
                className="shrink-0 inline-flex h-9 items-center rounded-xl bg-rose-600 px-4 text-xs font-extrabold text-white hover:bg-rose-700 transition"
              >
                Upgrade Plan →
              </Link>
            )}
          </div>
        )}

        {isEditing && listingError && (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700">
            Could not load this product. It may no longer exist or belong to another store.
          </div>
        )}

        {/* Main 2-col layout */}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px]">
          {/* ── LEFT: Form Sections ── */}
          <div className="min-w-0 space-y-5">
            {/* ① Basic Information */}
            <Card>
              <CardHeader icon={Package} label="Step 1" title="Product Information" />
              <div className="space-y-5 p-6">
                {/* Title */}
                <div>
                  <Label required hint="Write a clear, keyword-rich title (3–120 chars)">
                    Product Title
                  </Label>
                  <input
                    {...register("title")}
                    placeholder="e.g. Sony WH-1000XM5 Noise-Cancelling Headphones — Black"
                    className={cn(INPUT_BASE, "h-12 text-base", errors.title && INPUT_ERROR)}
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <FieldError message={errors.title?.message} />
                    <span
                      className={cn(
                        "ml-auto text-[11px] font-semibold tabular-nums",
                        (watchedTitle?.length || 0) > 100
                          ? "text-rose-500"
                          : "text-slate-300",
                      )}
                    >
                      {watchedTitle?.length || 0}/120
                    </span>
                  </div>
                </div>

                {/* SKU / Barcode */}
                <div>
                  <Label hint="Stock Keeping Unit / Barcode for hardware scanner lookups (max 64 chars)">
                    SKU / Barcode (Optional)
                  </Label>
                  <input
                    {...register("sku")}
                    placeholder="e.g., SONY-WH1000XM5-BLK or 8806091234567"
                    className={cn(INPUT_BASE, "h-12 font-mono text-sm", errors.sku && INPUT_ERROR)}
                  />
                  <FieldError message={errors.sku?.message} />
                </div>

                {/* Description */}
                <div>
                  <Label required hint="Describe specs, condition, box contents, and highlights">
                    Full Description
                  </Label>
                  <textarea
                    {...register("description")}
                    rows={7}
                    placeholder="Include key features, specifications, box contents, warranty, and anything a buyer needs to make a confident purchase decision…"
                    className={cn(
                      INPUT_BASE,
                      "py-3.5 leading-relaxed resize-y",
                      errors.description && INPUT_ERROR,
                    )}
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <FieldError message={errors.description?.message} />
                    <span className="ml-auto text-[11px] font-semibold text-slate-300 tabular-nums">
                      {useWatch({ control, name: "description" })?.length || 0}/5000
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* ② Images */}
            <Card>
              <CardHeader
                icon={ImagePlus}
                label="Step 2"
                title="Photos & Gallery"
                badge={
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-500">
                    Max 8 images
                  </span>
                }
              />
              <div className="p-6">
                {isEditing ? (
                  <ListingGalleryManager listing={listing} listingUuid={editUuid} />
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500 font-medium">
                      Upload up to 8 high-resolution photos. Drag to reorder — the starred photo becomes your cover image visible to buyers.
                    </p>
                    <NewListingImages
                      images={picked}
                      coverId={coverId}
                      max={8}
                      onChange={(next, nextCoverId) => {
                        setPicked(next)
                        setCoverId(nextCoverId)
                        setValue("images", next.map((p) => p.file), {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }}
                    />
                    <FieldError message={errors.images?.message} />
                  </div>
                )}
              </div>
            </Card>

            {/* ③ Pricing & Inventory */}
            <Card>
              <CardHeader icon={Banknote} label="Step 3" title="Pricing & Inventory" />
              <div className="p-6">
                <div className="grid gap-5 sm:grid-cols-3">
                  {/* Regular Price */}
                  <div>
                    <Label required>Regular Price (USD)</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-black text-slate-400">
                        $
                      </span>
                      <input
                        {...register("price", { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className={cn(
                          INPUT_BASE,
                          "h-12 pl-8 font-black text-base tabular-nums",
                          errors.price && INPUT_ERROR,
                        )}
                      />
                    </div>
                    <FieldError message={errors.price?.message} />
                  </div>

                  {/* Discount Price */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Sale Price (Optional)</Label>
                      {discountPct !== null && (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 flex items-center gap-1">
                          <TrendingDown className="size-3" />
                          {discountPct}% OFF
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-black text-slate-400">
                        $
                      </span>
                      <input
                        {...register("discountPrice", {
                          setValueAs: (v) => (v === "" || isNaN(Number(v)) ? undefined : Number(v)),
                        })}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className={cn(
                          INPUT_BASE,
                          "h-12 pl-8 font-black text-base tabular-nums",
                          errors.discountPrice && INPUT_ERROR,
                        )}
                      />
                    </div>
                    <FieldError message={errors.discountPrice?.message} />
                  </div>

                  {/* Stock */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label required hint="Total units available to sell">
                        Stock Units
                      </Label>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-black",
                          watchedStockQty > 4
                            ? "bg-emerald-100 text-emerald-800"
                            : watchedStockQty > 0
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800",
                        )}
                      >
                        {watchedStockQty > 4
                          ? `${watchedStockQty} In Stock`
                          : watchedStockQty > 0
                          ? `Low Stock (${watchedStockQty})`
                          : "Out of Stock"}
                      </span>
                    </div>

                    {/* Number input with stepper buttons */}
                    <div className="flex items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-xs focus-within:border-[#6C4CD8] focus-within:ring-2 focus-within:ring-[#6C4CD8]/20">
                      <button
                        type="button"
                        onClick={() => {
                          const current = Number(getValues("stockQty") || 0)
                          setValue("stockQty", Math.max(0, current - 1), {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }}
                        className="grid size-10 place-items-center rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 transition"
                      >
                        <Minus className="size-4" />
                      </button>

                      <input
                        {...register("stockQty", { valueAsNumber: true })}
                        type="number"
                        step="1"
                        min="0"
                        placeholder="10"
                        className="w-full text-center font-black text-base tabular-nums outline-none"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          const current = Number(getValues("stockQty") || 0)
                          setValue("stockQty", current + 1, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }}
                        className="grid size-10 place-items-center rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 transition"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                    <FieldError message={errors.stockQty?.message} />

                    {/* Quick Add Presets */}
                    <div className="flex items-center gap-1 pt-1">
                      <span className="text-[10px] font-bold text-slate-400">Quick Add:</span>
                      {[5, 10, 25, 50, 100].map((addAmount) => (
                        <button
                          key={addAmount}
                          type="button"
                          onClick={() => {
                            const current = Number(getValues("stockQty") || 0)
                            setValue("stockQty", current + addAmount, {
                              shouldDirty: true,
                              shouldValidate: true,
                            })
                            toast.success(`Added +${addAmount} units (Total: ${current + addAmount})`)
                          }}
                          className="rounded-lg bg-purple-50 px-2 py-0.5 text-[10px] font-extrabold text-[#6C4CD8] hover:bg-[#6C4CD8] hover:text-white transition"
                        >
                          +{addAmount}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price visual summary */}
                {watchedPrice > 0 && (
                  <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-slate-900 tabular-nums">
                        ${(watchedDiscountPrice || watchedPrice).toFixed(2)}
                      </span>
                      {watchedDiscountPrice && watchedDiscountPrice < watchedPrice && (
                        <span className="text-sm font-semibold text-slate-400 line-through tabular-nums">
                          ${watchedPrice.toFixed(2)}
                        </span>
                      )}
                      {discountPct !== null && (
                        <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-black text-white">
                          -{discountPct}%
                        </span>
                      )}
                    </div>
                    <span className="ml-auto text-xs font-bold text-slate-400">
                      {watchedStockQty > 0 ? (
                        <span className="text-emerald-600">{watchedStockQty} units in stock</span>
                      ) : (
                        <span className="text-rose-600">Out of stock</span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* ④ Category + Dynamic Attributes */}
            <Card>
              <CardHeader icon={Layers} label="Step 4" title="Category & Specifications" />
              <div className="p-6 space-y-5">
                {/* Category Search Dropdown */}
                <div>
                  <Label required>Product Category</Label>
                  <div ref={catDropRef} className="relative">
                    <button
                      type="button"
                      disabled={categoriesLoading}
                      onClick={() => setCatOpen((o) => !o)}
                      className={cn(
                        "flex h-12 w-full items-center rounded-xl border border-slate-200 bg-white px-4 text-left text-sm font-bold text-slate-900 outline-none transition hover:bg-slate-50 focus:border-violet-400 focus:ring-3 focus:ring-violet-100",
                        catOpen && "border-violet-400 ring-3 ring-violet-100",
                        errors.categoryUuid && "border-rose-300 ring-3 ring-rose-100",
                      )}
                    >
                      <span className="flex-1 truncate text-sm">
                        {categoriesLoading ? (
                          <span className="text-slate-400">Loading categories…</span>
                        ) : selectedCategory ? (
                          selectedCategory.displayPath
                        ) : (
                          <span className="text-slate-300">Select a category…</span>
                        )}
                      </span>
                      <ChevronDown
                        className={cn(
                          "ml-2 size-4 shrink-0 text-slate-400 transition-transform",
                          catOpen && "rotate-180",
                        )}
                      />
                    </button>

                    {catOpen && (
                      <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-40 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in fade-in-0 slide-in-from-top-1 duration-150">
                        {/* Search Input */}
                        <div className="border-b border-slate-100 p-3">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                            <input
                              type="search"
                              autoFocus
                              value={catSearch}
                              onChange={(e) => setCatSearch(e.target.value)}
                              placeholder="Search categories…"
                              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-medium outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                            />
                          </div>
                        </div>

                        {/* List */}
                        <div className="max-h-60 overflow-y-auto py-1">
                          {filteredCategories.length === 0 ? (
                            <p className="px-4 py-3 text-xs text-slate-400">No categories found</p>
                          ) : (
                            filteredCategories.map((cat) => (
                              <button
                                key={cat.uuid}
                                type="button"
                                onClick={() => {
                                  setAttrValues({})
                                  setValue("categoryUuid", cat.uuid, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  })
                                  setCatOpen(false)
                                  setCatSearch("")
                                }}
                                className={cn(
                                  "flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-bold transition hover:bg-violet-50",
                                  cat.uuid === watchedCategoryUuid
                                    ? "bg-violet-50 text-violet-700"
                                    : "text-slate-700",
                                  cat.depth > 0 && "pl-6",
                                  cat.depth > 1 && "pl-10",
                                )}
                                style={{ paddingLeft: `${16 + cat.depth * 16}px` }}
                              >
                                {cat.depth > 0 && (
                                  <span className="text-slate-300 font-normal">└</span>
                                )}
                                <span className="flex-1 truncate">{cat.name}</span>
                                {cat.uuid === watchedCategoryUuid && (
                                  <Check className="size-4 text-violet-600 shrink-0" />
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <FieldError message={errors.categoryUuid?.message} />
                </div>

                {/* Dynamic Schema Fields */}
                {watchedCategoryUuid && (
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-4">
                    <p className="text-[11px] font-black uppercase tracking-widest text-violet-600">
                      {attrsLoading ? "Loading attributes…" : `${attributeSchema?.categoryName || "Category"} Specifications`}
                    </p>

                    {attrsLoading ? (
                      <div className="flex items-center gap-2.5 text-xs text-slate-400 py-2">
                        <Loader2 className="size-4 animate-spin text-violet-500" />
                        Fetching fields for this category…
                      </div>
                    ) : attrsError ? (
                      <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-800">
                        <span>Failed to load attributes.</span>
                        <button type="button" onClick={() => refetchAttrs()} className="underline">
                          Retry
                        </button>
                      </div>
                    ) : categoryAttributes.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">
                        No extra attributes required for this category.
                      </p>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {categoryAttributes.map((attr) => (
                          <AttributeField
                            key={attr.uuid || attr.code}
                            attribute={attr}
                            value={attrValues[attr.code] ?? ""}
                            onChange={(v) =>
                              setAttrValues((prev) => ({ ...prev, [attr.code]: v }))
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* ⑤ Custom Specs */}
            <Card>
              <CardHeader
                icon={Tag}
                label="Step 5 — Optional"
                title="Custom Specifications"
                badge={
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-400">
                    Optional
                  </span>
                }
              />
              <div className="p-6 space-y-3">
                <p className="text-xs text-slate-500 font-medium">
                  Add extra specs like Brand, Warranty, Material, Dimensions, Model Number, Condition, etc.
                </p>

                {customSpecs.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-6 text-center text-xs text-slate-400 font-medium">
                    No custom specifications yet. Click below to add one.
                  </div>
                )}

                <div className="space-y-2.5">
                  {customSpecs.map((spec, i) => (
                    <div key={spec.id} className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-[11px] font-black text-violet-600">
                        {i + 1}
                      </div>
                      <input
                        type="text"
                        value={spec.key}
                        onChange={(e) => updateSpec(spec.id, "key", e.target.value)}
                        placeholder="Label (e.g. Warranty)"
                        className="w-1/3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      />
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => updateSpec(spec.id, "value", e.target.value)}
                        placeholder="Value (e.g. 1 Year Official)"
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpec(spec.id)}
                        className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addSpec}
                  className="mt-1 flex items-center gap-2 rounded-xl border border-dashed border-violet-300 px-4 py-2.5 text-xs font-extrabold text-violet-600 transition hover:bg-violet-50 hover:border-violet-400"
                >
                  <Plus className="size-4" /> Add Specification Row
                </button>
              </div>
            </Card>

            {/* ⑥ Visibility & Promotion */}
            <Card>
              <CardHeader icon={Sparkles} label="Step 6" title="Visibility & Promotion" />
              <div className="p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Status */}
                  <div>
                    <Label>Listing Status</Label>
                    <select
                      {...register("status")}
                      className={cn(INPUT_BASE, "h-12")}
                    >
                      <option value="ACTIVE">Active — Visible on Marketplace</option>
                      <option value="DRAFT">Draft — Saved Privately</option>
                      <option value="ARCHIVED">Archived — Inactive & Hidden</option>
                    </select>
                    <p className="mt-2 text-[11px] text-slate-400 font-medium">
                      {watchedStatus === "ACTIVE"
                        ? "Buyers can find and purchase this product immediately."
                        : watchedStatus === "DRAFT"
                        ? "Only you can see this listing. Publish it when ready."
                        : "Listing is hidden from buyers but kept in your inventory."}
                    </p>
                  </div>

                  {/* Featured Toggle */}
                  <div>
                    <Label hint="Featured products get premium placement on the homepage">
                      Featured Spotlight
                    </Label>
                    <label
                      className={cn(
                        "flex h-12 cursor-pointer items-center justify-between rounded-xl border px-4 transition hover:bg-slate-50",
                        watchedIsFeatured
                          ? "border-amber-300 bg-amber-50/50"
                          : "border-slate-200 bg-white",
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Star
                          className={cn(
                            "size-4 transition",
                            watchedIsFeatured
                              ? "text-amber-500 fill-amber-400"
                              : "text-slate-300",
                          )}
                        />
                        <span
                          className={cn(
                            "text-sm font-bold",
                            watchedIsFeatured ? "text-amber-700" : "text-slate-600",
                          )}
                        >
                          {watchedIsFeatured ? "Featured on Homepage" : "Mark as Featured"}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        {...register("isFeatured")}
                        className="size-4.5 accent-amber-500 rounded"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* ── RIGHT: Sticky Preview Panel ── */}
          <aside className="space-y-4 lg:sticky lg:top-20 self-start">
            {/* Live Preview Card */}
            <Card>
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Eye className="size-4 text-violet-600" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-600">
                    Live Preview
                  </span>
                </div>
                <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[10px] font-black text-violet-600">
                  Real-time
                </span>
              </div>

              {/* Product Listing Card Mockup */}
              <div className="p-4">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  {/* Image */}
                  <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
                    {previewThumb ? (
                      <Image
                        src={previewThumb}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-300">
                        <Package className="size-12" />
                        <span className="text-[10px] font-bold">No photo yet</span>
                      </div>
                    )}

                    {/* Badges over image */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {watchedIsFeatured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-slate-900 shadow-sm">
                          <Star className="size-2.5 fill-slate-900" /> Featured
                        </span>
                      )}
                      {watchedStatus === "DRAFT" && (
                        <span className="rounded-full bg-slate-700/80 px-2 py-0.5 text-[10px] font-black text-white backdrop-blur-sm">
                          Draft
                        </span>
                      )}
                      {watchedStatus === "ARCHIVED" && (
                        <span className="rounded-full bg-slate-400/80 px-2 py-0.5 text-[10px] font-black text-white backdrop-blur-sm">
                          Archived
                        </span>
                      )}
                    </div>

                    {discountPct !== null && (
                      <span className="absolute top-3 right-3 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-black text-white shadow-sm">
                        -{discountPct}%
                      </span>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-2.5">
                    {selectedCategory && (
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-violet-600">
                        {selectedCategory.name}
                      </span>
                    )}

                    <h3 className="text-sm font-extrabold text-slate-950 leading-snug line-clamp-2 min-h-[2.5rem]">
                      {watchedTitle?.trim() || (
                        <span className="text-slate-300 font-medium">
                          Your product title will appear here…
                        </span>
                      )}
                    </h3>

                    {/* Fake Stars */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="ml-1 text-[10px] font-bold text-slate-400">
                        New listing
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 pt-0.5">
                      {watchedPrice > 0 ? (
                        <>
                          <span className="text-lg font-black text-slate-950 tabular-nums">
                            ${(watchedDiscountPrice && watchedDiscountPrice < watchedPrice ? watchedDiscountPrice : watchedPrice).toFixed(2)}
                          </span>
                          {watchedDiscountPrice && watchedDiscountPrice < watchedPrice && (
                            <span className="text-xs font-semibold text-slate-400 line-through tabular-nums">
                              ${watchedPrice.toFixed(2)}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-base font-black text-slate-300">$0.00</span>
                      )}
                    </div>

                    {/* Stock + Status bar */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] font-bold">
                      <span
                        className={cn(
                          watchedStockQty > 0 ? "text-emerald-600" : "text-rose-500",
                        )}
                      >
                        {watchedStockQty > 0 ? `${watchedStockQty} in stock` : "Out of stock"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Completeness Checklist */}
            {!isEditing && (
              <Card>
                <div className="px-5 py-4 space-y-3">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                    Listing Readiness
                  </p>
                  <div className="space-y-2">
                    {[
                      { label: "Product title (3+ chars)", done: (watchedTitle?.trim().length || 0) >= 3 },
                      { label: "Category selected", done: Boolean(watchedCategoryUuid) },
                      { label: "Price set", done: watchedPrice > 0 },
                      { label: "Stock quantity", done: watchedStockQty >= 0 },
                      { label: "At least 1 photo", done: picked.length > 0 },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2.5">
                        <div
                          className={cn(
                            "grid size-5 shrink-0 place-items-center rounded-full transition-all",
                            item.done
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-slate-100 text-slate-300",
                          )}
                        >
                          <Check className="size-3" strokeWidth={3} />
                        </div>
                        <span
                          className={cn(
                            "text-xs font-semibold",
                            item.done ? "text-slate-700" : "text-slate-400",
                          )}
                        >
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-black text-slate-400">Overall Progress</span>
                      <span className="text-[11px] font-black tabular-nums text-violet-600">
                        {completeness}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          completeness === 100 ? "bg-emerald-500" : "bg-violet-600",
                        )}
                        style={{ width: `${completeness}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Publish CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-2xl bg-violet-600 text-sm font-extrabold text-white shadow-md shadow-violet-200/60 transition hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4.5 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Zap className="size-4.5" />
                  {isEditing ? "Save Changes" : "Publish to Marketplace"}
                </>
              )}
            </button>

            {!isEditing && (
              <button
                type="button"
                onClick={saveDraft}
                className="w-full h-10 rounded-2xl border border-slate-200 bg-white text-xs font-extrabold text-slate-600 transition hover:border-violet-300 hover:text-violet-700"
              >
                Save as Draft
              </button>
            )}
          </aside>
        </div>
      </form>
    </div>
  )
}
