"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  Sparkles,
  Loader2,
  Package,
  Tag,
  Image as ImageIcon,
  Save,
} from "lucide-react";
import { AuthToast } from "@/components/auth/AuthToast";
import { readSellerDrafts, writeSellerDrafts } from "@/lib/seller-drafts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ToastState = { message: string; type: "success" | "error" };

interface CategoryOption {
  uuid: string;
  name: string;
  slug: string;
  level?: number;
  parentUuid?: string | null;
  children?: CategoryOption[];
}

interface AttributeInput {
  key: string;
  value: string;
}

const ATTRIBUTE_PRESETS: Array<{ matches: string[]; label: string; keys: string[] }> = [
  {
    matches: ["computer", "laptop", "desktop", "pc"],
    label: "Computer specifications",
    keys: ["Brand", "Model", "Processor", "RAM", "Storage", "Graphics", "Operating system", "Condition"],
  },
  {
    matches: ["electronic", "phone", "mobile", "tablet", "camera"],
    label: "Electronic specifications",
    keys: ["Brand", "Model", "Color", "Connectivity", "Warranty", "Condition"],
  },
  {
    matches: ["shoe", "sneaker", "footwear"],
    label: "Shoe details",
    keys: ["Brand", "Size", "Color", "Material", "Gender", "Condition"],
  },
  {
    matches: ["gaming", "game", "console"],
    label: "Gaming details",
    keys: ["Platform", "Genre", "Edition", "Region", "Age rating", "Condition"],
  },
];

const DEFAULT_ATTRIBUTES = ["Brand", "Condition"];

function getAttributePreset(category?: CategoryOption) {
  const identity = `${category?.name ?? ""} ${category?.slug ?? ""}`.toLowerCase();
  return ATTRIBUTE_PRESETS.find((preset) => preset.matches.some((match) => identity.includes(match))) ?? {
    label: "Product specifications",
    keys: DEFAULT_ATTRIBUTES,
  };
}

function flattenCategoryTree(nodes: CategoryOption[], parentUuid: string | null = null): CategoryOption[] {
  return nodes.flatMap((node) => [
    { ...node, parentUuid: node.parentUuid ?? parentUuid, children: undefined },
    ...flattenCategoryTree(node.children ?? [], node.uuid),
  ]);
}

export default function CreateNewProductPage() {
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState("");
  const [categoryUuid, setCategoryUuid] = useState("");
  const [rootCategoryUuid, setRootCategoryUuid] = useState("");
  const [subCategoryUuid, setSubCategoryUuid] = useState("");
  const [nestedSubCategoryUuid, setNestedSubCategoryUuid] = useState("");
  const [price, setPrice] = useState("");
  const [stockQty, setStockQty] = useState("10");
  const [description, setDescription] = useState("");
  const [thumbnailObjectName, setThumbnailObjectName] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [attributes, setAttributes] = useState<AttributeInput[]>(
    DEFAULT_ATTRIBUTES.map((key) => ({ key, value: key === "Condition" ? "New" : "" }))
  );

  // Categories & Loading States
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories?tree=true");
        if (res.ok) {
          const data = await res.json();
          const tree = Array.isArray(data) ? data : data.content || data.data || [];
          const list = flattenCategoryTree(tree);
          setCategories(list);
          if (list.length > 0) {
            const firstCategory = list[0] as CategoryOption;
            setRootCategoryUuid(firstCategory.uuid);
            setCategoryUuid(firstCategory.uuid);
            const preset = getAttributePreset(firstCategory);
            setAttributes(preset.keys.map((key) => ({ key, value: key === "Condition" ? "New" : "" })));
          }
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setIsLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  const handleAddAttribute = () => {
    setAttributes((prev) => [...prev, { key: "", value: "" }]);
  };

  const applyCategory = (uuid: string) => {
    setCategoryUuid(uuid);
    const preset = getAttributePreset(categories.find((category) => category.uuid === uuid));
    setAttributes((current) => {
      const existingValues = new Map(current.map((attribute) => [attribute.key, attribute.value]));
      return preset.keys.map((key) => ({
        key,
        value: existingValues.get(key) ?? (key === "Condition" ? "New" : ""),
      }));
    });
  };

  const handleRootCategoryChange = (uuid: string) => {
    setRootCategoryUuid(uuid);
    setSubCategoryUuid("");
    setNestedSubCategoryUuid("");
    applyCategory(uuid);
  };

  const handleSubCategoryChange = (uuid: string) => {
    setSubCategoryUuid(uuid);
    setNestedSubCategoryUuid("");
    applyCategory(uuid || rootCategoryUuid);
  };

  const handleNestedSubCategoryChange = (uuid: string) => {
    setNestedSubCategoryUuid(uuid);
    applyCategory(uuid || subCategoryUuid || rootCategoryUuid);
  };

  const handleRemoveAttribute = (index: number) => {
    setAttributes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAttributeChange = (
    index: number,
    field: "key" | "value",
    val: string
  ) => {
    setAttributes((prev) =>
      prev.map((attr, i) => (i === index ? { ...attr, [field]: val } : attr))
    );
  };

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const objName = data.objectName || data.uri || file.name;
        const previewUrl = data.uri || URL.createObjectURL(file);
        setThumbnailObjectName(objName);
        setImageUrl(previewUrl);
        setToast({ type: "success", message: "Image uploaded successfully!" });
      } else {
        // Fallback for demonstration if upload endpoint is mock
        const fallbackUrl = URL.createObjectURL(file);
        setThumbnailObjectName(file.name);
        setImageUrl(fallbackUrl);
        setToast({ type: "success", message: "Image preview set successfully." });
      }
    } catch (err) {
      console.error("Image upload error:", err);
      const fallbackUrl = URL.createObjectURL(file);
      setThumbnailObjectName(file.name);
      setImageUrl(fallbackUrl);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveDraft = () => {
    const listingAttributes = attributes
      .filter((attribute) => attribute.key.trim() && attribute.value.trim())
      .map((attribute, index) => ({ key: attribute.key.trim(), value: attribute.value.trim(), sortOrder: index + 1 }));

    const drafts = readSellerDrafts();
    drafts.unshift({
      id: crypto.randomUUID(),
      title: title.trim() || "Untitled product",
      description: description.trim(),
      categoryUuid,
      categoryPath: [rootCategoryUuid, subCategoryUuid, nestedSubCategoryUuid].filter(Boolean),
      price,
      stockQty,
      imageNames: thumbnailObjectName ? [thumbnailObjectName] : [],
      thumbnailObjectName: thumbnailObjectName || undefined,
      isFeatured: false,
      listingAttributes,
      updatedAt: new Date().toISOString(),
    });
    writeSellerDrafts(drafts);
    setToast({ type: "success", message: "Product saved to drafts." });
    router.push("/seller-dashboard/products/drafts");
  };

  // Submit Listing
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setToast({ type: "error", message: "Please enter a product title." });
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      setToast({ type: "error", message: "Please enter a valid price." });
      return;
    }

    if (!categoryUuid) {
      setToast({ type: "error", message: "Please select a product category." });
      return;
    }

    setIsSubmitting(true);

    const validAttributes = attributes
      .filter((attr) => attr.key.trim() && attr.value.trim())
      .map((attr, idx) => ({
        key: attr.key.trim(),
        value: attr.value.trim(),
        sortOrder: idx + 1,
      }));

    const payload = {
      categoryUuid,
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      stockQty: parseInt(stockQty, 10) || 1,
      isFeatured: false,
      thumbnailObjectName: thumbnailObjectName || "default-thumbnail.png",
      images: thumbnailObjectName
        ? [{ objectName: thumbnailObjectName, sortOrder: 1, isPrimary: true }]
        : [],
      listingAttributes: validAttributes,
    };

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setToast({
          type: "success",
          message: "Product created successfully! Redirecting to products...",
        });
        setTimeout(() => {
          router.push("/seller-dashboard/products/dashboard");
        }, 1200);
      } else {
        const errData = await res.json().catch(() => null);
        const errorMsg =
          errData?.message || "Failed to create product. Please try again.";
        setToast({ type: "error", message: errorMsg });
      }
    } catch (err: unknown) {
      console.error("Create listing failed:", err);
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Network error while creating product.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10";
  const rootCategories = categories.filter((category) => !category.parentUuid || category.level === 1);
  const subCategories = categories.filter((category) => category.parentUuid === rootCategoryUuid);
  const nestedSubCategories = categories.filter((category) => category.parentUuid === subCategoryUuid);
  const selectedCategory = categories.find((category) => category.uuid === categoryUuid);
  const activeAttributePreset = getAttributePreset(selectedCategory);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.08),_transparent_28rem)] bg-slate-50/70 px-4 py-6 dark:bg-slate-950 font-sans sm:px-6 lg:px-8">
      <AuthToast toast={toast} onClose={() => setToast(null)} />

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 border-b border-slate-200/80 dark:border-slate-800 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/seller-dashboard/products/dashboard"
              className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 transition hover:text-violet-800"
            >
              <ArrowLeft className="size-4" /> Products
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl">Create a new product</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Add the details, media, and specifications buyers need to make a decision.
            </p>
          </div>

        </div>

        {/* Main Form Form Card */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Information Card */}
          <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
            <div className="flex items-start gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600"><Package className="size-5" /></span>
              <div><h2 className="font-semibold text-slate-950 dark:text-slate-100">General information</h2><p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">The main details shown on your product page.</p></div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Product Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter product title"
                className={fieldClass}
              />
              <p className="mt-2 text-xs text-slate-400">e.g. POCO Smart Phone — 8GB RAM / 256GB Storage</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Category path <span className="text-red-500">*</span>
                </label>
                {isLoadingCategories ? (
                  <div className="flex items-center gap-2 h-10 rounded-xl border border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800 px-3 text-xs text-gray-400">
                    <Loader2 className="size-3.5 animate-spin" /> Loading categories...
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div><span className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-400">Main category</span><Select value={rootCategoryUuid} onValueChange={handleRootCategoryChange} disabled={!rootCategories.length}><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{rootCategories.map((category) => <SelectItem key={category.uuid} value={category.uuid}>{category.name}</SelectItem>)}</SelectContent></Select></div>
                    <div><span className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-400">Subcategory</span><Select value={subCategoryUuid || undefined} onValueChange={handleSubCategoryChange} disabled={!subCategories.length}><SelectTrigger><SelectValue placeholder={subCategories.length ? "Select subcategory" : "No subcategories"} /></SelectTrigger><SelectContent>{subCategories.map((category) => <SelectItem key={category.uuid} value={category.uuid}>{category.name}</SelectItem>)}</SelectContent></Select></div>
                    <div><span className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-400">Second level</span><Select value={nestedSubCategoryUuid || undefined} onValueChange={handleNestedSubCategoryChange} disabled={!nestedSubCategories.length}><SelectTrigger><SelectValue placeholder={nestedSubCategories.length ? "Select second level" : "No second level"} /></SelectTrigger><SelectContent>{nestedSubCategories.map((category) => <SelectItem key={category.uuid} value={category.uuid}>{category.name}</SelectItem>)}</SelectContent></Select></div>
                  </div>
                )}
                <p className="mt-2 text-xs text-slate-400">Choose the most specific category available. The product will be posted to the last selected level.</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className={`${fieldClass} pl-8`}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Stock quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockQty}
                  onChange={(e) => setStockQty(e.target.value)}
                  placeholder="10"
                  className={fieldClass}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label><span className="text-xs text-slate-400">{description.length}/2,000</span></div>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe key features, specs, warranty details, and condition..."
                maxLength={2000}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              />
            </div>
          </div>

          {/* Media & Image Upload Card */}
          <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
            <div className="flex items-start gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-600"><ImageIcon className="size-5" /></span>
              <div><h2 className="font-semibold text-slate-950 dark:text-slate-100">Product media</h2><p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">A square, high-resolution image works best.</p></div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Cover image
              </label>
              <div className="flex flex-col items-stretch gap-5 sm:flex-row">
                <div className="relative flex size-36 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Thumbnail preview"
                      className="size-full object-cover"
                    />
                  ) : (
                    <Upload className="size-7 text-slate-400" />
                  )}
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                      <Loader2 className="size-5 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-center space-y-3 text-center sm:text-left">
                  <input
                    type="file"
                    accept="image/*"
                    id="thumbnail-upload"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="thumbnail-upload"
                    className="inline-flex h-10 cursor-pointer items-center gap-2 self-center rounded-xl bg-violet-50 px-4 text-sm font-semibold text-violet-700 transition hover:bg-violet-100 sm:self-start"
                  >
                    <Upload className="size-4" />
                    Choose Image File
                  </label>
                  <p className="text-xs leading-5 text-slate-400">
                    Supports JPG, PNG, WEBP files up to 5MB. High resolution square aspect ratio recommended.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Specifications & Custom Attributes */}
          <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600"><Tag className="size-5" /></span>
                <div><h2 className="font-semibold text-slate-950 dark:text-slate-100">{activeAttributePreset.label}</h2><p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Suggested fields for {selectedCategory?.name ?? "this category"}. You can add or remove any field.</p></div>
              </div>
              <button
                type="button"
                onClick={handleAddAttribute}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-violet-50 px-3 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
              >
                <Plus className="size-3.5" /> Add Attribute
              </button>
            </div>

            <div className="space-y-3">
              {attributes.map((attr, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Specification name"
                    value={attr.key}
                    onChange={(e) =>
                      handleAttributeChange(idx, "key", e.target.value)
                    }
                    className={fieldClass}
                  />
                  <input
                    type="text"
                    placeholder={`Enter ${attr.key || "value"}`}
                    value={attr.value}
                    onChange={(e) =>
                      handleAttributeChange(idx, "value", e.target.value)
                    }
                    className={fieldClass}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAttribute(idx)}
                    className="p-2 text-gray-400 hover:text-red-500 transition rounded-lg"
                    aria-label="Remove attribute"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className=" bottom-0 z-20 -mx-4 flex items-center justify-end gap-3  px-4 py-4 dark:border-slate-800 sm:-mx-6 sm:px-6">
            <p className="hidden text-xs text-slate-400 sm:block">Fields marked with * are required.</p>
            <button type="button" onClick={handleSaveDraft} className="ml-auto inline-flex h-11 items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 text-sm font-semibold text-violet-700 transition hover:bg-violet-100">
              <Save className="size-4" /> Save draft
            </button>
            <Link
              href="/seller-dashboard/products/dashboard"
              className="inline-flex h-11 items-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 transition hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white shadow-md shadow-violet-600/20 transition hover:bg-violet-700 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Publishing Product...
                </>
              ) : (
                <>
                  <Sparkles className="size-4 text-yellow-300" />
                  Publish Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
