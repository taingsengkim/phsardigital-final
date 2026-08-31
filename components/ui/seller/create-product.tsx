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
  Barcode,
  Check,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Eye,
  ImagePlus,
  Info,
  Layers,
  Loader2,
  Minus,
  Package,
  Plus,
  Search,
  Star,
  Tag,
  Trash2,
  TrendingDown,
  X,
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
    costPrice: z
      .number({ error: "Enter a valid cost price." })
      .min(0, "Cost price must be 0 or greater.")
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

// ─── Clean UI Primitives ─────────────────────────────────────────────────────
function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <div className="mt-1.5 flex items-center gap-1.5">
      <AlertCircle className="size-3.5 text-rose-500 shrink-0" />
      <p className="text-xs text-rose-600">{message}</p>
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
      className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-700"
    >
      <span>{children}</span>
      {required && <span className="text-rose-500">*</span>}
      {hint && (
        <span title={hint} className="ml-auto text-slate-400 hover:text-slate-600 cursor-help">
          <Info className="size-3.5" />
        </span>
      )}
    </label>
  )
}

const INPUT_BASE =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-400"

const INPUT_ERROR =
  "border-rose-300 bg-rose-50/30 focus:border-rose-400 focus:ring-rose-200"

// ─── Section Card ────────────────────────────────────────────────────────────
function Card({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("rounded-xl border border-slate-200/90 bg-white shadow-xs", className)}>
      {children}
    </div>
  )
}

function CardHeader({
  title,
  description,
  badge,
}: {
  title: string
  description?: string
  badge?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
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
  const base = cn(INPUT_BASE, "h-10 text-sm")

  const labelEl = (
    <Label htmlFor={id} required={attribute.required}>
      {attribute.label}
      {attribute.unit ? <span className="ml-1 text-slate-400">({attribute.unit})</span> : null}
    </Label>
  )

  if (attribute.dataType === "BOOLEAN") {
    return (
      <div>
        {labelEl}
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={base}>
          <option value="">Select option</option>
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
          <option value="">Select {attribute.label.toLowerCase()}</option>
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
        <legend className="mb-1.5 text-xs font-medium text-slate-700">
          {attribute.label}
          {attribute.required && <span className="ml-1 text-rose-500">*</span>}
        </legend>
        <div className="flex flex-wrap gap-1.5 rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 min-h-10">
          {(attribute.options ?? []).map((o) => (
            <label
              key={o.uuid ?? o.value}
              className={cn(
                "cursor-pointer select-none rounded-md px-2.5 py-1 text-xs font-medium transition",
                selected.has(o.value)
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300",
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
        className={base}
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
    formState: { errors },
  } = useForm<CreateProductForm>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      title: "",
      sku: "",
      costPrice: undefined,
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
  const watchedCostPrice = useWatch({ control, name: "costPrice" })
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
      costPrice: listing.costPrice != null ? Number(listing.costPrice) : undefined,
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
    toast.success("Draft saved successfully.")
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
      setError("images", { type: "manual", message: "Please upload at least one product image." })
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
            costPrice:
              data.costPrice !== undefined
                ? isNaN(Number(data.costPrice))
                  ? null
                  : Number(data.costPrice)
                : undefined,
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
          costPrice:
            data.costPrice !== undefined && !isNaN(Number(data.costPrice))
              ? Number(data.costPrice)
              : undefined,
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
      toast.success(isEditing ? "Product updated." : "Product published.")
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
        setFormError(msg || "Listing quota reached. Upgrade your plan or archive an item.")
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
      typeof first?.message === "string" ? first.message : "Please complete all required fields.",
    )
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Margin Calculations
  const activeSellingPrice = (watchedDiscountPrice && watchedDiscountPrice > 0 ? watchedDiscountPrice : watchedPrice) || 0
  const hasCostPrice = watchedCostPrice !== undefined && watchedCostPrice !== null && !isNaN(Number(watchedCostPrice)) && Number(watchedCostPrice) >= 0
  const costPriceNum = hasCostPrice ? Number(watchedCostPrice) : null
  const profitPerUnit = costPriceNum !== null && activeSellingPrice > 0 ? activeSellingPrice - costPriceNum : null
  const marginPercent = profitPerUnit !== null && activeSellingPrice > 0 ? (profitPerUnit / activeSellingPrice) * 100 : null

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* ── Top Header ── */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link
              href="/seller-dashboard/products/dashboard"
              className="flex items-center gap-1 hover:text-slate-900 transition"
            >
              <ArrowLeft className="size-4" />
              <span>Inventory</span>
            </Link>
            <ChevronRight className="size-3.5 text-slate-400" />
            <span className="font-medium text-slate-900">
              {isEditing ? "Edit Product" : "New Listing"}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                type="button"
                onClick={saveDraft}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Save draft
              </button>
            )}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(submitProduct, showValidationError)()}
              className="h-9 rounded-lg bg-slate-900 px-4 text-xs font-medium text-white hover:bg-slate-800 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="size-3.5 animate-spin" /> Saving...
                </span>
              ) : isEditing ? (
                "Save changes"
              ) : (
                "Publish product"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Form Body ── */}
      <form
        noValidate
        onSubmit={handleSubmit(submitProduct, showValidationError)}
        className="mx-auto max-w-7xl px-4 py-6 sm:px-6"
      >
        {/* Banner Messages */}
        {draftSaved && (
          <div className="mb-5 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-800">
            <span>Draft saved. Your work is kept in drafts.</span>
            <Link
              href="/seller-dashboard/products/drafts"
              className="font-medium underline hover:text-emerald-950"
            >
              View drafts
            </Link>
          </div>
        )}

        {formError && (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
            {requiresSubscription && (
              <Link
                href="/subscriptions"
                className="font-medium underline text-rose-900 shrink-0"
              >
                Upgrade plan
              </Link>
            )}
          </div>
        )}

        {/* 2-Column Layout */}
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Left Column: Form Fields */}
          <div className="space-y-6">
            {/* 1. Basic Information */}
            <Card>
              <CardHeader title="Product Details" description="Title, shop barcode, and description" />
              <div className="p-6 space-y-4">
                <div>
                  <Label required hint="Give your product a clear, descriptive title">
                    Product Title
                  </Label>
                  <input
                    {...register("title")}
                    placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                    className={cn(INPUT_BASE, "h-10", errors.title && INPUT_ERROR)}
                  />
                  <div className="mt-1 flex items-center justify-between">
                    <FieldError message={errors.title?.message} />
                    <span className="ml-auto text-[11px] text-slate-400">
                      {watchedTitle?.length || 0}/120
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label hint="Optional internal shop code or barcode for fast POS scanning">
                      SKU / Shop Code (Optional)
                    </Label>
                    <input
                      {...register("sku")}
                      placeholder="e.g. TS-001 or 880609123456"
                      className={cn(INPUT_BASE, "h-10 font-mono text-xs", errors.sku && INPUT_ERROR)}
                    />
                    <FieldError message={errors.sku?.message} />
                  </div>

                  <div>
                    <Label required>Category</Label>
                    <div ref={catDropRef} className="relative">
                      <button
                        type="button"
                        disabled={categoriesLoading}
                        onClick={() => setCatOpen((o) => !o)}
                        className={cn(
                          "flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-left text-sm text-slate-900 outline-none transition hover:bg-slate-50",
                          catOpen && "border-slate-400 ring-1 ring-slate-400",
                          errors.categoryUuid && "border-rose-300",
                        )}
                      >
                        <span className="truncate">
                          {categoriesLoading ? (
                            <span className="text-slate-400">Loading categories...</span>
                          ) : selectedCategory ? (
                            selectedCategory.displayPath
                          ) : (
                            <span className="text-slate-400">Select category</span>
                          )}
                        </span>
                        <ChevronDown className={cn("size-4 text-slate-400 transition", catOpen && "rotate-180")} />
                      </button>

                      {catOpen && (
                        <div className="absolute top-full left-0 right-0 z-40 mt-1 max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                          <div className="p-2 border-b border-slate-100">
                            <input
                              type="search"
                              autoFocus
                              value={catSearch}
                              onChange={(e) => setCatSearch(e.target.value)}
                              placeholder="Search categories..."
                              className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 text-xs outline-none focus:border-slate-400"
                            />
                          </div>
                          <div className="py-1">
                            {filteredCategories.map((cat) => (
                              <button
                                key={cat.uuid}
                                type="button"
                                onClick={() => {
                                  setAttrValues({})
                                  setValue("categoryUuid", cat.uuid, { shouldValidate: true })
                                  setCatOpen(false)
                                  setCatSearch("")
                                }}
                                className={cn(
                                  "flex w-full items-center justify-between px-3 py-2 text-left text-xs transition hover:bg-slate-50",
                                  cat.uuid === watchedCategoryUuid ? "bg-slate-50 font-medium text-slate-900" : "text-slate-600",
                                )}
                                style={{ paddingLeft: `${12 + cat.depth * 12}px` }}
                              >
                                <span>{cat.name}</span>
                                {cat.uuid === watchedCategoryUuid && <Check className="size-3.5 text-slate-900" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <FieldError message={errors.categoryUuid?.message} />
                  </div>
                </div>

                <div>
                  <Label required hint="Detailed specs, what is in the box, and warranty">
                    Description
                  </Label>
                  <textarea
                    {...register("description")}
                    rows={5}
                    placeholder="Provide details about condition, specifications, and warranty..."
                    className={cn(INPUT_BASE, "py-2.5 resize-y text-sm", errors.description && INPUT_ERROR)}
                  />
                  <FieldError message={errors.description?.message} />
                </div>
              </div>
            </Card>

            {/* 2. Photos */}
            <Card>
              <CardHeader title="Product Images" description="Upload up to 8 high-resolution photos" />
              <div className="p-6">
                {isEditing ? (
                  <ListingGalleryManager listing={listing} listingUuid={editUuid} />
                ) : (
                  <div className="space-y-3">
                    <NewListingImages
                      images={picked}
                      coverId={coverId}
                      max={8}
                      onChange={(next, nextCoverId) => {
                        setPicked(next)
                        setCoverId(nextCoverId)
                        setValue("images", next.map((p) => p.file), { shouldValidate: true })
                      }}
                    />
                    <FieldError message={errors.images?.message} />
                  </div>
                )}
              </div>
            </Card>

            {/* 3. Pricing & Inventory */}
            <Card>
              <CardHeader title="Pricing & Stock" description="Cost, regular price, sale price, and inventory count" />
              <div className="p-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Cost Price */}
                  <div>
                    <Label hint="What your shop paid per unit. Private to you and never visible to buyers.">
                      Cost Price (USD)
                    </Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
                      <input
                        {...register("costPrice", {
                          setValueAs: (v) => (v === "" || isNaN(Number(v)) ? undefined : Number(v)),
                        })}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className={cn(INPUT_BASE, "h-10 pl-7 text-sm tabular-nums", errors.costPrice && INPUT_ERROR)}
                      />
                    </div>
                    <FieldError message={errors.costPrice?.message} />
                  </div>

                  {/* Regular Price */}
                  <div>
                    <Label required>Regular Price (USD)</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
                      <input
                        {...register("price", { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className={cn(INPUT_BASE, "h-10 pl-7 text-sm font-medium tabular-nums", errors.price && INPUT_ERROR)}
                      />
                    </div>
                    <FieldError message={errors.price?.message} />
                  </div>

                  {/* Discount Price */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label>Sale Price (Optional)</Label>
                      {discountPct !== null && (
                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 rounded px-1.5 py-0.5">
                          {discountPct}% off
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
                      <input
                        {...register("discountPrice", {
                          setValueAs: (v) => (v === "" || isNaN(Number(v)) ? undefined : Number(v)),
                        })}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className={cn(INPUT_BASE, "h-10 pl-7 text-sm tabular-nums", errors.discountPrice && INPUT_ERROR)}
                      />
                    </div>
                    <FieldError message={errors.discountPrice?.message} />
                  </div>

                  {/* Stock Units */}
                  <div>
                    <Label required>Stock Units</Label>
                    <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          const current = Number(getValues("stockQty") || 0)
                          setValue("stockQty", Math.max(0, current - 1), { shouldValidate: true })
                        }}
                        className="grid size-8 place-items-center rounded text-slate-500 hover:bg-slate-100"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <input
                        {...register("stockQty", { valueAsNumber: true })}
                        type="number"
                        min="0"
                        step="1"
                        className="w-full text-center text-sm font-medium tabular-nums outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const current = Number(getValues("stockQty") || 0)
                          setValue("stockQty", current + 1, { shouldValidate: true })
                        }}
                        className="grid size-8 place-items-center rounded text-slate-500 hover:bg-slate-100"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <FieldError message={errors.stockQty?.message} />
                  </div>
                </div>

                {/* Quick Add Presets */}
                <div className="flex items-center gap-1 text-xs text-slate-500 pt-1">
                  <span>Quick stock add:</span>
                  {[5, 10, 25, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        const current = Number(getValues("stockQty") || 0)
                        setValue("stockQty", current + amt, { shouldValidate: true })
                      }}
                      className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-700 hover:bg-slate-100 transition"
                    >
                      +{amt}
                    </button>
                  ))}
                </div>

                {/* Live Margin & Profit Banner */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600">
                      Selling Price: <strong className="font-medium text-slate-900">${activeSellingPrice.toFixed(2)}</strong>
                    </span>

                    {hasCostPrice ? (
                      profitPerUnit !== null && profitPerUnit < 0 ? (
                        <span className="rounded bg-amber-100 px-2 py-0.5 font-medium text-amber-900">
                          Selling below cost (-${Math.abs(profitPerUnit).toFixed(2)} loss/unit)
                        </span>
                      ) : (
                        <span className="rounded bg-emerald-100 px-2 py-0.5 font-medium text-emerald-900">
                          Margin: {marginPercent?.toFixed(1)}% (+${profitPerUnit?.toFixed(2)} profit/unit)
                        </span>
                      )
                    ) : (
                      <span className="text-slate-400">
                        Cost price not set (margin unavailable)
                      </span>
                    )}
                  </div>

                  <span className="text-slate-600">
                    {watchedStockQty > 0 ? `${watchedStockQty} units available` : "Out of stock"}
                  </span>
                </div>
              </div>
            </Card>

            {/* 4. Specifications */}
            {watchedCategoryUuid && categoryAttributes.length > 0 && (
              <Card>
                <CardHeader title="Category Specifications" description="Attributes defined for this category" />
                <div className="p-6">
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
                </div>
              </Card>
            )}

            {/* 5. Custom Specs */}
            <Card>
              <CardHeader title="Custom Specifications" description="Optional extra specifications like Warranty, Dimensions, etc." />
              <div className="p-6 space-y-3">
                {customSpecs.map((spec) => (
                  <div key={spec.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={spec.key}
                      onChange={(e) => updateSpec(spec.id, "key", e.target.value)}
                      placeholder="Label (e.g. Warranty)"
                      className="w-1/3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-slate-400"
                    />
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => updateSpec(spec.id, "value", e.target.value)}
                      placeholder="Value (e.g. 1 Year)"
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => removeSpec(spec.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addSpec}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 pt-1"
                >
                  <Plus className="size-3.5" /> Add specification row
                </button>
              </div>
            </Card>
          </div>

          {/* Right Column: Visibility & Preview */}
          <div className="space-y-6">
            {/* Visibility / Status */}
            <Card>
              <CardHeader title="Listing Status" />
              <div className="p-5 space-y-4">
                <div>
                  <Label>Status</Label>
                  <select {...register("status")} className={cn(INPUT_BASE, "h-10 text-sm")}>
                    <option value="ACTIVE">Active (Visible in marketplace)</option>
                    <option value="DRAFT">Draft (Private)</option>
                    <option value="ARCHIVED">Archived (Hidden)</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("isFeatured")}
                      className="size-4 rounded border-slate-300 text-slate-900"
                    />
                    <span>Feature on store homepage</span>
                  </label>
                </div>
              </div>
            </Card>

            {/* Preview Card */}
            <Card>
              <CardHeader title="Marketplace Preview" />
              <div className="p-4">
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <div className="relative aspect-square w-full bg-slate-100">
                    {previewThumb ? (
                      <Image src={previewThumb} alt="Preview" fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400 text-xs">
                        No image uploaded
                      </div>
                    )}
                  </div>
                  <div className="p-3.5 space-y-1.5">
                    <p className="text-[11px] text-slate-400 font-medium">{selectedCategory?.name || "Category"}</p>
                    <p className="text-xs font-medium text-slate-900 line-clamp-2">
                      {watchedTitle || "Product title will appear here"}
                    </p>
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-sm font-semibold text-slate-900">
                        ${((watchedDiscountPrice && watchedDiscountPrice > 0 ? watchedDiscountPrice : watchedPrice) || 0).toFixed(2)}
                      </span>
                      {watchedDiscountPrice && watchedDiscountPrice < watchedPrice && (
                        <span className="text-xs text-slate-400 line-through">
                          ${watchedPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Bottom Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-lg bg-slate-900 text-xs font-medium text-white hover:bg-slate-800 transition disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : isEditing ? "Save changes" : "Publish product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
