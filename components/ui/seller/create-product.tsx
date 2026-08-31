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
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Eye,
  HelpCircle,
  ImagePlus,
  Info,
  Layers,
  Loader2,
  Package,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Tag,
  Trash2,
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAppDispatch } from "@/lib/hooks"
import { sellerApi } from "@/lib/api/sellerApi"
import type { CategoryAttributeDefinition, SellerCategoryTree } from "@/lib/types/seller-product"
import { cn, getFileUrl } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const productImageSchema = z
  .custom<File>((value) => typeof File !== "undefined" && value instanceof File, "Please select a valid image file.")
  .refine((file) => file.type.startsWith("image/"), "Only image files are allowed.")
  .refine((file) => file.size <= 8 * 1024 * 1024, "Each image must be 8 MB or smaller.")

const createProductSchema = z
  .object({
    title: z.string().trim().min(3, "Title must contain at least 3 characters.").max(120, "Title must not exceed 120 characters."),
    description: z.string().trim().min(10, "Description must contain at least 10 characters.").max(5000, "Description must not exceed 5,000 characters."),
    price: z.number({ error: "Enter a valid regular price." }).positive("Price must be greater than 0."),
    discountPrice: z.number({ error: "Enter a valid discount price." }).positive("Discount price must be greater than 0.").optional(),
    stockQty: z.number({ error: "Enter a valid stock quantity." }).int("Stock quantity must be a whole number.").min(0, "Stock quantity cannot be negative."),
    categoryUuid: z.string().min(1, "Please select a category."),
    status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
    isFeatured: z.boolean(),
    images: z.array(productImageSchema).max(8, "You can upload up to 8 images."),
  })
  .refine(
    (data) => data.discountPrice === undefined || data.discountPrice < data.price,
    { path: ["discountPrice"], message: "Discount price must be strictly lower than the regular price." },
  )

type CreateProductForm = z.infer<typeof createProductSchema>

type CustomAttribute = {
  id: string
  key: string
  value: string
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
      { ...category, name: path.join(" > ") },
      ...flattenCategoryTree(category.children ?? [], path),
    ]
  })
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1.5 text-xs font-semibold text-rose-600">{message}</p> : null
}

function FieldLabel({ children, required, tooltip }: { children: React.ReactNode; required?: boolean; tooltip?: string }) {
  return (
    <label className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-700">
      {children}
      {required && <span className="text-rose-500 font-black">*</span>}
      {tooltip && <span title={tooltip} className="cursor-help"><Info className="size-3.5 text-slate-400" /></span>}
    </label>
  )
}

function Section({
  title,
  subtitle,
  icon: Icon,
  children,
  badge,
}: {
  title: string
  subtitle?: string
  icon?: React.ElementType
  children: React.ReactNode
  badge?: React.ReactNode
}) {
  return (
    <section className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <span className="grid size-9 place-items-center rounded-xl bg-purple-50 text-[#6C4CD8]">
              <Icon className="size-4.5" />
            </span>
          )}
          <div>
            <h2 className="text-base font-black text-slate-950">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
          </div>
        </div>
        {badge}
      </div>
      {children}
    </section>
  )
}

function CategoryAttributeField({
  attribute,
  value,
  onChange,
}: {
  attribute: CategoryAttributeDefinition
  value: string
  onChange: (value: string) => void
}) {
  const label = (
    <FieldLabel required={attribute.required}>
      {attribute.label}
      {attribute.unit ? ` (${attribute.unit})` : ""}
    </FieldLabel>
  )
  const inputClass =
    "h-11 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 text-xs sm:text-sm font-medium text-slate-900 outline-none transition focus:border-[#6C4CD8] focus:bg-white focus:ring-2 focus:ring-[#6C4CD8]/20"

  if (attribute.dataType === "BOOLEAN") {
    return (
      <div>
        {label}
        <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
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
        {label}
        <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
          <option value="">Select {attribute.label.toLowerCase()}</option>
          {(attribute.options ?? []).map((opt) => (
            <option key={opt.uuid ?? opt.value} value={opt.value}>
              {opt.label || opt.value}
            </option>
          ))}
        </select>
      </div>
    )
  }

  if (attribute.dataType === "MULTI_SELECT") {
    const selected = new Set(value.split(",").filter(Boolean))
    return (
      <fieldset className="space-y-1.5">
        <legend className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-700">
          {attribute.label}
          {attribute.required && <span className="text-rose-500"> *</span>}
        </legend>
        <div className="flex min-h-11 flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-slate-50/40 p-2">
          {(attribute.options ?? []).map((opt) => (
            <label
              key={opt.uuid ?? opt.value}
              className={cn(
                "cursor-pointer rounded-lg px-2.5 py-1 text-xs font-bold transition select-none",
                selected.has(opt.value)
                  ? "bg-[#6C4CD8] text-white shadow-xs"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100",
              )}
            >
              <input
                type="checkbox"
                checked={selected.has(opt.value)}
                onChange={(e) => {
                  const next = new Set(selected)
                  if (e.target.checked) next.add(opt.value)
                  else next.delete(opt.value)
                  onChange([...next].join(","))
                }}
                className="sr-only"
              />
              {opt.label || opt.value}
            </label>
          ))}
        </div>
      </fieldset>
    )
  }

  return (
    <div>
      {label}
      <input
        type={attribute.dataType === "NUMBER" ? "number" : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${attribute.label.toLowerCase()}`}
        className={inputClass}
      />
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

  // Category & Listing Queries
  const { data: categoryTree = [], isLoading: categoriesLoading, isError: categoriesError } =
    useGetSellerCategoryTreeQuery()
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

  // Form State
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
      stockQty: 10,
      categoryUuid: "",
      status: "ACTIVE",
      isFeatured: false,
      images: [],
    },
  })

  // Watched Values for Real-time Preview
  const watchedTitle = useWatch({ control, name: "title" })
  const watchedPrice = useWatch({ control, name: "price" })
  const watchedDiscountPrice = useWatch({ control, name: "discountPrice" })
  const watchedStockQty = useWatch({ control, name: "stockQty" })
  const watchedCategoryUuid = useWatch({ control, name: "categoryUuid" })
  const watchedIsFeatured = useWatch({ control, name: "isFeatured" })
  const watchedStatus = useWatch({ control, name: "status" })

  // Gallery and Photos State
  const [picked, setPicked] = React.useState<PickedImage[]>([])
  const [coverId, setCoverId] = React.useState("")

  // Dynamic Category Attributes
  const [attributeValues, setAttributeValues] = React.useState<Record<string, string>>({})

  // Custom Key/Value Specifications
  const [customSpecs, setCustomSpecs] = React.useState<CustomAttribute[]>([])

  // Flattened categories for search & select
  const [categorySearch, setCategorySearch] = React.useState("")
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = React.useState(false)
  const categoryOptions = React.useMemo(() => flattenCategoryTree(categoryTree), [categoryTree])
  const selectedCategory = categoryOptions.find((c) => c.uuid === watchedCategoryUuid)
  const attributeCategoryUuid = selectedCategory?.uuid ?? ""

  // Dynamic schema for selected category
  const {
    data: attributeSchema,
    isLoading: attributesLoading,
    isError: attributesError,
    refetch: refetchAttributes,
  } = useGetSellerCategoryAttributesQuery(attributeCategoryUuid, {
    skip: !attributeCategoryUuid,
  })

  const categoryAttributes = React.useMemo(() => {
    const grouped = attributeSchema?.groups?.flatMap((g) => g.attributes ?? []) ?? []
    const attrs = grouped.length ? grouped : attributeSchema?.attributes ?? []
    return [...attrs].sort(
      (a, b) => (a.groupSortOrder ?? 0) - (b.groupSortOrder ?? 0) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    )
  }, [attributeSchema])

  const isSubmitting = isCreating || isUpdating

  // Filtered categories for searchable dropdown
  const filteredCategories = React.useMemo(() => {
    if (!categorySearch.trim()) return categoryOptions
    const q = categorySearch.toLowerCase().trim()
    return categoryOptions.filter((c) => c.name.toLowerCase().includes(q))
  }, [categoryOptions, categorySearch])

  // Populate form on Edit
  React.useEffect(() => {
    if (!listing || !isEditing || categoryTree.length === 0) return
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
      isFeatured: Boolean(listing.isFeatured),
      images: [],
    })
  }, [categoryTree, isEditing, listing, reset])

  // Populate dynamic category attributes & custom specs on Edit
  React.useEffect(() => {
    if (!isEditing || !listing) return
    const catVals: Record<string, string> = {}
    const extraSpecs: CustomAttribute[] = []

    for (const attr of listing.listingAttributes ?? []) {
      const isPredefined = categoryAttributes.some(
        (ca) => ca.code === attr.key || ca.label === attr.key,
      )
      if (isPredefined) {
        const def = categoryAttributes.find(
          (ca) => ca.code === attr.key || ca.label === attr.key,
        )
        catVals[def?.code ?? attr.key] = attr.value ?? ""
      } else {
        extraSpecs.push({
          id: crypto.randomUUID(),
          key: attr.key,
          value: attr.value,
        })
      }
    }

    if (categoryAttributes.length > 0) {
      setAttributeValues(catVals)
    }
    if (extraSpecs.length > 0 && customSpecs.length === 0) {
      setCustomSpecs(extraSpecs)
    }
  }, [categoryAttributes, isEditing, listing])

  // Calculate discount percentage
  const discountPercent = React.useMemo(() => {
    if (watchedPrice && watchedDiscountPrice && watchedDiscountPrice < watchedPrice) {
      return Math.round(((watchedPrice - watchedDiscountPrice) / watchedPrice) * 100)
    }
    return null
  }, [watchedPrice, watchedDiscountPrice])

  // Custom Spec Helpers
  const handleAddCustomSpec = () => {
    setCustomSpecs((prev) => [...prev, { id: crypto.randomUUID(), key: "", value: "" }])
  }

  const handleUpdateCustomSpec = (id: string, field: "key" | "value", text: string) => {
    setCustomSpecs((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: text } : item)),
    )
  }

  const handleRemoveCustomSpec = (id: string) => {
    setCustomSpecs((prev) => prev.filter((item) => item.id !== id))
  }

  // Save Draft Locally
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
    toast.success("Saved to local drafts.")
  }

  // Main Submit Action
  const submitProduct = async (data: CreateProductForm) => {
    setFormError("")
    setRequiresSubscription(false)

    try {
      // Validate required category attributes
      const missingAttribute = categoryAttributes.find(
        (attr) => attr.required && !attributeValues[attr.code]?.trim(),
      )
      if (missingAttribute) {
        setFormError(`${missingAttribute.label} is required for this category.`)
        window.scrollTo({ top: 0, behavior: "smooth" })
        return
      }

      if (!isEditing && data.images.length === 0) {
        setError("images", { type: "manual", message: "Please upload at least 1 cover photo." })
        window.scrollTo({ top: 0, behavior: "smooth" })
        return
      }

      // Upload newly added files
      const uploadedImages = await Promise.all(
        data.images.map((file) => uploadProductFile(file).unwrap()),
      )

      const coverIndex = Math.max(
        picked.findIndex((img) => img.id === coverId),
        0,
      )
      const coverObjectName =
        uploadedImages[coverIndex]?.objectName ?? uploadedImages[0]?.objectName

      // Combine category attributes and custom specifications
      const predefinedAttributes = categoryAttributes
        .map((attr, index) => ({
          key: attr.code,
          value: attributeValues[attr.code]?.trim() ?? "",
          sortOrder: attr.sortOrder ?? index,
        }))
        .filter((attr) => attr.value)

      const extraAttributes = customSpecs
        .filter((spec) => spec.key.trim() && spec.value.trim())
        .map((spec, index) => ({
          key: spec.key.trim(),
          value: spec.value.trim(),
          sortOrder: predefinedAttributes.length + index,
        }))

      const allListingAttributes = [...predefinedAttributes, ...extraAttributes]

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
            listingAttributes: allListingAttributes,
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
            uploadedImages.map((image, index) =>
              addListingImage({
                uuid: editUuid,
                objectName: image.objectName,
                sortOrder: (listing?.images?.length ?? 0) + index,
              }).unwrap(),
            ),
          )
        }
      } else {
        const galleryImages = uploadedImages.map((image, index) => ({
          objectName: image.objectName,
          sortOrder: index,
        }))

        const created = await createSellerListing({
          categoryUuid: data.categoryUuid,
          title: data.title,
          description: data.description,
          fullPrice: data.price,
          discountPrice: data.discountPrice,
          stockQty: data.stockQty,
          isFeatured: data.isFeatured,
          thumbnailObjectName: coverObjectName,
          images: galleryImages,
          listingAttributes: allListingAttributes,
        }).unwrap()

        const createdUuid = created?.uuid
        if (createdUuid) {
          const persisted = new Set(
            (created.images ?? []).map((img) => img.objectName).filter(Boolean),
          )
          const unattached = galleryImages.filter((img) => !persisted.has(img.objectName))
          for (const image of unattached) {
            await addListingImage({
              uuid: createdUuid,
              objectName: image.objectName,
              sortOrder: image.sortOrder,
            }).unwrap()
          }
        }
      }

      dispatch(sellerApi.util.invalidateTags(["SellerListings"]))
      toast.success(isEditing ? "Product updated successfully!" : "Product published successfully!")
      router.push(`/seller-dashboard/products/dashboard?success=${isEditing ? "updated" : "created"}`)
      router.refresh()
    } catch (error: any) {
      const status = error?.status
      if (status === 402 || status === 409) {
        setRequiresSubscription(true)
        setFormError(
          status === 409
            ? "Your subscription listing quota is full. Upgrade your plan to list more products."
            : "An active seller subscription is required to publish products.",
        )
      } else {
        setFormError(
          error?.data?.message ||
            error?.message ||
            `Could not ${isEditing ? "update" : "create"} the product. Please check your inputs.`,
        )
      }
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const showValidationError = (validationErrors: FieldErrors<CreateProductForm>) => {
    const firstError = Object.values(validationErrors).find((err) => err?.message)
    setFormError(
      typeof firstError?.message === "string"
        ? firstError.message
        : "Please fill out all required fields marked in red.",
    )
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Preview Image
  const previewThumbnail = React.useMemo(() => {
    if (picked.length > 0) {
      const coverObj = picked.find((p) => p.id === coverId) || picked[0]
      return coverObj?.previewUrl
    }
    if (listing?.thumbnailUri) {
      const uri = typeof listing.thumbnailUri === "string" ? listing.thumbnailUri : (listing.thumbnailUri as any)?.uri
      return uri ? getFileUrl(uri) : null
    }
    return null
  }, [picked, coverId, listing])

  return (
    <form
      data-create-product
      noValidate
      onSubmit={handleSubmit(submitProduct, showValidationError)}
      className="mx-auto w-full max-w-[1550px] space-y-6 pb-12"
    >
      {/* ── Top Header Actions Bar ── */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#6C4CD8]">
            <Link href="/seller-dashboard/products/dashboard" className="hover:underline">
              Inventory
            </Link>
            <ChevronRight className="size-3 text-slate-400" />
            <span className="text-slate-500">{isEditing ? "Edit Product" : "New Listing"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mt-1">
            {isEditing ? "Edit Product Listing" : "Create New Product"}
          </h1>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl border-slate-200 text-xs font-bold"
          >
            <Link href="/seller-dashboard/products/dashboard">
              <ArrowLeft className="size-3.5 mr-1.5" /> Cancel
            </Link>
          </Button>

          {!isEditing && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={saveDraft}
              className="rounded-xl border-purple-200 text-[#6C4CD8] hover:bg-purple-50 text-xs font-bold"
            >
              Save Draft
            </Button>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-[#6C4CD8] hover:bg-[#5B3DC0] text-xs font-black text-white px-5 shadow-md shadow-[#6C4CD8]/25"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" /> Saving...
              </span>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Publish Product"
            )}
          </Button>
        </div>
      </header>

      {/* Draft Saved Status */}
      {draftSaved && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600" />
            <span>Product saved to local drafts successfully.</span>
          </div>
          <Link href="/seller-dashboard/products/drafts" className="underline font-black">
            View Drafts →
          </Link>
        </div>
      )}

      {/* Global Form Error Banner */}
      {formError && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-800 animate-in fade-in-50">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="size-5 text-rose-600 shrink-0" />
            <span>{formError}</span>
          </div>
          {requiresSubscription && (
            <Button asChild size="sm" className="rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shrink-0">
              <Link href="/subscriptions">View Subscription Plans →</Link>
            </Button>
          )}
        </div>
      )}

      {/* ── 2-COLUMN DESKTOP LAYOUT (Editor Form + Live Preview) ── */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px]">
        {/* ── LEFT COLUMN: MAIN FORM SECTIONS ── */}
        <div className="space-y-6 min-w-0">
          {/* Section 1: General Product Information */}
          <Section title="General Information" subtitle="Provide a clear, compelling title and detailed description" icon={Package}>
            <div className="space-y-4">
              <div>
                <FieldLabel required tooltip="Clear title including brand, model, key features">
                  Product Title
                </FieldLabel>
                <input
                  {...register("title")}
                  placeholder="e.g., Apple iPhone 15 Pro Max 256GB Natural Titanium"
                  className={cn(
                    "h-12 w-full rounded-2xl border bg-slate-50/60 px-4 text-xs sm:text-sm font-medium text-slate-950 outline-none transition focus:border-[#6C4CD8] focus:bg-white focus:ring-2 focus:ring-[#6C4CD8]/20",
                    errors.title ? "border-rose-400 bg-rose-50/20" : "border-slate-200",
                  )}
                />
                <FieldError message={errors.title?.message} />
              </div>

              <div>
                <FieldLabel required tooltip="Full description of specifications, box contents, condition">
                  Product Description
                </FieldLabel>
                <textarea
                  {...register("description")}
                  rows={6}
                  placeholder="Describe your item in detail (key features, condition, warranty, box contents)..."
                  className={cn(
                    "w-full rounded-2xl border bg-slate-50/60 p-4 text-xs sm:text-sm font-medium text-slate-950 outline-none transition focus:border-[#6C4CD8] focus:bg-white focus:ring-2 focus:ring-[#6C4CD8]/20 leading-relaxed",
                    errors.description ? "border-rose-400 bg-rose-50/20" : "border-slate-200",
                  )}
                />
                <FieldError message={errors.description?.message} />
              </div>
            </div>
          </Section>

          {/* Section 2: Media & Gallery */}
          <Section
            title="Product Images & Gallery"
            subtitle="Upload up to 8 high-resolution photos. The starred image is your primary cover."
            icon={ImagePlus}
            badge={<span className="text-xs font-bold text-slate-400">Max 8 Images</span>}
          >
            {isEditing ? (
              <ListingGalleryManager listing={listing} listingUuid={editUuid} />
            ) : (
              <div className="space-y-2">
                <NewListingImages
                  images={picked}
                  coverId={coverId}
                  max={8}
                  onChange={(next, nextCoverId) => {
                    setPicked(next)
                    setCoverId(nextCoverId)
                    setValue(
                      "images",
                      next.map((img) => img.file),
                      { shouldDirty: true, shouldValidate: true },
                    )
                  }}
                />
                <FieldError message={errors.images?.message} />
              </div>
            )}
          </Section>

          {/* Section 3: Pricing & Inventory */}
          <Section title="Pricing & Inventory" subtitle="Set your selling price, optional sale discount, and stock count" icon={Tag}>
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Regular Price */}
              <div>
                <FieldLabel required>Regular Price ($)</FieldLabel>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
                  <input
                    {...register("price", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className={cn(
                      "h-12 w-full rounded-2xl border bg-slate-50/60 pl-8 pr-4 text-xs sm:text-sm font-black text-slate-950 outline-none focus:border-[#6C4CD8] focus:bg-white focus:ring-2 focus:ring-[#6C4CD8]/20",
                      errors.price ? "border-rose-400" : "border-slate-200",
                    )}
                  />
                </div>
                <FieldError message={errors.price?.message} />
              </div>

              {/* Discount Price */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <FieldLabel>Discount Price ($)</FieldLabel>
                  {discountPercent !== null && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800 animate-pulse">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
                  <input
                    {...register("discountPrice", {
                      setValueAs: (v) => (v === "" || isNaN(Number(v)) ? undefined : Number(v)),
                    })}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Optional sale price"
                    className={cn(
                      "h-12 w-full rounded-2xl border bg-slate-50/60 pl-8 pr-4 text-xs sm:text-sm font-black text-slate-950 outline-none focus:border-[#6C4CD8] focus:bg-white focus:ring-2 focus:ring-[#6C4CD8]/20",
                      errors.discountPrice ? "border-rose-400" : "border-slate-200",
                    )}
                  />
                </div>
                <FieldError message={errors.discountPrice?.message} />
              </div>

              {/* Stock Quantity */}
              <div>
                <FieldLabel required>Stock Units</FieldLabel>
                <input
                  {...register("stockQty", { valueAsNumber: true })}
                  type="number"
                  step="1"
                  min="0"
                  placeholder="10"
                  className={cn(
                    "h-12 w-full rounded-2xl border bg-slate-50/60 px-4 text-xs sm:text-sm font-black text-slate-950 outline-none focus:border-[#6C4CD8] focus:bg-white focus:ring-2 focus:ring-[#6C4CD8]/20",
                    errors.stockQty ? "border-rose-400" : "border-slate-200",
                  )}
                />
                <FieldError message={errors.stockQty?.message} />
              </div>
            </div>
          </Section>

          {/* Section 4: Category & Dynamic Specifications */}
          <Section title="Category & Classifications" subtitle="Select the category hierarchy to unlock customized attribute fields" icon={Layers}>
            <div className="space-y-4">
              <div>
                <FieldLabel required>Product Category</FieldLabel>
                {/* Searchable Category Selector */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    disabled={categoriesLoading || Boolean(categoriesError)}
                    className="flex h-12 w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 px-4 text-left text-xs sm:text-sm font-bold text-slate-900 transition hover:bg-slate-100/70"
                  >
                    <span className="truncate">
                      {selectedCategory ? selectedCategory.name : "Select a product category..."}
                    </span>
                    <ChevronDown className="size-4 text-slate-400 shrink-0 ml-2" />
                  </button>

                  {isCategoryDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 z-30 mt-1.5 max-h-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
                        <input
                          type="search"
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          placeholder="Search categories..."
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs font-medium outline-none focus:border-[#6C4CD8]"
                        />
                      </div>

                      <div className="max-h-52 overflow-y-auto space-y-0.5 pr-1">
                        {filteredCategories.map((cat) => (
                          <button
                            key={cat.uuid}
                            type="button"
                            onClick={() => {
                              setAttributeValues({})
                              setValue("categoryUuid", cat.uuid, { shouldDirty: true, shouldValidate: true })
                              setIsCategoryDropdownOpen(false)
                            }}
                            className={cn(
                              "w-full rounded-xl px-3 py-2 text-left text-xs font-bold transition flex items-center justify-between",
                              cat.uuid === watchedCategoryUuid
                                ? "bg-[#6C4CD8] text-white"
                                : "text-slate-700 hover:bg-purple-50 hover:text-[#6C4CD8]",
                            )}
                          >
                            <span className="truncate">{cat.name}</span>
                            {cat.uuid === watchedCategoryUuid && <Check className="size-3.5 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <FieldError message={errors.categoryUuid?.message} />
              </div>

              {/* Dynamic Category Attributes Fields */}
              {attributeCategoryUuid && (
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#6C4CD8]">
                    {attributeSchema?.categoryName || "Category"} Specifications
                  </h3>

                  {attributesLoading ? (
                    <div className="flex items-center gap-2 text-xs text-slate-400 py-3">
                      <Loader2 className="size-4 animate-spin text-[#6C4CD8]" /> Loading category attributes...
                    </div>
                  ) : categoryAttributes.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {categoryAttributes.map((attr) => (
                        <CategoryAttributeField
                          key={attr.uuid || attr.code}
                          attribute={attr}
                          value={attributeValues[attr.code] ?? ""}
                          onChange={(val) =>
                            setAttributeValues((prev) => ({ ...prev, [attr.code]: val }))
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No additional attributes required for this category.</p>
                  )}
                </div>
              )}
            </div>
          </Section>

          {/* Section 5: Custom Specifications / Key-Value Details */}
          <Section
            title="Custom Specifications & Details"
            subtitle="Add any extra attributes like Brand, Material, Warranty, Dimensions, etc."
            icon={Tag}
          >
            <div className="space-y-3">
              {customSpecs.map((spec) => (
                <div key={spec.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={spec.key}
                    onChange={(e) => handleUpdateCustomSpec(spec.id, "key", e.target.value)}
                    placeholder="Feature (e.g., Warranty)"
                    className="w-1/3 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#6C4CD8] focus:bg-white"
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) => handleUpdateCustomSpec(spec.id, "value", e.target.value)}
                    placeholder="Value (e.g., 1 Year Official Warranty)"
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#6C4CD8] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomSpec(spec.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCustomSpec}
                className="rounded-xl border-dashed border-[#6C4CD8]/50 text-xs font-bold text-[#6C4CD8] hover:bg-purple-50"
              >
                <Plus className="size-3.5 mr-1" /> Add Custom Specification
              </Button>
            </div>
          </Section>

          {/* Section 6: Visibility & Store Spotlight */}
          <Section title="Visibility & Promotion" subtitle="Control marketplace availability and showcase status" icon={Sparkles}>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Status Picker */}
              <div>
                <FieldLabel>Listing Status</FieldLabel>
                <select
                  {...register("status")}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-[#6C4CD8] focus:bg-white"
                >
                  <option value="ACTIVE">Active (Available on Marketplace)</option>
                  <option value="DRAFT">Draft (Saved privately)</option>
                  <option value="ARCHIVED">Archived / Inactive</option>
                </select>
              </div>

              {/* isFeatured Switch */}
              <div>
                <FieldLabel>Featured Spotlight</FieldLabel>
                <label className="flex h-12 items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 px-4 cursor-pointer hover:bg-slate-100/70 transition">
                  <span className="text-xs font-bold text-slate-700">Feature on Shop Homepage</span>
                  <input
                    type="checkbox"
                    {...register("isFeatured")}
                    className="size-4 accent-[#6C4CD8] rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </Section>
        </div>

        {/* ── RIGHT COLUMN: STICKY REAL-TIME LIVE PREVIEW CARD ── */}
        <aside className="space-y-5 lg:sticky lg:top-20">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="size-4 text-[#6C4CD8]" />
                <span className="text-xs font-black text-slate-950 uppercase tracking-wider">
                  Live Marketplace Card
                </span>
              </div>
              <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-black text-[#6C4CD8]">
                Real-time
              </span>
            </div>

            {/* Live Product Card Mockup */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md transition-all">
              {/* Product Thumbnail */}
              <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                {previewThumbnail ? (
                  <Image
                    src={previewThumbnail}
                    alt={watchedTitle || "Product preview"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-slate-300">
                    <Package className="size-16" />
                  </div>
                )}

                {/* Featured Star Badge */}
                {watchedIsFeatured && (
                  <span className="absolute top-3 left-3 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-black text-slate-950 shadow-md flex items-center gap-1">
                    <Star className="size-3 fill-slate-950" /> Featured
                  </span>
                )}

                {/* Discount Badge */}
                {discountPercent !== null && (
                  <span className="absolute top-3 right-3 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-black text-white shadow-md">
                    -{discountPercent}%
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6C4CD8]">
                  {selectedCategory?.name || "General"}
                </span>

                <h3 className="text-sm font-black text-slate-950 line-clamp-2 leading-snug">
                  {watchedTitle || "Your Product Title will appear here..."}
                </h3>

                {/* Star Rating Mockup */}
                <div className="flex items-center gap-1 text-xs text-amber-500">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">(New Listing)</span>
                </div>

                {/* Pricing Display */}
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-lg font-black text-slate-950 tabular-nums">
                    {watchedDiscountPrice !== undefined && watchedDiscountPrice > 0
                      ? `$${watchedDiscountPrice.toFixed(2)}`
                      : watchedPrice !== undefined
                      ? `$${watchedPrice.toFixed(2)}`
                      : "$0.00"}
                  </span>
                  {watchedDiscountPrice !== undefined && watchedDiscountPrice > 0 && watchedPrice && (
                    <span className="text-xs font-bold text-slate-400 line-through tabular-nums">
                      ${watchedPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Stock Tag */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-emerald-600">
                    {watchedStockQty !== undefined && watchedStockQty > 0
                      ? `${watchedStockQty} in stock`
                      : "Out of stock"}
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-600">
                    {watchedStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-2xl bg-[#6C4CD8] hover:bg-[#5B3DC0] font-black text-white shadow-md shadow-[#6C4CD8]/25 text-sm"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" /> Saving...
                </span>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Publish Product Now"
              )}
            </Button>
          </div>
        </aside>
      </div>
    </form>
  )
}
