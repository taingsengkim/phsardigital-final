"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ChevronDown,
  ImagePlus,
  Info,
  Upload,
} from "lucide-react"

import {
  useCreateSellerListingMutation,
  useGetSellerCategoriesQuery,
  useUploadProductFileMutation,
} from "@/lib/redux/service/sellerProductApi"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { readSellerDrafts, writeSellerDrafts } from "@/lib/seller-drafts"

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
}: {
  accept: string
  multiple?: boolean
  label: string
  files: File[]
  onFiles: (files: File[]) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = React.useState(false)

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
      {files.length > 0 && (
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          {files.map((file) => <li key={`${file.name}-${file.size}`} className="rounded-lg bg-slate-50 px-3 py-2">{file.name}</li>)}
        </ul>
      )}
    </div>
  )
}

export function CreateProduct() {
  const router = useRouter()
  const [images, setImages] = React.useState<File[]>([])
  const [categoryUuid, setCategoryUuid] = React.useState("")
  const [formError, setFormError] = React.useState("")
  const [requiresSubscription, setRequiresSubscription] = React.useState(false)
  const [draftSaved, setDraftSaved] = React.useState(false)
  const { data: categories = [], isLoading: categoriesLoading, isError: categoriesError } = useGetSellerCategoriesQuery()
  const [uploadProductFile] = useUploadProductFileMutation()
  const [createSellerListing, { isLoading: isCreating }] = useCreateSellerListingMutation()

  const saveDraft = (form: HTMLFormElement | null) => {
    if (!form) return

    const data = new FormData(form)
    const title = String(data.get("title") ?? "").trim()
    const drafts = readSellerDrafts()
    drafts.unshift({
      id: crypto.randomUUID(),
      title: title || "Untitled product",
      description: String(data.get("description") ?? "").trim(),
      categoryUuid: String(data.get("category") ?? ""),
      price: String(data.get("price") ?? ""),
      stockQty: String(data.get("stockQty") ?? ""),
      imageNames: images.map((image) => image.name),
      updatedAt: new Date().toISOString(),
    })
    writeSellerDrafts(drafts)
    setDraftSaved(true)
    setFormError("")
    setRequiresSubscription(false)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError("")
    setRequiresSubscription(false)

    if (!images.length) {
      setFormError("Please add at least one cover image.")
      return
    }

    if (!categoryUuid) {
      setFormError("Please select a category.")
      return
    }

    const form = new FormData(event.currentTarget)
    try {
      const uploadedImages = await Promise.all(
        images.map((file) => uploadProductFile(file).unwrap()),
      )

      await createSellerListing({
        categoryUuid: String(form.get("category") ?? ""),
        title: String(form.get("title") ?? "").trim(),
        description: String(form.get("description") ?? "").trim(),
        price: Number(form.get("price")),
        stockQty: Number(form.get("stockQty")),
        isFeatured: false,
        thumbnailObjectName: uploadedImages[0]?.objectName,
        images: uploadedImages.map((image, index) => ({
          objectName: image.objectName,
          sortOrder: index,
          isPrimary: index === 0,
        })),
        listingAttributes: [],
      }).unwrap()

      router.push("/seller-dashboard/products/dashboard")
      router.refresh()
    } catch (error) {
      const apiError = error as { status?: number; data?: { message?: string } | string; error?: string }
      const subscriptionRequired = apiError.status === 402
      const message = typeof apiError.data === "string"
        ? apiError.data
        : apiError.data?.message ?? apiError.error ?? "Could not create the product. Please try again."
      setRequiresSubscription(subscriptionRequired)
      setFormError(message)
    }
  }

  return (
    <form className="mx-auto w-full max-w-5xl pb-10" onSubmit={handleSubmit}>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-sm font-medium text-violet-600">Products / Create</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">New product</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/seller-dashboard/products/dashboard" className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
            <ArrowLeft className="size-4" /> Back
          </Link>
          <button
            type="button"
            onClick={(event) => saveDraft(event.currentTarget.form)}
            className="h-11 rounded-xl border border-violet-300 bg-white px-5 text-sm font-semibold text-violet-700 shadow-sm transition hover:bg-violet-50"
          >
            Save draft
          </button>
          <button disabled={isCreating} type="submit" className="h-11 rounded-xl bg-[#6C4CD8] px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#5d3fc4] disabled:cursor-not-allowed disabled:opacity-60">
            {isCreating ? "Creating..." : "Create product"}
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

      <div className="space-y-4">
        <Section title="Name & description" color="bg-emerald-200">
          <div className="space-y-5">
            <div>
              <FieldLabel>Product title</FieldLabel>
              <input required name="title" className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100" placeholder="Enter a clear product title" />
            </div>
            <div>
              <FieldLabel>Description</FieldLabel>
              <div className="overflow-hidden rounded-xl border border-slate-200 focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-100">
                <textarea name="description" rows={6} className="block w-full resize-y bg-white p-4 text-base outline-none" placeholder="Describe what buyers will receive..." />
              </div>
            </div>
          </div>
        </Section>

        <Section title="Images" color="bg-sky-200">
          <FieldLabel>Cover images</FieldLabel>
          <DropZone accept="image/*" multiple label="Click to add images" files={images} onFiles={(files) => setImages((current) => [...current, ...files])} />
        </Section>

        <Section title="Price" color="bg-emerald-200">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <FieldLabel>Amount</FieldLabel>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-slate-500">$</span>
                <input required min="0" step="0.01" type="number" name="price" className="h-12 w-full rounded-xl border border-slate-200 pl-9 pr-4 text-base outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100" placeholder="0.00" />
              </div>
            </div>
            <div>
              <FieldLabel>Stock quantity</FieldLabel>
              <input
                required
                min="0"
                step="1"
                type="number"
                name="stockQty"
                inputMode="numeric"
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-base outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                placeholder="0"
              />
            </div>
          </div>
        </Section>

        <Section title="Category" color="bg-violet-200">
          <FieldLabel>Category</FieldLabel>
          <input type="hidden" name="category" value={categoryUuid} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={categoriesLoading || categoriesError}>
              <button type="button" className="flex h-12 w-full items-center rounded-xl border border-border bg-background px-4 text-left text-sm text-foreground outline-none transition hover:bg-muted/50 focus-visible:border-violet-400 focus-visible:ring-4 focus-visible:ring-violet-100 dark:focus-visible:ring-violet-950 disabled:cursor-not-allowed disabled:opacity-60">
                <span className={!categoryUuid ? "text-muted-foreground" : undefined}>
                  {categoriesLoading
                    ? "Loading categories..."
                    : categoriesError
                      ? "Could not load categories"
                      : categories.find((category) => category.uuid === categoryUuid)?.name ?? "Select category"}
                </span>
                <ChevronDown className="ml-auto size-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-64 p-1.5">
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category.uuid}
                  onSelect={() => setCategoryUuid(category.uuid)}
                  className="cursor-pointer rounded-lg px-3 py-2.5"
                >
                  {category.name}
                  {category.uuid === categoryUuid && <span className="ml-auto text-primary">✓</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </Section>

      </div>
    </form>
  )
}
