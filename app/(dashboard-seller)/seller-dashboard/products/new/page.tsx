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
  CheckCircle2,
  Loader2,
  Package,
  DollarSign,
  Tag,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { AuthToast } from "@/components/auth/AuthToast";

type ToastState = { message: string; type: "success" | "error" };

interface CategoryOption {
  uuid: string;
  name: string;
  slug: string;
}

interface AttributeInput {
  key: string;
  value: string;
}

export default function CreateNewProductPage() {
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState("");
  const [categoryUuid, setCategoryUuid] = useState("");
  const [price, setPrice] = useState("");
  const [stockQty, setStockQty] = useState("10");
  const [description, setDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [thumbnailObjectName, setThumbnailObjectName] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [attributes, setAttributes] = useState<AttributeInput[]>([
    { key: "Brand", value: "" },
    { key: "Condition", value: "New" },
  ]);

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
        const res = await fetch("/api/categories?pageSize=100");
        if (res.ok) {
          const data = await res.json();
          const list = data.content || data || [];
          setCategories(list);
          if (list.length > 0) {
            setCategoryUuid(list[0].uuid);
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
      isFeatured,
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
    } catch (err: any) {
      console.error("Create listing failed:", err);
      setToast({
        type: "error",
        message: err?.message || "Network error while creating product.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 font-sans">
      <AuthToast toast={toast} onClose={() => setToast(null)} />

      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/seller-dashboard/products/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6C4CD8] hover:underline mb-2"
            >
              <ArrowLeft className="size-4" /> Back to Products Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-gray-900">Create New Product</h1>
            <p className="text-xs text-gray-500 mt-1">
              Add a new product listing to your store inventory on Phsar Digital
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/seller-dashboard/products/dashboard"
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#6C4CD8] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#6C4CD8]/20 hover:bg-[#5C3DC8] transition disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Sparkles className="size-4 text-yellow-300" />
                  Publish Product
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Form Form Card */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Information Card */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
              <Package className="size-4 text-[#6C4CD8]" />
              General Information
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Product Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. POCO Smart Phone — 8GB RAM / 256GB Storage"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-xs font-medium text-gray-900 outline-none focus:border-[#6C4CD8] focus:bg-white focus:ring-2 focus:ring-[#6C4CD8]/20 transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                {isLoadingCategories ? (
                  <div className="flex items-center gap-2 h-10 rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs text-gray-400">
                    <Loader2 className="size-3.5 animate-spin" /> Loading categories...
                  </div>
                ) : (
                  <select
                    value={categoryUuid}
                    onChange={(e) => setCategoryUuid(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-xs font-medium text-gray-900 outline-none focus:border-[#6C4CD8] focus:bg-white focus:ring-2 focus:ring-[#6C4CD8]/20 transition"
                  >
                    {categories.length > 0 ? (
                      categories.map((c) => (
                        <option key={c.uuid} value={c.uuid}>
                          {c.name}
                        </option>
                      ))
                    ) : (
                      <option value="default-cat">General Products</option>
                    )}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Price (USD $) <span className="text-red-500">*</span>
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
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-8 pr-4 py-2.5 text-xs font-medium text-gray-900 outline-none focus:border-[#6C4CD8] focus:bg-white focus:ring-2 focus:ring-[#6C4CD8]/20 transition"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Available Inventory Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockQty}
                  onChange={(e) => setStockQty(e.target.value)}
                  placeholder="10"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-xs font-medium text-gray-900 outline-none focus:border-[#6C4CD8] focus:bg-white focus:ring-2 focus:ring-[#6C4CD8]/20 transition"
                />
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="size-4 rounded border-gray-300 text-[#6C4CD8] focus:ring-[#6C4CD8]"
                  />
                  <span className="text-xs font-bold text-gray-800">
                    Promote as Featured Product on Storefront
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Product Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe key features, specs, warranty details, and condition..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-xs font-medium text-gray-900 outline-none focus:border-[#6C4CD8] focus:bg-white focus:ring-2 focus:ring-[#6C4CD8]/20 transition"
              />
            </div>
          </div>

          {/* Media & Image Upload Card */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
              <ImageIcon className="size-4 text-[#6C4CD8]" />
              Product Cover &amp; Media
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Upload Main Thumbnail Cover
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex size-24 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Thumbnail preview"
                      className="size-full object-cover"
                    />
                  ) : (
                    <Upload className="size-6 text-gray-400" />
                  )}
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                      <Loader2 className="size-5 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <input
                    type="file"
                    accept="image/*"
                    id="thumbnail-upload"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="thumbnail-upload"
                    className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200 transition cursor-pointer"
                  >
                    <Upload className="size-4" />
                    Choose Image File
                  </label>
                  <p className="text-[11px] text-gray-400">
                    Supports JPG, PNG, WEBP files up to 5MB. High resolution square aspect ratio recommended.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Specifications & Custom Attributes */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <Tag className="size-4 text-[#6C4CD8]" />
                Product Specifications &amp; Attributes
              </div>
              <button
                type="button"
                onClick={handleAddAttribute}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#6C4CD8] hover:underline"
              >
                <Plus className="size-3.5" /> Add Attribute
              </button>
            </div>

            <div className="space-y-3">
              {attributes.map((attr, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="e.g. Brand / RAM / Color"
                    value={attr.key}
                    onChange={(e) =>
                      handleAttributeChange(idx, "key", e.target.value)
                    }
                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-xs font-medium text-gray-900 outline-none focus:border-[#6C4CD8] focus:bg-white"
                  />
                  <input
                    type="text"
                    placeholder="e.g. POCO / 8GB / Black"
                    value={attr.value}
                    onChange={(e) =>
                      handleAttributeChange(idx, "value", e.target.value)
                    }
                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-xs font-medium text-gray-900 outline-none focus:border-[#6C4CD8] focus:bg-white"
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
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/seller-dashboard/products/dashboard"
              className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#6C4CD8] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#6C4CD8]/20 hover:bg-[#5C3DC8] transition disabled:opacity-70"
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
